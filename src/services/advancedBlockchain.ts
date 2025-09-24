import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

// Smart contract addresses from BS folder
const CONTRACT_ADDRESSES = {
  CROWDFUNDING_PLATFORM: process.env.REACT_APP_CROWDFUNDING_CONTRACT || '0xf8e81D47203A594245E36C48e151709F0C19fBe8',
  ZK_PROOF_VERIFIER: process.env.REACT_APP_ZKP_CONTRACT || '0xd9145CCE52D386f254917e481eB44e9943F39138',
  DECENTRALIZED_ORACLE: process.env.REACT_APP_ORACLE_CONTRACT || '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8',
  MULTISIG_WALLET: process.env.REACT_APP_MULTISIG_WALLET || '0x497464B152a17D4D1bDa6Ea00F0e4F594aa5fa9f'
};

// Crowdfunding Platform ABI
const CROWDFUNDING_ABI = [
  "function registerUser(uint8 _userType, string memory _ipfsHash) external",
  "function createCampaign(uint8 _campaignType, string memory _title, string memory _description, string memory _ipfsHash, uint256 _fundingGoal, uint256 _deadline, string[] memory _milestoneDescriptions, uint256[] memory _milestoneFunds, uint256[] memory _milestoneDeadlines) external",
  "function contributeToCampaign(uint256 _campaignId) external payable",
  "function privateContributeToCampaign(uint256 _campaignId, bytes32 _commitment, bytes calldata _proof) external payable",
  "function submitMilestoneDeliverable(uint256 _campaignId, uint256 _milestoneId, string memory _deliverableHash) external",
  "function releaseMilestoneFunds(uint256 _campaignId, uint256 _milestoneId) external",
  "function withdrawFunds(uint256 _campaignId) external",
  "function refundContributors(uint256 _campaignId) external",
  "function emergencyStopCampaign(uint256 _campaignId, bool _stop) external",
  "function getCampaign(uint256 _campaignId) external view returns (address creator, uint8 campaignType, string memory title, string memory description, uint256 fundingGoal, uint256 currentFunding, uint256 deadline, uint8 status)",
  "function getCampaignMilestones(uint256 _campaignId) external view returns (tuple(string description, uint256 fundAmount, uint256 deadline, uint8 status, bool fundsReleased, string deliverableHash)[] memory)",
  "function getUserCampaigns(address _user) external view returns (uint256[] memory)",
  "function getUserContributions(address _user) external view returns (uint256[] memory)",
  "function getCampaignContributions(uint256 _campaignId) external view returns (tuple(address contributor, uint256 amount, uint256 timestamp, bool isPrivate, bytes32 commitment)[] memory)",
  "function users(address) external view returns (address walletAddress, uint8 userType, bool isVerified, string memory ipfsHash, uint256 registrationTime, uint256 totalFunded, uint256 totalRaised)",
  "event UserRegistered(address indexed user, uint8 userType, string ipfsHash)",
  "event CampaignCreated(uint256 indexed campaignId, address indexed creator, uint8 campaignType)",
  "event CampaignFunded(uint256 indexed campaignId, address indexed contributor, uint256 amount)",
  "event MilestoneCompleted(uint256 indexed campaignId, uint256 milestoneId, uint256 amountReleased)",
  "event FundsWithdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount)"
];

// ZK Proof Verifier ABI
const ZKP_ABI = [
  "function verifyProof(bytes32 _commitment, bytes calldata _proof) external view returns (bool)",
  "function generateCommitment(uint256 _amount, uint256 _secret, uint256 _nullifier) external pure returns (bytes32)",
  "function createProof(uint256 _amount, uint256 _secret, uint256 _nullifier, uint256 _minAmount) external pure returns (bytes memory)",
  "function registerCommitment(bytes32 _commitment, uint256 _minAmount, uint256 _nullifierHash) external",
  "function isNullifierUsed(uint256 _nullifier) external view returns (bool)",
  "function isCommitmentUsed(bytes32 _commitment) external view returns (bool)"
];

// Oracle ABI
const ORACLE_ABI = [
  "function requestMilestoneVerification(uint256 _campaignId, uint256 _milestoneId) external",
  "function castVote(uint256 _requestId, bool _vote) external",
  "function getMilestoneStatus(uint256 _campaignId, uint256 _milestoneId) external view returns (bool)",
  "function getVerificationRequest(uint256 _requestId) external view returns (uint256 campaignId, uint256 milestoneId, address requester, uint256 timestamp, bool isCompleted, bool result, uint256 votesFor, uint256 votesAgainst)",
  "function registerOracleNode() external payable",
  "function getActiveNodes() external view returns (address[] memory)",
  "event VerificationRequested(uint256 indexed requestId, uint256 campaignId, uint256 milestoneId)",
  "event MilestoneVerified(uint256 indexed campaignId, uint256 indexed milestoneId, bool verified)"
];

