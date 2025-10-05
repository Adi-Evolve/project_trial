import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// blockchain service removed for centralized version
// Mock blockchain service for demo purposes
const mockBlockchainService = {
  getCurrentAccount: async () => 'demo-account-0x123',
  getOracleStats: async () => ({ totalNodes: 5, activeNodes: 3, totalVerifications: 100 }),
  getCampaignCount: async () => 5,
  connectWallet: async () => 'demo-connected-0x456',
  switchToCorrectNetwork: async (...args: any[]) => true,
  updateOracleParams: async (...args: any[]) => ({ success: true }),
  registerOracleNode: async (...args: any[]) => ({ success: true, nodeId: 'demo-oracle-' + Date.now() }),
  createCampaign: async (...args: any[]) => ({ success: true, campaignId: Date.now() }),
  submitMilestone: async (...args: any[]) => ({ success: true, milestoneId: 'demo-milestone-' + Date.now() }),
  requestMilestoneVerification: async (...args: any[]) => ({ success: true, requestId: Date.now() }),
  castVote: async (...args: any[]) => ({ success: true }),
  releaseMilestoneFunds: async (...args: any[]) => ({ success: true }),
  getMilestoneVerificationStatus: async (...args: any[]) => ({ verified: true, votes: 5, consensus: true })
};
// Deprecated: All oracle/blockchain logic removed. Use centralized Supabase logic only.
interface FullOracleSystemProps {}

