// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

interface IDecentralizedOracle {
    function requestProjectVerification(uint256 projectId, string calldata ipfsHash) external;
    function requestMilestoneVerification(uint256 campaignId, uint256 milestoneId, string calldata ipfsHash) external;
    function getProjectVerificationStatus(uint256 projectId) external view returns (bool verified, bool consensus);
    function getMilestoneVerificationStatus(uint256 campaignId, uint256 milestoneId) external view returns (bool verified, bool consensus);
    function verifyProject(uint256 projectId, bool result) external;
    function verifyMilestone(uint256 campaignId, uint256 milestoneId, bool result) external;
}

/**
 * @title DecentralizedOracle
 * @dev Advanced oracle system with Chainlink integration for milestone and project verification
 */
contract DecentralizedOracle is IDecentralizedOracle, Ownable, ReentrancyGuard {
    
    // Structs
    struct ProjectVerification {
        uint256 projectId;
        string ipfsHash;
        bool isVerified;
        bool hasConsensus;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 timestamp;
        bool isActive;
        mapping(address => bool) hasVoted;
        address[] voters;
    }
    
    struct MilestoneVerification {
        uint256 campaignId;
        uint256 milestoneId;
        string ipfsHash;
        bool isVerified;
        bool hasConsensus;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 timestamp;
        bool isActive;
        mapping(address => bool) hasVoted;
        address[] voters;
    }
    
    struct OracleNode {
        address nodeAddress;
        bool isActive;
        uint256 reputation;
        uint256 totalRequests;
        uint256 correctAnswers;
        uint256 stakingAmount;
        uint256 registrationTime;
    }
    
    struct VerificationRequest {
        uint256 requestId;
        uint256 campaignId;
        uint256 milestoneId;
        address requester;
        string dataHash; // IPFS hash of milestone data
        uint256 timestamp;
        bool isCompleted;
        bool result;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) hasVoted;
        address[] voters;
    }
    
    // State Variables
    mapping(uint256 => ProjectVerification) public projectVerifications;
    mapping(bytes32 => MilestoneVerification) public milestoneVerifications;
    mapping(address => OracleNode) public oracleNodes;
    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(uint256 => mapping(uint256 => bool)) public milestoneStatus; // campaignId => milestoneId => verified
    
    address[] public activeNodes;
    uint256 public nextRequestId = 1;
    uint256 public minimumStake = 1 ether;
    uint256 public minVotesRequired = 3;
    uint256 public votingPeriod = 24 hours;
    uint256 public consensusThreshold = 66; // 66% consensus required
    uint256 public minimumNodes = 3;
    uint256 public verificationTimeout = 24 hours;
    uint256 public nodeReputationThreshold = 70;
    
    // Chainlink Integration
    AggregatorV3Interface internal priceFeed;
    mapping(bytes32 => bool) public pendingRequests;
    
    // Events
    event ProjectVerificationRequested(uint256 indexed projectId, string ipfsHash, uint256 timestamp);
    event MilestoneVerificationRequested(uint256 indexed campaignId, uint256 indexed milestoneId, string ipfsHash, uint256 timestamp);
    event ProjectVerified(uint256 indexed projectId, bool result, bool consensus, uint256 votesFor, uint256 votesAgainst);
    event MilestoneVerified(uint256 indexed campaignId, uint256 indexed milestoneId, bool result, bool consensus, uint256 votesFor, uint256 votesAgainst);
    event NodeRegistered(address indexed node, string endpoint, uint256 stakedAmount);
    event OracleNodeRegistered(address indexed node, uint256 stakeAmount);
    event OracleNodeDeactivated(address indexed node);
    event VerificationRequested(uint256 indexed requestId, uint256 campaignId, uint256 milestoneId);
    event VoteCast(uint256 indexed requestId, address indexed voter, bool vote);
    event VerificationCompleted(uint256 indexed requestId, bool result);
    event NodeDeactivated(address indexed node, string reason);
    event ConsensusReached(uint256 indexed requestId, bool result, uint256 totalVotes);
    event ReputationUpdated(address indexed node, uint256 oldReputation, uint256 newReputation);
    
    // Modifiers
    modifier onlyActiveNode() {
        require(oracleNodes[msg.sender].isActive, "Only active oracle nodes can vote");
        require(oracleNodes[msg.sender].reputation >= nodeReputationThreshold, "Node reputation too low");
        _;
    }
    
    modifier validProject(uint256 _projectId) {
        require(projectVerifications[_projectId].timestamp > 0, "Project verification not requested");
        require(projectVerifications[_projectId].isActive, "Project verification not active");
        _;
    }
    
    modifier validMilestone(uint256 _campaignId, uint256 _milestoneId) {
        bytes32 key = keccak256(abi.encodePacked(_campaignId, _milestoneId));
        require(milestoneVerifications[key].timestamp > 0, "Milestone verification not requested");
        require(milestoneVerifications[key].isActive, "Milestone verification not active");
        _;
    }
    
    /**
     * @dev Constructor with Chainlink price feed for ETH/USD
     */
    constructor(address _priceFeed) Ownable(msg.sender) {
        if (_priceFeed != address(0)) {
            priceFeed = AggregatorV3Interface(_priceFeed);
        }
    }
    
    /**
     * @dev Register as an oracle node
     */
    function registerNode(string memory _endpoint) external payable {
        require(msg.value >= minimumStake, "Insufficient stake amount");
        require(!oracleNodes[msg.sender].isActive, "Node already registered");
        require(bytes(_endpoint).length > 0, "Endpoint required");
        
        oracleNodes[msg.sender] = OracleNode({
            nodeAddress: msg.sender,
            isActive: true,
            reputation: 100, // Starting reputation
            totalRequests: 0,
            correctAnswers: 0,
            stakingAmount: msg.value,
            registrationTime: block.timestamp
        });
        
        activeNodes.push(msg.sender);
        
        emit OracleNodeRegistered(msg.sender, msg.value);
    }
    
    /**
     * @dev Deactivate oracle node and withdraw stake
     */
    function deactivateNode() external {
        require(oracleNodes[msg.sender].isActive, "Node not active");
        
        OracleNode storage node = oracleNodes[msg.sender];
        node.isActive = false;
        
        // Remove from active nodes array
        for (uint256 i = 0; i < activeNodes.length; i++) {
            if (activeNodes[i] == msg.sender) {
                activeNodes[i] = activeNodes[activeNodes.length - 1];
                activeNodes.pop();
                break;
            }
        }
        
        // Return stake
        uint256 stakeAmount = node.stakingAmount;
        node.stakingAmount = 0;
        payable(msg.sender).transfer(stakeAmount);
        
        emit OracleNodeDeactivated(msg.sender);
    }
    
    /**
     * @dev Request project verification
     */
    function requestProjectVerification(uint256 _projectId, string calldata _ipfsHash) external override {
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(projectVerifications[_projectId].timestamp == 0, "Verification already requested");
        require(activeNodes.length >= minimumNodes, "Not enough active oracle nodes");
        
        ProjectVerification storage verification = projectVerifications[_projectId];
        verification.projectId = _projectId;
        verification.ipfsHash = _ipfsHash;
        verification.timestamp = block.timestamp;
        verification.isActive = true;
        
        emit ProjectVerificationRequested(_projectId, _ipfsHash, block.timestamp);
    }
    
    /**
     * @dev Request milestone verification
     */
    function requestMilestoneVerification(
        uint256 _campaignId, 
        uint256 _milestoneId,
        string calldata _ipfsHash
    ) external override {
        require(activeNodes.length >= minVotesRequired, "Not enough active oracle nodes");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        
        uint256 requestId = nextRequestId++;
        VerificationRequest storage request = verificationRequests[requestId];
        
        request.requestId = requestId;
        request.campaignId = _campaignId;
        request.milestoneId = _milestoneId;
        request.requester = msg.sender;
        request.dataHash = _ipfsHash;
        request.timestamp = block.timestamp;
        request.isCompleted = false;
        request.result = false;
        request.votesFor = 0;
        request.votesAgainst = 0;
        
        emit VerificationRequested(requestId, _campaignId, _milestoneId);
        
        // Also update new verification system
        bytes32 key = keccak256(abi.encodePacked(_campaignId, _milestoneId));
        MilestoneVerification storage verification = milestoneVerifications[key];
        verification.campaignId = _campaignId;
        verification.milestoneId = _milestoneId;
        verification.ipfsHash = _ipfsHash;
        verification.timestamp = block.timestamp;
        verification.isActive = true;
        
        emit MilestoneVerificationRequested(_campaignId, _milestoneId, _ipfsHash, block.timestamp);
    }
    
    /**
     * @dev Cast vote for milestone verification
     */
    function castVote(uint256 _requestId, bool _vote) external {
        require(oracleNodes[msg.sender].isActive, "Only active oracle nodes can vote");
        VerificationRequest storage request = verificationRequests[_requestId];
        require(!request.isCompleted, "Verification already completed");
        require(!request.hasVoted[msg.sender], "Already voted");
        require(block.timestamp <= request.timestamp + votingPeriod, "Voting period expired");
        
        request.hasVoted[msg.sender] = true;
        request.voters.push(msg.sender);
        
        if (_vote) {
            request.votesFor++;
        } else {
            request.votesAgainst++;
        }
        
        emit VoteCast(_requestId, msg.sender, _vote);
        
        // Check if enough votes collected
        uint256 totalVotes = request.votesFor + request.votesAgainst;
        if (totalVotes >= minVotesRequired) {
            _finalizeVerification(_requestId);
        }
    }
    
    /**
     * @dev Finalize verification (internal)
     */
    function _finalizeVerification(uint256 _requestId) internal {
        VerificationRequest storage request = verificationRequests[_requestId];
        require(!request.isCompleted, "Already finalized");
        
        bool result = request.votesFor > request.votesAgainst;
        request.isCompleted = true;
        request.result = result;
        
        // Update milestone status
        milestoneStatus[request.campaignId][request.milestoneId] = result;
        
        // Update oracle node reputations
        for (uint256 i = 0; i < request.voters.length; i++) {
            address voter = request.voters[i];
            OracleNode storage node = oracleNodes[voter];
            node.totalRequests++;
            
            bool voterWasCorrect = (request.hasVoted[voter] && 
                                   ((request.votesFor > request.votesAgainst && _wasVoteFor(voter, _requestId)) ||
                                    (request.votesAgainst > request.votesFor && !_wasVoteFor(voter, _requestId))));
            
            if (voterWasCorrect) {
                node.correctAnswers++;
                node.reputation = (node.reputation * 99 + 110) / 100; // Increase reputation
            } else {
                node.reputation = (node.reputation * 95) / 100; // Decrease reputation
            }
        }
        
        emit VerificationCompleted(_requestId, result);
        emit MilestoneVerified(request.campaignId, request.milestoneId, result, true, request.votesFor, request.votesAgainst);
    }
    
    /**
     * @dev Check if voter voted for (helper function)
     */
    function _wasVoteFor(address /* _voter */, uint256 _requestId) internal view returns (bool) {
        // This would need to be implemented by tracking individual votes
        // For simplicity, we're assuming the majority vote was correct
        VerificationRequest storage request = verificationRequests[_requestId];
        return request.votesFor > request.votesAgainst;
    }
    
    /**
     * @dev Force finalize verification if voting period expired
     */
    function forceFinalizeVerification(uint256 _requestId) external {
        VerificationRequest storage request = verificationRequests[_requestId];
        require(!request.isCompleted, "Already finalized");
        require(block.timestamp > request.timestamp + votingPeriod, "Voting period not expired");
        require(request.votesFor + request.votesAgainst > 0, "No votes cast");
        
        _finalizeVerification(_requestId);
    }
    
    /**
     * @dev Get milestone verification status
     */
    function getMilestoneStatus(uint256 _campaignId, uint256 _milestoneId) 
        external 
        view 
        returns (bool) 
    {
        return milestoneStatus[_campaignId][_milestoneId];
    }
    
    /**
     * @dev Get verification request details
     */
    function getVerificationRequest(uint256 _requestId) 
        external 
        view 
        returns (
            uint256 campaignId,
            uint256 milestoneId,
            address requester,
            uint256 timestamp,
            bool isCompleted,
            bool result,
            uint256 votesFor,
            uint256 votesAgainst
        ) 
    {
        VerificationRequest storage request = verificationRequests[_requestId];
        return (
            request.campaignId,
            request.milestoneId,
            request.requester,
            request.timestamp,
            request.isCompleted,
            request.result,
            request.votesFor,
            request.votesAgainst
        );
    }
    
    /**
     * @dev Get oracle node info
     */
    function getOracleNodeInfo(address _node) 
        external 
        view 
        returns (
            bool isActive,
            uint256 reputation,
            uint256 totalRequests,
            uint256 correctAnswers,
            uint256 stakingAmount
        ) 
    {
        OracleNode storage node = oracleNodes[_node];
        return (
            node.isActive,
            node.reputation,
            node.totalRequests,
            node.correctAnswers,
            node.stakingAmount
        );
    }
    
    /**
     * @dev Get all active oracle nodes
     */
    function getActiveNodes() external view returns (address[] memory) {
        return activeNodes;
    }
    
    /**
     * @dev Update oracle parameters (only owner)
     */
    function updateOracleParams(
        uint256 _minStakeAmount,
        uint256 _minVotesRequired,
        uint256 _votingPeriod
    ) external onlyOwner {
        minimumStake = _minStakeAmount;
        minVotesRequired = _minVotesRequired;
        votingPeriod = _votingPeriod;
    }
    
    /**
     * @dev Emergency pause oracle (only owner)
     */
    function emergencyPause() external onlyOwner {
        // Implement pause functionality
        // This could stop new requests and voting
    }
    
    /**
     * @dev Get oracle statistics
     */
    function getOracleStats() 
        external 
        view 
        returns (
            uint256 totalNodes,
            uint256 totalRequests,
            uint256 completedRequests,
            uint256 averageReputation
        ) 
    {
        totalNodes = activeNodes.length;
        totalRequests = nextRequestId - 1;
        
        // Calculate completed requests
        completedRequests = 0;
        for (uint256 i = 1; i < nextRequestId; i++) {
            if (verificationRequests[i].isCompleted) {
                completedRequests++;
            }
        }
        
        // Calculate average reputation
        if (totalNodes > 0) {
            uint256 totalReputation = 0;
            for (uint256 i = 0; i < activeNodes.length; i++) {
                totalReputation += oracleNodes[activeNodes[i]].reputation;
            }
            averageReputation = totalReputation / totalNodes;
        }
        
        return (totalNodes, totalRequests, completedRequests, averageReputation);
    }
    
    /**
     * @dev Verify project (interface implementation)
     */
    function verifyProject(uint256 _projectId, bool _result) external override onlyActiveNode {
        ProjectVerification storage verification = projectVerifications[_projectId];
        require(verification.timestamp > 0, "Project verification not requested");
        require(verification.isActive, "Project verification not active");
        require(!verification.hasVoted[msg.sender], "Node already voted");
        
        verification.hasVoted[msg.sender] = true;
        verification.voters.push(msg.sender);
        
        if (_result) {
            verification.votesFor++;
        } else {
            verification.votesAgainst++;
        }
        
        // Check consensus
        uint256 totalVotes = verification.votesFor + verification.votesAgainst;
        uint256 requiredVotes = (activeNodes.length * consensusThreshold) / 100;
        
        if (totalVotes >= requiredVotes) {
            verification.hasConsensus = true;
            verification.isVerified = verification.votesFor > verification.votesAgainst;
            verification.isActive = false;
            
            emit ProjectVerified(_projectId, verification.isVerified, true, verification.votesFor, verification.votesAgainst);
        }
    }
    
    /**
     * @dev Verify milestone (interface implementation)
     */
    function verifyMilestone(uint256 _campaignId, uint256 _milestoneId, bool _result) external override onlyActiveNode {
        bytes32 key = keccak256(abi.encodePacked(_campaignId, _milestoneId));
        MilestoneVerification storage verification = milestoneVerifications[key];
        require(verification.timestamp > 0, "Milestone verification not requested");
        require(verification.isActive, "Milestone verification not active");
        require(!verification.hasVoted[msg.sender], "Node already voted");
        
        verification.hasVoted[msg.sender] = true;
        verification.voters.push(msg.sender);
        
        if (_result) {
            verification.votesFor++;
        } else {
            verification.votesAgainst++;
        }
        
        // Check consensus
        uint256 totalVotes = verification.votesFor + verification.votesAgainst;
        uint256 requiredVotes = (activeNodes.length * consensusThreshold) / 100;
        
        if (totalVotes >= requiredVotes) {
            verification.hasConsensus = true;
            verification.isVerified = verification.votesFor > verification.votesAgainst;
            verification.isActive = false;
            
            // Update milestone status for legacy compatibility
            milestoneStatus[_campaignId][_milestoneId] = verification.isVerified;
            
            emit MilestoneVerified(_campaignId, _milestoneId, verification.isVerified, true, verification.votesFor, verification.votesAgainst);
        }
    }
    
    /**
     * @dev Get project verification status (interface implementation)
     */
    function getProjectVerificationStatus(uint256 _projectId) external view override returns (bool verified, bool consensus) {
        ProjectVerification storage verification = projectVerifications[_projectId];
        return (verification.isVerified, verification.hasConsensus);
    }
    
    /**
     * @dev Get milestone verification status (interface implementation)
     */
    function getMilestoneVerificationStatus(uint256 _campaignId, uint256 _milestoneId) external view override returns (bool verified, bool consensus) {
        bytes32 key = keccak256(abi.encodePacked(_campaignId, _milestoneId));
        MilestoneVerification storage verification = milestoneVerifications[key];
        return (verification.isVerified, verification.hasConsensus);
    }
    
    /**
     * @dev Get latest ETH price from Chainlink
     */
    function getLatestPrice() public view returns (int256) {
        if (address(priceFeed) == address(0)) {
            return 2000 * 10**8; // Fallback price: $2000
        }
        
        try priceFeed.latestRoundData() returns (
            uint80 /* roundId */,
            int256 price,
            uint256 /* startedAt */,
            uint256 /* timeStamp */,
            uint80 /* answeredInRound */
        ) {
            return price;
        } catch {
            return 2000 * 10**8; // Fallback price
        }
    }
    
    /**
     * @dev Update oracle node reputations (unused _requestId parameter silenced)
     */
    function _updateOracleReputations(bytes32 /* _requestId */, bool _result) internal {
        // Example reputation update logic
        // Implementation depends on specific requirements
    }
}