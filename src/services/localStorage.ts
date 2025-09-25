import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export interface StoredProject {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  tags: string[];
  fundingGoal: number;
  currentFunding: number;
  deadline: string;
  teamSize: number;
  technologies: string[];
  features: string[];
  roadmap: any[];
  milestones: any[];
  fundingTiers: any[];
  creatorId: string;
  creatorName?: string;
  creatorAddress?: string;
  status: 'draft' | 'active' | 'funded' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  demoUrl?: string;
  videoUrl?: string;
  imageHashes?: string[];
  imageUrls?: string[];
  ipfsHash?: string;
  blockchainTxHash?: string;
  blockchainId?: string;
  blockchainRecord?: {
    txHash: string;
    blockNumber?: number;
    timestamp?: string;
    verified: boolean;
  };
  views: number;
  likes: number;
  supporters: string[];
  comments: number;
}

export interface StoredIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  estimatedBudget?: number;
  creatorId: string;
  creatorAddress: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  ipfsHash?: string;
  blockchainTxHash?: string;
  blockchainRecord?: {
    txHash: string;
    blockNumber?: number;
    timestamp?: string;
    verified: boolean;
  };
  upvotes: number;
  downvotes: number;
  views: number;
  comments: number;
}

const STORAGE_KEYS = {
  PROJECTS: 'projectforge_projects',
  IDEAS: 'projectforge_ideas',
  USER_INTERACTIONS: 'projectforge_user_interactions'
};

class LocalStorageService {
  
