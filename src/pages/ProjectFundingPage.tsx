import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface FundingTier {
  id: string;
  title: string;
  amount: number;
  description: string;
  perks: string[];
  backers: number;
  estimatedDelivery?: Date;
  isPopular?: boolean;
}

interface ProjectInfo {
  id: string;
  title: string;
  description: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
  };
  funding: {
    goal: number;
    raised: number;
    backers: number;
    deadline: Date;
    tiers: FundingTier[];
  };
  banner: string;
}

const ProjectFundingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<FundingTier | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transaction, setTransaction] = useState<{
    status: 'pending' | 'success' | 'error';
    hash?: string;
    message?: string;
  } | null>(null);

  // Mock project data - in real app, this would come from API
  const project: ProjectInfo = {
    id: id || '1',
    title: 'AI-Powered Code Assistant',
    description: 'An intelligent code completion and debugging tool powered by machine learning',
    owner: {
      id: 'user-1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    funding: {
      goal: 5000000, // $5M in wei equivalent
      raised: 3250000, // $3.25M raised
      backers: 1247,
      deadline: new Date(2024, 5, 15), // June 15, 2024
      tiers: [
        {
          id: 'supporter',
          title: 'Supporter',
          amount: 10,
          description: 'Show your support for AI-powered development tools',
          perks: [
            'Supporter badge on your profile',
            'Project updates via email',
            'Access to supporter-only community'
          ],
          backers: 523
        },
        {
          id: 'early-adopter',
          title: 'Early Adopter',
          amount: 50,
          description: 'Get early access to the beta version',
          perks: [
            'Everything from Supporter tier',
            'Beta access (3 months early)',
            'Direct feedback channel to developers',
            'Early adopter badge'
          ],
          backers: 312,
          isPopular: true
        },
        {
          id: 'pro-developer',
          title: 'Pro Developer',
          amount: 100,
          description: 'Professional features and priority support',
          perks: [
            'Everything from Early Adopter tier',
            '1 year of Pro features included',
            'Priority customer support',
            'Monthly developer Q&A sessions'
          ],
          backers: 189
        },
        {
          id: 'enterprise',
          title: 'Enterprise Partner',
          amount: 500,
          description: 'Enterprise features and custom integration',
          perks: [
            'Everything from Pro Developer tier',
            'Custom enterprise integration',
            'Dedicated account manager',
            'Priority feature requests',
            'On-site training session'
          ],
          backers: 23,
          estimatedDelivery: new Date(2024, 8, 1)
        }
      ]
    },
    banner: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop'
  };

  const daysLeft = Math.ceil((project.funding.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const fundingProgress = (project.funding.raised / project.funding.goal) * 100;

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Switch to Sepolia testnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia testnet
          });
        } catch (switchError: any) {
          // If Sepolia is not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia test network',
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'SEP',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              }],
            });
          }
        }

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setIsConnected(true);
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to continue');
    }
  };

  const handleFunding = async (amount: number) => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setIsProcessing(true);
    setTransaction({ status: 'pending' });

    try {
      // Convert amount to wei (for demo purposes)
      const amountInWei = window.ethereum.utils?.toWei(amount.toString(), 'ether') || 
                         (BigInt(amount) * BigInt(10 ** 18)).toString();

      const transactionParameters = {
        to: project.owner.id, // In real app, this would be the smart contract address
        from: walletAddress,
        value: amountInWei,
        gas: '0x5208', // 21000 gas limit
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      setTransaction({
        status: 'success',
        hash: txHash,
        message: `Successfully funded $${amount} to ${project.title}!`
      });

      // Reset selections after successful transaction
      setTimeout(() => {
        setSelectedTier(null);
        setCustomAmount('');
      }, 3000);

    } catch (error: any) {
      console.error('Error processing transaction:', error);
      setTransaction({
        status: 'error',
        message: error.message || 'Transaction failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Project</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="text-sm">Connected: {formatAddress(walletAddress)}</span>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CurrencyDollarIcon className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 mb-8"
        >
          <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
            <img
              src={project.banner}
              alt={project.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/70 to-purple-600/70" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
              <p className="text-lg opacity-90">{project.description}</p>
              <div className="flex items-center space-x-2 mt-4">
                <img
                  src={project.owner.avatar}
                  alt={project.owner.name}
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <span className="text-sm">by {project.owner.name}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Funding Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Funding Progress</h2>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-gray-900">
                    ${(project.funding.raised / 1000000).toFixed(1)}M / ${(project.funding.goal / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(fundingProgress, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>{Math.round(fundingProgress)}% funded</span>
                  <span>{project.funding.backers} backers</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <ChartBarIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    ${(project.funding.raised / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-gray-600">Raised</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <UserGroupIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{project.funding.backers}</div>
                  <div className="text-gray-600">Backers</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <ClockIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{daysLeft}</div>
                  <div className="text-gray-600">Days left</div>
                </div>
              </div>
            </motion.div>

            {/* Funding Tiers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Support Level</h2>
              
              <div className="space-y-4">
                {project.funding.tiers.map((tier) => (
                  <motion.div
                    key={tier.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedTier(tier)}
                    className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedTier?.id === tier.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${tier.isPopular ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
                  >
                    {tier.isPopular && (
                      <div className="absolute -top-3 left-6">
                        <span className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                          <StarIcon className="w-4 h-4" />
                          <span>Most Popular</span>
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">${tier.amount}</h3>
                        <h4 className="text-lg text-blue-600 font-semibold">{tier.title}</h4>
                      </div>
                      <span className="text-sm text-gray-500">{tier.backers} backers</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{tier.description}</p>
                    
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-900">Includes:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {tier.perks.map((perk, index) => (
                          <li key={index} className="text-sm text-gray-600">{perk}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {tier.estimatedDelivery && (
                      <div className="mt-4 text-xs text-gray-500">
                        Estimated delivery: {tier.estimatedDelivery.toLocaleDateString()}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Payment Sidebar */}
          <div className="space-y-6">
            {/* Custom Amount */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Custom Amount</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter custom amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="1"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transaction Status */}
            {transaction && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-2xl p-6 shadow-xl border ${
                  transaction.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : transaction.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {transaction.status === 'success' && (
                    <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  )}
                  {transaction.status === 'error' && (
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  {transaction.status === 'pending' && (
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-1" />
                  )}
                  
                  <div>
                    <h4 className={`font-semibold ${
                      transaction.status === 'success'
                        ? 'text-green-800'
                        : transaction.status === 'error'
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }`}>
                      {transaction.status === 'success' && 'Transaction Successful!'}
                      {transaction.status === 'error' && 'Transaction Failed'}
                      {transaction.status === 'pending' && 'Processing Transaction...'}
                    </h4>
                    {transaction.message && (
                      <p className={`text-sm mt-1 ${
                        transaction.status === 'success'
                          ? 'text-green-700'
                          : transaction.status === 'error'
                          ? 'text-red-700'
                          : 'text-blue-700'
                      }`}>
                        {transaction.message}
                      </p>
                    )}
                    {transaction.hash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 underline mt-1 block"
                      >
                        View on Etherscan
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Fund Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
            >
              <div className="space-y-4">
                {selectedTier ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFunding(selectedTier.amount)}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CurrencyDollarIcon className="w-5 h-5" />
                    <span>
                      {isProcessing ? 'Processing...' : `Fund $${selectedTier.amount}`}
                    </span>
                  </motion.button>
                ) : customAmount && parseFloat(customAmount) > 0 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFunding(parseFloat(customAmount))}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CurrencyDollarIcon className="w-5 h-5" />
                    <span>
                      {isProcessing ? 'Processing...' : `Fund $${customAmount}`}
                    </span>
                  </motion.button>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Select a tier or enter a custom amount to continue
                  </div>
                )}

                {/* Security Notice */}
                <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg">
                  <ShieldCheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">Secure Funding</p>
                    <p>All transactions are processed securely through MetaMask on the Sepolia testnet. Your funds are protected by blockchain technology.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFundingPage;