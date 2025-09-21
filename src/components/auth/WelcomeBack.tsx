import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  CheckCircleIcon,
  WalletIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

interface WelcomeBackProps {
  onContinue: () => void;
}

const WelcomeBack: React.FC<WelcomeBackProps> = ({ onContinue }) => {
  const { user, walletInfo } = useAuth();
  const [isAutoConnecting, setIsAutoConnecting] = useState(true);

  useEffect(() => {
    // Auto-continue after 2 seconds if wallet is connected
    const timer = setTimeout(() => {
      if (walletInfo?.isConnected) {
        onContinue();
      } else {
        setIsAutoConnecting(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [walletInfo?.isConnected, onContinue]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-center"
      >
        {/* Profile Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <UserCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          )}
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user?.name || 'there'}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome back to ProjectForge
          </p>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 space-y-2 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-xs sm:text-sm">Wallet Address:</span>
            <span className="text-gray-900 font-mono text-xs sm:text-sm">
              {user?.walletAddress ? formatAddress(user.walletAddress) : 'Not connected'}
            </span>
          </div>
          
          {user?.email && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-xs sm:text-sm">Email:</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-900 text-xs sm:text-sm truncate max-w-32">{user.email}</span>
                {user.isEmailVerified && (
                  <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-xs sm:text-sm">Role:</span>
            <span className="text-gray-900 text-xs sm:text-sm capitalize">
              {user?.role?.replace('_', ' ') || 'User'}
            </span>
          </div>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-4 sm:mb-6"
        >
          {walletInfo?.isConnected ? (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">Wallet Connected</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 text-amber-600">
              <WalletIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">
                {isAutoConnecting ? 'Connecting wallet...' : 'Wallet disconnected'}
              </span>
            </div>
          )}
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {isAutoConnecting ? (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
              <span className="text-xs sm:text-sm">Loading your workspace...</span>
            </div>
          ) : (
            <button
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 group text-sm sm:text-base"
            >
              <span>Continue to ProjectForge</span>
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </motion.div>

        {/* Quick Stats */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200"
          >
            <p className="text-xs text-gray-500">
              Member since {new Date(user.joinedAt).toLocaleDateString()}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WelcomeBack;