  // Project methods
  saveProject(projectData: Omit<StoredProject, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'supporters' | 'comments'>): StoredProject {
    try {
      const projects = this.getAllProjects();
      
      const newProject: StoredProject = {
        id: uuidv4(),
        ...projectData,
        currentFunding: 0,
        views: 0,
        likes: 0,
        supporters: [],
        comments: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      projects.push(newProject);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      
      toast.success('Project saved locally');
      return newProject;
    } catch (error) {
      console.error('Error saving project to localStorage:', error);
      toast.error('Failed to save project locally');
      throw error;
    }
  }

  getAllProjects(): StoredProject[] {
    try {
      const projectsJson = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return projectsJson ? JSON.parse(projectsJson) : [];
    } catch (error) {
      console.error('Error loading projects from localStorage:', error);
      return [];
    }
  }

  getProjectById(projectId: string): StoredProject | null {
    try {
      const projects = this.getAllProjects();
      return projects.find(project => project.id === projectId) || null;
    } catch (error) {
      console.error('Error getting project by ID:', error);
      return null;
    }
  }

  getProjectsByCreator(creatorId: string): StoredProject[] {
    try {
      const projects = this.getAllProjects();
      return projects.filter(project => project.creatorId === creatorId);
    } catch (error) {
      console.error('Error getting projects by creator:', error);
      return [];
    }
  }

  updateProject(projectId: string, updates: Partial<StoredProject>): StoredProject | null {
    try {
      const projects = this.getAllProjects();
      const projectIndex = projects.findIndex(project => project.id === projectId);
      
      if (projectIndex === -1) {
        toast.error('Project not found');
        return null;
      }

      const updatedProject = {
        ...projects[projectIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      projects[projectIndex] = updatedProject;
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
      return null;
    }
  }

  deleteProject(projectId: string): boolean {
    try {
      const projects = this.getAllProjects();
      const filteredProjects = projects.filter(project => project.id !== projectId);
      
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filteredProjects));
      toast.success('Project deleted');
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      return false;
    }
  }

  // Idea methods
  saveIdea(ideaData: Omit<StoredIdea, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'views' | 'comments'>): StoredIdea {
    try {
      const ideas = this.getAllIdeas();
      
      const newIdea: StoredIdea = {
        id: uuidv4(),
        ...ideaData,
        upvotes: 0,
        downvotes: 0,
        views: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      ideas.push(newIdea);
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
      
      toast.success('Idea saved locally');
      return newIdea;
    } catch (error) {
      console.error('Error saving idea to localStorage:', error);
      toast.error('Failed to save idea locally');
      throw error;
    }
  }

  getAllIdeas(): StoredIdea[] {
    try {
      const ideasJson = localStorage.getItem(STORAGE_KEYS.IDEAS);
      return ideasJson ? JSON.parse(ideasJson) : [];
    } catch (error) {
      console.error('Error loading ideas from localStorage:', error);
      return [];
    }
  }

  getIdeaById(ideaId: string): StoredIdea | null {
    try {
      const ideas = this.getAllIdeas();
      return ideas.find(idea => idea.id === ideaId) || null;
    } catch (error) {
      console.error('Error getting idea by ID:', error);
      return null;
    }
  }

  updateIdea(ideaId: string, updates: Partial<StoredIdea>): StoredIdea | null {
    try {
      const ideas = this.getAllIdeas();
      const ideaIndex = ideas.findIndex(idea => idea.id === ideaId);
      
      if (ideaIndex === -1) {
        toast.error('Idea not found');
        return null;
      }

      const updatedIdea = {
        ...ideas[ideaIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      ideas[ideaIndex] = updatedIdea;
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
      
      return updatedIdea;
    } catch (error) {
      console.error('Error updating idea:', error);
      toast.error('Failed to update idea');
      return null;
    }
  }

  // User interaction methods
  toggleProjectLike(projectId: string, userId: string): boolean {
    try {
      const interactions = this.getUserInteractions();
      const userKey = `likes_${userId}`;
      const userLikes = interactions[userKey] || [];
      
      let isLiked = false;
      let updatedLikes: string[];
      
      if (userLikes.includes(projectId)) {
        // Unlike
        updatedLikes = userLikes.filter((id: string) => id !== projectId);
        this.updateProjectStats(projectId, { likes: -1 });
      } else {
        // Like
        updatedLikes = [...userLikes, projectId];
        isLiked = true;
        this.updateProjectStats(projectId, { likes: 1 });
      }
      
      interactions[userKey] = updatedLikes;
      localStorage.setItem(STORAGE_KEYS.USER_INTERACTIONS, JSON.stringify(interactions));
      
      return isLiked;
    } catch (error) {
      console.error('Error toggling project like:', error);
      return false;
    }
  }

  isProjectLikedByUser(projectId: string, userId: string): boolean {
    try {
      const interactions = this.getUserInteractions();
      const userLikes = interactions[`likes_${userId}`] || [];
      return userLikes.includes(projectId);
    } catch (error) {
      console.error('Error checking if project is liked:', error);
      return false;
    }
  }

  incrementProjectViews(projectId: string): void {
    this.updateProjectStats(projectId, { views: 1 });
  }

  private updateProjectStats(projectId: string, deltas: { likes?: number; views?: number; comments?: number }): void {
    try {
      const projects = this.getAllProjects();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        const project = projects[projectIndex];
        
        if (deltas.likes !== undefined) {
          project.likes = Math.max(0, project.likes + deltas.likes);
        }
        if (deltas.views !== undefined) {
          project.views = Math.max(0, project.views + deltas.views);
        }
        if (deltas.comments !== undefined) {
          project.comments = Math.max(0, project.comments + deltas.comments);
        }
        
        project.updatedAt = new Date().toISOString();
        projects[projectIndex] = project;
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      }
    } catch (error) {
      console.error('Error updating project stats:', error);
    }
  }

  private getUserInteractions(): any {
    try {
      const interactionsJson = localStorage.getItem(STORAGE_KEYS.USER_INTERACTIONS);
      return interactionsJson ? JSON.parse(interactionsJson) : {};
    } catch (error) {
      console.error('Error loading user interactions:', error);
      return {};
    }
  }

  // Utility methods
  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.IDEAS);
      localStorage.removeItem(STORAGE_KEYS.USER_INTERACTIONS);
      toast.success('All local data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear local data');
    }
  }

  exportData(): { projects: StoredProject[]; ideas: StoredIdea[] } {
    return {
      projects: this.getAllProjects(),
      ideas: this.getAllIdeas()
    };
  }

  importData(data: { projects?: StoredProject[]; ideas?: StoredIdea[] }): void {
    try {
      if (data.projects) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
      }
      if (data.ideas) {
        localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(data.ideas));
      }
      toast.success('Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
    }
  }

  getStats(): { 
    totalProjects: number; 
    totalIdeas: number; 
    totalFundingGoals: number;
    totalViews: number;
  } {
    const projects = this.getAllProjects();
    const ideas = this.getAllIdeas();
    
    return {
      totalProjects: projects.length,
      totalIdeas: ideas.length,
      totalFundingGoals: projects.reduce((sum, p) => sum + p.fundingGoal, 0),
      totalViews: projects.reduce((sum, p) => sum + p.views, 0)
    };
  }
}

// Create and export a singleton instance
export const localStorageService = new LocalStorageService();
export default localStorageService;