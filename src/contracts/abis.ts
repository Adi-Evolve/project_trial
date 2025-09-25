// Contract ABIs for deployed smart contracts

export const CROWDFUNDING_PLATFORM_ABI = [
  // Constructor
  "constructor(address _oracle)",
  
  // Campaign Management
  "function createCampaign(string memory _title, string memory _description, uint256 _goalAmount, uint256 _duration, string[] memory _milestones) external returns (uint256)",
  "function contribute(uint256 _campaignId) external payable",
  "function withdrawFunds(uint256 _campaignId) external",
  "function refund(uint256 _campaignId) external",
  
  // Milestone Management
  "function submitMilestone(uint256 _campaignId, uint256 _milestoneId, string memory _ipfsHash) external",
  "function releaseMilestoneFunds(uint256 _campaignId, uint256 _milestoneId) external",
  
  // View Functions
  "function getCampaign(uint256 _campaignId) external view returns (tuple(uint256 id, address creator, string title, string description, uint256 goalAmount, uint256 raisedAmount, uint256 deadline, bool isActive, bool goalReached, string[] milestones))",
  "function getCampaignCount() external view returns (uint256)",
  "function getContribution(uint256 _campaignId, address _contributor) external view returns (uint256)",
  "function getMilestone(uint256 _campaignId, uint256 _milestoneId) external view returns (tuple(string description, bool isCompleted, bool fundsReleased, string ipfsHash, bool isVerified))",
  "function isMilestoneVerified(uint256 _campaignId, uint256 _milestoneId) external view returns (bool)",
  
  // Events
  "event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 goalAmount, uint256 deadline)",
  "event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount, uint256 newTotal)",
  "event MilestoneSubmitted(uint256 indexed campaignId, uint256 indexed milestoneId, string ipfsHash)",
  "event MilestoneFundsReleased(uint256 indexed campaignId, uint256 indexed milestoneId, uint256 amount)",
  "event FundsWithdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount)",
  "event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount)"
] as const;

export const DECENTRALIZED_ORACLE_ABI = [
  // Constructor
  "constructor(address _priceFeed)",
  
  // Oracle Node Management
  "function registerNode(string memory _endpoint) external payable",
  "function deactivateNode() external",
  
  // Verification Requests
  "function requestProjectVerification(uint256 projectId, string calldata ipfsHash) external",
  "function requestMilestoneVerification(uint256 campaignId, uint256 milestoneId, string calldata ipfsHash) external",
  
  // Voting Functions
  "function castVote(uint256 _requestId, bool _vote) external",
  "function verifyProject(uint256 projectId, bool result) external",
  "function verifyMilestone(uint256 campaignId, uint256 milestoneId, bool result) external",
  
  // View Functions
  "function getProjectVerificationStatus(uint256 projectId) external view returns (bool verified, bool consensus)",
  "function getMilestoneVerificationStatus(uint256 campaignId, uint256 milestoneId) external view returns (bool verified, bool consensus)",
  "function getMilestoneStatus(uint256 _campaignId, uint256 _milestoneId) external view returns (bool)",
  "function getVerificationRequest(uint256 _requestId) external view returns (uint256 campaignId, uint256 milestoneId, address requester, uint256 timestamp, bool isCompleted, bool result, uint256 votesFor, uint256 votesAgainst)",
  "function getOracleNodeInfo(address _node) external view returns (bool isActive, uint256 reputation, uint256 totalRequests, uint256 correctAnswers, uint256 stakingAmount)",
  "function getActiveNodes() external view returns (address[] memory)",
  "function getOracleStats() external view returns (uint256 totalNodes, uint256 totalRequests, uint256 completedRequests, uint256 averageReputation)",
  "function getLatestPrice() public view returns (int256)",
  
  // Admin Functions
  "function updateOracleParams(uint256 _minStakeAmount, uint256 _minVotesRequired, uint256 _votingPeriod) external",
  "function forceFinalizeVerification(uint256 _requestId) external",
  
  // State Variables (public getters)
  "function nextRequestId() external view returns (uint256)",
  "function minimumStake() external view returns (uint256)",
  "function minVotesRequired() external view returns (uint256)",
  "function votingPeriod() external view returns (uint256)",
  "function consensusThreshold() external view returns (uint256)",
  "function minimumNodes() external view returns (uint256)",
  "function nodeReputationThreshold() external view returns (uint256)",
  
  // Events
  "event ProjectVerificationRequested(uint256 indexed projectId, string ipfsHash, uint256 timestamp)",
  "event MilestoneVerificationRequested(uint256 indexed campaignId, uint256 indexed milestoneId, string ipfsHash, uint256 timestamp)",
  "event ProjectVerified(uint256 indexed projectId, bool result, bool consensus, uint256 votesFor, uint256 votesAgainst)",
  "event MilestoneVerified(uint256 indexed campaignId, uint256 indexed milestoneId, bool result, bool consensus, uint256 votesFor, uint256 votesAgainst)",
  "event OracleNodeRegistered(address indexed node, uint256 stakeAmount)",
  "event OracleNodeDeactivated(address indexed node)",
  "event VerificationRequested(uint256 indexed requestId, uint256 campaignId, uint256 milestoneId)",
  "event VoteCast(uint256 indexed requestId, address indexed voter, bool vote)",
  "event VerificationCompleted(uint256 indexed requestId, bool result)",
  "event ConsensusReached(uint256 indexed requestId, bool result, uint256 totalVotes)"
] as const;

// Legacy ABI for backward compatibility
export const PROJECT_REGISTRY_ABI = [
  "function registerProject(string memory projectId, string memory metadataHash, address owner) public returns (uint256)",
  "function registerIdea(string memory ideaId, string memory metadataHash, address owner) public returns (uint256)",
  "function getProjectOwner(string memory projectId) public view returns (address)",
  "function getIdeaOwner(string memory ideaId) public view returns (address)",
  "function verifyOwnership(string memory itemId, address claimedOwner) public view returns (bool)",
  "event ProjectRegistered(string indexed projectId, address indexed owner, uint256 timestamp)",
  "event IdeaRegistered(string indexed ideaId, address indexed owner, uint256 timestamp)"
] as const;

// Type definitions for better TypeScript support
export interface Campaign {
  id: number;
  creator: string;
  title: string;
  description: string;
  goalAmount: bigint;
  raisedAmount: bigint;
  deadline: number;
  isActive: boolean;
  goalReached: boolean;
  milestones: string[];
}

export interface Milestone {
  description: string;
  isCompleted: boolean;
  fundsReleased: boolean;
  ipfsHash: string;
  isVerified: boolean;
}

export interface VerificationRequest {
  campaignId: number;
  milestoneId: number;
  requester: string;
  timestamp: number;
  isCompleted: boolean;
  result: boolean;
  votesFor: number;
  votesAgainst: number;
}

export interface OracleNode {
  isActive: boolean;
  reputation: number;
  totalRequests: number;
  correctAnswers: number;
  stakingAmount: bigint;
}

export interface OracleStats {
  totalNodes: number;
  totalRequests: number;
  completedRequests: number;
  averageReputation: number;
}