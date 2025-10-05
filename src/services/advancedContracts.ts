import { ethers } from 'ethers';
import { Contract } from 'ethers';
// This file is deprecated. All blockchain/contract logic removed. Use Supabase for all storage and logic.
// Import ABIs
import CrowdfundingPlatformABI from '../contracts/abi/CrowdfundingPlatform.json';
import DecentralizedOracleABI from '../contracts/abi/DecentralizedOracle.json';
import ZKProofVerifierABI from '../contracts/abi/ZKProofVerifier.json';

// Contract addresses from environment
const CROWDFUNDING_ADDRESS = process.env.REACT_APP_CROWDFUNDING_CONTRACT_ADDRESS;
const ORACLE_ADDRESS = process.env.REACT_APP_ORACLE_CONTRACT_ADDRESS;
const ZKP_ADDRESS = process.env.REACT_APP_ZKP_CONTRACT_ADDRESS;
const MULTISIG_ADDRESS = process.env.REACT_APP_MULTISIG_WALLET_ADDRESS;

// Types for contract interactions
export interface Campaign {
  campaignId: number;
  creator: string;
  campaignType: number;
  title: string;
  description: string;
  ipfsHash: string;
  goalAmount: string;
  raisedAmount: string;
  deadline: number;
  status: number;
  milestoneCount: number;
}

export interface Milestone {
  description: string;
  fundAmount: string;
  deadline: number;
  status: number;
  fundsReleased: boolean;
}

export interface VerificationRequest {
  campaignId: number;
  milestoneIndex: number;
  ipfsHash: string;
  isCompleted: boolean;
  consensusReached: boolean;
  approved: boolean;
  approvalCount: number;
  rejectionCount: number;
}

export interface ZKCommitment {
  user: string;
  isRegistered: boolean;
  timestamp: number;
}

export enum UserType {
  PROJECT_CREATOR = 0,
  NGO_CREATOR = 1,
  BACKER = 2
}

export enum CampaignType {
  PROJECT = 0,
  NGO = 1,
  CHARITY = 2
}

export enum CampaignStatus {
  ACTIVE = 0,
  SUCCESSFUL = 1,
  FAILED = 2,
  PAUSED = 3
}

export enum MilestoneStatus {
  PENDING = 0,
  VERIFICATION_REQUESTED = 1,
  APPROVED = 2,
  REJECTED = 3
}

class AdvancedContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private crowdfundingContract: Contract | null = null;
  private oracleContract: Contract | null = null;
  private zkpContract: Contract | null = null;

  async initialize(): Promise<void> {
    // Skip real contract initialization in development mode
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_ENABLE_REAL_CONTRACTS) {
      console.log('⚠️ Real contract connections disabled in development mode');
      return;
    }

    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not found');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();

    // Initialize contracts
    this.crowdfundingContract = new ethers.Contract(
      CROWDFUNDING_ADDRESS!,
      CrowdfundingPlatformABI,
      this.signer
    );

    this.oracleContract = new ethers.Contract(
      ORACLE_ADDRESS!,
      DecentralizedOracleABI,
      this.signer
    );

    this.zkpContract = new ethers.Contract(
      ZKP_ADDRESS!,
      ZKProofVerifierABI,
      this.signer
    );
  }

  // Helper method to check if contracts are available
  private isContractAvailable(): boolean {
    return process.env.NODE_ENV !== 'development' || process.env.REACT_APP_ENABLE_REAL_CONTRACTS === 'true';
  }

  private throwContractUnavailableError(): never {
    throw new Error('Real contracts disabled in development mode. Use mockBlockchainService instead.');
  }

  // Crowdfunding Platform Methods
  async registerUser(userType: UserType, ipfsHash: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.isContractAvailable()) this.throwContractUnavailableError();
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    return await this.crowdfundingContract.registerUser(userType, ipfsHash);
  }

  async createCampaign(
    campaignType: CampaignType,
    title: string,
    description: string,
    ipfsHash: string,
    goalAmount: string,
    deadline: number,
    milestoneDescriptions: string[],
    milestoneFunds: string[],
    milestoneDeadlines: number[]
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    
    const goalAmountWei = ethers.parseEther(goalAmount);
    const milestoneFundsWei = milestoneFunds.map(amount => ethers.parseEther(amount));

    return await this.crowdfundingContract.createCampaign(
      campaignType,
      title,
      description,
      ipfsHash,
      goalAmountWei,
      deadline,
      milestoneDescriptions,
      milestoneFundsWei,
      milestoneDeadlines
    );
  }

  async contribute(campaignId: number, amount: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    
    const amountWei = ethers.parseEther(amount);
    return await this.crowdfundingContract.contribute(campaignId, {
      value: amountWei
    });
  }

  async contributeWithZKP(
    campaignId: number,
    commitment: string,
    minAmount: string,
    proof: string,
    amount: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    
    const amountWei = ethers.parseEther(amount);
    const minAmountWei = ethers.parseEther(minAmount);
    
    return await this.crowdfundingContract.contributeWithZKP(
      campaignId,
      commitment,
      minAmountWei,
      proof,
      { value: amountWei }
    );
  }

  async getCampaign(campaignId: number): Promise<Campaign> {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    
    const campaign = await this.crowdfundingContract.getCampaign(campaignId);
    return {
      campaignId,
      creator: campaign.creator,
      campaignType: Number(campaign.campaignType),
      title: campaign.title,
      description: campaign.description,
      ipfsHash: campaign.ipfsHash,
      goalAmount: ethers.formatEther(campaign.goalAmount),
      raisedAmount: ethers.formatEther(campaign.raisedAmount),
      deadline: Number(campaign.deadline),
      status: Number(campaign.status),
      milestoneCount: Number(campaign.milestoneCount)
    };
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    
    const result = await this.crowdfundingContract.getAllCampaigns();
    const campaigns: Campaign[] = [];
    
    for (let i = 0; i < result.ids.length; i++) {
      campaigns.push({
        campaignId: Number(result.ids[i]),
        creator: result.creators[i],
        campaignType: Number(result.campaignTypes[i]),
        title: result.titles[i],
        description: result.descriptions[i],
        ipfsHash: '', // Not returned in bulk query
        goalAmount: ethers.formatEther(result.goalAmounts[i]),
        raisedAmount: ethers.formatEther(result.raisedAmounts[i]),
        deadline: Number(result.deadlines[i]),
        status: Number(result.statuses[i]),
        milestoneCount: 0 // Not returned in bulk query
      });
    }
    
    return campaigns;
  }

  async getMilestone(campaignId: number, milestoneIndex: number): Promise<Milestone> {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    
    const milestone = await this.crowdfundingContract.getMilestone(campaignId, milestoneIndex);
    return {
      description: milestone.description,
      fundAmount: ethers.formatEther(milestone.fundAmount),
      deadline: Number(milestone.deadline),
      status: Number(milestone.status),
      fundsReleased: milestone.fundsReleased
    };
  }

  async requestMilestoneVerification(
    campaignId: number,
    milestoneIndex: number
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    return await this.crowdfundingContract.requestMilestoneVerification(campaignId, milestoneIndex);
  }

  async releaseMilestoneFunds(
    campaignId: number,
    milestoneIndex: number
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    return await this.crowdfundingContract.releaseMilestoneFunds(campaignId, milestoneIndex);
  }

  async getUserCampaigns(userAddress: string): Promise<number[]> {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    const campaigns = await this.crowdfundingContract.getUserCampaigns(userAddress);
    return campaigns.map((id: any) => Number(id));
  }

  async getUserContributions(userAddress: string): Promise<number[]> {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    const contributions = await this.crowdfundingContract.getUserContributions(userAddress);
    return contributions.map((id: any) => Number(id));
  }

  // Oracle Methods
  async requestOracleVerification(
    campaignId: number,
    milestoneIndex: number,
    ipfsHash: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.oracleContract) throw new Error('Oracle contract not initialized');
    return await this.oracleContract.requestMilestoneVerification(campaignId, milestoneIndex, ipfsHash);
  }

  async voteOnMilestone(
    requestId: number,
    approved: boolean
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.oracleContract) throw new Error('Oracle contract not initialized');
    return await this.oracleContract.voteOnMilestone(requestId, approved);
  }

  async getVerificationRequest(requestId: number): Promise<VerificationRequest> {
    if (!this.oracleContract) throw new Error('Oracle contract not initialized');
    
    const request = await this.oracleContract.getVerificationRequest(requestId);
    return {
      campaignId: Number(request.campaignId),
      milestoneIndex: Number(request.milestoneIndex),
      ipfsHash: request.ipfsHash,
      isCompleted: request.isCompleted,
      consensusReached: request.consensusReached,
      approved: request.approved,
      approvalCount: Number(request.approvalCount),
      rejectionCount: Number(request.rejectionCount)
    };
  }

  async getActiveOracles(): Promise<string[]> {
    if (!this.oracleContract) throw new Error('Oracle contract not initialized');
    return await this.oracleContract.getActiveOracles();
  }

  async getOracleReputation(oracleAddress: string): Promise<number> {
    if (!this.oracleContract) throw new Error('Oracle contract not initialized');
    const reputation = await this.oracleContract.getOracleReputation(oracleAddress);
    return Number(reputation);
  }

  async isActiveOracle(oracleAddress: string): Promise<boolean> {
    if (!this.oracleContract) throw new Error('Oracle contract not initialized');
    return await this.oracleContract.isActiveOracle(oracleAddress);
  }

  // ZKP Methods
  async registerZKCommitment(commitment: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.zkpContract) throw new Error('ZKP contract not initialized');
    return await this.zkpContract.registerCommitment(commitment);
  }

  async verifyZKProof(
    commitment: string,
    amount: string,
    nonce: number,
    nullifier: string,
    proof: string
  ): Promise<boolean> {
    if (!this.zkpContract) throw new Error('ZKP contract not initialized');
    
    const amountWei = ethers.parseEther(amount);
    return await this.zkpContract.verifyProof(commitment, amountWei, nonce, nullifier, proof);
  }

  async generateZKCommitment(
    commitment: string,
    minAmount: string,
    maxAmount: string
  ): Promise<string> {
    if (!this.zkpContract) throw new Error('ZKP contract not initialized');
    
    const minAmountWei = ethers.parseEther(minAmount);
    const maxAmountWei = ethers.parseEther(maxAmount);
    
    return await this.zkpContract.generateCommitment(commitment, minAmountWei, maxAmountWei);
  }

  async getZKCommitment(commitment: string): Promise<ZKCommitment> {
    if (!this.zkpContract) throw new Error('ZKP contract not initialized');
    
    const commitmentData = await this.zkpContract.getCommitment(commitment);
    return {
      user: commitmentData.user,
      isRegistered: commitmentData.isRegistered,
      timestamp: Number(commitmentData.timestamp)
    };
  }

  async isNullifierUsed(nullifier: string): Promise<boolean> {
    if (!this.zkpContract) throw new Error('ZKP contract not initialized');
    return await this.zkpContract.isNullifierUsed(nullifier);
  }

  async verifyRangeProof(amount: string, minAmount: string, maxAmount: string): Promise<boolean> {
    if (!this.zkpContract) throw new Error('ZKP contract not initialized');
    
    const amountWei = ethers.parseEther(amount);
    const minAmountWei = ethers.parseEther(minAmount);
    const maxAmountWei = ethers.parseEther(maxAmount);
    
    return await this.zkpContract.verifyRangeProof(amountWei, minAmountWei, maxAmountWei);
  }

  // Utility Methods
  async getCurrentAccount(): Promise<string> {
    if (!this.signer) throw new Error('Signer not initialized');
    return await this.signer.getAddress();
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');
    const account = address || await this.getCurrentAccount();
    const balance = await this.provider.getBalance(account);
    return ethers.formatEther(balance);
  }

  async switchToNetwork(chainId: number): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not found');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        throw new Error('Please add this network to MetaMask first');
      }
      throw switchError;
    }
  }

  // Email record storage for audit trail
  async storeEmailRecord(emailMetadata: any): Promise<{ transactionHash: string; success: boolean }> {
    try {
      if (!this.provider || !this.signer) {
        await this.initialize();
      }
      
      // Create a simple transaction to store email metadata hash on blockchain
      // In a real implementation, you might have a dedicated contract for this
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(emailMetadata)));
      
      // Store the hash as a transaction with minimal gas cost
      const signerAddress = await this.signer!.getAddress();
      const tx = await this.signer!.sendTransaction({
        to: signerAddress, // Send to self with data
        value: 0,
        data: dataHash
      });
      
      const receipt = await tx.wait();
      
      console.log('Email record stored on blockchain:', {
        hash: dataHash,
        transactionHash: receipt?.hash,
        blockNumber: receipt?.blockNumber
      });
      
      return {
        transactionHash: receipt?.hash || tx.hash,
        success: true
      };
    } catch (error) {
      console.error('Failed to store email record on blockchain:', error);
      return {
        transactionHash: '',
        success: false
      };
    }
  }

  // Event Listeners
  onCampaignCreated(callback: (campaignId: number, creator: string, campaignType: number) => void): void {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    
    this.crowdfundingContract.on('CampaignCreated', (campaignId, creator, campaignType) => {
      callback(Number(campaignId), creator, Number(campaignType));
    });
  }

  onContributionMade(callback: (campaignId: number, contributor: string, amount: string) => void): void {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    
    this.crowdfundingContract.on('ContributionMade', (campaignId, contributor, amount) => {
      callback(Number(campaignId), contributor, ethers.formatEther(amount));
    });
  }

  onMilestoneCompleted(callback: (campaignId: number, milestoneIndex: number) => void): void {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    
    this.crowdfundingContract.on('MilestoneCompleted', (campaignId, milestoneIndex) => {
      callback(Number(campaignId), Number(milestoneIndex));
    });
  }

  onZKPContribution(callback: (campaignId: number, commitment: string) => void): void {
    if (!this.crowdfundingContract) throw new Error('Contract not initialized');
    
    this.crowdfundingContract.on('ZKPContributionMade', (campaignId, commitment) => {
      callback(Number(campaignId), commitment);
    });
  }

  // Cleanup
  removeAllListeners(): void {
    if (this.crowdfundingContract) {
      this.crowdfundingContract.removeAllListeners();
    }
    if (this.oracleContract) {
      this.oracleContract.removeAllListeners();
    }
    if (this.zkpContract) {
      this.zkpContract.removeAllListeners();
    }
  }
}

// Export singleton instance
export const advancedContractService = new AdvancedContractService();
export default AdvancedContractService;