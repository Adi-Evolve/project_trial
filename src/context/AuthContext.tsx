import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { emailVerificationService } from '../services/emailVerification';

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
  login: (walletAddress: string, userData: Partial<User>) => void;
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
    // Check for existing authentication on app load
    checkExistingAuth();
    
    // Auto-reconnect after a short delay
    const autoReconnectTimer = setTimeout(() => {
      attemptAutoReconnect();
    }, 1000);
    
    // Listen for MetaMask account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('MetaMask accounts changed:', accounts);
        
        if (accounts.length === 0) {
          // No accounts connected, user might have disconnected
          console.log('No accounts connected, but keeping user session');
          // Don't logout immediately, user might reconnect
          if (walletInfo) {
            setWalletInfo({ ...walletInfo, isConnected: false });
          }
        } else if (user && accounts[0].toLowerCase() !== user.walletAddress.toLowerCase()) {
          // Different account connected, need to re-authenticate
          console.log('Different account connected, clearing session');
          logout();
        } else if (user && accounts[0].toLowerCase() === user.walletAddress.toLowerCase()) {
          // Same account reconnected
          console.log('Same account reconnected');
          attemptAutoReconnect();
        }
      };

      const handleChainChanged = (chainId: string) => {
        console.log('Chain changed to:', chainId);
        // Update network info if wallet is connected
        if (walletInfo && walletInfo.isConnected) {
          attemptAutoReconnect();
        }
      };

      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup event listeners and timer
      return () => {
        clearTimeout(autoReconnectTimer);
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }

    return () => {
      clearTimeout(autoReconnectTimer);
    };
  }, [user, walletInfo]);

  const checkExistingAuth = async () => {
    try {
      // Check localStorage for saved user data
      const savedUser = localStorage.getItem('projectforge_user');
      const savedWallet = localStorage.getItem('projectforge_wallet');
      
      if (savedUser && savedWallet) {
        const parsedUser = JSON.parse(savedUser);
        const parsedWallet = JSON.parse(savedWallet);
        
        // Check if MetaMask is still connected to the same account
        if (window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            
            if (accounts.length > 0 && accounts[0].toLowerCase() === parsedUser.walletAddress.toLowerCase()) {
              // Same wallet is still connected, restore session
              setUser(parsedUser);
              setWalletInfo(parsedWallet);
              console.log('Session restored successfully');
              return; // Exit early, user is authenticated
            } else if (accounts.length === 0) {
              // No wallet connected, but we have saved data - try to reconnect silently
              console.log('Wallet disconnected, but user data exists');
              // Keep the user data but mark wallet as disconnected
              setUser(parsedUser);
              setWalletInfo({ ...parsedWallet, isConnected: false });
              return;
            } else {
              // Different wallet connected, clear old data
              console.log('Different wallet detected, clearing old session');
              logout();
            }
          } catch (error) {
            console.error('Error checking MetaMask accounts:', error);
            // If we can't check MetaMask, but have saved data, keep it
            if (savedUser && savedWallet) {
              setUser(JSON.parse(savedUser));
              setWalletInfo(JSON.parse(savedWallet));
            }
          }
        } else {
          // MetaMask not available, but we have saved data
          console.log('MetaMask not available, keeping saved user data');
          setUser(parsedUser);
          setWalletInfo(parsedWallet);
        }
      }
    } catch (error) {
      console.error('Error checking existing auth:', error);
      // Clear corrupted data
      localStorage.removeItem('projectforge_user');
      localStorage.removeItem('projectforge_wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const login = (walletAddress: string, userData: Partial<User>) => {
    const now = new Date();
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
      // Set compatibility fields
      id: walletAddress,
      username: userData.name || walletAddress.slice(0, 8),
      fullName: userData.name || '',
      avatarUrl: userData.avatarUrl
    };

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
  };

  const logout = () => {
    setUser(null);
    setWalletInfo(null);
    
    // Clear all localStorage data
    localStorage.removeItem('projectforge_user');
    localStorage.removeItem('projectforge_wallet');
    localStorage.removeItem('projectforge_session');
    
    console.log('User session cleared');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('projectforge_user', JSON.stringify(updatedUser));
    }
  };

  const connectWallet = (newWalletInfo: WalletInfo) => {
    setWalletInfo(newWalletInfo);
    localStorage.setItem('projectforge_wallet', JSON.stringify(newWalletInfo));
  };

  const disconnectWallet = () => {
    setWalletInfo(null);
    localStorage.removeItem('projectforge_wallet');
  };

  // Auto-reconnect wallet if user exists but wallet is disconnected
  const attemptAutoReconnect = async () => {
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

  const sendEmailVerification = async (email: string): Promise<boolean> => {
    try {
      const result = await emailVerificationService.sendVerificationEmail(email);
      return result.success;
    } catch (error) {
      console.error('Error sending email verification:', error);
      return false;
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
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
  };

  const value: AuthContextType = {
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
  };

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