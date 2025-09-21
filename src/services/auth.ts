import { supabase } from './supabase';
import { mockAuth, MockUser } from './mockAuth';
import { User, ApiResponse } from '../types';
import { toast } from 'react-hot-toast';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends AuthCredentials {
  fullName: string;
  username: string;
}

export interface AuthResponse {
  user: User | null;
  session: any;
  error: any;
}

// Check if we're in mock mode (when Supabase isn't properly configured)
const isMockMode = () => {
  const url = process.env.REACT_APP_SUPABASE_URL;
  return !url || url === 'your_supabase_url_here' || url === 'https://demo.supabase.co';
};

// Mock user data for demo
const convertMockToUser = (mockUser: MockUser): User => ({
  id: mockUser.id,
  email: mockUser.email,
  username: mockUser.email.split('@')[0],
  fullName: mockUser.name,
  avatarUrl: mockUser.avatar_url,
  skills: ['JavaScript', 'React', 'TypeScript'],
  fieldsOfInterest: ['Web Development', 'AI/ML', 'Blockchain'],
  reputation: Math.floor(Math.random() * 1000),
  verified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

class AuthService {
  private useMock = isMockMode();

  // Sign up with email and password
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    if (this.useMock) {
      try {
        const { data, error } = await mockAuth.signUp(credentials.email, credentials.password);
        if (error) throw error;
        
        const user = data?.user ? convertMockToUser(data.user) : null;
        toast.success('Account created successfully! Welcome to ProjectForge!');
        
        return {
          user,
          session: { access_token: 'mock-token', user: data?.user },
          error: null
        };
      } catch (error: any) {
        toast.error(error.message || 'Failed to create account');
        return { user: null, session: null, error };
      }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
            username: credentials.username,
          }
        }
      });

      if (error) throw error;

      // Create user profile in our users table
      if (data.user) {
        await this.createUserProfile({
          id: data.user.id,
          email: credentials.email,
          username: credentials.username,
          fullName: credentials.fullName,
          skills: [],
          fieldsOfInterest: [],
          reputation: 0,
          verified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      toast.success('Account created successfully! Please check your email for verification.');
      
      // Get the full user profile after signup
      const userProfile = data.user ? await this.getCurrentUser() : null;
      
      return {
        user: userProfile,
        session: data.session,
        error: null
      };
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      return {
        user: null,
        session: null,
        error
      };
    }
  }

  // Sign in with email and password
  async signIn(credentials: AuthCredentials): Promise<AuthResponse> {
    if (this.useMock) {
      try {
        const { data, error } = await mockAuth.signInWithPassword(credentials.email, credentials.password);
        if (error) throw error;
        
        const user = data?.user ? convertMockToUser(data.user) : null;
        toast.success('Welcome back!');
        
        return {
          user,
          session: { access_token: 'mock-token', user: data?.user },
          error: null
        };
      } catch (error: any) {
        toast.error(error.message || 'Failed to sign in');
        return { user: null, session: null, error };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      toast.success('Welcome back!');
      
      // Get the full user profile after signin
      const userProfile = data.user ? await this.getCurrentUser() : null;
      
      return {
        user: userProfile,
        session: data.session,
        error: null
      };
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      return {
        user: null,
        session: null,
        error
      };
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<AuthResponse> {
    if (this.useMock) {
      try {
        const { data, error } = await mockAuth.signInWithOAuth('google');
        if (error) throw error;
        
        const user = data?.user ? convertMockToUser(data.user) : null;
        toast.success('Signed in with Google!');
        
        return {
          user,
          session: { access_token: 'mock-token', user: data?.user },
          error: null
        };
      } catch (error: any) {
        toast.error(error.message || 'Failed to sign in with Google');
        return { user: null, session: null, error };
      }
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

      return {
        user: null,
        session: null,
        error: null
      };
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
      return {
        user: null,
        session: null,
        error
      };
    }
  }

  // Sign in with GitHub
  async signInWithGitHub(): Promise<AuthResponse> {
    if (this.useMock) {
      try {
        const { data, error } = await mockAuth.signInWithOAuth('github');
        if (error) throw error;
        
        const user = data?.user ? convertMockToUser(data.user) : null;
        toast.success('Signed in with GitHub!');
        
        return {
          user,
          session: { access_token: 'mock-token', user: data?.user },
          error: null
        };
      } catch (error: any) {
        toast.error(error.message || 'Failed to sign in with GitHub');
        return { user: null, session: null, error };
      }
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return {
        user: null,
        session: null,
        error: null
      };
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with GitHub');
      return {
        user: null,
        session: null,
        error
      };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    if (this.useMock) {
      try {
        await mockAuth.signOut();
        toast.success('Signed out successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to sign out');
      }
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    if (this.useMock) {
      const session = mockAuth.getSession();
      if (session?.user) {
        return convertMockToUser(session.user);
      }
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      // Get user profile from our users table
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile) return null;

      return profile as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get current session
  async getCurrentSession() {
    if (this.useMock) {
      return mockAuth.getSession();
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  // Create user profile
  private async createUserProfile(userData: Partial<User>): Promise<void> {
    if (this.useMock) {
      // Mock mode - just return success
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .insert([userData]);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    if (this.useMock) {
      toast.success('Profile updated successfully');
      return {
        data: { ...await this.getCurrentUser(), ...updates } as User,
        message: 'Profile updated successfully',
        success: true
      };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Profile updated successfully');

      return {
        data: data as User,
        message: 'Profile updated successfully',
        success: true
      };
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      return {
        data: null as any,
        message: error.message || 'Failed to update profile',
        success: false,
        error: error.message
      };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    if (this.useMock) {
      toast.success('Password reset email sent! (Demo mode)');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
      throw error;
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<void> {
    if (this.useMock) {
      toast.success('Password updated successfully! (Demo mode)');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
      throw error;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (this.useMock) {
      return mockAuth.onAuthStateChange(callback);
    }
    return supabase.auth.onAuthStateChange(callback);
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    if (this.useMock) {
      toast.success('Email verified successfully! (Demo mode)');
      return;
    }

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) throw error;

      toast.success('Email verified successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify email');
      throw error;
    }
  }

  // Check if username is available
  async isUsernameAvailable(username: string): Promise<boolean> {
    if (this.useMock) {
      // In mock mode, allow most usernames except a few common ones
      const unavailable = ['admin', 'test', 'demo', 'user'];
      return !unavailable.includes(username.toLowerCase());
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .limit(1);

      if (error) throw error;

      return data.length === 0;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<User | null> {
    if (this.useMock) {
      // Mock implementation
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) return null;

      return data as User;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;