import React, { useState, useEffect } from 'react';
import { blockchainService } from '../../services/blockchain';
import { toast } from 'react-hot-toast';

interface ContractTestProps {}

const ContractTest: React.FC<ContractTestProps> = () => {
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [campaignData, setCampaignData] = useState({
    title: 'Test Project Campaign',
    description: 'A test campaign for demonstrating the crowdfunding platform',
    goalAmount: '1.0',
    durationInDays: 30,
    milestones: ['Initial Setup', 'MVP Development', 'Beta Testing', 'Final Release']
  });
  const [oracleStats, setOracleStats] = useState<any>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Check if already connected
      const account = await blockchainService.getCurrentAccount();
      setConnectedAccount(account);

      // Load oracle stats
      const stats = await blockchainService.getOracleStats();
      setOracleStats(stats);

      // Get ETH price from Chainlink
      const price = await blockchainService.getETHPrice();
      setEthPrice(price);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      const account = await blockchainService.connectWallet();
      setConnectedAccount(account);
      
      // Switch to Sepolia testnet
      const switched = await blockchainService.switchToCorrectNetwork(11155111);
      if (switched) {
        toast.success('Switched to Sepolia testnet');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestCampaign = async () => {
    if (!connectedAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const result = await blockchainService.createCampaign(
        campaignData.title,
        campaignData.description,
        campaignData.goalAmount,
        campaignData.durationInDays,
        campaignData.milestones
      );

      if (result) {
        toast.success(`Campaign created! TX: ${result.txHash}`);
        console.log('Campaign creation result:', result);
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerAsOracle = async () => {
    if (!connectedAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const result = await blockchainService.registerOracleNode(
        'https://api.example.com/oracle',
        '1.0' // 1 ETH stake
      );

      if (result) {
        toast.success(`Registered as oracle! TX: ${result.txHash}`);
        // Reload oracle stats
        const stats = await blockchainService.getOracleStats();
        setOracleStats(stats);
      }
    } catch (error) {
      console.error('Failed to register as oracle:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCampaignInfo = async () => {
    try {
      const count = await blockchainService.getCampaignCount();
      toast.success(`Total campaigns: ${count}`);
      
      if (count > 0) {
        const campaign = await blockchainService.getCampaign(count - 1);
        if (campaign) {
          console.log('Latest campaign:', campaign);
          toast.success(`Latest campaign: ${campaign.title}`);
        }
      }
    } catch (error) {
      console.error('Failed to get campaign info:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Smart Contract Integration Test
        </h1>

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

        {/* Contract Addresses */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Deployed Contracts</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Crowdfunding:</strong> 0x21C3d838E291cD83CeC6D0f52AB2D2b3A19CBc27
            </div>
            <div>
              <strong>Oracle:</strong> 0x912b6265AFD7Ed9Cbc3FaEFDC419a3EC108De39A
            </div>
          </div>
        </div>

        {/* Oracle Stats */}
        {oracleStats && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Oracle Network Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Nodes</div>
                <div className="text-xl">{oracleStats.totalNodes}</div>
              </div>
              <div>
                <div className="font-medium">Total Requests</div>
                <div className="text-xl">{oracleStats.totalRequests}</div>
              </div>
              <div>
                <div className="font-medium">Completed</div>
                <div className="text-xl">{oracleStats.completedRequests}</div>
              </div>
              <div>
                <div className="font-medium">Avg Reputation</div>
                <div className="text-xl">{oracleStats.averageReputation}</div>
              </div>
            </div>
          </div>
        )}

        {/* ETH Price */}
        {ethPrice && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Chainlink Price Feed</h2>
            <div className="text-2xl font-bold text-yellow-700">
              ETH/USD: ${ethPrice.toFixed(2)}
            </div>
          </div>
        )}

        {/* Test Actions */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={createTestCampaign}
              disabled={loading || !connectedAccount}
              className="px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Test Campaign'}
            </button>

            <button
              onClick={registerAsOracle}
              disabled={loading || !connectedAccount}
              className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register as Oracle'}
            </button>

            <button
              onClick={getCampaignInfo}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            >
              Get Campaign Info
            </button>
          </div>
        </div>

        {/* Campaign Form */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Test Campaign Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={campaignData.title}
                onChange={(e) => setCampaignData({ ...campaignData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Goal Amount (ETH)</label>
              <input
                type="number"
                step="0.1"
                value={campaignData.goalAmount}
                onChange={(e) => setCampaignData({ ...campaignData, goalAmount: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (days)</label>
              <input
                type="number"
                value={campaignData.durationInDays}
                onChange={(e) => setCampaignData({ ...campaignData, durationInDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Milestones ({campaignData.milestones.length})</label>
              <div className="text-sm text-gray-600">
                {campaignData.milestones.join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Connect your MetaMask wallet</li>
            <li>Ensure you're on Sepolia testnet</li>
            <li>Get Sepolia ETH from faucet if needed</li>
            <li>Register as an Oracle node (requires 1 ETH stake)</li>
            <li>Create a test campaign</li>
            <li>Check the console for transaction details</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ContractTest;