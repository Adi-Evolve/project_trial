// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DecentralizedOracle
 * @dev Oracle for milestone verification and external data feeds
 */
contract DecentralizedOracle is Ownable {
    
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
    mapping(address => OracleNode) public oracleNodes;
    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(uint256 => mapping(uint256 => bool)) public milestoneStatus; // campaignId => milestoneId => verified
    
    address[] public activeNodes;
    uint256 public nextRequestId = 1;
    uint256 public minStakeAmount = 1 ether;
    uint256 public minVotesRequired = 3;
    uint256 public votingPeriod = 24 hours;
    
    // Events
    event OracleNodeRegistered(address indexed node, uint256 stakeAmount);
    event OracleNodeDeactivated(address indexed node);
    event VerificationRequested(uint256 indexed requestId, uint256 campaignId, uint256 milestoneId);
    event VoteCast(uint256 indexed requestId, address indexed voter, bool vote);
    event VerificationCompleted(uint256 indexed requestId, bool result);
    event MilestoneVerified(uint256 indexed campaignId, uint256 indexed milestoneId, bool verified);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register as an oracle node
     */
    function registerOracleNode() external payable {
        require(msg.value >= minStakeAmount, "Insufficient stake amount");
        require(!oracleNodes[msg.sender].isActive, "Node already registered");
        
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
     * @dev Request milestone verification
     */
    function requestMilestoneVerification(
        uint256 _campaignId, 
        uint256 _milestoneId
    ) external {
        require(activeNodes.length >= minVotesRequired, "Not enough active oracle nodes");
        
        uint256 requestId = nextRequestId++;
        VerificationRequest storage request = verificationRequests[requestId];
        
        request.requestId = requestId;
        request.campaignId = _campaignId;
        request.milestoneId = _milestoneId;
        request.requester = msg.sender;
        request.timestamp = block.timestamp;
        request.isCompleted = false;
        request.result = false;
        request.votesFor = 0;
        request.votesAgainst = 0;
        
        emit VerificationRequested(requestId, _campaignId, _milestoneId);
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
        emit MilestoneVerified(request.campaignId, request.milestoneId, result);
    }
    
    /**
     * @dev Check if voter voted for (helper function)
     */
    function _wasVoteFor(address _voter, uint256 _requestId) internal view returns (bool) {
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
        minStakeAmount = _minStakeAmount;
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
}