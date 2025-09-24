import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  HeartIcon,
  CalendarDaysIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { contributionsService, ProjectContribution } from '../../services/contributionsService';
import { toast } from 'react-hot-toast';

interface ContributionsDisplayProps {
  projectId: string;
  className?: string;
}

const ContributionsDisplay: React.FC<ContributionsDisplayProps> = ({
  projectId,
  className = '',
}) => {
  const [contributions, setContributions] = useState<ProjectContribution[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalContributors, setTotalContributors] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadContributions();
  }, [projectId]);

  const loadContributions = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📊 Loading contributions for project:', projectId);

      const result = await contributionsService.getProjectContributions(projectId);

      if (result.success) {
        setContributions(result.contributions || []);
        setTotalAmount(result.totalAmount || 0);
        setTotalContributors(result.totalContributors || 0);
        console.log('✅ Contributions loaded:', {
          count: result.contributions?.length,
          totalAmount: result.totalAmount,
          totalContributors: result.totalContributors
        });
      } else {
        console.error('❌ Failed to load contributions:', result.error);
        setError(result.error || 'Failed to load contributions');
      }
    } catch (error: any) {
      console.error('❌ Error loading contributions:', error);
      setError(error.message || 'Failed to load contributions');
    } finally {
      setLoading(false);
    }
  };

  const displayedContributions = showAll ? contributions : contributions.slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatEthAmount = (amount: number) => {
    return amount.toFixed(4);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-xl border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="w-24 h-4 bg-gray-300 rounded"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-20 h-3 bg-gray-300 rounded"></div>
                  <div className="w-32 h-3 bg-gray-300 rounded"></div>
                </div>
                <div className="w-16 h-3 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-xl border border-gray-200 ${className}`}>
        <div className="text-center py-6">
          <div className="text-red-500 mb-2">❌</div>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={loadContributions}
            className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <UserGroupIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Contributors</h3>
            <p className="text-sm text-gray-600">
              {totalContributors} contributors • {formatEthAmount(totalAmount)} ETH raised
            </p>
          </div>
        </div>
        
        {contributions.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
          >
            <span>{showAll ? 'Show Less' : 'Show All'}</span>
            {showAll ? (
              <EyeSlashIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Summary Stats */}
      {totalAmount > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Total Raised</span>
            </div>
            <p className="text-xl font-bold text-green-900 mt-1">
              {formatEthAmount(totalAmount)} ETH
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Contributors</span>
            </div>
            <p className="text-xl font-bold text-blue-900 mt-1">{totalContributors}</p>
          </div>
        </div>
      )}

      {/* Contributions List */}
      {contributions.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {displayedContributions.map((contribution, index) => (
              <motion.div
                key={contribution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {contribution.contributor_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">
                          {contribution.is_anonymous ? 'Anonymous' : contribution.contributor_name}
                        </span>
                        {contribution.confirmed_at && (
                          <CheckBadgeIcon className="w-4 h-4 text-green-500" title="Confirmed" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-green-600">
                          {formatEthAmount(contribution.amount)} ETH
                        </span>
                        <span className="text-xs text-gray-500 flex items-center space-x-1">
                          <CalendarDaysIcon className="w-3 h-3" />
                          <span>{formatDate(contribution.created_at)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Message */}
                    {contribution.contribution_message && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border-l-3 border-blue-300">
                        <p className="text-sm text-blue-900 italic">
                          "{contribution.contribution_message}"
                        </p>
                      </div>
                    )}

                    {/* Transaction Hash */}
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Transaction:</span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${contribution.blockchain_tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-blue-600 hover:text-blue-700 truncate max-w-[200px]"
                        title={contribution.blockchain_tx_hash}
                      >
                        {contribution.blockchain_tx_hash}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Show More/Less Button */}
          {contributions.length > 5 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-4 py-2 text-center text-sm text-blue-600 hover:text-blue-700 font-medium border-2 border-dashed border-blue-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              {showAll 
                ? `Hide ${contributions.length - 5} contributions` 
                : `Show ${contributions.length - 5} more contributions`
              }
            </motion.button>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No contributors yet</h4>
          <p className="text-gray-600 text-sm">
            Be the first to support this project!
          </p>
        </div>
      )}
    </div>
  );
};

export default ContributionsDisplay;