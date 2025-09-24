import { advancedContractService } from './advancedContracts';

export interface OracleInfo {
  address: string;
  isActive: boolean;
  reputation: number;
  totalVotes: number;
  correctVotes: number;
  accuracy: number;
}

export interface VerificationRequest {
  requestId: number;
  campaignId: number;
  milestoneIndex: number;
  ipfsHash: string;
  isCompleted: boolean;
  consensusReached: boolean;
  approved: boolean;
  approvalCount: number;
  rejectionCount: number;
  timestamp: number;
}

export interface OracleVote {
  oracleAddress: string;
  requestId: number;
  vote: boolean;
  timestamp: number;
  reputation: number;
}

export interface ConsensusResult {
  requestId: number;
  approved: boolean;
  consensusReached: boolean;
  approvalPercentage: number;
  totalVotes: number;
  participatingOracles: number;
}

export enum VerificationStatus {
  PENDING = 'pending',
  VOTING = 'voting',
  CONSENSUS_REACHED = 'consensus_reached',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

class OracleService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (!this.initialized) {
      try {
        await advancedContractService.initialize();
        this.initialized = true;
      } catch (error) {
        console.log('⚠️ Oracle service: Real contracts unavailable in development mode');
        this.initialized = false;
      }
    }
  }

  // Oracle Management
  async getActiveOracles(): Promise<OracleInfo[]> {
    await this.initialize();
    
    const oracleAddresses = await advancedContractService.getActiveOracles();
    const oracles: OracleInfo[] = [];

    for (const address of oracleAddresses) {
      const reputation = await advancedContractService.getOracleReputation(address);
      const isActive = await advancedContractService.isActiveOracle(address);

      // In a real implementation, we'd get these from the contract
      const totalVotes = Math.floor(Math.random() * 100) + 10;
      const correctVotes = Math.floor(totalVotes * (0.7 + Math.random() * 0.25));
      const accuracy = totalVotes > 0 ? (correctVotes / totalVotes) * 100 : 0;

      oracles.push({
        address,
        isActive,
        reputation,
        totalVotes,
        correctVotes,
        accuracy
      });
    }

    return oracles;
  }

  async isOracle(address: string): Promise<boolean> {
    await this.initialize();
    return await advancedContractService.isActiveOracle(address);
  }

  async getOracleReputation(address: string): Promise<number> {
    await this.initialize();
    return await advancedContractService.getOracleReputation(address);
  }

  // Verification Requests
  async requestMilestoneVerification(
    campaignId: number,
    milestoneIndex: number,
    ipfsHash: string
  ): Promise<{ requestId: number; txHash: string }> {
    await this.initialize();
    
    const tx = await advancedContractService.requestOracleVerification(
      campaignId,
      milestoneIndex,
      ipfsHash
    );

    // Extract request ID from transaction receipt (simplified)
    const requestId = Math.floor(Math.random() * 10000); // In real implementation, get from events
    
    return {
      requestId,
      txHash: tx.hash
    };
  }

  async getVerificationRequest(requestId: number): Promise<VerificationRequest> {
    await this.initialize();
    
    const request = await advancedContractService.getVerificationRequest(requestId);
    
    return {
      requestId,
      campaignId: request.campaignId,
      milestoneIndex: request.milestoneIndex,
      ipfsHash: request.ipfsHash,
      isCompleted: request.isCompleted,
      consensusReached: request.consensusReached,
      approved: request.approved,
      approvalCount: request.approvalCount,
      rejectionCount: request.rejectionCount,
      timestamp: Date.now() // In real implementation, get from contract
    };
  }

  async getAllVerificationRequests(): Promise<VerificationRequest[]> {
    await this.initialize();
    
    // In a real implementation, we'd query the contract for all requests
    const requests: VerificationRequest[] = [];
    
    // For demo purposes, generate some sample requests
    for (let i = 0; i < 5; i++) {
      try {
        const request = await this.getVerificationRequest(i);
        requests.push(request);
      } catch (error) {
        // Request doesn't exist
        break;
      }
    }
    
    return requests;
  }

  async getPendingVerificationRequests(): Promise<VerificationRequest[]> {
    const allRequests = await this.getAllVerificationRequests();
    return allRequests.filter(request => !request.isCompleted);
  }

  // Oracle Voting
  async voteOnMilestone(
    requestId: number,
    approved: boolean
  ): Promise<string> {
    await this.initialize();
    
    const tx = await advancedContractService.voteOnMilestone(requestId, approved);
    return tx.hash;
  }

  async getVotesForRequest(requestId: number): Promise<OracleVote[]> {
    await this.initialize();
    
    // In a real implementation, we'd get this from contract events
    const request = await this.getVerificationRequest(requestId);
    const votes: OracleVote[] = [];
    
    // Generate sample votes for demo
    const oracles = await this.getActiveOracles();
    const votingOracles = oracles.slice(0, Math.min(3, oracles.length));
    
    for (const oracle of votingOracles) {
      votes.push({
        oracleAddress: oracle.address,
        requestId,
        vote: Math.random() > 0.3, // 70% approval rate for demo
        timestamp: Date.now() - Math.random() * 86400000, // Random time in last 24h
        reputation: oracle.reputation
      });
    }
    
    return votes;
  }

  // Consensus Calculation
  async calculateConsensus(requestId: number): Promise<ConsensusResult> {
    await this.initialize();
    
    const request = await this.getVerificationRequest(requestId);
    const votes = await this.getVotesForRequest(requestId);
    
    const totalVotes = request.approvalCount + request.rejectionCount;
    const approvalPercentage = totalVotes > 0 ? (request.approvalCount / totalVotes) * 100 : 0;
    
    return {
      requestId,
      approved: request.approved,
      consensusReached: request.consensusReached,
      approvalPercentage,
      totalVotes,
      participatingOracles: votes.length
    };
  }

  async hasConsensusThresholdMet(requestId: number): Promise<boolean> {
    const consensus = await this.calculateConsensus(requestId);
    const CONSENSUS_THRESHOLD = 66.67; // 2/3 majority
    
    return consensus.approvalPercentage >= CONSENSUS_THRESHOLD || 
           (100 - consensus.approvalPercentage) >= CONSENSUS_THRESHOLD;
  }

  // Oracle Analytics
  async getOraclePerformanceMetrics(): Promise<{
    totalOracles: number;
    activeOracles: number;
    averageReputation: number;
    averageAccuracy: number;
    totalVerifications: number;
    consensusRate: number;
  }> {
    const oracles = await this.getActiveOracles();
    const allRequests = await this.getAllVerificationRequests();
    
    const totalOracles = oracles.length;
    const activeOracles = oracles.filter(o => o.isActive).length;
    const averageReputation = oracles.length > 0 ? 
      oracles.reduce((sum, o) => sum + o.reputation, 0) / oracles.length : 0;
    const averageAccuracy = oracles.length > 0 ? 
      oracles.reduce((sum, o) => sum + o.accuracy, 0) / oracles.length : 0;
    const totalVerifications = allRequests.length;
    const consensusReachedCount = allRequests.filter(r => r.consensusReached).length;
    const consensusRate = totalVerifications > 0 ? 
      (consensusReachedCount / totalVerifications) * 100 : 0;

    return {
      totalOracles,
      activeOracles,
      averageReputation,
      averageAccuracy,
      totalVerifications,
      consensusRate
    };
  }

  async getVerificationStats(): Promise<{
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    averageConsensusTime: number;
  }> {
    const allRequests = await this.getAllVerificationRequests();
    
    const pendingRequests = allRequests.filter(r => !r.consensusReached).length;
    const approvedRequests = allRequests.filter(r => r.consensusReached && r.approved).length;
    const rejectedRequests = allRequests.filter(r => r.consensusReached && !r.approved).length;
    
    // Calculate average consensus time (simplified)
    const averageConsensusTime = 2.5; // hours (demo value)

    return {
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      averageConsensusTime
    };
  }

  // Oracle Reputation Management
  async updateOracleReputation(
    oracleAddress: string,
    wasCorrect: boolean
  ): Promise<void> {
    // In a real implementation, this would be handled by the smart contract
    // This is a placeholder for reputation tracking logic
    console.log(`Updating reputation for oracle ${oracleAddress}: ${wasCorrect ? 'correct' : 'incorrect'} vote`);
  }

  async getOracleHistory(oracleAddress: string): Promise<{
    totalVotes: number;
    correctVotes: number;
    accuracy: number;
    recentVotes: OracleVote[];
  }> {
    const oracle = (await this.getActiveOracles()).find(o => o.address === oracleAddress);
    
    if (!oracle) {
      throw new Error('Oracle not found');
    }

    // Get recent votes (simplified - in real implementation, query contract events)
    const recentVotes: OracleVote[] = [];
    for (let i = 0; i < 5; i++) {
      recentVotes.push({
        oracleAddress,
        requestId: i,
        vote: Math.random() > 0.3,
        timestamp: Date.now() - Math.random() * 86400000,
        reputation: oracle.reputation
      });
    }

    return {
      totalVotes: oracle.totalVotes,
      correctVotes: oracle.correctVotes,
      accuracy: oracle.accuracy,
      recentVotes
    };
  }

  // Verification Status Tracking
  getVerificationStatus(request: VerificationRequest): VerificationStatus {
    if (request.consensusReached) {
      return request.approved ? VerificationStatus.APPROVED : VerificationStatus.REJECTED;
    }
    
    if (request.approvalCount > 0 || request.rejectionCount > 0) {
      return VerificationStatus.VOTING;
    }
    
    return VerificationStatus.PENDING;
  }

  async getRequestsRequiringVote(oracleAddress: string): Promise<VerificationRequest[]> {
    const pendingRequests = await this.getPendingVerificationRequests();
    const requestsNeedingVote: VerificationRequest[] = [];
    
    for (const request of pendingRequests) {
      const votes = await this.getVotesForRequest(request.requestId);
      const hasVoted = votes.some(vote => vote.oracleAddress === oracleAddress);
      
      if (!hasVoted) {
        requestsNeedingVote.push(request);
      }
    }
    
    return requestsNeedingVote;
  }

  // Event Listeners for real-time updates
  onVerificationRequested(callback: (requestId: number, campaignId: number, milestoneIndex: number) => void): void {
    // In a real implementation, this would listen to contract events
    console.log('Setting up verification request listener');
  }

  onVoteCast(callback: (requestId: number, oracle: string, vote: boolean) => void): void {
    // In a real implementation, this would listen to contract events
    console.log('Setting up vote cast listener');
  }

  onConsensusReached(callback: (requestId: number, approved: boolean) => void): void {
    // In a real implementation, this would listen to contract events
    console.log('Setting up consensus reached listener');
  }

  // Utility Functions
  async estimateConsensusTime(requestId: number): Promise<number> {
    const oracles = await this.getActiveOracles();
    const activeOracleCount = oracles.filter(o => o.isActive).length;
    
    // Estimate based on oracle count and historical data
    // More oracles = faster consensus (up to a point)
    const baseTime = 1.5; // hours
    const oracleFactor = Math.max(0.5, 1 - (activeOracleCount * 0.1));
    
    return baseTime * oracleFactor;
  }

  async getMinimumOraclesForConsensus(): Promise<number> {
    const oracles = await this.getActiveOracles();
    return Math.max(3, Math.ceil(oracles.length * 0.66)); // 2/3 majority
  }
}

// Export singleton instance
export const oracleService = new OracleService();
export default OracleService;