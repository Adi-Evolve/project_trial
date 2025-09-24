import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  WalletIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { web3Service } from '../../services/web3';
import { contributionsService } from '../../services/contributionsService';
import { transactionMonitorService } from '../../services/transactionMonitorService';
import { useAuth } from '../../context/AuthContext';

interface FundTransferTestProps {
  className?: string;
}

const FundTransferTest: React.FC<FundTransferTestProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'setup' | 'testing' | 'success' | 'error'>('setup');
  const [error, setError] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');
  
  // Test configuration
  const TEST_CONFIG = {
    recipientAddress: '0xbC96A75605fee7614b77877D9871A77CA9e7E022', // Your MetaMask address
    testAmount: '0.001', // 0.001 Sepolia ETH
    testProjectId: 'test-fund-transfer-' + Date.now(),
    testProjectTitle: 'Test Fund Transfer Project'
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
    setError('');

    try {
      const result = await web3Service.connectWallet();
      
      if (result.success && result.account) {
        setIsConnected(true);
        setWalletAddress(result.account);
        await loadBalance(result.account);
        toast.success('Wallet connected successfully!');
      } else {
        setError(result.error || 'Failed to connect wallet');
        toast.error(result.error || 'Failed to connect wallet');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const testFundTransfer = async () => {
    if (!user) {
      toast.error('Please sign in to test fund transfer');
      return;
    }

    setStep('testing');
    setIsLoading(true);
    setError('');

    try {
      console.log('🧪 Starting fund transfer test:', TEST_CONFIG);
      
      // Step 1: Create a test project on blockchain
      toast.loading('Step 1/4: Creating test project on blockchain...', { id: 'test-progress' });
      
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30); // 30 days from now

      const createResult = await web3Service.createProject(
        TEST_CONFIG.testProjectId,
        '1.0', // 1 ETH target
        deadline
      );

      if (!createResult.success) {
        throw new Error(`Failed to create test project: ${createResult.error}`);
      }

      console.log('✅ Test project created:', createResult.transactionHash);

      // Step 2: Donate to the test project
      toast.loading('Step 2/4: Processing donation transaction...', { id: 'test-progress' });
      
      const donateResult = await web3Service.donate(
        TEST_CONFIG.testProjectId,
        TEST_CONFIG.testAmount,
        `Test donation from ${walletAddress} to ${TEST_CONFIG.recipientAddress}`
      );

      if (!donateResult.success) {
        throw new Error(`Failed to donate: ${donateResult.error}`);
      }

      console.log('✅ Donation transaction sent:', donateResult.transactionHash);
      setTransactionHash(donateResult.transactionHash!);

      // Step 3: Save to database
      toast.loading('Step 3/4: Saving contribution to database...', { id: 'test-progress' });
      
      const contributionResult = await contributionsService.processContribution(
        TEST_CONFIG.testProjectId,
        user.id!,
        parseFloat(TEST_CONFIG.testAmount),
        'ETH',
        donateResult.transactionHash!,
        `Test fund transfer to ${TEST_CONFIG.recipientAddress}`,
        false
      );

      if (!contributionResult.success) {
        console.warn('Database save failed but blockchain succeeded:', contributionResult.error);
        toast.error('Database save failed but transaction succeeded');
      } else {
        console.log('✅ Contribution saved to database');
      }

      // Step 4: Start monitoring transaction
      toast.loading('Step 4/4: Monitoring transaction confirmation...', { id: 'test-progress' });
      
      transactionMonitorService.startMonitoring(donateResult.transactionHash!);

      // Update balance
      await loadBalance(walletAddress);

      setStep('success');
      toast.success('Fund transfer test completed successfully!', { id: 'test-progress' });

    } catch (error: any) {
      console.error('❌ Fund transfer test failed:', error);
      setError(error.message || 'Fund transfer test failed');
      setStep('error');
      toast.error(`Test failed: ${error.message}`, { id: 'test-progress' });
    } finally {
      setIsLoading(false);
    }
  };

  const testWithdrawal = async () => {
    if (!transactionHash) {
      toast.error('No transaction to test withdrawal with');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      toast.loading('Testing fund withdrawal...');
      
      const withdrawResult = await web3Service.withdrawFunds(TEST_CONFIG.testProjectId);
      
      if (withdrawResult.success) {
        toast.success(`Withdrawal successful! TX: ${withdrawResult.transactionHash}`);
        await loadBalance(walletAddress);
      } else {
        throw new Error(withdrawResult.error || 'Withdrawal failed');
      }
      
    } catch (error: any) {
      console.error('❌ Withdrawal test failed:', error);
      toast.error(`Withdrawal failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetTest = () => {
    setStep('setup');
    setError('');
    setTransactionHash('');
  };

  if (!isConnected) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <WalletIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Fund Transfer Test
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect your MetaMask wallet to test the complete funding mechanism
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
          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          🧪 Fund Transfer Testing Lab
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <div>Connected: {web3Service.formatAddress(walletAddress)}</div>
          <div>Balance: {parseFloat(balance).toFixed(4)} ETH</div>
        </div>
      </div>

      {/* Test Configuration */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Test Configuration</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700 dark:text-blue-300">Test Amount:</span>
            <span className="font-mono text-blue-900 dark:text-blue-100">{TEST_CONFIG.testAmount} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700 dark:text-blue-300">Recipient:</span>
            <span className="font-mono text-blue-900 dark:text-blue-100 truncate max-w-[200px]">
              {TEST_CONFIG.recipientAddress}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700 dark:text-blue-300">Network:</span>
            <span className="text-blue-900 dark:text-blue-100">Sepolia Testnet</span>
          </div>
        </div>
      </div>

      {/* Test Steps */}
      {step === 'setup' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Test Steps:</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <span>Create test project on blockchain</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <span>Process donation of {TEST_CONFIG.testAmount} ETH</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <span>Save contribution to database</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                <span>Monitor transaction confirmation</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={testFundTransfer}
            disabled={isLoading || parseFloat(balance) < parseFloat(TEST_CONFIG.testAmount)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg 
                     font-medium disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center transition-colors"
          >
            <ArrowRightIcon className="h-5 w-5 mr-2" />
            Start Fund Transfer Test
          </button>
          
          {parseFloat(balance) < parseFloat(TEST_CONFIG.testAmount) && (
            <p className="text-amber-600 text-sm text-center">
              ⚠️ Insufficient balance. Need at least {TEST_CONFIG.testAmount} ETH
            </p>
          )}
        </motion.div>
      )}

      {step === 'testing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <ArrowPathIcon className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Running Fund Transfer Test
          </h4>
          <p className="text-gray-600 dark:text-gray-300">
            Please confirm transactions in MetaMask and wait for processing...
          </p>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 space-y-4"
        >
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Fund Transfer Test Successful! 🎉
          </h4>
          <p className="text-gray-600 dark:text-gray-300">
            Successfully transferred {TEST_CONFIG.testAmount} ETH via smart contract
          </p>
          
          {transactionHash && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
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
          )}
          
          <div className="flex space-x-3 justify-center">
            <button
              onClick={testWithdrawal}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium"
            >
              Test Fund Withdrawal
            </button>
            <button
              onClick={resetTest}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                       py-2 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Run Another Test
            </button>
          </div>
        </motion.div>
      )}

      {step === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Test Failed
          </h4>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error}
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={testFundTransfer}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
            >
              Try Again
            </button>
            <button
              onClick={resetTest}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                       py-2 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FundTransferTest;