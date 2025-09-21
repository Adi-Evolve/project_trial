import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WalletIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
  WalletIcon as WalletSolid,
  ShieldCheckIcon as ShieldSolid
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface MetaMaskAuthProps {
  onAuthSuccess: (address: string, isNewUser: boolean) => void;
  onClose?: () => void;
  defaultMode?: 'login' | 'signup';
}

interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  isConnected: boolean;
}

const MetaMaskAuth: React.FC<MetaMaskAuthProps> = ({ 
  onAuthSuccess, 
  onClose, 
  defaultMode = 'login' 
}) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [currentStep, setCurrentStep] = useState<'connect' | 'verify' | 'success'>('connect');

  const checkMetaMaskInstallation = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setIsMetaMaskInstalled(true);
    } else {
      setIsMetaMaskInstalled(false);
    }
  };

  const checkExistingConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await getWalletInfo(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    }
  };

  const getWalletInfo = async (address: string) => {
    try {
      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      // Convert balance from Wei to ETH
      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);

      // Get network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkNames: { [key: string]: string } = {
        '0x1': 'Ethereum Mainnet',
        '0x3': 'Ropsten Testnet',
        '0x4': 'Rinkeby Testnet',
        '0x5': 'Goerli Testnet',
        '0x89': 'Polygon Mainnet',
        '0x13881': 'Polygon Mumbai',
        '0xa86a': 'Avalanche Mainnet',
        '0x38': 'BSC Mainnet'
      };

      const networkName = networkNames[chainId] || `Unknown Network (${chainId})`;

      setWalletInfo({
        address,
        balance: balanceInEth,
        network: networkName,
        isConnected: true
      });

      setCurrentStep('verify');
    } catch (error) {
      console.error('Error getting wallet info:', error);
      setError('Failed to get wallet information');
    }
  };

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        await getWalletInfo(accounts[0]);
        toast.success('Wallet connected successfully!');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        setError('Connection rejected by user');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const signMessage = async () => {
    if (!walletInfo) return;

    try {
      setIsConnecting(true);
      
      // Create a message to sign for verification
      const message = `Welcome to ProjectForge!\n\nSign this message to verify your wallet ownership.\n\nWallet: ${walletInfo.address}\nTimestamp: ${Date.now()}`;
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletInfo.address]
      });

      if (signature) {
        setCurrentStep('success');
        
        // Check if user exists (mock check - replace with actual API call)
        const isExistingUser = await checkIfUserExists(walletInfo.address);
        
        // Reduce delay from 1500ms to 500ms for faster redirect
        setTimeout(() => {
          onAuthSuccess(walletInfo.address, !isExistingUser);
        }, 500);
      }
    } catch (error: any) {
      console.error('Error signing message:', error);
      if (error.code === 4001) {
        setError('Message signing rejected by user');
      } else {
        setError('Failed to sign message. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const checkIfUserExists = async (address: string): Promise<boolean> => {
    // Mock function - replace with actual API call to check if user exists
    // For demo purposes, we'll randomly determine if user exists
    return Math.random() > 0.7; // 30% chance user already exists
  };

  const installMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    checkMetaMaskInstallation();
    checkExistingConnection();
  }, []);

  if (!isMetaMaskInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200"
        >
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">MetaMask Required</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              You need MetaMask wallet to access ProjectForge. MetaMask is a secure way to connect to blockchain applications.
            </p>
            
            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={installMetaMask}
                className="w-full py-2.5 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <WalletIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Install MetaMask</span>
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-full py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200"
      >
        <AnimatePresence mode="wait">
          {currentStep === 'connect' && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <WalletSolid className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Connect Your Wallet</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Connect your MetaMask wallet to access ProjectForge. Your wallet address will be your unique identifier.
              </p>
              
              {error && (
                <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs sm:text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <WalletIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Connect MetaMask</span>
                    </>
                  )}
                </button>
                
                {onClose && (
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              <div className="mt-4 sm:mt-6 text-xs text-gray-500">
                <p>By connecting, you agree to our Terms of Service and Privacy Policy</p>
              </div>
            </motion.div>
          )}

          {currentStep === 'verify' && walletInfo && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <ShieldSolid className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Verify Your Wallet</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Please sign a message to verify you own this wallet. This is free and doesn't cost any gas.
              </p>
              
              {/* Wallet Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs sm:text-sm">Address:</span>
                  <span className="text-gray-900 font-mono text-xs sm:text-sm">{formatAddress(walletInfo.address)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs sm:text-sm">Balance:</span>
                  <span className="text-gray-900 text-xs sm:text-sm">{walletInfo.balance} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs sm:text-sm">Network:</span>
                  <span className="text-gray-900 text-xs sm:text-sm">{walletInfo.network}</span>
                </div>
              </div>
              
              {error && (
                <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs sm:text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={signMessage}
                  disabled={isConnecting}
                  className="w-full py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      <span>Signing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Sign Message</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setCurrentStep('connect')}
                  className="w-full py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Wallet Verified!</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Your wallet has been successfully verified. Redirecting to complete your profile...
              </p>
              
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MetaMaskAuth;