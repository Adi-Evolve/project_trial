import { supabase } from './supabase';
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

class AuthService {

  // Sign up with email and password
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
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
        // Create user profile with database schema fields
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            wallet_address: `email-${data.user.id.slice(0, 8)}`, // Temporary placeholder
            email: credentials.email,
            username: credentials.username,
            full_name: credentials.fullName,
            skills: [],
            reputation_score: 0,
            email_verified: false,
            is_active: true
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          throw new Error('Failed to create user profile');
        }
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }



  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
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
    return supabase.auth.onAuthStateChange(callback);
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
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