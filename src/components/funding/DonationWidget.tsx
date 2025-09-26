import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WalletIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { web3Service, ProjectData } from '../../services/web3';
import { contributionsService } from '../../services/contributionsService';
import { transactionMonitorService } from '../../services/transactionMonitorService';
import { localStorageService } from '../../services/localStorage';
import { enhancedProjectService } from '../../services/enhancedProjectService';
import { supabase } from '../../services/supabase';
import { escrowService } from '../../services/escrowService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface DonationWidgetProps {
  projectId: string;
  projectTitle: string;
  creatorName: string;
  onDonationSuccess?: (transactionHash: string, amount: string) => void;
  onDonationError?: (error: string) => void;
}

interface DonationFormData {
  amount: string;
  message: string;
  donorName: string;
  donorEmail: string;
}

const DonationWidget: React.FC<DonationWidgetProps> = ({
  projectId,
  projectTitle,
  creatorName,
  onDonationSuccess,
  onDonationError,
}) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm' | 'processing' | 'success' | 'error'>('form');
  const [error, setError] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [gasEstimate, setGasEstimate] = useState<{
    gasEstimate: number;
    gasPriceGwei: string;
    totalCostEth: string;
  } | null>(null);

  const [formData, setFormData] = useState<DonationFormData>({
    amount: '',
    message: '',
    donorName: '',
    donorEmail: '',
  });

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isZkpOptIn, setIsZkpOptIn] = useState<boolean>(false);

  useEffect(() => {
    checkWalletConnection();
    loadProjectData();
  }, [projectId]);

  const checkWalletConnection = async () => {
    try {
      const account = await web3Service.getAccount();
      if (account) {
        setIsConnected(true);
        setWalletAddress(account);
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const loadProjectData = async () => {
    try {
      const data = await web3Service.getProject(projectId);
      setProjectData(data);
    } catch (error) {
      console.error('Failed to load project data:', error);
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
      } else {
        setError(result.error || 'Failed to connect wallet');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof DonationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');

    // Estimate gas when amount changes
    if (field === 'amount' && value && parseFloat(value) > 0) {
      estimateGas(value);
    }
  };

  const estimateGas = async (amount: string) => {
    try {
      if (!isConnected || !amount) return;

      const estimate = await web3Service.estimateGas(projectId, amount, formData.message);
      setGasEstimate(estimate);
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      setGasEstimate(null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid donation amount');
      return false;
    }

    if (!formData.donorEmail || !/\S+@\S+\.\S+/.test(formData.donorEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.donorName.trim()) {
      setError('Please enter your name');
      return false;
    }

    return true;
  };

  const handleDonate = async () => {
    if (!validateForm()) return;

    setStep('confirm');
  };

  const confirmDonation = async () => {
    setStep('processing');
    setIsLoading(true);

    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('Please sign in to make a contribution');
      }

      console.log('🔄 Starting donation process:', {
          projectId,
          amount: formData.amount,
          userId: user.id
        });

      // First, check if project exists on blockchain, if not try to resolve/create it
  console.log('🔍 Checking if project exists on blockchain...');
  // onChainProjectId is the identifier used by the smart contract. Default to the provided projectId
  // but prefer any resolved blockchain identifier from Supabase/local data.
  let onChainProjectId = projectId;
  let projectExists = await web3Service.getProject(onChainProjectId);

      // If not found on-chain, try to resolve a proper blockchain identifier from Supabase/local storage
      if (!projectExists) {
        console.log('⚠️ Project not found on blockchain. Attempting enhanced lookup...');

        const enhanced = await enhancedProjectService.getProjectById(projectId).catch(() => null);
        if (enhanced && enhanced.blockchainId) {
          console.log('🔁 Resolved blockchainId from Supabase/local:', enhanced.blockchainId);
          onChainProjectId = enhanced.blockchainId;
          projectExists = await web3Service.getProject(onChainProjectId);
        }

        // If still not found, attempt to create using localProject metadata as a last resort (preserves previous behavior)
        if (!projectExists) {
          console.log('📝 Falling back to creating project on-chain from local metadata...');
          const localProject = await localStorageService.getProjectById(projectId);
          if (!localProject) {
            throw new Error('Project not found in local storage or Supabase; cannot create on-chain project');
          }

          // Convert funding goal to ETH (ensure it's a string)
          const targetAmountEth = localProject.fundingGoal?.toString() || '1.0';

          // Set deadline (default to 30 days from now if not specified)
          let deadline = new Date();
          if (localProject.deadline) {
            deadline = new Date(localProject.deadline);
          } else {
            deadline.setDate(deadline.getDate() + 30); // 30 days from now
          }

          console.log('🚀 Creating project on blockchain (fallback):', {
            projectId,
            targetAmount: targetAmountEth + ' ETH',
            deadline: deadline.toISOString()
          });

          // Use onChainProjectId for creation to ensure the contract registers the expected id
          const createResult = await web3Service.createProject(
            onChainProjectId,
            targetAmountEth,
            deadline
          );

          if (!createResult.success) {
            throw new Error(`Failed to create project on blockchain: ${createResult.error}`);
          }

          console.log('✅ Project created on blockchain (fallback):', createResult.transactionHash);

          // Wait a moment for the transaction to be mined
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Verify project was created
          projectExists = await web3Service.getProject(onChainProjectId);
          if (!projectExists) {
            throw new Error('Project creation verification failed for onChainProjectId: ' + onChainProjectId);
          }
          if (!projectExists) {
            throw new Error('Project creation verification failed');
          }
        }
      } else {
        console.log('✅ Project already exists on blockchain');
      }

      // Determine whether project uses milestones (escrow) or should be direct payout
      console.log('🔁 Final donate call IDs:', { dbProjectId: projectId, onChainProjectId });
      let result: { success: boolean; transactionHash?: string; error?: string } | null = null;

      // Check for milestones via enhancedProjectService (falls back to DB). If none, do direct transfer to creator
      let doDirectPayout = false;
      let creatorWalletAddress: string | undefined;
      try {
        const enhanced = await enhancedProjectService.getProjectById(projectId);
        if (enhanced) {
          // If enhanced project has explicit milestones array, respect that
          const milestones = enhanced.milestones || [];
          if (Array.isArray(milestones) && milestones.length === 0) {
            doDirectPayout = true;
          }
          creatorWalletAddress = (enhanced as any).creatorAddress || undefined;
        }
      } catch (err) {
        console.warn('Could not determine project milestones from enhanced service, falling back to escrowService');
      }

      // If we couldn't determine from enhancedProjectService, try escrowService.getProjectMilestones
      if (!doDirectPayout) {
        try {
          const milestonesResult = await escrowService.getProjectMilestones(projectId);
          if (milestonesResult.success && Array.isArray(milestonesResult.milestones) && milestonesResult.milestones.length === 0) {
            doDirectPayout = true;
          }
        } catch (err) {
          console.warn('Could not check milestones via escrowService:', err);
        }
      }

      if (doDirectPayout) {
        console.log('➡️ Project has zero milestones — performing direct payout to creator');


        // Resolve creator wallet address if missing.
        // Prefer the explicit projects.creator_wallet_address column (present in migrations).
        if (!creatorWalletAddress) {
          try {
            // PATCH: Use correct Supabase filter syntax for project lookup
            const { data: projectRow, error: projErr } = await supabase
              .from('projects')
              .select('id, creator_id, creator_wallet_address, blockchain_id')
              .eq('id', projectId)
              .limit(1)
              .single();
            // If not found by id, try blockchain_id
            let finalProjectRow = projectRow;
            let finalError = projErr;
            if (!finalProjectRow) {
              const { data: altProjectRow, error: altProjErr } = await supabase
                .from('projects')
                .select('id, creator_id, creator_wallet_address, blockchain_id')
                .eq('blockchain_id', projectId)
                .limit(1)
                .single();
              if (altProjectRow) {
                finalProjectRow = altProjectRow;
                finalError = altProjErr;
              }
            }
            if (!finalProjectRow) {
              console.error('❌ Supabase project query failed:', finalError);
              toast.error('Could not find project in database. Please check your Supabase schema and RLS policies.');
              throw new Error('Project not found in Supabase. See console for details.');
            }

            if (!projErr && projectRow) {
              // Use the explicit creator_wallet_address if present
              if (projectRow.creator_wallet_address && web3Service.isValidAddress(projectRow.creator_wallet_address)) {
                creatorWalletAddress = projectRow.creator_wallet_address;
                console.log('✅ Found creator_wallet_address in projects:', creatorWalletAddress);
              } else if (projectRow.creator_id) {
                const creatorIdVal = projectRow.creator_id as string;
                // If creator_id is a UUID, lookup user by id in users table
                if (creatorIdVal && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(creatorIdVal)) {
                  const { data: userRow, error: userErr } = await supabase
                    .from('users')
                    .select('wallet_address')
                    .eq('id', creatorIdVal)
                    .single();
                  if (userRow?.wallet_address && web3Service.isValidAddress(userRow.wallet_address)) {
                    creatorWalletAddress = userRow.wallet_address;
                    console.log('✅ Found wallet_address in users by id:', creatorWalletAddress);
                  } else {
                    console.warn('❌ No valid wallet_address found in users for creator_id:', creatorIdVal);
                  }
                } else if (creatorIdVal && web3Service.isValidAddress(creatorIdVal)) {
                  // If creator_id is already a wallet address
                  creatorWalletAddress = creatorIdVal;
                  console.log('✅ creator_id is a wallet address:', creatorWalletAddress);
                } else {
                  // As a last resort, attempt to find a user with this string as wallet_address
                  const { data: userRow, error: userErr } = await supabase
                    .from('users')
                    .select('wallet_address')
                    .eq('wallet_address', creatorIdVal)
                    .single();
                  if (userRow?.wallet_address && web3Service.isValidAddress(userRow.wallet_address)) {
                    creatorWalletAddress = userRow.wallet_address;
                    console.log('✅ Found wallet_address in users by wallet_address:', creatorWalletAddress);
                  } else {
                    console.warn('❌ No valid wallet_address found in users for creatorIdVal:', creatorIdVal);
                  }
                }
              } else {
                console.warn('❌ No creator_id found in projectRow');
              }
            } else {
              console.warn('❌ No projectRow found for projectId:', projectId);
            }
          } catch (err) {
            console.warn('Failed to resolve creator wallet address from Supabase/enhancedProjectService:', err);
          }
        }

        if (!creatorWalletAddress || !web3Service.isValidAddress(creatorWalletAddress)) {
          throw new Error('Creator wallet address not available or invalid; cannot perform direct payout');
        }

        // Perform direct ETH transfer from donor to creator
        result = await web3Service.sendDirectTransfer(creatorWalletAddress, formData.amount);

        if (!result.success) {
          throw new Error(result.error || 'Direct payout transaction failed');
        }

        // Save contribution as confirmed (skip escrow pending flow)
        if (result.transactionHash) {
          console.log('✅ Direct payout transaction successful:', result.transactionHash);

          // Attempt to insert contribution with status = 'confirmed' so totals update immediately
          try {
            const { data: contribData, error: insertErr } = await supabase
              .from('contributions')
              .insert([{ 
                project_id: projectId,
                contributor_id: user.id || null,
                amount: parseFloat(formData.amount),
                currency: 'ETH',
                blockchain_tx_hash: result.transactionHash,
                status: 'confirmed',
                contribution_message: formData.message || undefined,
                is_anonymous: false,
                is_zkp: isZkpOptIn || false,
                created_at: new Date().toISOString(),
                confirmed_at: new Date().toISOString()
              }])
              .select()
              .single();

            if (insertErr) {
              console.warn('Direct payout: supabase insert returned error, falling back to contributionsService:', insertErr.message || insertErr);
              const contributionResult = await contributionsService.processContribution(
                projectId,
                user.id!,
                parseFloat(formData.amount),
                'ETH',
                result.transactionHash,
                formData.message || undefined,
                false,
                isZkpOptIn
              );
              if (!contributionResult.success) {
                console.error('Failed saving contribution after direct payout:', contributionResult.error);
                toast.error('Donation succeeded but failed to record contribution in database');
              }
            } else {
              console.log('✅ Contribution recorded as confirmed in DB (direct payout)');
            }

          } catch (err) {
            console.warn('Error saving contribution record after direct payout:', err);
          }

          // Monitor the transaction
          transactionMonitorService.startMonitoring(result.transactionHash);

          setTransactionHash(result.transactionHash);
          setStep('success');
          if (onDonationSuccess) onDonationSuccess(result.transactionHash, formData.amount);
          await loadProjectData();
          setIsLoading(false);
          return;
        }
      }

      // Process blockchain donation transaction (escrow path)
      // Donate using the on-chain id (may be different from DB UUID)
      // Try donate using the resolved on-chain id first
      result = await web3Service.donate(
        onChainProjectId,
        formData.amount,
        formData.message
      );

      // If the call failed due to project not found and we used a different id than the DB id,
      // retry once with the DB projectId (handles mismatches where the contract was created with the DB UUID instead)
      if (!result.success && result.error && onChainProjectId !== projectId) {
        const errLower = (result.error || '').toLowerCase();
        if (errLower.includes('project') || errLower.includes('not exist') || errLower.includes('project_not_found')) {
          console.warn('⚠️ Donate failed for onChainProjectId, retrying with DB projectId:', { onChainProjectId, projectId, error: result.error });
          result = await web3Service.donate(
            projectId,
            formData.amount,
            formData.message
          );
          if (result.success) {
            console.log('✅ Donate succeeded on retry with DB projectId');
          } else {
            console.error('❌ Donate also failed on retry with DB projectId:', result.error);
          }
        }
      }

      if (result.success && result.transactionHash) {
        console.log('✅ Blockchain transaction successful:', result.transactionHash);
        console.log('🔄 Starting database save process...');
        console.log('📊 Save parameters:', {
          projectId,
          userId: user.id,
          amount: parseFloat(formData.amount),
          currency: 'ETH',
          txHash: result.transactionHash,
          message: formData.message || undefined,
          isAnonymous: false
        });
        
        // Save contribution to database
        console.log('🔄 Calling contributionsService.processContribution...');
        const contributionResult = await contributionsService.processContribution(
          projectId,
          user.id!,
          parseFloat(formData.amount),
          'ETH',
          result.transactionHash,
          formData.message || undefined,
          false, // Not anonymous
          isZkpOptIn // pass user's ZKP opt-in preference
        );

        console.log('📈 Contribution service result:', contributionResult);

        if (contributionResult.success) {
          console.log('✅ Contribution saved to database successfully!');
          console.log('📝 Contribution details:', contributionResult);
          toast.success('Contribution saved successfully!');
          
          // Start monitoring transaction for confirmation
          console.log('🔄 Starting transaction monitoring for:', result.transactionHash);
          transactionMonitorService.startMonitoring(result.transactionHash);
        } else {
          console.error('❌ DATABASE SAVE FAILED!');
          console.error('🔍 Detailed error analysis:');
          console.error('   - Error message:', contributionResult.error);
          console.error('   - Project ID:', projectId);
          console.error('   - User ID:', user.id);
          console.error('   - Transaction hash:', result.transactionHash);
          console.error('   - Contribution result object:', contributionResult);
          console.warn('⚠️ Blockchain succeeded but database save failed:', contributionResult.error);
          toast.error(`Transaction succeeded but failed to save to database: ${contributionResult.error}`);
        }

        setTransactionHash(result.transactionHash);
        setStep('success');
        
        // Call success callback
        if (onDonationSuccess) {
          onDonationSuccess(result.transactionHash, formData.amount);
        }

        // Reload project data to show updated amounts
        await loadProjectData();
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error: any) {
      console.error('❌ Donation failed:', error);
      setError(error.message || 'Donation failed');
      setStep('error');
      
      if (onDonationError) {
        onDonationError(error.message || 'Donation failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setError('');
    setTransactionHash('');
    setGasEstimate(null);
    setFormData({
      amount: '',
      message: '',
      donorName: '',
      donorEmail: '',
    });
  };

  const predefinedAmounts = ['0.01', '0.05', '0.1', '0.5', '1.0'];

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center">
          <WalletIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect your MetaMask wallet to donate to this project
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Support This Project
        </h3>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <WalletIcon className="h-4 w-4 mr-1" />
          {web3Service.formatAddress(walletAddress)}
        </div>
      </div>

      {projectData && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Progress</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {projectData.raisedAmount} / {projectData.targetAmount} ETH
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  (parseFloat(projectData.raisedAmount) / parseFloat(projectData.targetAmount)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Donation Amount (ETH)
              </label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleInputChange('amount', amount)}
                    className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                      formData.amount === amount
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="0.001"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="Enter custom amount"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {gasEstimate && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Estimated gas fee: ~{parseFloat(gasEstimate.totalCostEth).toFixed(6)} ETH
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={formData.donorName}
                onChange={(e) => handleInputChange('donorName', e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.donorEmail}
                onChange={(e) => handleInputChange('donorEmail', e.target.value)}
                placeholder="Enter your email for confirmation"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                id="zkp-optin"
                type="checkbox"
                checked={isZkpOptIn}
                onChange={(e) => setIsZkpOptIn(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="zkp-optin" className="text-sm text-gray-700 dark:text-gray-300">
                Opt-in to ZKP privacy for this contribution (store minimal personal info)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Leave a message for the project creator..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleDonate}
              disabled={isLoading || !formData.amount || !formData.donorEmail || !formData.donorName}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg 
                       font-medium disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center transition-colors"
            >
              <HeartSolid className="h-5 w-5 mr-2" />
              Donate {formData.amount ? `${formData.amount} ETH` : ''}
            </button>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                Confirm Your Donation
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Project:</span>
                  <span className="text-blue-900 dark:text-blue-100 font-medium">{projectTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Creator:</span>
                  <span className="text-blue-900 dark:text-blue-100">{creatorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Amount:</span>
                  <span className="text-blue-900 dark:text-blue-100 font-medium">{formData.amount} ETH</span>
                </div>
                {gasEstimate && (
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Est. Gas Fee:</span>
                    <span className="text-blue-900 dark:text-blue-100">~{parseFloat(gasEstimate.totalCostEth).toFixed(6)} ETH</span>
                  </div>
                )}
                {formData.message && (
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                    <span className="text-blue-700 dark:text-blue-300">Message:</span>
                    <p className="text-blue-900 dark:text-blue-100 mt-1">{formData.message}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                         py-3 px-6 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600
                         transition-colors"
              >
                Back
              </button>
              <button
                onClick={confirmDonation}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg 
                         font-medium disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                )}
                {isLoading ? 'Processing...' : 'Confirm Donation'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <ArrowPathIcon className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Processing Your Donation
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please confirm the transaction in your wallet and wait for blockchain confirmation.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This may take a few minutes...
            </p>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Donation Successful!
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Thank you for supporting {projectTitle}! Your donation of {formData.amount} ETH has been confirmed.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Transaction Hash:</p>
              <p className="text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded border break-all">
                {transactionHash}
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
              >
                View on Etherscan →
              </a>
            </div>
            <button
              onClick={resetForm}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium"
            >
              Make Another Donation
            </button>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Donation Failed
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error}
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={resetForm}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                         py-2 px-6 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Start Over
              </button>
              <button
                onClick={confirmDonation}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonationWidget;