// Mock authentication service for demo purposes
export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface AuthSession {
  user: MockUser;
  access_token: string;
}

class MockAuthService {
  private currentUser: MockUser | null = null;
  private session: AuthSession | null = null;

  // Mock users for demo
  private mockUsers: MockUser[] = [
    {
      id: '1',
      email: 'demo@projectforge.com',
      name: 'Demo User',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
    },
    {
      id: '2',
      email: 'john@example.com',
      name: 'John Doe',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
    }
  ];

  async signUp(email: string, password: string): Promise<{ data: { user: MockUser } | null, error: any }> {
    // Mock signup
    const newUser: MockUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };

    this.currentUser = newUser;
    this.session = {
      user: newUser,
      access_token: 'mock-token-' + Date.now()
    };

    localStorage.setItem('mock-auth-session', JSON.stringify(this.session));

    return {
      data: { user: newUser },
      error: null
    };
  }

  async signInWithPassword(email: string, password: string): Promise<{ data: { user: MockUser } | null, error: any }> {
    // Mock login - accept any credentials for demo
    const user = this.mockUsers.find(u => u.email === email) || this.mockUsers[0];
    
    this.currentUser = user;
    this.session = {
      user,
      access_token: 'mock-token-' + Date.now()
    };

    localStorage.setItem('mock-auth-session', JSON.stringify(this.session));

    return {
      data: { user },
      error: null
    };
  }

  async signInWithOAuth(provider: 'google' | 'github'): Promise<{ data: any, error: any }> {
    // Mock OAuth login
    const user: MockUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: `user@${provider}.com`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
    };

    this.currentUser = user;
    this.session = {
      user,
      access_token: 'mock-token-' + Date.now()
    };

    localStorage.setItem('mock-auth-session', JSON.stringify(this.session));

    return {
      data: { user },
      error: null
    };
  }

  async signOut(): Promise<{ error: any }> {
    this.currentUser = null;
    this.session = null;
    localStorage.removeItem('mock-auth-session');
    
    return { error: null };
  }

  getSession(): AuthSession | null {
    if (this.session) return this.session;
    
    // Try to restore from localStorage
    const stored = localStorage.getItem('mock-auth-session');
    if (stored) {
      this.session = JSON.parse(stored);
      this.currentUser = this.session?.user || null;
      return this.session;
    }
    
    return null;
  }

  getUser(): MockUser | null {
    return this.currentUser;
  }

  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    // Mock auth state change listener
    const session = this.getSession();
    callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
}

export const mockAuth = new MockAuthService();