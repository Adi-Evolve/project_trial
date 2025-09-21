import { createClient } from '@supabase/supabase-js';

// For demo purposes, use a mock configuration if real Supabase credentials are not provided
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_URL !== 'your_supabase_url_here' 
  ? process.env.REACT_APP_SUPABASE_URL 
  : 'https://demo.supabase.co'; // Demo URL for development

const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY && process.env.REACT_APP_SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here'
  ? process.env.REACT_APP_SUPABASE_ANON_KEY 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTIwMjh9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'; // Demo key for development

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Database table names
export const TABLES = {
  USERS: 'users',
  PROJECTS: 'projects',
  IDEAS: 'ideas',
  COMMENTS: 'comments',
  VOTES: 'votes',
  NOTIFICATIONS: 'notifications',
  USER_SKILLS: 'user_skills',
  PROJECT_COLLABORATORS: 'project_collaborators',
  PROJECT_UPDATES: 'project_updates',
  MILESTONES: 'milestones',
  BLOCKCHAIN_RECORDS: 'blockchain_records'
} as const;

// Real-time subscriptions helper
export const createRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  return supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter
      },
      callback
    )
    .subscribe();
};

// Storage buckets
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  PROJECT_IMAGES: 'project-images',
  PROJECT_VIDEOS: 'project-videos',
  DOCUMENTS: 'documents'
} as const;

export default supabase;