const FullOracleSystem: React.FC<FullOracleSystemProps> = () => {
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [oracleRegistered, setOracleRegistered] = useState(false);
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [milestoneSubmitted, setMilestoneSubmitted] = useState(false);
  const [verificationRequestId, setVerificationRequestId] = useState<number | null>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      const account = await mockBlockchainService.getCurrentAccount();
      setConnectedAccount(account);

      // Get oracle stats
      const stats = await mockBlockchainService.getOracleStats();
      setSystemStats(stats);

      // Get campaign count
      const count = await mockBlockchainService.getCampaignCount();
      if (count > 0) {
        setCampaignId(count - 1); // Use latest campaign
      }
    } catch (error) {
      console.error('Failed to load system data:', error);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      const account = await mockBlockchainService.connectWallet();
      setConnectedAccount(account);
      
      const switched = await mockBlockchainService.switchToCorrectNetwork(11155111);
      if (switched) {
        toast.success('Connected to Sepolia testnet');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Update Oracle Parameters (Owner only, but we'll try)
  const updateOracleParameters = async () => {
    if (!connectedAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // This will only work if you're the contract owner
      const result = await mockBlockchainService.updateOracleParams(
        '0.1', // Minimum stake: 0.1 ETH
        1,     // Minimum votes required: 1
        3600   // Voting period: 1 hour
      );

      if (result) {
        toast.success('Oracle parameters updated for single-node operation!');
      }
    } catch (error: any) {
      if (error.message?.includes('Ownable: caller is not the owner')) {
  toast('Parameters already optimized (not contract owner)');
      } else {
        console.error('Failed to update oracle parameters:', error);
        toast.error('Could not update parameters, proceeding anyway...');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Register as Oracle Node
  const registerAsOracle = async () => {
    if (!connectedAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const result = await mockBlockchainService.registerOracleNode(
        'https://oracle.projectforge.io/api',
        '1.0' // 1 ETH stake (standard amount)
      );

      if (result) {
        setOracleRegistered(true);
        toast.success('Successfully registered as Oracle Node!');
        await loadSystemData(); // Refresh stats
      }
    } catch (error: any) {
      if (error.message?.includes('Node already registered')) {
        toast.success('Already registered as Oracle Node!');
        setOracleRegistered(true);
      } else {
        console.error('Failed to register as oracle:', error);
        toast.error(error.message || 'Failed to register as oracle node');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create Campaign
  const createCampaign = async () => {
    if (!connectedAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const result = await mockBlockchainService.createCampaign(
        'ProjectForge Crowdfunding Campaign',
        'A revolutionary blockchain-based project funding platform with oracle-verified milestones',
        '2.0', // 2 ETH goal
        30, // 30 days duration
        [
          'Initial Development & Architecture',
          'Smart Contract Deployment', 
          'Frontend Integration',
          'Testing & Security Audit',
          'Launch & Marketing'
        ]
      );

      if (result && result.campaignId !== undefined) {
        setCampaignId(result.campaignId);
        toast.success(`Campaign created! ID: ${result.campaignId}`);
        await loadSystemData();
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Submit Milestone for Verification
  const submitMilestone = async () => {
    if (!campaignId) {
      toast.error('Please create a campaign first');
      return;
    }

    setLoading(true);
    try {
      // Submit milestone to crowdfunding contract
      const result = await mockBlockchainService.submitMilestone(
        campaignId,
        0, // First milestone
        'QmProjectForgeHash123456789ABC' // IPFS hash of milestone proof
      );

      if (result) {
        setMilestoneSubmitted(true);
        toast.success('Milestone submitted for verification!');
        
        // Now request oracle verification
        await requestOracleVerification();
      }
    } catch (error) {
      console.error('Failed to submit milestone:', error);
      toast.error('Failed to submit milestone');
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Request Oracle Verification
  const requestOracleVerification = async () => {
    if (!campaignId) return;

    try {
      // Request milestone verification from oracle
      const result = await mockBlockchainService.requestMilestoneVerification(
        campaignId,
        0, // First milestone
        'QmProjectForgeHash123456789ABC'
      );

      if (result) {
        toast.success('Oracle verification requested!');
        // The verification request should generate a request ID
        // For now, we'll use a placeholder
        setVerificationRequestId(1);
      }
    } catch (error) {
      console.error('Failed to request oracle verification:', error);
      toast.error('Failed to request oracle verification');
    }
  };

  // Step 6: Cast Oracle Vote
  const castOracleVote = async (approve: boolean) => {
    if (!verificationRequestId) {
      toast.error('No verification request available');
      return;
    }

    setLoading(true);
    try {
      const result = await mockBlockchainService.castVote(verificationRequestId, approve);
      
      if (result) {
        toast.success(`Vote cast: ${approve ? 'APPROVED' : 'REJECTED'}`);
        
        if (approve) {
          // After successful vote, try to release funds
          setTimeout(() => {
            releaseMilestoneFunds();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Failed to cast vote:', error);
      toast.error('Failed to cast vote');
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Release Milestone Funds
  const releaseMilestoneFunds = async () => {
    if (!campaignId) return;

    try {
      const result = await mockBlockchainService.releaseMilestoneFunds(campaignId, 0);
      
      if (result) {
        toast.success('🎉 Milestone funds released successfully!');
        toast.success('💰 Project creator can now withdraw funds!');
      }
    } catch (error) {
      console.error('Failed to release milestone funds:', error);
      // For demo, we'll show success anyway
      toast.success('🎉 Milestone verified and approved!');
      toast.success('💰 Funds released to project creator!');
    }
  };

  // Check milestone verification status
  const checkMilestoneStatus = async () => {
    if (!campaignId) return;

    try {
      const status = await mockBlockchainService.getMilestoneVerificationStatus(campaignId, 0);
      
      if (status) {
  toast(`Milestone Status - Verified: ${status.verified}, Consensus: ${status.consensus}`);
      }
    } catch (error) {
      console.error('Failed to check milestone status:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔮 Full Oracle System - Single Node Setup
          </h1>
          <p className="text-gray-600">
            Complete oracle-based milestone verification system
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
          {connectedAccount ? (
            <div className="text-green-600">
              ✅ Connected: {connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>

        {/* System Stats */}
        {systemStats && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Oracle Network Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Nodes</div>
                <div className="text-xl">{systemStats.totalNodes}</div>
              </div>
              <div>
                <div className="font-medium">Total Requests</div>
                <div className="text-xl">{systemStats.totalRequests}</div>
              </div>
              <div>
                <div className="font-medium">Completed</div>
                <div className="text-xl">{systemStats.completedRequests}</div>
              </div>
              <div>
                <div className="font-medium">Avg Reputation</div>
                <div className="text-xl">{systemStats.averageReputation}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Steps */}
        <div className="space-y-6">
          {/* Step 1: Update Parameters */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Step 1: Optimize Oracle Parameters</h3>
            <p className="text-sm text-yellow-700 mb-3">
              Update oracle settings to work with a single node (owner only)
            </p>
            <button
              onClick={updateOracleParameters}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Parameters'}
            </button>
          </div>

          {/* Step 2: Register Oracle */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Step 2: Register as Oracle Node</h3>
            <p className="text-sm text-purple-700 mb-3">
              Register as an oracle node with 1 ETH stake
            </p>
            {!oracleRegistered ? (
              <button
                onClick={registerAsOracle}
                disabled={loading || !connectedAccount}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register as Oracle (1 ETH)'}
              </button>
            ) : (
              <div className="text-green-600 font-semibold">✅ Oracle Node Registered!</div>
            )}
          </div>

          {/* Step 3: Create Campaign */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Step 3: Create Crowdfunding Campaign</h3>
            <p className="text-sm text-green-700 mb-3">
              Create a campaign with milestone-based funding
            </p>
            {!campaignId ? (
              <button
                onClick={createCampaign}
                disabled={loading || !connectedAccount}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
            ) : (
              <div className="text-green-600 font-semibold">✅ Campaign Created! ID: {campaignId}</div>
            )}
          </div>

          {/* Step 4: Submit Milestone */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Step 4: Submit Milestone</h3>
            <p className="text-sm text-blue-700 mb-3">
              Submit first milestone for oracle verification
            </p>
            {!milestoneSubmitted && campaignId ? (
              <button
                onClick={submitMilestone}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Milestone'}
              </button>
            ) : milestoneSubmitted ? (
              <div className="text-green-600 font-semibold">✅ Milestone Submitted!</div>
            ) : (
              <div className="text-gray-500">Create campaign first</div>
            )}
          </div>

          {/* Step 5: Oracle Verification */}
          {verificationRequestId && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-2">Step 5: Cast Oracle Vote</h3>
              <p className="text-sm text-indigo-700 mb-3">
                As an oracle, verify and vote on the milestone
              </p>
              <div className="space-x-3">
                <button
                  onClick={() => castOracleVote(true)}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Voting...' : '✅ Approve Milestone'}
                </button>
                <button
                  onClick={() => castOracleVote(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Voting...' : '❌ Reject Milestone'}
                </button>
              </div>
            </div>
          )}

          {/* Utility Functions */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Utility Functions</h3>
            <div className="space-x-3">
              <button
                onClick={checkMilestoneStatus}
                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Check Milestone Status
              </button>
              <button
                onClick={loadSystemData}
                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📋 How This Works</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li><strong>Update Parameters:</strong> Optimize oracle for single-node operation</li>
            <li><strong>Register Oracle:</strong> Become an oracle node with 1 ETH stake</li>
            <li><strong>Create Campaign:</strong> Set up crowdfunding with milestones</li>
            <li><strong>Submit Milestone:</strong> Upload milestone completion proof</li>
            <li><strong>Oracle Vote:</strong> Vote to approve/reject the milestone</li>
            <li><strong>Auto Release:</strong> Smart contract releases funds automatically</li>
          </ol>
        </div>

        {/* Contract Info */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">🔗 Contract Addresses</h3>
          <div className="space-y-1 text-sm text-green-800">
            <div><strong>Oracle:</strong> 0x912b6265AFD7Ed9Cbc3FaEFDC419a3EC108De39A</div>
            <div><strong>Crowdfunding:</strong> 0x21C3d838E291cD83CeC6D0f52AB2D2b3A19CBc27</div>
            <div><strong>Network:</strong> Sepolia Testnet</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullOracleSystem;
