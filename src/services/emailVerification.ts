import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://vdpmumstdxgftaaxeacx.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcG11bXN0ZHhnZnRhYXhlYWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDYwODIsImV4cCI6MjA2NzQ4MjA4Mn0.Pbfm3FebzjQAHLPfdkzky-IH9aF3Zj1ZNVBjwe-3lyw';

// Initialize Supabase client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface EmailVerificationService {
  sendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (token: string, email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
}

class SupabaseEmailService implements EmailVerificationService {
  async sendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create user, just send verification
        }
      });

      if (error) {
        console.error('Error sending verification email:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  async verifyEmail(token: string, email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        console.error('Error verifying email:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error verifying email:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    return this.sendVerificationEmail(email);
  }
}

// Export the service instance
export const emailVerificationService = new SupabaseEmailService();

// Email validation utility
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Email verification status tracking
export interface EmailVerificationState {
  email: string;
  isVerificationSent: boolean;
  isVerified: boolean;
  verificationToken?: string;
  resendCount: number;
  lastSentAt?: Date;
}

export class EmailVerificationManager {
  private state: EmailVerificationState;
  private onStateChange?: (state: EmailVerificationState) => void;

  constructor(email: string, onStateChange?: (state: EmailVerificationState) => void) {
    this.state = {
      email,
      isVerificationSent: false,
      isVerified: false,
      resendCount: 0
    };
    this.onStateChange = onStateChange;
  }

  async sendVerification(): Promise<boolean> {
    const result = await emailVerificationService.sendVerificationEmail(this.state.email);
    
    if (result.success) {
      this.updateState({
        isVerificationSent: true,
        resendCount: this.state.resendCount + 1,
        lastSentAt: new Date()
      });
      return true;
    }
    
    return false;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const result = await emailVerificationService.verifyEmail(token, this.state.email);
    
    if (result.success) {
      this.updateState({
        isVerified: true,
        verificationToken: token
      });
      return true;
    }
    
    return false;
  }

  async resendVerification(): Promise<boolean> {
    if (this.canResend()) {
      return this.sendVerification();
    }
    return false;
  }

  canResend(): boolean {
    if (!this.state.lastSentAt) return true;
    
    const timeSinceLastSent = Date.now() - this.state.lastSentAt.getTime();
    const cooldownPeriod = 60000; // 1 minute cooldown
    
    return timeSinceLastSent >= cooldownPeriod && this.state.resendCount < 5;
  }

  getTimeUntilNextResend(): number {
    if (!this.state.lastSentAt) return 0;
    
    const timeSinceLastSent = Date.now() - this.state.lastSentAt.getTime();
    const cooldownPeriod = 60000; // 1 minute
    
    return Math.max(0, cooldownPeriod - timeSinceLastSent);
  }

  private updateState(updates: Partial<EmailVerificationState>) {
    this.state = { ...this.state, ...updates };
    this.onStateChange?.(this.state);
  }

  getState(): EmailVerificationState {
    return { ...this.state };
  }
}

// Configuration setup helper
export const setupSupabaseConfig = (url: string, anonKey: string): SupabaseClient => {
  return createClient(url, anonKey);
};

// Error codes for better error handling
export enum EmailVerificationError {
  INVALID_EMAIL = 'INVALID_EMAIL',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  VERIFICATION_EXPIRED = 'VERIFICATION_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export const mapSupabaseError = (error: any): EmailVerificationError => {
  if (error.message?.includes('rate limit')) {
    return EmailVerificationError.RATE_LIMIT_EXCEEDED;
  }
  if (error.message?.includes('invalid email')) {
    return EmailVerificationError.INVALID_EMAIL;
  }
  if (error.message?.includes('expired')) {
    return EmailVerificationError.VERIFICATION_EXPIRED;
  }
  if (error.message?.includes('invalid token')) {
    return EmailVerificationError.INVALID_TOKEN;
  }
  return EmailVerificationError.UNKNOWN_ERROR;
};