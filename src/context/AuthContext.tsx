import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { emailVerificationService } from '../services/emailVerification';
import { userRegistrationService } from '../services/userRegistration';

interface User {
  walletAddress: string;
  email: string;
  name: string;
  dateOfBirth: string;
  role: 'fund_raiser' | 'donor';
  bio?: string;
  skills?: string[];
  interests?: string[];
  isVerified: boolean;
  isEmailVerified: boolean;
  joinedAt: Date;
  // Additional fields for compatibility with existing components
  id?: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
}

interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  isConnected: boolean;
}

interface AuthContextType {
  user: User | null;
  walletInfo: WalletInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (walletAddress: string, userData: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  connectWallet: (walletInfo: WalletInfo) => void;
  disconnectWallet: () => void;
  sendEmailVerification: (email: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    console.log('AuthContext initializing');
    
    // Simple initialization
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('projectforge_user');
        const savedWallet = localStorage.getItem('projectforge_wallet');
        
        if (savedUser && savedWallet) {
          setUser(JSON.parse(savedUser));
          setWalletInfo(JSON.parse(savedWallet));
        }
      } catch (error) {
        console.error('Error loading saved auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Simple checkExistingAuth function for compatibility
  const checkExistingAuth = async () => {
    // This function is kept for compatibility but the actual logic is in useEffect
    console.log('checkExistingAuth called');
  };

  useEffect(() => {
    console.log('AuthContext useEffect (2) running'); // Debug log
    // Listen for MetaMask account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('MetaMask accounts changed:', accounts);
        
        if (accounts.length === 0) {
          // No accounts connected, user might have disconnected
          console.log('No accounts connected, but keeping user session');
          // Don't logout immediately, user might reconnect
          setWalletInfo(prev => prev ? { ...prev, isConnected: false } : null);
        } else {
          // Get current user from state at the time of the event
          const currentUser = JSON.parse(localStorage.getItem('projectforge_user') || 'null');
          if (currentUser && accounts[0].toLowerCase() !== currentUser.walletAddress.toLowerCase()) {
            // Different account connected, need to re-authenticate
            console.log('Different account connected, clearing session');
            logout();
          } else if (currentUser && accounts[0].toLowerCase() === currentUser.walletAddress.toLowerCase()) {
            // Same account reconnected
            console.log('Same account reconnected');
            attemptAutoReconnect();
          }
        }
      };

      const handleChainChanged = (chainId: string) => {
        console.log('Chain changed to:', chainId);
        // Update network info if wallet is connected
        attemptAutoReconnect();
      };

      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup event listeners
      return () => {
        console.log('AuthContext useEffect (2) cleanup'); // Debug log
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []); // Empty dependency array for MetaMask listeners

  const login = useCallback(async (walletAddress: string, userData: Partial<User>) => {
    const now = new Date();
    
    // First, try to get existing user from Supabase to get proper UUID
    let supabaseUserId = walletAddress; // Fallback to wallet address
    
    try {
      const existingUser = await userRegistrationService.getUserByWallet(walletAddress);
      if (existingUser && existingUser.id) {
        supabaseUserId = existingUser.id; // Use the proper UUID from Supabase
        console.log('Found existing user in Supabase with UUID:', supabaseUserId);
      }
    } catch (error) {
      console.log('Could not fetch user from Supabase, using wallet address as ID');
    }
    
    const newUser: User = {
      walletAddress,
      email: userData.email || '',
      name: userData.name || '',
      dateOfBirth: userData.dateOfBirth || '',
      role: userData.role || 'donor',
      bio: userData.bio,
      skills: userData.skills,
      interests: userData.interests,
      isVerified: true,
      isEmailVerified: userData.isEmailVerified || false,
      joinedAt: userData.joinedAt || now,
      // Set compatibility fields - use proper UUID if available
      id: supabaseUserId,
      username: userData.name || walletAddress.slice(0, 8),
      fullName: userData.name || '',
      avatarUrl: userData.avatarUrl
    };

    // Register user in blockchain and Supabase if this is a new user
    if (userData.name && userData.email && userData.dateOfBirth && userData.role) {
      try {
        const registrationResult = await userRegistrationService.registerUser({
          walletAddress,
          email: userData.email,
          name: userData.name,
          dateOfBirth: userData.dateOfBirth,
          role: userData.role,
          bio: userData.bio,
          skills: userData.skills,
          interests: userData.interests
        });

        if (!registrationResult.success) {
          console.error('User registration failed:', registrationResult.message);
          // Continue with local storage even if registration fails
        } else {
          console.log('User registered successfully:', registrationResult);
          // Update the user ID with the proper UUID from Supabase
          if (registrationResult.supabaseRecord && registrationResult.supabaseRecord.id) {
            newUser.id = registrationResult.supabaseRecord.id;
            console.log('Updated user ID to Supabase UUID:', newUser.id);
          }
        }
      } catch (error) {
        console.error('Error during user registration:', error);
      }
    }

    const walletInfo: WalletInfo = {
      address: walletAddress,
      balance: '0.0000', // Will be updated when wallet connects
      network: 'Unknown', // Will be updated when wallet connects
      isConnected: true
    };

    setUser(newUser);
    setWalletInfo(walletInfo);
    
    // Save to localStorage with timestamp
    const sessionData = {
      user: newUser,
      wallet: walletInfo,
      timestamp: now.getTime(),
      version: '1.0' // For future migrations
    };
    
    localStorage.setItem('projectforge_user', JSON.stringify(newUser));
    localStorage.setItem('projectforge_wallet', JSON.stringify(walletInfo));
    localStorage.setItem('projectforge_session', JSON.stringify(sessionData));
    
    console.log('User session saved successfully');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setWalletInfo(null);
    
    // Clear all localStorage data
    localStorage.removeItem('projectforge_user');
    localStorage.removeItem('projectforge_wallet');
    localStorage.removeItem('projectforge_session');
    
    console.log('User session cleared');
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('projectforge_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const connectWallet = useCallback((newWalletInfo: WalletInfo) => {
    setWalletInfo(newWalletInfo);
    localStorage.setItem('projectforge_wallet', JSON.stringify(newWalletInfo));
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletInfo(null);
    localStorage.removeItem('projectforge_wallet');
  }, []);

  // Auto-reconnect wallet if user exists but wallet is disconnected
  const attemptAutoReconnect = async () => {
    console.log('attemptAutoReconnect called'); // Debug log
    if (user && (!walletInfo || !walletInfo.isConnected) && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0 && accounts[0].toLowerCase() === user.walletAddress.toLowerCase()) {
          // Same wallet is available, reconnect
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          });
          
          const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          
          const networkNames: { [key: string]: string } = {
            '0x1': 'Ethereum Mainnet',
            '0x89': 'Polygon Mainnet',
            '0x13881': 'Polygon Mumbai'
          };
          
          const networkName = networkNames[chainId] || `Network ${chainId}`;
          
          const reconnectedWallet: WalletInfo = {
            address: accounts[0],
            balance: balanceInEth,
            network: networkName,
            isConnected: true
          };
          
          setWalletInfo(reconnectedWallet);
          localStorage.setItem('projectforge_wallet', JSON.stringify(reconnectedWallet));
          console.log('Wallet automatically reconnected');
        }
      } catch (error) {
        console.error('Auto-reconnect failed:', error);
      }
    }
  };

  const sendEmailVerification = useCallback(async (email: string): Promise<boolean> => {
    try {
      const result = await emailVerificationService.sendVerificationEmail(email);
      return result.success;
    } catch (error) {
      console.error('Error sending email verification:', error);
      return false;
    }
  }, []);

  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    try {
      if (!user?.email) {
        console.error('No email found for verification');
        return false;
      }
      
      const result = await emailVerificationService.verifyEmail(token, user.email);
      
      if (result.success && user) {
        updateUser({ isEmailVerified: true });
      }
      
      return result.success;
    } catch (error) {
      console.error('Error verifying email:', error);
      return false;
    }
  }, [user, updateUser]);

  const value: AuthContextType = useMemo(() => ({
    user,
    walletInfo,
    isAuthenticated: !!user && !!walletInfo?.isConnected,
    isLoading,
    login,
    logout,
    updateUser,
    connectWallet,
    disconnectWallet,
    sendEmailVerification,
    verifyEmail
  }), [user, walletInfo, isLoading, login, logout, updateUser, connectWallet, disconnectWallet, sendEmailVerification, verifyEmail]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;