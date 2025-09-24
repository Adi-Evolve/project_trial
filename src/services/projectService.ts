import { supabase } from './supabase';
import { localStorageService, StoredProject } from './localStorage';
import { toast } from 'react-hot-toast';

export interface ProjectSupabaseData {
  project_id: string;
  title: string;
  description: string;
  long_description?: string;
  category: string;
  tags: string[];
  funding_goal: number;
  current_funding: number;
  deadline: string;
  team_size: number;
  technologies: string[];
  features: string[];
  roadmap: any[];
  milestones: any[];
  funding_tiers: any[];
  creator_id: string;
  creator_name?: string;
  creator_address?: string;
  status: 'draft' | 'active' | 'funded' | 'completed' | 'cancelled';
  demo_url?: string;
  video_url?: string;
  image_hashes?: string[];
  ipfs_hash?: string;
  blockchain_tx_hash?: string;
  blockchain_verified: boolean;
  views: number;
  likes: number;
  supporters: string[];
  comments_count: number;
  created_at: string;
  updated_at: string;
}

class ProjectService {
  
  // Save project to both localStorage and Supabase
  async saveProject(projectData: Omit<StoredProject, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'supporters' | 'comments'>): Promise<{
    success: boolean;
    project?: StoredProject;
    error?: string;
  }> {
    try {
      // First save to localStorage for immediate use
      const savedProject = localStorageService.saveProject(projectData);
      
      if (!savedProject) {
        throw new Error('Failed to save project to localStorage');
      }

      // Then save to Supabase for persistence and sharing
      await this.saveProjectToSupabase(savedProject);

      return {
        success: true,
        project: savedProject
      };

    } catch (error) {
      console.error('Failed to save project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save project'
      };
    }
  }

  // Save project to Supabase
  private async saveProjectToSupabase(project: StoredProject): Promise<void> {
    try {
      const supabaseData: ProjectSupabaseData = {
        project_id: project.id,
        title: project.title,
        description: project.description,
        long_description: project.longDescription,
        category: project.category,
        tags: project.tags,
        funding_goal: project.fundingGoal,
        current_funding: project.currentFunding,
        deadline: project.deadline,
        team_size: project.teamSize,
        technologies: project.technologies,
        features: project.features,
        roadmap: project.roadmap,
        milestones: project.milestones,
        funding_tiers: project.fundingTiers,
        creator_id: project.creatorId,
        creator_name: project.creatorName,
        creator_address: project.creatorAddress,
        status: project.status,
        demo_url: project.demoUrl,
        video_url: project.videoUrl,
        image_hashes: project.imageHashes,
        ipfs_hash: project.ipfsHash,
        blockchain_tx_hash: project.blockchainTxHash,
        blockchain_verified: project.blockchainRecord?.verified || false,
        views: project.views,
        likes: project.likes,
        supporters: project.supporters,
        comments_count: project.comments,
        created_at: project.createdAt,
        updated_at: project.updatedAt
      };

      const { error } = await supabase
        .from('projects')
        .upsert(supabaseData);

      if (error) {
        console.error('Supabase save error:', error);
        // Don't throw error here - localStorage save was successful
        toast.error('Failed to sync project to database');
      } else {
        console.log('✅ Project successfully saved to Supabase with IPFS hash:', project.ipfsHash);
      }

    } catch (error) {
      console.error('Error saving to Supabase:', error);
      // Don't throw - localStorage save was successful
    }
  }

  // Get project by ID (tries Supabase first, then localStorage)
  async getProjectById(projectId: string): Promise<StoredProject | null> {
    try {
      // First try to get from localStorage (fastest)
      const localProject = localStorageService.getProjectById(projectId);
      if (localProject) {
        return localProject;
      }

      // If not found locally, try Supabase
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error || !data) {
        return null;
      }

      // Convert Supabase data back to StoredProject format
      const project: StoredProject = {
        id: data.project_id,
        title: data.title,
        description: data.description,
        longDescription: data.long_description,
        category: data.category,
        tags: data.tags,
        fundingGoal: data.funding_goal,
        currentFunding: data.current_funding,
        deadline: data.deadline,
        teamSize: data.team_size,
        technologies: data.technologies,
        features: data.features,
        roadmap: data.roadmap,
        milestones: data.milestones,
        fundingTiers: data.funding_tiers,
        creatorId: data.creator_id,
        creatorName: data.creator_name,
        creatorAddress: data.creator_address,
        status: data.status,
        demoUrl: data.demo_url,
        videoUrl: data.video_url,
        imageHashes: data.image_hashes,
        ipfsHash: data.ipfs_hash,
        blockchainTxHash: data.blockchain_tx_hash,
        blockchainRecord: data.blockchain_tx_hash ? {
          txHash: data.blockchain_tx_hash,
          verified: data.blockchain_verified,
          timestamp: data.created_at
        } : undefined,
        views: data.views,
        likes: data.likes,
        supporters: data.supporters,
        comments: data.comments_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return project;

    } catch (error) {
      console.error('Error getting project:', error);
      return null;
    }
  }

