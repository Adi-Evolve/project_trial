export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  skills: string[];
  fieldsOfInterest: string[];
  reputation: number;
  verified: boolean;
  githubProfile?: string;
  linkedinProfile?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  images: string[];
  videos?: string[];
  category: ProjectCategory;
  tags: string[];
  status: ProjectStatus;
  visibility: 'public' | 'private' | 'unlisted';
  targetAmount?: number;
  currentAmount: number;
  currency: 'USD' | 'ETH' | 'MATIC';
  startDate: string;
  endDate?: string;
  requirements: string[];
  skillsNeeded: string[];
  teamSize: number;
  currentTeamSize: number;
  location?: string;
  remote: boolean;
  owner: User;
  collaborators: User[];
  upvotes: number;
  downvotes: number;
  views: number;
  bookmarks: number;
  comments: Comment[];
  updates: ProjectUpdate[];
  milestones: Milestone[];
  blockchain: {
    txHash?: string;
    blockNumber?: number;
    contractAddress?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  tags: string[];
  visibility: 'public' | 'private' | 'protected';
  author: User;
  upvotes: number;
  downvotes: number;
  views: number;
  comments: Comment[];
  collaborationOpen: boolean;
  skillsNeeded: string[];
  potentialReward?: number;
  blockchain: {
    txHash: string;
    blockNumber: number;
    timestamp: string;
    ownershipProof: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  parentId?: string;
  replies: Comment[];
  upvotes: number;
  downvotes: number;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  images?: string[];
  videos?: string[];
  author: User;
  type: 'progress' | 'milestone' | 'announcement' | 'funding';
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedDate?: string;
  reward?: number;
  requirements: string[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface VoteRecord {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'project' | 'idea' | 'comment';
  voteType: 'up' | 'down';
  createdAt: string;
}

export type ProjectCategory = 
  | 'technology'
  | 'design'
  | 'business'
  | 'education'
  | 'health'
  | 'environment'
  | 'social'
  | 'entertainment'
  | 'research'
  | 'nonprofit'
  | 'hardware'
  | 'software'
  | 'mobile'
  | 'web'
  | 'ai'
  | 'blockchain'
  | 'iot'
  | 'gaming'
  | 'fintech'
  | 'other';

export type IdeaCategory = 
  | 'app_idea'
  | 'business_model'
  | 'feature_request'
  | 'research_topic'
  | 'design_concept'
  | 'technical_solution'
  | 'social_impact'
  | 'innovation'
  | 'other';

export type ProjectStatus = 
  | 'draft'
  | 'seeking_team'
  | 'seeking_funding'
  | 'in_progress'
  | 'completed'
  | 'paused'
  | 'cancelled';

export type NotificationType = 
  | 'project_update'
  | 'comment_reply'
  | 'collaboration_request'
  | 'vote_received'
  | 'milestone_completed'
  | 'funding_received'
  | 'system_announcement';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface UserSkill {
  name: string;
  level: SkillLevel;
  yearsOfExperience: number;
  verified: boolean;
}

export interface SearchFilters {
  category?: ProjectCategory | IdeaCategory;
  tags?: string[];
  skills?: string[];
  location?: string;
  remote?: boolean;
  status?: ProjectStatus;
  sortBy?: 'newest' | 'oldest' | 'most_upvoted' | 'most_viewed' | 'trending';
  timeRange?: 'today' | 'week' | 'month' | 'year' | 'all';
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface BlockchainRecord {
  id: string;
  type: 'user_verification' | 'project_creation' | 'idea_registration' | 'vote_cast';
  data: any;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  verified: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
}