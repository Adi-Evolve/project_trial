// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ICrowdfundingPlatform {
    function releaseMilestoneFunds(uint256 campaignId, uint256 milestoneIndex) external;
}

contract DecentralizedOracle is Ownable, ReentrancyGuard {
    
    // Structs
    struct Oracle {
        address oracleAddress;
        string name;
        bool isActive;
        uint256 reputation;
        uint256 totalVerifications;
        uint256 successfulVerifications;
    }
    
    struct MilestoneVerification {
        uint256 campaignId;
        uint256 milestoneIndex;
        string verificationData; // IPFS hash or URL for milestone proof
        bool isCompleted;
        uint256 requestTime;
        uint256 deadline;
        mapping(address => bool) oracleVotes;
        address[] votingOracles;
        uint256 positiveVotes;
        uint256 negativeVotes;
        bool fundsReleased;
    }
    
    // State Variables
    mapping(address => Oracle) public oracles;
    address[] public activeOracles;
    mapping(bytes32 => MilestoneVerification) public verificationRequests;
    mapping(uint256 => mapping(uint256 => bytes32)) public campaignMilestoneToRequest;
    
    ICrowdfundingPlatform public crowdfundingContract;
    
    uint256 public minimumOracles = 3;
    uint256 public consensusThreshold = 67; // 67% consensus required
    uint256 public verificationTimeout = 7 days;
    uint256 public oracleReward = 0.01 ether;
    
    // Events
    event OracleAdded(address indexed oracle, string name);
    event OracleRemoved(address indexed oracle);
    event MilestoneVerificationRequested(bytes32 indexed requestId, uint256 campaignId, uint256 milestoneIndex);
    event OracleVoted(bytes32 indexed requestId, address indexed oracle, bool vote);
    event MilestoneVerified(bytes32 indexed requestId, bool result);
    event OracleRewarded(address indexed oracle, uint256 amount);
    
    // Modifiers
    modifier onlyActiveOracle() {
        require(oracles[msg.sender].isActive, "Not an active oracle");
        _;
    }
    
    modifier onlyPlatform() {
        require(msg.sender == address(crowdfundingContract), "Only platform can call");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    // Oracle Management Functions
    function addOracle(address _oracle, string memory _name) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        require(!oracles[_oracle].isActive, "Oracle already active");
        
        oracles[_oracle] = Oracle({
            oracleAddress: _oracle,
            name: _name,
            isActive: true,
            reputation: 100, // Starting reputation
            totalVerifications: 0,
            successfulVerifications: 0
        });
        
        activeOracles.push(_oracle);
        emit OracleAdded(_oracle, _name);
    }
    
    function removeOracle(address _oracle) external onlyOwner {
        require(oracles[_oracle].isActive, "Oracle not active");
        
        oracles[_oracle].isActive = false;
        
        // Remove from active oracles array
        for (uint256 i = 0; i < activeOracles.length; i++) {
            if (activeOracles[i] == _oracle) {
                activeOracles[i] = activeOracles[activeOracles.length - 1];
                activeOracles.pop();
                break;
            }
        }
        
        emit OracleRemoved(_oracle);
    }
    
    function setCrowdfundingContract(address _contract) external onlyOwner {
        crowdfundingContract = ICrowdfundingPlatform(_contract);
    }
    
    // Verification Functions
    function requestMilestoneVerification(uint256 _campaignId, uint256 _milestoneIndex) 
        external 
        onlyPlatform 
    {
        require(activeOracles.length >= minimumOracles, "Not enough active oracles");
        
        bytes32 requestId = keccak256(abi.encodePacked(_campaignId, _milestoneIndex, block.timestamp));
        
        MilestoneVerification storage request = verificationRequests[requestId];
        request.campaignId = _campaignId;
        request.milestoneIndex = _milestoneIndex;
        request.isCompleted = false;
        request.requestTime = block.timestamp;
        request.deadline = block.timestamp + verificationTimeout;
        
        campaignMilestoneToRequest[_campaignId][_milestoneIndex] = requestId;
        
        emit MilestoneVerificationRequested(requestId, _campaignId, _milestoneIndex);
    }
    
    function submitMilestoneData(bytes32 _requestId, string memory _verificationData) 
        external 
        onlyActiveOracle 
    {
        MilestoneVerification storage request = verificationRequests[_requestId];
        require(!request.isCompleted, "Verification already completed");
        require(block.timestamp <= request.deadline, "Verification deadline passed");
        require(bytes(_verificationData).length > 0, "Verification data required");
        
        // Only allow the first oracle to submit the verification data
        if (bytes(request.verificationData).length == 0) {
            request.verificationData = _verificationData;
        }
    }
    
    function voteOnMilestone(bytes32 _requestId, bool _vote) 
        external 
        onlyActiveOracle 
    {
        MilestoneVerification storage request = verificationRequests[_requestId];
        require(!request.isCompleted, "Verification already completed");
        require(block.timestamp <= request.deadline, "Verification deadline passed");
        require(!request.oracleVotes[msg.sender], "Oracle already voted");
        require(bytes(request.verificationData).length > 0, "No verification data submitted");
        
        request.oracleVotes[msg.sender] = true;
        request.votingOracles.push(msg.sender);
        
        if (_vote) {
            request.positiveVotes++;
        } else {
            request.negativeVotes++;
        }
        
        emit OracleVoted(_requestId, msg.sender, _vote);
        
        // Check if we have enough votes to reach consensus
        uint256 totalVotes = request.positiveVotes + request.negativeVotes;
        if (totalVotes >= minimumOracles) {
            _processVerificationResult(_requestId);
        }
    }
    
    function _processVerificationResult(bytes32 _requestId) internal {
        MilestoneVerification storage request = verificationRequests[_requestId];
        require(!request.isCompleted, "Already processed");
        
        uint256 totalVotes = request.positiveVotes + request.negativeVotes;
        uint256 positivePercentage = (request.positiveVotes * 100) / totalVotes;
        
        bool verificationResult = positivePercentage >= consensusThreshold;
        request.isCompleted = true;
        
        // Update oracle reputations and distribute rewards
        _updateOracleReputations(_requestId, verificationResult);
        
        emit MilestoneVerified(_requestId, verificationResult);
    }
    
    function _updateOracleReputations(bytes32 _requestId, bool _result) internal {
        MilestoneVerification storage request = verificationRequests[_requestId];
        
        for (uint256 i = 0; i < request.votingOracles.length; i++) {
            address oracleAddr = request.votingOracles[i];
            Oracle storage oracle = oracles[oracleAddr];
            
            oracle.totalVerifications++;
            
            // Check if oracle voted correctly (with majority)
            bool votedCorrectly = (request.positiveVotes > request.negativeVotes) == 
                                (request.oracleVotes[oracleAddr]);
            
            if (votedCorrectly) {
                oracle.successfulVerifications++;
                oracle.reputation += 10; // Increase reputation
                
                // Reward oracle
                if (address(this).balance >= oracleReward) {
                    payable(oracleAddr).transfer(oracleReward);
                    emit OracleRewarded(oracleAddr, oracleReward);
                }
            } else {
                // Decrease reputation for incorrect votes
                if (oracle.reputation > 10) {
                    oracle.reputation -= 5;
                }
            }
        }
    }
    
    // Force verification completion after deadline
    function forceCompleteVerification(bytes32 _requestId) external {
        MilestoneVerification storage request = verificationRequests[_requestId];
        require(!request.isCompleted, "Already completed");
        require(block.timestamp > request.deadline, "Deadline not passed");
        require(request.positiveVotes > 0 || request.negativeVotes > 0, "No votes submitted");
        
        _processVerificationResult(_requestId);
    }
    
    // View Functions
    function getMilestoneStatus(uint256 _campaignId, uint256 _milestoneIndex) 
        external 
        view 
        returns (bool) 
    {
        bytes32 requestId = campaignMilestoneToRequest[_campaignId][_milestoneIndex];
        if (requestId == bytes32(0)) {
            return false;
        }
        
        MilestoneVerification storage request = verificationRequests[requestId];
        if (!request.isCompleted) {
            return false;
        }
        
        uint256 totalVotes = request.positiveVotes + request.negativeVotes;
        if (totalVotes == 0) {
            return false;
        }
        
        uint256 positivePercentage = (request.positiveVotes * 100) / totalVotes;
        return positivePercentage >= consensusThreshold;
    }
    
    function getVerificationDetails(bytes32 _requestId) 
        external 
        view 
        returns (
            uint256 campaignId,
            uint256 milestoneIndex,
            string memory verificationData,
            bool isCompleted,
            uint256 positiveVotes,
            uint256 negativeVotes,
            uint256 deadline
        ) 
    {
        MilestoneVerification storage request = verificationRequests[_requestId];
        return (
            request.campaignId,
            request.milestoneIndex,
            request.verificationData,
            request.isCompleted,
            request.positiveVotes,
            request.negativeVotes,
            request.deadline
        );
    }
    
    function getOracleInfo(address _oracle) 
        external 
        view 
        returns (
            string memory name,
            bool isActive,
            uint256 reputation,
            uint256 totalVerifications,
            uint256 successfulVerifications
        ) 
    {
        Oracle storage oracle = oracles[_oracle];
        return (
            oracle.name,
            oracle.isActive,
            oracle.reputation,
            oracle.totalVerifications,
            oracle.successfulVerifications
        );
    }
    
    function getActiveOracles() external view returns (address[] memory) {
        return activeOracles;
    }
    
    function getActiveOracleCount() external view returns (uint256) {
        return activeOracles.length;
    }
    
    // Admin Functions
    function setMinimumOracles(uint256 _minimum) external onlyOwner {
        require(_minimum > 0, "Minimum must be positive");
        minimumOracles = _minimum;
    }
    
    function setConsensusThreshold(uint256 _threshold) external onlyOwner {
        require(_threshold > 50 && _threshold <= 100, "Threshold must be between 51-100");
        consensusThreshold = _threshold;
    }
    
    function setVerificationTimeout(uint256 _timeout) external onlyOwner {
        require(_timeout >= 1 hours, "Timeout too short");
        verificationTimeout = _timeout;
    }
    
    function setOracleReward(uint256 _reward) external onlyOwner {
        oracleReward = _reward;
    }
    
    // Emergency Functions
    function emergencyPause(bytes32 _requestId) external onlyOwner {
        verificationRequests[_requestId].isCompleted = true;
    }
    
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Receive function to accept payments for oracle rewards
    receive() external payable {}
}