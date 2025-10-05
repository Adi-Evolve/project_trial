import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

interface SecurityEvent {
  userId: string;
  eventType: 'login' | 'failed_login' | 'password_change' | 'profile_update' | 'suspicious_activity';
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  deviceInfo?: string;
  ipAddress?: string;
  lastActivity: string;
  isActive: boolean;
}

class SecurityService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Log security events
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await supabase.from('security_logs').insert({
        user_id: event.userId,
        event_type: event.eventType,
        ip_address: event.ipAddress || this.getClientIP(),
        user_agent: event.userAgent || navigator.userAgent,
        metadata: event.metadata || {},
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Check if user account is locked due to failed login attempts
   */
  async isAccountLocked(email: string): Promise<boolean> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('login_attempts, last_failed_login')
        .eq('email', email)
        .single();

      if (!user) return false;

      if (user.login_attempts >= this.MAX_LOGIN_ATTEMPTS) {
        const timeSinceLastAttempt = Date.now() - new Date(user.last_failed_login).getTime();
        return timeSinceLastAttempt < this.LOCKOUT_DURATION;
      }

      return false;
    } catch (error) {
      console.error('Error checking account lock status:', error);
      return false;
    }
  }

  /**
   * Record failed login attempt
   */
  async recordFailedLogin(email: string): Promise<void> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id, login_attempts')
        .eq('email', email)
        .single();

      if (user) {
        const newAttempts = (user.login_attempts || 0) + 1;
        
        await supabase
          .from('users')
          .update({
            login_attempts: newAttempts,
            last_failed_login: new Date().toISOString()
          })
          .eq('id', user.id);

        await this.logSecurityEvent({
          userId: user.id,
          eventType: 'failed_login',
          metadata: { attemptNumber: newAttempts }
        });

        if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
          toast.error(`Account locked due to too many failed attempts. Try again in 30 minutes.`);
        }
      }
    } catch (error) {
      console.error('Error recording failed login:', error);
    }
  }

  /**
   * Reset login attempts on successful login
   */
  async resetLoginAttempts(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({
          login_attempts: 0,
          last_failed_login: null,
          last_login: new Date().toISOString()
        })
        .eq('id', userId);

      await this.logSecurityEvent({
        userId,
        eventType: 'login'
      });
    } catch (error) {
      console.error('Error resetting login attempts:', error);
    }
  }

  /**
   * Create user session
   */
  async createSession(userId: string, deviceInfo?: string): Promise<string> {
    try {
      const sessionToken = this.generateSessionToken();
      
      const { data } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          device_info: deviceInfo || this.getDeviceInfo(),
          ip_address: this.getClientIP(),
          last_activity: new Date().toISOString(),
          expires_at: new Date(Date.now() + this.SESSION_TIMEOUT).toISOString(),
          is_active: true
        })
        .select()
        .single();

      return sessionToken;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Validate session
   */
  async validateSession(sessionToken: string): Promise<UserSession | null> {
    try {
      const { data } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .single();

      if (!data) return null;

      // Check if session has expired
      if (new Date(data.expires_at) < new Date()) {
        await this.invalidateSession(sessionToken);
        return null;
      }

      // Update last activity
      await supabase
        .from('user_sessions')
        .update({
          last_activity: new Date().toISOString()
        })
        .eq('session_token', sessionToken);

      return data;
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionToken: string): Promise<void> {
    try {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);
    } catch (error) {
      console.error('Error invalidating session:', error);
    }
  }

  /**
   * Get all active sessions for user
   */
  async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      const { data } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  /**
   * Invalidate all sessions for user (force logout everywhere)
   */
  async invalidateAllUserSessions(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId);

      await this.logSecurityEvent({
        userId,
        eventType: 'suspicious_activity',
        metadata: { action: 'force_logout_all_sessions' }
      });
    } catch (error) {
      console.error('Error invalidating all user sessions:', error);
    }
  }

  /**
   * Check for suspicious activity
   */
  async detectSuspiciousActivity(userId: string): Promise<void> {
    try {
      // Check for multiple login attempts from different IPs
      const { data: recentLogins } = await supabase
        .from('security_logs')
        .select('ip_address, created_at')
        .eq('user_id', userId)
        .eq('event_type', 'login')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (recentLogins && recentLogins.length > 0) {
        const uniqueIPs = new Set(recentLogins.map(log => log.ip_address));
        
        if (uniqueIPs.size > 3) {
          // Multiple IPs in 24 hours - potential account compromise
          await this.createSecurityAlert({
            userId,
            alertType: 'multiple_ip_login',
            severity: 'medium',
            title: 'Multiple IP Login Detected',
            description: `User logged in from ${uniqueIPs.size} different IP addresses in the last 24 hours.`
          });
        }
      }

      // Check for rapid successive login attempts
      if (recentLogins && recentLogins.length > 10) {
        await this.createSecurityAlert({
          userId,
          alertType: 'rapid_login_attempts',
          severity: 'high',
          title: 'Rapid Login Attempts',
          description: 'Multiple rapid login attempts detected. Possible brute force attack.'
        });
      }
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
    }
  }

  /**
   * Create security alert
   */
  async createSecurityAlert(alert: {
    userId: string;
    alertType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
  }): Promise<void> {
    try {
      await supabase.from('security_alerts').insert({
        user_id: alert.userId,
        alert_type: alert.alertType,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        status: 'active',
        created_at: new Date().toISOString()
      });

      // Notify user if severity is high or critical
      if (['high', 'critical'].includes(alert.severity)) {
        toast.error(`Security Alert: ${alert.title}`);
      }
    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain uppercase letters');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain numbers');
    }

    if (/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain special characters');
    }

    return {
      isValid: score >= 4,
      score,
      feedback
    };
  }

  /**
   * Generate secure session token
   */
  private generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get client IP address
   */
  private getClientIP(): string {
    // In a real implementation, this would be handled server-side
    return '127.0.0.1'; // Placeholder
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): string {
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;
    
    return `${platform} - ${userAgent.substring(0, 100)}`;
  }

  /**
   * Check for data breaches (placeholder for external service integration)
   */
  async checkForDataBreaches(email: string): Promise<boolean> {
    try {
      // In a real implementation, integrate with HaveIBeenPwned or similar service
      // For now, return false
      return false;
    } catch (error) {
      console.error('Error checking for data breaches:', error);
      return false;
    }
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(userId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      // In a real implementation, generate TOTP secret and QR code
      const secret = this.generateSessionToken().substring(0, 16);
      const qrCode = `otpauth://totp/ProjectForge?secret=${secret}&issuer=ProjectForge`;
      
      await supabase
        .from('users')
        .update({
          two_factor_enabled: true,
          two_factor_secret: secret
        })
        .eq('id', userId);

      return { secret, qrCode };
    } catch (error) {
      console.error('Error enabling two-factor authentication:', error);
      throw error;
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error disabling two-factor authentication:', error);
      throw error;
    }
  }

  /**
   * Verify two-factor authentication code
   */
  async verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
    try {
      // In a real implementation, verify TOTP code
      // For now, return true for demonstration
      return code.length === 6 && /^\d+$/.test(code);
    } catch (error) {
      console.error('Error verifying two-factor code:', error);
      return false;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }
}

export const securityService = new SecurityService();
export default SecurityService;