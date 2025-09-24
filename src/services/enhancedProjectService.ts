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
  image_url?: string;
  video_url?: string;
  website_url?: string;
  github_url?: string;
  whitepaper_url?: string;
  roadmap: any[];
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
      console.log('📤 Preparing Supabase data for project:', project.id);

      const supabaseData: ProjectSupabaseData = {
        // Map to correct schema fields
        creator_id: project.creatorId,
        title: project.title,
        description: project.description,
        short_description: project.longDescription?.substring(0, 500) || project.description.substring(0, 500),
        category: project.category,
        tags: project.tags || [],
        funding_goal: project.fundingGoal || 0,
        current_funding: project.currentFunding || 0,
        currency: 'ETH', // Default currency
        deadline: project.deadline,
        status: project.status as any || 'draft',
        blockchain_tx_hash: project.blockchainTxHash,
        ipfs_hash: project.ipfsHash, // 🎯 Key field for IPFS hash
        image_url: project.imageHashes && project.imageHashes.length > 0 
          ? `https://gateway.pinata.cloud/ipfs/${project.imageHashes[0]}` 
          : undefined,
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

      console.log('📊 Supabase data prepared:', {
        creator_id: supabaseData.creator_id,
        title: supabaseData.title,
        ipfs_hash: supabaseData.ipfs_hash,
        blockchain_tx_hash: supabaseData.blockchain_tx_hash
      });

      // Insert into Supabase with proper error handling
      const { data, error } = await supabase
        .from('projects')
        .insert(supabaseData)
        .select('id')
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from Supabase insert');
      }

      console.log('✅ Supabase insert successful:', data);
      
      // Also save IPFS hash specifically to ipfs_storage table if available
      if (project.ipfsHash) {
        await this.saveIPFSRecord(project.ipfsHash, data.id, project.creatorId);
      }

      return data.id;

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

      // Try Supabase with correct ID field
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ Project not found in Supabase');
          return null;
        }
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

      // Update in Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('projects')
        .update(supabaseUpdates)
        .eq('id', projectId)
        .select();

      if (supabaseError) {
        console.error('❌ Failed to update project in Supabase:', supabaseError);
        throw supabaseError;
      }

      console.log('✅ Project updated in Supabase:', supabaseData);

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