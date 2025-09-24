import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  WalletIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { web3Service } from '../../services/web3';
import { useAuth } from '../../context/AuthContext';

const DirectTransferTest: React.FC = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  
  // Direct transfer configuration
  const TRANSFER_CONFIG = {
    recipientAddress: '0xbC96A75605fee7614b77877D9871A77CA9e7E022', // Your MetaMask address
    amount: '0.001' // 0.001 Sepolia ETH
  };

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const account = await web3Service.getAccount();
      if (account) {
        setIsConnected(true);
        setWalletAddress(account);
        await loadBalance(account);
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const loadBalance = async (address: string) => {
    try {
      const bal = await web3Service.getBalance(address);
      setBalance(bal);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);

    try {
      const result = await web3Service.connectWallet();
      
      if (result.success && result.account) {
        setIsConnected(true);
        setWalletAddress(result.account);
        await loadBalance(result.account);
        toast.success('Wallet connected successfully!');
      } else {
        toast.error(result.error || 'Failed to connect wallet');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const sendDirectTransfer = async () => {
    if (!user) {
      toast.error('Please sign in to send transfer');
      return;
    }

    setIsLoading(true);

    try {
      console.log('💸 Sending direct transfer:', {
        from: walletAddress,
        to: TRANSFER_CONFIG.recipientAddress,
        amount: TRANSFER_CONFIG.amount
      });

      toast.loading('Sending transfer transaction...');

      // Use web3Service method for direct transfer
      const result = await web3Service.sendDirectTransfer(
        TRANSFER_CONFIG.recipientAddress,
        TRANSFER_CONFIG.amount
      );

      if (result.success && result.transactionHash) {
        console.log('✅ Direct transfer successful:', result.transactionHash);
        setTransactionHash(result.transactionHash);
        
        // Update balance
        await loadBalance(walletAddress);
        
        toast.success(`Transfer of ${TRANSFER_CONFIG.amount} ETH sent successfully!`);
      } else {
        throw new Error(result.error || 'Transfer failed');
      }

    } catch (error: any) {
      console.error('❌ Direct transfer failed:', error);
      toast.error(`Transfer failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center">
          <WalletIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Direct ETH Transfer Test
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect your wallet to test direct Sepolia ETH transfer
          </p>
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium 
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
          >
            {isLoading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <WalletIcon className="h-5 w-5 mr-2" />
            )}
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          💸 Direct ETH Transfer
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <div>From: {web3Service.formatAddress(walletAddress)}</div>
          <div>Balance: {parseFloat(balance).toFixed(4)} ETH</div>
        </div>
      </div>

      {/* Transfer Details */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Transfer Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700 dark:text-blue-300">Amount:</span>
            <span className="font-mono text-blue-900 dark:text-blue-100">{TRANSFER_CONFIG.amount} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700 dark:text-blue-300">To:</span>
            <span className="font-mono text-blue-900 dark:text-blue-100 text-xs">
              {TRANSFER_CONFIG.recipientAddress}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700 dark:text-blue-300">Network:</span>
            <span className="text-blue-900 dark:text-blue-100">Sepolia Testnet</span>
          </div>
        </div>
      </div>

      {/* Transfer Button */}
      {!transactionHash ? (
        <button
          onClick={sendDirectTransfer}
          disabled={isLoading || parseFloat(balance) < parseFloat(TRANSFER_CONFIG.amount)}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg 
                   font-medium disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center transition-colors"
        >
          {isLoading ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <ArrowRightIcon className="h-5 w-5 mr-2" />
          )}
          {isLoading ? 'Sending...' : `Send ${TRANSFER_CONFIG.amount} ETH`}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
          <h4 className="font-medium text-gray-900 dark:text-white">
            Transfer Successful! 🎉
          </h4>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-sm text-green-700 dark:text-green-300 mb-2">Transaction Hash:</p>
            <p className="text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded border break-all">
              {transactionHash}
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 text-sm mt-2 inline-block"
            >
              View on Sepolia Etherscan →
            </a>
          </div>
          <button
            onClick={() => {
              setTransactionHash('');
              loadBalance(walletAddress);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
          >
            Send Another Transfer
          </button>
        </motion.div>
      )}

      {parseFloat(balance) < parseFloat(TRANSFER_CONFIG.amount) && (
        <p className="text-amber-600 text-sm text-center mt-4">
          ⚠️ Insufficient balance. Need at least {TRANSFER_CONFIG.amount} ETH
        </p>
      )}
    </div>
  );
};

export default DirectTransferTest;