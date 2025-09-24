import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import FundTransferTest from '../components/testing/FundTransferTest';
import DirectTransferTest from '../components/testing/DirectTransferTest';

const TestFundTransferPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              🧪 Fund Transfer Testing Lab
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Test the complete funding mechanism with real Sepolia transactions
            </p>
          </div>
        </motion.div>

        {/* Warning Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              ⚠️
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Testing Environment
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  This is a testing environment using <strong>Sepolia Testnet</strong>. 
                  Make sure you have:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>MetaMask connected to Sepolia network</li>
                  <li>Sufficient Sepolia ETH for testing (at least 0.002 ETH for gas + transfer)</li>
                  <li>Signed into the application with your user account</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Direct Transfer Test - Simpler Testing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <DirectTransferTest />
        </motion.div>

        {/* Fund Transfer Test Component - Smart Contract Testing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Advanced Smart Contract Testing
          </h2>
          <FundTransferTest />
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🔗 Blockchain Flow</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>1. Create project smart contract</div>
                <div>2. Send ETH to contract via donate() function</div>
                <div>3. Contract holds funds in escrow</div>
                <div>4. Creator can withdraw funds via withdrawFunds()</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">💾 Database Flow</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>1. Save contribution record with tx hash</div>
                <div>2. Monitor transaction for confirmation</div>
                <div>3. Update status when blockchain confirms</div>
                <div>4. Update project funding totals</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🔍 Transaction Monitoring</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>1. Start monitoring pending transactions</div>
                <div>2. Check blockchain every 15 seconds</div>
                <div>3. Auto-confirm when receipt available</div>
                <div>4. Update database records accordingly</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">💰 Fund Transfer</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>1. Funds held securely in smart contract</div>
                <div>2. Creator address receives funds on withdrawal</div>
                <div>3. Transaction fees paid by caller</div>
                <div>4. All transactions are verifiable on-chain</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TestFundTransferPage;