interface BlockchainRecord {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  gasUsed?: string;
  gasPrice?: string;
}

interface CampaignData {
  id: string;
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  deadline: string;
  creator: string;
  milestones?: {
    description: string;
    fundAmount: number;
    deadline: string;
  }[];
  ipfsHash?: string;
}

interface IdeaData {
  id: string;
  title: string;
  description: string;
  author: string;
  timestamp: string;
  category: string;
  tags: string[];
}

interface UserRegistrationData {
  userType: 'PROJECT_CREATOR' | 'NGO_CREATOR' | 'BACKER';
  ipfsHash: string;
}

enum UserType {
  NONE = 0,
  PROJECT_CREATOR = 1,
  NGO_CREATOR = 2,
  BACKER = 3
}

enum CampaignType {
  PROJECT = 0,
  DONATION = 1
}

class AdvancedBlockchainService {
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private crowdfundingContract: ethers.Contract | null = null;
  private zkpContract: ethers.Contract | null = null;
  private oracleContract: ethers.Contract | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        // Fallback to a public RPC provider for read-only operations
        this.provider = new ethers.JsonRpcProvider(
          process.env.REACT_APP_WEB3_PROVIDER_URL || 'https://polygon-mumbai.g.alchemy.com/v2/demo'
        );
      }

      // Initialize contracts
      this.crowdfundingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.CROWDFUNDING_PLATFORM,
        CROWDFUNDING_ABI,
        this.provider
      );

      this.zkpContract = new ethers.Contract(
        CONTRACT_ADDRESSES.ZK_PROOF_VERIFIER,
        ZKP_ABI,
        this.provider
      );

      this.oracleContract = new ethers.Contract(
        CONTRACT_ADDRESSES.DECENTRALIZED_ORACLE,
        ORACLE_ABI,
        this.provider
      );

    } catch (error) {
      console.error('Failed to initialize blockchain provider:', error);
    }
  }

  async connectWallet(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask to continue');
        return false;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Update contract instances with signer
      if (this.crowdfundingContract) {
        this.crowdfundingContract = new ethers.Contract(
          CONTRACT_ADDRESSES.CROWDFUNDING_PLATFORM,
          CROWDFUNDING_ABI,
          this.signer
        );
      }
      if (this.zkpContract) {
        this.zkpContract = new ethers.Contract(
          CONTRACT_ADDRESSES.ZK_PROOF_VERIFIER,
          ZKP_ABI,
          this.signer
        );
      }
      if (this.oracleContract) {
        this.oracleContract = new ethers.Contract(
          CONTRACT_ADDRESSES.DECENTRALIZED_ORACLE,
          ORACLE_ABI,
          this.signer
        );
      }

      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      
      toast.success(`Connected to ${network.name}`);
      return true;

    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      toast.error(error.message || 'Failed to connect wallet');
      return false;
    }
  }

  async registerUser(userData: UserRegistrationData): Promise<BlockchainRecord | null> {
    try {
      if (!this.crowdfundingContract || !this.signer) {
        const connected = await this.connectWallet();
        if (!connected) return null;
      }

      const userTypeEnum = UserType[userData.userType];
      toast.loading('Registering user on blockchain...', { id: 'blockchain-tx' });

      const tx = await this.crowdfundingContract!.registerUser(
        userTypeEnum,
        userData.ipfsHash
      );

      const receipt = await tx.wait();
      toast.success('User registered on blockchain!', { id: 'blockchain-tx' });

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString()
      };

    } catch (error: any) {
      console.error('User registration failed:', error);
      toast.error(error.message || 'Failed to register user on blockchain', { id: 'blockchain-tx' });
      return null;
    }
  }

  async registerProject(projectData: CampaignData): Promise<BlockchainRecord | null> {
    try {
      if (!this.crowdfundingContract || !this.signer) {
        const connected = await this.connectWallet();
        if (!connected) return null;
      }

      toast.loading('Creating project on blockchain...', { id: 'blockchain-tx' });

      // Prepare milestone data
      const milestones = projectData.milestones || [];
      const milestoneDescriptions = milestones.map(m => m.description);
      const milestoneFunds = milestones.map(m => ethers.parseEther(m.fundAmount.toString()));
      const milestoneDeadlines = milestones.map(m => Math.floor(new Date(m.deadline).getTime() / 1000));

      const tx = await this.crowdfundingContract!.createCampaign(
        CampaignType.PROJECT,
        projectData.title,
        projectData.description,
        projectData.ipfsHash || '',
        ethers.parseEther(projectData.fundingGoal.toString()),
        Math.floor(new Date(projectData.deadline).getTime() / 1000),
        milestoneDescriptions,
        milestoneFunds,
        milestoneDeadlines
      );

      const receipt = await tx.wait();
      toast.success('Project created on blockchain!', { id: 'blockchain-tx' });

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString()
      };

    } catch (error: any) {
      console.error('Project registration failed:', error);
      toast.error(error.message || 'Failed to create project on blockchain', { id: 'blockchain-tx' });
      return null;
    }
  }

  async registerIdea(ideaData: IdeaData): Promise<BlockchainRecord | null> {
    try {
      if (!this.crowdfundingContract || !this.signer) {
        const connected = await this.connectWallet();
        if (!connected) return null;
      }

      toast.loading('Registering idea on blockchain...', { id: 'blockchain-tx' });

      // For ideas, we create a simple donation campaign with basic info
      const tx = await this.crowdfundingContract!.createCampaign(
        CampaignType.DONATION,
        ideaData.title,
        ideaData.description,
        '', // No IPFS hash for simple ideas
        ethers.parseEther('0.1'), // Minimum funding goal for ideas
        Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000), // 30 days from now
        [], // No milestones for ideas
        [],
        []
      );

      const receipt = await tx.wait();
      toast.success('Idea registered on blockchain!', { id: 'blockchain-tx' });

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString()
      };

    } catch (error: any) {
      console.error('Idea registration failed:', error);
      toast.error(error.message || 'Failed to register idea on blockchain', { id: 'blockchain-tx' });
      return null;
    }
  }

  async contributeToCampaign(campaignId: number, amount: number): Promise<BlockchainRecord | null> {
    try {
      if (!this.crowdfundingContract || !this.signer) {
        const connected = await this.connectWallet();
        if (!connected) return null;
      }

      toast.loading('Processing contribution...', { id: 'blockchain-tx' });

      const tx = await this.crowdfundingContract!.contributeToCampaign(campaignId, {
        value: ethers.parseEther(amount.toString())
      });

      const receipt = await tx.wait();
      toast.success('Contribution successful!', { id: 'blockchain-tx' });

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString()
      };

    } catch (error: any) {
      console.error('Contribution failed:', error);
      toast.error(error.message || 'Failed to contribute to campaign', { id: 'blockchain-tx' });
      return null;
    }
  }

  async privateContribution(
    campaignId: number, 
    amount: number, 
    secret: number, 
    nullifier: number
  ): Promise<BlockchainRecord | null> {
    try {
      if (!this.crowdfundingContract || !this.zkpContract || !this.signer) {
        const connected = await this.connectWallet();
        if (!connected) return null;
      }

      toast.loading('Creating private contribution...', { id: 'blockchain-tx' });

      // Generate ZK proof
      const commitment = await this.zkpContract!.generateCommitment(
        ethers.parseEther(amount.toString()),
        secret,
        nullifier
      );

      const proof = await this.zkpContract!.createProof(
        ethers.parseEther(amount.toString()),
        secret,
        nullifier,
        ethers.parseEther(amount.toString())
      );

      const tx = await this.crowdfundingContract!.privateContributeToCampaign(
        campaignId,
        commitment,
        proof,
        { value: ethers.parseEther(amount.toString()) }
      );

      const receipt = await tx.wait();
      toast.success('Private contribution successful!', { id: 'blockchain-tx' });

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString()
      };

    } catch (error: any) {
      console.error('Private contribution failed:', error);
      toast.error(error.message || 'Failed to make private contribution', { id: 'blockchain-tx' });
      return null;
    }
  }

  async submitMilestone(campaignId: number, milestoneId: number, deliverableHash: string): Promise<BlockchainRecord | null> {
    try {
      if (!this.crowdfundingContract || !this.signer) {
        const connected = await this.connectWallet();
        if (!connected) return null;
      }

      toast.loading('Submitting milestone...', { id: 'blockchain-tx' });

      const tx = await this.crowdfundingContract!.submitMilestoneDeliverable(
        campaignId,
        milestoneId,
        deliverableHash
      );

      const receipt = await tx.wait();
      toast.success('Milestone submitted successfully!', { id: 'blockchain-tx' });

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString()
      };

    } catch (error: any) {
      console.error('Milestone submission failed:', error);
      toast.error(error.message || 'Failed to submit milestone', { id: 'blockchain-tx' });
      return null;
    }
  }

  async withdrawFunds(campaignId: number): Promise<BlockchainRecord | null> {
    try {
      if (!this.crowdfundingContract || !this.signer) {
        const connected = await this.connectWallet();
        if (!connected) return null;
      }

      toast.loading('Withdrawing funds...', { id: 'blockchain-tx' });

      const tx = await this.crowdfundingContract!.withdrawFunds(campaignId);
      const receipt = await tx.wait();
      
      toast.success('Funds withdrawn successfully!', { id: 'blockchain-tx' });

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString()
      };

    } catch (error: any) {
      console.error('Funds withdrawal failed:', error);
      toast.error(error.message || 'Failed to withdraw funds', { id: 'blockchain-tx' });
      return null;
    }
  }

  // Oracle functions
  async castOracleVote(requestId: number, vote: boolean): Promise<BlockchainRecord | null> {
    try {
      if (!this.oracleContract || !this.signer) {
        const connected = await this.connectWallet();
        if (!connected) return null;
      }

      toast.loading('Casting oracle vote...', { id: 'blockchain-tx' });

      const tx = await this.oracleContract!.castVote(requestId, vote);
      const receipt = await tx.wait();
      
      toast.success('Oracle vote cast successfully!', { id: 'blockchain-tx' });

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString()
      };

    } catch (error: any) {
      console.error('Oracle vote failed:', error);
      toast.error(error.message || 'Failed to cast oracle vote', { id: 'blockchain-tx' });
      return null;
    }
  }

  async registerAsOracleNode(stakeAmount: number): Promise<BlockchainRecord | null> {
    try {
      if (!this.oracleContract || !this.signer) {
        const connected = await this.connectWallet();
        if (!connected) return null;
      }

      toast.loading('Registering as oracle node...', { id: 'blockchain-tx' });

      const tx = await this.oracleContract!.registerOracleNode({
        value: ethers.parseEther(stakeAmount.toString())
      });

      const receipt = await tx.wait();
      toast.success('Oracle node registration successful!', { id: 'blockchain-tx' });

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString()
      };

    } catch (error: any) {
      console.error('Oracle node registration failed:', error);
      toast.error(error.message || 'Failed to register as oracle node', { id: 'blockchain-tx' });
      return null;
    }
  }

  // View functions
  async getCampaign(campaignId: number): Promise<any> {
    try {
      if (!this.crowdfundingContract) return null;

      const campaign = await this.crowdfundingContract.getCampaign(campaignId);
      const milestones = await this.crowdfundingContract.getCampaignMilestones(campaignId);

      return {
        creator: campaign.creator,
        campaignType: campaign.campaignType,
        title: campaign.title,
        description: campaign.description,
        fundingGoal: ethers.formatEther(campaign.fundingGoal),
        currentFunding: ethers.formatEther(campaign.currentFunding),
        deadline: new Date(Number(campaign.deadline) * 1000),
        status: campaign.status,
        milestones: milestones.map((m: any) => ({
          description: m.description,
          fundAmount: ethers.formatEther(m.fundAmount),
          deadline: new Date(Number(m.deadline) * 1000),
          status: m.status,
          fundsReleased: m.fundsReleased,
          deliverableHash: m.deliverableHash
        }))
      };

    } catch (error) {
      console.error('Failed to get campaign:', error);
      return null;
    }
  }

  async getUserCampaigns(address: string): Promise<number[]> {
    try {
      if (!this.crowdfundingContract) return [];
      const campaigns = await this.crowdfundingContract.getUserCampaigns(address);
      return campaigns.map((id: any) => Number(id));
    } catch (error) {
      console.error('Failed to get user campaigns:', error);
      return [];
    }
  }

  async getUserContributions(address: string): Promise<number[]> {
    try {
      if (!this.crowdfundingContract) return [];
      const contributions = await this.crowdfundingContract.getUserContributions(address);
      return contributions.map((id: any) => Number(id));
    } catch (error) {
      console.error('Failed to get user contributions:', error);
      return [];
    }
  }

  async getUser(address: string): Promise<any> {
    try {
      if (!this.crowdfundingContract) return null;
      const user = await this.crowdfundingContract.users(address);
      return {
        walletAddress: user.walletAddress,
        userType: user.userType,
        isVerified: user.isVerified,
        ipfsHash: user.ipfsHash,
        registrationTime: new Date(Number(user.registrationTime) * 1000),
        totalFunded: ethers.formatEther(user.totalFunded),
        totalRaised: ethers.formatEther(user.totalRaised)
      };
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  // Utility functions
  async getCurrentWalletAddress(): Promise<string | null> {
    try {
      if (!this.signer) {
        await this.connectWallet();
      }
      return this.signer ? await this.signer.getAddress() : null;
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      return null;
    }
  }

  getContractAddresses() {
    return CONTRACT_ADDRESSES;
  }

  async verifyOwnership(itemId: string, claimedOwner: string): Promise<boolean> {
    try {
      // Implementation depends on how ownership is tracked
      // This is a placeholder
      return false;
    } catch (error) {
      console.error('Failed to verify ownership:', error);
      return false;
    }
  }
}

export const advancedBlockchainService = new AdvancedBlockchainService();
export default AdvancedBlockchainService;