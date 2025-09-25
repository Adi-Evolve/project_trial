import { supabase } from './supabase';
import { localStorageService, StoredProject } from './localStorage';
import { toast } from 'react-hot-toast';

export interface ProjectSupabaseData {
  id?: string;
  creator_id: string;
  title: string;
  description: string;
  short_description?: string;
  category: string;
  tags: string[];
  funding_goal: number;
  current_funding: number;
  currency: string;
  deadline: string;
  status: 'draft' | 'pending' | 'active' | 'funded' | 'completed' | 'cancelled';
  blockchain_campaign_id?: number;
  blockchain_tx_hash?: string;
  ipfs_hash?: string;
  blockchain_id?: string; // <-- Added for blockchain project ID
  image_url?: string;
  image_urls?: string[];
  video_url?: string;
  website_url?: string;
  github_url?: string;
  whitepaper_url?: string;
  roadmap: any[];
  milestones?: any[];
  team_members: any[];
  featured: boolean;
  total_backers: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at?: string;
  updated_at?: string;
}

class EnhancedProjectService {

  // Check whether a specific column exists on a table (used to guard writes before migration)
  private async columnExists(tableName: string, columnName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', tableName)
        .eq('column_name', columnName)
        .limit(1);

      if (error) {
        console.warn('Could not check column existence for', tableName, columnName, error.message || error);
        return false;
      }

      return Array.isArray(data) && data.length > 0;
    } catch (err) {
      console.warn('Error checking column existence:', err);
      return false;
    }
  }
  
  // Save project to both localStorage and Supabase with proper schema mapping
  async saveProject(projectData: Omit<StoredProject, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'supporters' | 'comments'>): Promise<{
    success: boolean;
    project?: StoredProject;
    error?: string;
    supabaseId?: string;
  }> {
    try {
      console.log('🚀 Starting project save...', { title: projectData.title });

      // Step 1: Save to localStorage for immediate use
      const savedProject = localStorageService.saveProject(projectData);
      
      if (!savedProject) {
        throw new Error('Failed to save project to localStorage');
      }

      console.log('✅ Project saved to localStorage:', savedProject.id);

      // Step 2: Save to Supabase with correct schema mapping
      try {
        const supabaseId = await this.saveProjectToSupabase(savedProject);
        
        if (supabaseId) {
          console.log('✅ Project saved to Supabase with ID:', supabaseId);
        }

        return {
          success: true,
          project: savedProject,
          supabaseId: supabaseId || undefined
        };

      } catch (supabaseError) {
        console.error('❌ Supabase save failed:', supabaseError);
        toast.error('Project saved locally but failed to sync to database');
        
        // Still return success since localStorage save worked
        return {
          success: true,
          project: savedProject,
          error: `Database sync failed: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`
        };
      }

    } catch (error) {
      console.error('❌ Project save failed:', error);
      toast.error('Failed to save project');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save project'
      };
    }
  }

  // Save project to Supabase with correct schema
  private async saveProjectToSupabase(project: StoredProject): Promise<string | null> {
    try {
      console.log('� SAVE PROJECT TO SUPABASE - Starting...');
      console.log('📝 Project to save:', {
        id: project.id,
        title: project.title,
        creatorId: project.creatorId,
        ipfsHash: project.ipfsHash,
        blockchainTxHash: project.blockchainTxHash
      });

      // Check if project already exists by blockchain_id (which is the project.id)
      const { data: existingProject, error: checkError } = await supabase
        .from('projects')
        .select('id')
        .eq('blockchain_id', project.id)
        .single();

      let supabaseId: string;

      if (existingProject) {
        // Project exists, update it
        console.log('🔄 Project exists, updating:', existingProject.id);

        const supabaseData: Partial<ProjectSupabaseData> = {
          title: project.title,
          description: project.description,
          short_description: project.longDescription?.substring(0, 500) || project.description.substring(0, 500),
          category: project.category,
          tags: project.tags || [],
          funding_goal: project.fundingGoal || 0,
          current_funding: project.currentFunding || 0,
          currency: 'ETH',
          deadline: project.deadline,
          status: project.status as any || 'active',
          blockchain_tx_hash: project.blockchainTxHash,
          ipfs_hash: project.ipfsHash,
          blockchain_id: project.id,
          image_url: project.imageHashes && project.imageHashes.length > 0
            ? `https://gateway.pinata.cloud/ipfs/${project.imageHashes[0]}`
            : undefined,
          // image_urls: only include if DB column exists (migration may not have run yet)
          ...(await this.columnExists('projects', 'image_urls') ? {
            image_urls: project.imageUrls || (project.imageHashes ? project.imageHashes.map(h => `https://gateway.pinata.cloud/ipfs/${h}`) : [])
          } : {}),
          video_url: project.videoUrl,
          website_url: project.demoUrl,
          roadmap: project.roadmap || [],
          team_members: project.fundingTiers || [],
          featured: false,
          total_backers: 0,
          view_count: project.views || 0,
          like_count: project.likes || 0,
          comment_count: project.comments || 0,
          updated_at: new Date().toISOString()
        };

        const { data: updateData, error: updateError } = await supabase
          .from('projects')
          .update(supabaseData)
          .eq('id', existingProject.id)
          .select('id')
          .single();

        if (updateError) {
          console.error('❌ SUPABASE PROJECT UPDATE FAILED!');
          console.error('🔍 Detailed error analysis:', updateError);
          throw new Error(`Database update error: ${updateError.message}`);
        }

        supabaseId = existingProject.id;
        console.log('✅ SUPABASE PROJECT UPDATE SUCCESSFUL!');
        console.log('🆔 Updated project UUID:', supabaseId);

      } else {
        // Project doesn't exist, insert it
        console.log('� Project does not exist, inserting new record');

        const supabaseData: ProjectSupabaseData = {
          creator_id: project.creatorId,
          title: project.title,
          description: project.description,
          short_description: project.longDescription?.substring(0, 500) || project.description.substring(0, 500),
          category: project.category,
          tags: project.tags || [],
          funding_goal: project.fundingGoal || 0,
          current_funding: project.currentFunding || 0,
          currency: 'ETH',
          deadline: project.deadline,
          status: project.status as any || 'active',
          blockchain_tx_hash: project.blockchainTxHash,
          ipfs_hash: project.ipfsHash,
          blockchain_id: project.id,
          image_url: project.imageHashes && project.imageHashes.length > 0
            ? `https://gateway.pinata.cloud/ipfs/${project.imageHashes[0]}`
            : undefined,
          ...(await this.columnExists('projects', 'image_urls') ? {
            image_urls: project.imageUrls || (project.imageHashes ? project.imageHashes.map(h => `https://gateway.pinata.cloud/ipfs/${h}`) : [])
          } : {}),
          milestones: project.milestones || [],
          video_url: project.videoUrl,
          website_url: project.demoUrl,
          roadmap: project.roadmap || [],
          team_members: project.fundingTiers || [],
          featured: false,
          total_backers: 0,
          view_count: project.views || 0,
          like_count: project.likes || 0,
          comment_count: project.comments || 0,
          created_at: project.createdAt,
          updated_at: new Date().toISOString()
        };

        console.log('� Full Supabase data to insert:', JSON.stringify(supabaseData, null, 2));

        const { data, error } = await supabase
          .from('projects')
          .insert(supabaseData)
          .select('id')
          .single();

        console.log('📊 Supabase insert result:', {
          success: !error,
          data: data,
          error: error ? {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          } : null
        });

        if (error) {
          console.error('❌ SUPABASE PROJECT INSERT FAILED!');
          console.error('🔍 Detailed error analysis:');
          console.error('   - Code:', error.code);
          console.error('   - Message:', error.message);
          console.error('   - Details:', error.details);
          console.error('   - Hint:', error.hint);
          console.error('   - Full error object:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        if (!data) {
          console.error('❌ No data returned from Supabase insert');
          throw new Error('No data returned from Supabase insert');
        }

        supabaseId = data.id;
        console.log('✅ SUPABASE PROJECT INSERT SUCCESSFUL!');
        console.log('🆔 New project UUID:', supabaseId);
        console.log('📝 Project title:', supabaseData.title);
      }

      // Also save IPFS hash specifically to ipfs_storage table if available
      if (project.ipfsHash) {
        await this.saveIPFSRecord(project.ipfsHash, supabaseId, project.creatorId);
      }

      return supabaseId;

    } catch (error) {
      console.error('❌ Supabase save error:', error);
      throw error;
    }
  }

  // Save IPFS record to dedicated table
  private async saveIPFSRecord(ipfsHash: string, projectId: string, uploadedBy: string): Promise<void> {
    try {
      const ipfsData = {
        ipfs_hash: ipfsHash,
        project_id: projectId,
        uploaded_by: uploadedBy,
        file_category: 'other',
        is_public: true,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('ipfs_storage')
        .insert(ipfsData);

      if (error) {
        console.error('⚠️ IPFS record save failed:', error);
        // Don't throw - this is supplementary
      } else {
        console.log('✅ IPFS record saved to ipfs_storage table');
      }
    } catch (error) {
      console.error('⚠️ IPFS record save error:', error);
      // Don't throw - this is supplementary
    }
  }

  // Get project by ID with enhanced error handling
  async getProjectById(projectId: string): Promise<StoredProject | null> {
    try {
      console.log('🔍 Getting project by ID:', projectId);

      // First try localStorage (fastest)
      const localProject = localStorageService.getProjectById(projectId);
      if (localProject) {
        console.log('✅ Found project in localStorage');
        return localProject;
      }

      // Try Supabase with several possible ID fields (uuid id, blockchain_id, title)
      let data: any = null;
      let error: any = null;

      // 1) Try UUID primary id
      ({ data, error } = await supabase.from('projects').select('*').eq('id', projectId).single());

      // 2) If not found, try blockchain_id
      if ((!data || Object.keys(data).length === 0) && !error) {
        ({ data, error } = await supabase.from('projects').select('*').eq('blockchain_id', projectId).single());
      }

      // 3) If still not found, try title (case-insensitive)
      if ((!data || Object.keys(data).length === 0) && !error) {
        ({ data, error } = await supabase.from('projects').select('*').ilike('title', projectId).single());
      }

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ Project not found in Supabase');
          return null;
        }
        console.error('Supabase error fetching project:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      console.log('✅ Found project in Supabase');

      // Convert back to StoredProject format
      const project: StoredProject = {
        id: data.id,
        title: data.title,
        description: data.description,
        longDescription: data.short_description,
        category: data.category,
        tags: data.tags || [],
        fundingGoal: data.funding_goal || 0,
        currentFunding: data.current_funding || 0,
        deadline: data.deadline,
        teamSize: 1,
        technologies: [],
        features: [],
        roadmap: data.roadmap || [],
        milestones: [],
        fundingTiers: data.team_members || [],
        creatorId: data.creator_id,
        creatorName: undefined,
        creatorAddress: undefined,
        status: data.status as any,
        demoUrl: data.website_url,
        videoUrl: data.video_url,
        imageHashes: data.image_url ? [data.image_url] : [],
        imageUrls: data.image_urls || [],
        blockchainId: data.blockchain_id || undefined,
        ipfsHash: data.ipfs_hash,
        blockchainTxHash: data.blockchain_tx_hash,
        blockchainRecord: data.blockchain_tx_hash ? {
          txHash: data.blockchain_tx_hash,
          verified: true,
          timestamp: data.created_at
        } : undefined,
        views: data.view_count || 0,
        likes: data.like_count || 0,
        supporters: [],
        comments: data.comment_count || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return project;

    } catch (error) {
      console.error('❌ Error getting project by ID:', error);
      return null;
    }
  }

  // Ensure project exists in Supabase (for projects created on blockchain)
  async ensureProjectInSupabase(
    projectId: string, 
    localProject: StoredProject, 
    blockchainTxHash?: string
  ): Promise<{
    success: boolean;
    supabaseId?: string;
    error?: string;
  }> {
    try {
      console.log('🔍 Checking if project exists in Supabase...');
      
      // First check if project already exists by title
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('title', projectId)
        .single();
      
      if (existingProject) {
        console.log('✅ Project already exists in Supabase:', existingProject.id);
        return { success: true, supabaseId: existingProject.id };
      }
      
      // Project doesn't exist, create it
      console.log('📝 Project not in Supabase, creating...');
      
      const projectWithBlockchain: StoredProject = {
        ...localProject,
        blockchainTxHash: blockchainTxHash || localProject.blockchainTxHash,
        status: 'active' as const // Set to active since it's on blockchain
      };
      
      const supabaseId = await this.saveProjectToSupabase(projectWithBlockchain);
      
      if (supabaseId) {
        console.log('✅ Project created in Supabase:', supabaseId);
        return { success: true, supabaseId };
      } else {
        return { success: false, error: 'Failed to create project in Supabase' };
      }
      
    } catch (error: any) {
      console.error('❌ Error ensuring project in Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  // Update project in both localStorage and Supabase
  async updateProject(projectId: string, updates: Partial<StoredProject>): Promise<{
    success: boolean;
    project?: StoredProject;
    error?: string;
    data?: any;
  }> {
    try {
      console.log(`🔄 Updating project ${projectId}:`, updates);

      // First update localStorage
      let updatedProject: StoredProject | null = null;
      try {
        const localProject = localStorageService.getProjectById(projectId);
        if (localProject) {
          updatedProject = { ...localProject, ...updates };
          localStorageService.updateProject(projectId, updates);
          console.log('✅ Project updated in localStorage');
        }
      } catch (localError) {
        console.warn('⚠️ Failed to update in localStorage:', localError);
      }

      // Convert updates to Supabase format (using correct field names from schema)
      const supabaseUpdates: Partial<ProjectSupabaseData> = {};
      
      if (updates.title) supabaseUpdates.title = updates.title;
      if (updates.description) supabaseUpdates.description = updates.description;
      if (updates.longDescription) supabaseUpdates.short_description = updates.longDescription;
      if (updates.category) supabaseUpdates.category = updates.category;
      if (updates.tags) supabaseUpdates.tags = updates.tags;
      if (updates.demoUrl) supabaseUpdates.website_url = updates.demoUrl;
      if (updates.videoUrl) supabaseUpdates.video_url = updates.videoUrl;
  if (updates.imageHashes && updates.imageHashes.length > 0) supabaseUpdates.image_url = updates.imageHashes[0];
  // Persist imgbb / CDN URLs to image_urls (text[]) if column exists
  if (updates.imageUrls && updates.imageUrls.length > 0) {
    if (await this.columnExists('projects', 'image_urls')) {
      supabaseUpdates.image_urls = updates.imageUrls;
    } else {
      console.warn('Skipping image_urls update because column does not exist yet');
    }
  }
  // Persist milestones (JSON/JSONB)
  if (updates.milestones) supabaseUpdates.roadmap = updates.milestones; // keep roadmap for compatibility
  if (updates.milestones) supabaseUpdates.milestones = updates.milestones as any;
      if (updates.fundingGoal) supabaseUpdates.funding_goal = updates.fundingGoal;
      if (updates.currentFunding !== undefined) supabaseUpdates.current_funding = updates.currentFunding;
      if (updates.deadline) supabaseUpdates.deadline = updates.deadline;
      if (updates.roadmap) supabaseUpdates.roadmap = updates.roadmap;
      if (updates.fundingTiers) supabaseUpdates.team_members = updates.fundingTiers; // Using team_members field for funding tiers
      if (updates.ipfsHash) supabaseUpdates.ipfs_hash = updates.ipfsHash;
      if (updates.blockchainTxHash) supabaseUpdates.blockchain_tx_hash = updates.blockchainTxHash;
      if (updates.status) supabaseUpdates.status = updates.status;

      // Add updated timestamp
      supabaseUpdates.updated_at = new Date().toISOString();

      // Update in Supabase - first find the correct record
      console.log('🔍 Looking for Supabase project record...');
      console.log('🎯 Project ID to find:', projectId);
      
      let supabaseProjectId = projectId;
      
      // If projectId is not a UUID (blockchain project ID), find by title
      if (!projectId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log('🔄 Project ID is not UUID, searching by title...');
        
        const { data: foundProject, error: findError } = await supabase
          .from('projects')
          .select('id')
          .eq('title', projectId)
          .single();
        
        if (foundProject) {
          supabaseProjectId = foundProject.id;
          console.log('✅ Found Supabase project UUID:', supabaseProjectId);
        } else {
          console.warn('⚠️ Project not found in Supabase, cannot update');
          console.warn('🔍 Find error:', findError?.message);
          // Don't throw error, just log warning and continue
          return {
            success: true,
            project: updatedProject || undefined,
            error: `Project not found in Supabase: ${projectId}`
          };
        }
      }

      console.log('📤 Updating Supabase project:', supabaseProjectId);
      console.log('📝 Updates to apply:', JSON.stringify(supabaseUpdates, null, 2));

      const { data: supabaseData, error: supabaseError } = await supabase
        .from('projects')
        .update(supabaseUpdates)
        .eq('id', supabaseProjectId)
        .select();

      console.log('📊 Supabase update result:', {
        success: !supabaseError,
        data: supabaseData,
        error: supabaseError ? {
          code: supabaseError.code,
          message: supabaseError.message,
          details: supabaseError.details,
          hint: supabaseError.hint
        } : null
      });

      if (supabaseError) {
        console.error('❌ SUPABASE PROJECT UPDATE FAILED!');
        console.error('🔍 Error details:', supabaseError);
        throw supabaseError;
      }

      console.log('✅ Project updated successfully in Supabase');

      return {
        success: true,
        project: updatedProject || undefined,
        data: supabaseData
      };

    } catch (error: any) {
      console.error('❌ Error updating project:', error);
      return {
        success: false,
        error: error.message || 'Failed to update project'
      };
    }
  }

  // Enhanced IPFS hash sync with detailed logging
  async syncIPFSHashToSupabase(projectId: string, ipfsHash: string): Promise<boolean> {
    try {
      console.log('🔄 Syncing IPFS hash to Supabase:', { projectId, ipfsHash });

      const { error } = await supabase
        .from('projects')
        .update({ 
          ipfs_hash: ipfsHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error('❌ IPFS hash sync failed:', error);
        toast.error('Failed to sync IPFS hash to database');
        return false;
      }

      console.log('✅ IPFS hash synced successfully');
      toast.success('Project data synced to blockchain storage');
      return true;

    } catch (error) {
      console.error('❌ IPFS hash sync error:', error);
      return false;
    }
  }

  // Test connection and verify schema
  async testSupabaseConnection(): Promise<{
    connected: boolean;
    schemaValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      console.log('🧪 Testing Supabase connection...');

      // Test basic connection
      const { data, error } = await supabase
        .from('projects')
        .select('count', { count: 'exact', head: true });

      if (error) {
        errors.push(`Connection failed: ${error.message}`);
        return { connected: false, schemaValid: false, errors };
      }

      console.log('✅ Supabase connection successful');

      // Test schema by checking required columns
      const { data: schemaData, error: schemaError } = await supabase
        .from('projects')
        .select('id, creator_id, title, ipfs_hash, blockchain_tx_hash')
        .limit(1);

      if (schemaError) {
        errors.push(`Schema validation failed: ${schemaError.message}`);
        return { connected: true, schemaValid: false, errors };
      }

      console.log('✅ Schema validation successful');

      return { connected: true, schemaValid: true, errors: [] };

    } catch (error) {
      errors.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { connected: false, schemaValid: false, errors };
    }
  }

  // Get all projects with enhanced error handling
  async getAllProjects(): Promise<StoredProject[]> {
    try {
      // Get from localStorage first
      const localProjects = localStorageService.getAllProjects();
      
      // Get from Supabase
      const { data: supabaseProjects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch projects from Supabase:', error);
        toast.error('Failed to load projects from database');
        return localProjects;
      }

      // Merge and deduplicate
      const allProjects: StoredProject[] = [...localProjects];
      const localProjectIds = new Set(localProjects.map(p => p.id));

      if (supabaseProjects) {
        for (const data of supabaseProjects) {
          if (!localProjectIds.has(data.id)) {
            const project: StoredProject = {
              id: data.id,
              title: data.title,
              description: data.description,
              longDescription: data.short_description,
              category: data.category,
              tags: data.tags || [],
              fundingGoal: data.funding_goal || 0,
              currentFunding: data.current_funding || 0,
              deadline: data.deadline,
              teamSize: 1,
              technologies: [],
              features: [],
              roadmap: data.roadmap || [],
              milestones: [],
              fundingTiers: [],
              creatorId: data.creator_id,
              creatorName: undefined,
              creatorAddress: undefined,
              status: data.status as any,
              demoUrl: data.website_url,
              videoUrl: data.video_url,
              imageHashes: [],
              ipfsHash: data.ipfs_hash,
              blockchainTxHash: data.blockchain_tx_hash,
              views: data.view_count || 0,
              likes: data.like_count || 0,
              supporters: [],
              comments: data.comment_count || 0,
              createdAt: data.created_at,
              updatedAt: data.updated_at
            };
            allProjects.push(project);
          }
        }
      }

      return allProjects;

    } catch (error) {
      console.error('Error getting all projects:', error);
      return localStorageService.getAllProjects();
    }
  }

  // Diagnostic method to check IPFS hash status
  async diagnoseIPFSHashIssues(): Promise<void> {
    try {
      console.log('🔍 Starting IPFS hash diagnosis...');

      // Check Supabase connection
      const connectionTest = await this.testSupabaseConnection();
      console.log('Connection test results:', connectionTest);

      // Check projects with missing IPFS hashes
      const { data: projectsWithoutIPFS, error } = await supabase
        .from('projects')
        .select('id, title, ipfs_hash, blockchain_tx_hash')
        .is('ipfs_hash', null);

      if (error) {
        console.error('Failed to query projects:', error);
        return;
      }

      console.log(`📊 Found ${projectsWithoutIPFS?.length || 0} projects without IPFS hashes`);

      // Check IPFS storage table
      const { data: ipfsRecords, error: ipfsError } = await supabase
        .from('ipfs_storage')
        .select('count', { count: 'exact', head: true });

      if (ipfsError) {
        console.error('IPFS storage table error:', ipfsError);
      } else {
        console.log(`📊 IPFS storage table has ${ipfsRecords} records`);
      }

    } catch (error) {
      console.error('Diagnosis failed:', error);
    }
  }
}

export const enhancedProjectService = new EnhancedProjectService();
export default enhancedProjectService;