  // Update project in both localStorage and Supabase
  async updateProject(projectId: string, updates: Partial<StoredProject>): Promise<{
    success: boolean;
    project?: StoredProject;
    error?: string;
  }> {
    try {
      // Update in localStorage first
      const updatedProject = localStorageService.updateProject(projectId, updates);
      
      if (!updatedProject) {
        throw new Error('Failed to update project in localStorage');
      }

      // Update in Supabase
      const supabaseUpdates = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Convert field names to Supabase format
      const supabaseData: any = {};
      Object.keys(supabaseUpdates).forEach((key: string) => {
        switch (key) {
          case 'longDescription':
            supabaseData.long_description = (supabaseUpdates as any)[key];
            break;
          case 'fundingGoal':
            supabaseData.funding_goal = (supabaseUpdates as any)[key];
            break;
          case 'currentFunding':
            supabaseData.current_funding = (supabaseUpdates as any)[key];
            break;
          case 'teamSize':
            supabaseData.team_size = (supabaseUpdates as any)[key];
            break;
          case 'fundingTiers':
            supabaseData.funding_tiers = (supabaseUpdates as any)[key];
            break;
          case 'creatorId':
            supabaseData.creator_id = (supabaseUpdates as any)[key];
            break;
          case 'creatorName':
            supabaseData.creator_name = (supabaseUpdates as any)[key];
            break;
          case 'creatorAddress':
            supabaseData.creator_address = (supabaseUpdates as any)[key];
            break;
          case 'demoUrl':
            supabaseData.demo_url = (supabaseUpdates as any)[key];
            break;
          case 'videoUrl':
            supabaseData.video_url = (supabaseUpdates as any)[key];
            break;
          case 'imageHashes':
            supabaseData.image_hashes = (supabaseUpdates as any)[key];
            break;
          case 'ipfsHash':
            supabaseData.ipfs_hash = (supabaseUpdates as any)[key];
            break;
          case 'blockchainTxHash':
            supabaseData.blockchain_tx_hash = (supabaseUpdates as any)[key];
            break;
          case 'updatedAt':
            supabaseData.updated_at = (supabaseUpdates as any)[key];
            break;
          case 'createdAt':
            supabaseData.created_at = (supabaseUpdates as any)[key];
            break;
          default:
            supabaseData[key] = (supabaseUpdates as any)[key];
        }
      });

      const { error } = await supabase
        .from('projects')
        .update(supabaseData)
        .eq('project_id', projectId);

      if (error) {
        console.error('Supabase update error:', error);
        toast.error('Failed to sync project update to database');
      }

      return {
        success: true,
        project: updatedProject
      };

    } catch (error) {
      console.error('Failed to update project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update project'
      };
    }
  }

  // Get all projects (combines localStorage and Supabase)
  async getAllProjects(): Promise<StoredProject[]> {
    try {
      // Get from localStorage first (fastest)
      const localProjects = localStorageService.getAllProjects();
      
      // Try to get additional projects from Supabase
      const { data: supabaseProjects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch projects from Supabase:', error);
        return localProjects; // Return local projects if Supabase fails
      }

      // Combine and deduplicate projects
      const allProjects: StoredProject[] = [...localProjects];
      const localProjectIds = new Set(localProjects.map(p => p.id));

      if (supabaseProjects) {
        for (const data of supabaseProjects) {
          if (!localProjectIds.has(data.project_id)) {
            const project: StoredProject = {
              id: data.project_id,
              title: data.title,
              description: data.description,
              longDescription: data.long_description,
              category: data.category,
              tags: data.tags || [],
              fundingGoal: data.funding_goal,
              currentFunding: data.current_funding,
              deadline: data.deadline,
              teamSize: data.team_size,
              technologies: data.technologies || [],
              features: data.features || [],
              roadmap: data.roadmap || [],
              milestones: data.milestones || [],
              fundingTiers: data.funding_tiers || [],
              creatorId: data.creator_id,
              creatorName: data.creator_name,
              creatorAddress: data.creator_address,
              status: data.status,
              demoUrl: data.demo_url,
              videoUrl: data.video_url,
              imageHashes: data.image_hashes,
              ipfsHash: data.ipfs_hash,
              blockchainTxHash: data.blockchain_tx_hash,
              blockchainRecord: data.blockchain_tx_hash ? {
                txHash: data.blockchain_tx_hash,
                verified: data.blockchain_verified,
                timestamp: data.created_at
              } : undefined,
              views: data.views || 0,
              likes: data.likes || 0,
              supporters: data.supporters || [],
              comments: data.comments_count || 0,
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
      return localStorageService.getAllProjects(); // Fallback to local
    }
  }

  // Sync a project's IPFS hash to Supabase (specific fix for the hash storage issue)
  async syncIPFSHashToSupabase(projectId: string, ipfsHash: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          ipfs_hash: ipfsHash,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId);

      if (error) {
        console.error('Failed to sync IPFS hash to Supabase:', error);
        return false;
      }

      console.log('✅ IPFS hash synced to Supabase:', ipfsHash);
      return true;

    } catch (error) {
      console.error('Error syncing IPFS hash:', error);
      return false;
    }
  }

  // Verify IPFS hashes are properly saved
  async verifyProjectIPFSHashes(): Promise<{
    total: number;
    withIPFS: number;
    missing: string[];
  }> {
    try {
      const projects = await this.getAllProjects();
      const withIPFS = projects.filter(p => p.ipfsHash).length;
      const missing = projects.filter(p => !p.ipfsHash).map(p => p.id);

      console.log(`📊 IPFS Hash Status: ${withIPFS}/${projects.length} projects have IPFS hashes`);
      
      return {
        total: projects.length,
        withIPFS,
        missing
      };

    } catch (error) {
      console.error('Error verifying IPFS hashes:', error);
      return { total: 0, withIPFS: 0, missing: [] };
    }
  }
}

export const projectService = new ProjectService();
export default projectService;