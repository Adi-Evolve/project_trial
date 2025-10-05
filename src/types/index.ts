export interface User {
  id: string;
  google_id?: string;
  email: string;
  email_verified: boolean;
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  cover_photo?: string;
  website_url?: string;
  github_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  location?: string;
  phone?: string;
  company?: string;
  role?: string;
  skills: string[];
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  user_type: 'user' | 'admin' | 'reviewer';
  verification_status: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  is_active: boolean;
  is_reviewer: boolean;
  reputation_score: number;
  total_projects: number;
  views: number;
  likes: number;
  followers_count: number;
  following_count: number;
  privacy_settings: Record<string, any>;
  notification_settings: Record<string, any>;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  summary?: string;
  category: string;
  tags: string[];
  deadline?: string;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled';
  approval_status: 'pending' | 'approved' | 'rejected';
  cover_image?: string; // ImgBB URL
  image_urls?: string[]; // Multiple ImgBB URLs
  video_url?: string;
  website_url?: string;
  github_url?: string;
  roadmap: any[];
  team_members: any[];
  requirements?: string;
  featured: boolean;
  views: number;
  likes: number;
  comment_count: number;
  share_count: number;
  bookmark_count: number;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
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
  // Blockchain fields removed. All idea data is centralized.
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
  type: 'progress' | 'milestone' | 'announcement';
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
  | 'pending'
  | 'active'
  | 'completed'
  | 'cancelled';

export type NotificationType = 
  | 'project_update'
  | 'comment_reply'
  | 'collaboration_request'
  | 'vote_received'
  | 'milestone_completed'
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