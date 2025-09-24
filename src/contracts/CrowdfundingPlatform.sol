// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IOracle {
    function requestMilestoneVerification(uint256 campaignId, uint256 milestoneId) external;
    function getMilestoneStatus(uint256 campaignId, uint256 milestoneId) external view returns (bool);
}

interface IZKP {
    function verifyProof(bytes32 commitment, bytes calldata proof) external view returns (bool);
}

/**
 * @title CrowdfundingPlatform
 * @dev Advanced crowdfunding platform with milestone-based funding, user verification, and ZK privacy
 */
contract CrowdfundingPlatform is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _campaignIds;
    
    // Contract addresses
    IOracle public oracle;
    IZKP public zkpVerifier;
    address public multisigWallet;
    
    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeRate = 250;
    uint256 private constant BASIS_POINTS = 10000;
    
    // Enums
    enum UserType { NONE, PROJECT_CREATOR, NGO_CREATOR, BACKER }
    enum CampaignType { PROJECT, DONATION }
    enum CampaignStatus { ACTIVE, COMPLETED, FAILED, CANCELLED }
    enum MilestoneStatus { PENDING, VERIFIED, FAILED }
    
    // Structs
    struct User {
        address walletAddress;
        UserType userType;
        bool isVerified;
        string ipfsHash; // Hash of verification documents
        uint256 registrationTime;
        uint256 totalFunded;
        uint256 totalRaised;
    }
    
    struct Milestone {
        string description;
        uint256 fundAmount;
        uint256 deadline;
        MilestoneStatus status;
        bool fundsReleased;
        string deliverableHash; // IPFS hash of deliverable
    }
    
    struct Campaign {
        uint256 campaignId;
        address creator;
        CampaignType campaignType;
        string title;
        string description;
        string ipfsHash; // Campaign documents
        uint256 fundingGoal;
        uint256 currentFunding;
        uint256 deadline;
        CampaignStatus status;
        bool emergencyStop;
        uint256 createdAt;
        Milestone[] milestones;
        mapping(address => uint256) contributions;
        address[] contributors;
    }
    
    struct Contribution {
        address contributor;
        uint256 amount;
        uint256 timestamp;
        bool isPrivate; // For ZK contributions
        bytes32 commitment; // ZK commitment
    }
    
    // State Variables
    mapping(address => User) public users;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Contribution[]) public campaignContributions;
    mapping(address => uint256[]) public userCampaigns;
    mapping(address => uint256[]) public userContributions;
    
    // Events
    event UserRegistered(address indexed user, UserType userType, string ipfsHash);
    event UserVerified(address indexed user, bool isVerified);
    event CampaignCreated(uint256 indexed campaignId, address indexed creator, CampaignType campaignType);
    event CampaignFunded(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event MilestoneAdded(uint256 indexed campaignId, uint256 milestoneId, string description);
    event MilestoneCompleted(uint256 indexed campaignId, uint256 milestoneId, uint256 amountReleased);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount);
    event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event EmergencyStop(uint256 indexed campaignId, bool stopped);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    
    // Modifiers
    modifier onlyVerifiedUser() {
        require(users[msg.sender].isVerified, "User must be verified");
        _;
    }
    
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= _campaignIds.current(), "Campaign does not exist");
        _;
    }
    
    modifier onlyCampaignCreator(uint256 _campaignId) {
        require(campaigns[_campaignId].creator == msg.sender, "Only campaign creator can perform this action");
        _;
    }
    
    modifier campaignActive(uint256 _campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign is not active");
        require(!campaign.emergencyStop, "Campaign is emergency stopped");
        require(block.timestamp <= campaign.deadline, "Campaign deadline has passed");
        _;
    }
    
    constructor(
        address _oracle,
        address _zkpVerifier,
        address _multisigWallet
    ) Ownable(msg.sender) {
        oracle = IOracle(_oracle);
        zkpVerifier = IZKP(_zkpVerifier);
        multisigWallet = _multisigWallet;
    }
    
    /**
     * @dev Register a new user on the platform
     */
    function registerUser(
        UserType _userType,
        string memory _ipfsHash
    ) external {
        require(_userType != UserType.NONE, "Invalid user type");
        require(users[msg.sender].userType == UserType.NONE, "User already registered");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            userType: _userType,
            isVerified: false,
            ipfsHash: _ipfsHash,
            registrationTime: block.timestamp,
            totalFunded: 0,
            totalRaised: 0
        });
        
        emit UserRegistered(msg.sender, _userType, _ipfsHash);
    }
    
    /**
     * @dev Verify a user (only owner can do this)
     */
    function verifyUser(address _user, bool _verified) external onlyOwner {
        require(users[_user].userType != UserType.NONE, "User not registered");
        users[_user].isVerified = _verified;
        emit UserVerified(_user, _verified);
    }
    
    /**
     * @dev Create a new campaign
     */
    function createCampaign(
        CampaignType _campaignType,
        string memory _title,
        string memory _description,
        string memory _ipfsHash,
        uint256 _fundingGoal,
        uint256 _deadline,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneFunds,
        uint256[] memory _milestoneDeadlines
    ) external onlyVerifiedUser nonReentrant {
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");
        
        // Validate milestones
        require(
            _milestoneDescriptions.length == _milestoneFunds.length &&
            _milestoneFunds.length == _milestoneDeadlines.length,
            "Milestone arrays must have same length"
        );
        
        uint256 totalMilestoneFunds = 0;
        for (uint256 i = 0; i < _milestoneFunds.length; i++) {
            totalMilestoneFunds += _milestoneFunds[i];
            require(_milestoneDeadlines[i] > block.timestamp, "All milestone deadlines must be in future");
            if (i > 0) {
                require(_milestoneDeadlines[i] > _milestoneDeadlines[i-1], "Milestone deadlines must be sequential");
            }
        }
        require(totalMilestoneFunds == _fundingGoal, "Total milestone funds must equal funding goal");
        
        _campaignIds.increment();
        uint256 newCampaignId = _campaignIds.current();
        
        Campaign storage newCampaign = campaigns[newCampaignId];
        newCampaign.campaignId = newCampaignId;
        newCampaign.creator = msg.sender;
        newCampaign.campaignType = _campaignType;
        newCampaign.title = _title;
        newCampaign.description = _description;
        newCampaign.ipfsHash = _ipfsHash;
        newCampaign.fundingGoal = _fundingGoal;
        newCampaign.currentFunding = 0;
        newCampaign.deadline = _deadline;
        newCampaign.status = CampaignStatus.ACTIVE;
        newCampaign.emergencyStop = false;
        newCampaign.createdAt = block.timestamp;
        
        // Add milestones
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            newCampaign.milestones.push(Milestone({
                description: _milestoneDescriptions[i],
                fundAmount: _milestoneFunds[i],
                deadline: _milestoneDeadlines[i],
                status: MilestoneStatus.PENDING,
                fundsReleased: false,
                deliverableHash: ""
            }));
            
            emit MilestoneAdded(newCampaignId, i, _milestoneDescriptions[i]);
        }
        
        userCampaigns[msg.sender].push(newCampaignId);
        
        emit CampaignCreated(newCampaignId, msg.sender, _campaignType);
    }
    
    /**
     * @dev Contribute to a campaign
     */
    function contributeToCampaign(uint256 _campaignId) 
        external 
        payable 
        campaignExists(_campaignId)
        campaignActive(_campaignId)
        nonReentrant 
    {
        require(msg.value > 0, "Contribution must be greater than 0");
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender != campaign.creator, "Creator cannot contribute to own campaign");
        
        // Update campaign funding
        campaign.currentFunding += msg.value;
        
        // Update user contribution
        if (campaign.contributions[msg.sender] == 0) {
            campaign.contributors.push(msg.sender);
        }
        campaign.contributions[msg.sender] += msg.value;
        
        // Update user total funded
        users[msg.sender].totalFunded += msg.value;
        
        // Add to user contributions
        userContributions[msg.sender].push(_campaignId);
        
        // Record contribution
        campaignContributions[_campaignId].push(Contribution({
            contributor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            isPrivate: false,
            commitment: bytes32(0)
        }));
        
        // Check if funding goal is reached
        if (campaign.currentFunding >= campaign.fundingGoal) {
            campaign.status = CampaignStatus.COMPLETED;
            users[campaign.creator].totalRaised += campaign.currentFunding;
        }
        
        emit CampaignFunded(_campaignId, msg.sender, msg.value);
    }
    
    /**
     * @dev Private contribution using ZK proofs
     */
    function privateContributeToCampaign(
        uint256 _campaignId,
        bytes32 _commitment,
        bytes calldata _proof
    ) external payable campaignExists(_campaignId) campaignActive(_campaignId) nonReentrant {
        require(msg.value > 0, "Contribution must be greater than 0");
        require(zkpVerifier.verifyProof(_commitment, _proof), "Invalid ZK proof");
        
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender != campaign.creator, "Creator cannot contribute to own campaign");
        
        // Update campaign funding
        campaign.currentFunding += msg.value;
        
        // Record private contribution
        campaignContributions[_campaignId].push(Contribution({
            contributor: address(0), // Anonymous
            amount: msg.value,
            timestamp: block.timestamp,
            isPrivate: true,
            commitment: _commitment
        }));
        
        // Check if funding goal is reached
        if (campaign.currentFunding >= campaign.fundingGoal) {
            campaign.status = CampaignStatus.COMPLETED;
            users[campaign.creator].totalRaised += campaign.currentFunding;
        }
        
        emit CampaignFunded(_campaignId, address(0), msg.value); // Anonymous emission
    }
    
    /**
     * @dev Submit milestone deliverable
     */
    function submitMilestoneDeliverable(
        uint256 _campaignId,
        uint256 _milestoneId,
        string memory _deliverableHash
    ) external campaignExists(_campaignId) onlyCampaignCreator(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(_milestoneId < campaign.milestones.length, "Invalid milestone ID");
        
        Milestone storage milestone = campaign.milestones[_milestoneId];
        require(milestone.status == MilestoneStatus.PENDING, "Milestone already processed");
        require(bytes(_deliverableHash).length > 0, "Deliverable hash required");
        
        milestone.deliverableHash = _deliverableHash;
        
        // Request oracle verification
        oracle.requestMilestoneVerification(_campaignId, _milestoneId);
    }
    
    /**
     * @dev Release milestone funds (called after oracle verification)
     */
    function releaseMilestoneFunds(uint256 _campaignId, uint256 _milestoneId) 
        external 
        campaignExists(_campaignId) 
        nonReentrant 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(_milestoneId < campaign.milestones.length, "Invalid milestone ID");
        
        Milestone storage milestone = campaign.milestones[_milestoneId];
        require(!milestone.fundsReleased, "Funds already released");
        require(oracle.getMilestoneStatus(_campaignId, _milestoneId), "Milestone not verified");
        
        milestone.status = MilestoneStatus.VERIFIED;
        milestone.fundsReleased = true;
        
        // Calculate platform fee
        uint256 platformFee = (milestone.fundAmount * platformFeeRate) / BASIS_POINTS;
        uint256 creatorAmount = milestone.fundAmount - platformFee;
        
        // Transfer funds
        payable(campaign.creator).transfer(creatorAmount);
        payable(multisigWallet).transfer(platformFee);
        
        emit MilestoneCompleted(_campaignId, _milestoneId, creatorAmount);
    }
    
    /**
     * @dev Withdraw funds for completed campaign
     */
    function withdrawFunds(uint256 _campaignId) 
        external 
        campaignExists(_campaignId) 
        onlyCampaignCreator(_campaignId) 
        nonReentrant 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.COMPLETED, "Campaign not completed");
        require(campaign.currentFunding > 0, "No funds to withdraw");
        
        uint256 amount = campaign.currentFunding;
        campaign.currentFunding = 0;
        
        // Calculate platform fee
        uint256 platformFee = (amount * platformFeeRate) / BASIS_POINTS;
        uint256 creatorAmount = amount - platformFee;
        
        // Transfer funds
        payable(campaign.creator).transfer(creatorAmount);
        payable(multisigWallet).transfer(platformFee);
        
        emit FundsWithdrawn(_campaignId, campaign.creator, creatorAmount);
    }
    
    /**
     * @dev Refund contributors if campaign fails
     */
    function refundContributors(uint256 _campaignId) external campaignExists(_campaignId) nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(
            campaign.status == CampaignStatus.FAILED || 
            (block.timestamp > campaign.deadline && campaign.currentFunding < campaign.fundingGoal),
            "Campaign not eligible for refunds"
        );
        
        if (campaign.status != CampaignStatus.FAILED) {
            campaign.status = CampaignStatus.FAILED;
        }
        
        for (uint256 i = 0; i < campaign.contributors.length; i++) {
            address contributor = campaign.contributors[i];
            uint256 contribution = campaign.contributions[contributor];
            
            if (contribution > 0) {
                campaign.contributions[contributor] = 0;
                payable(contributor).transfer(contribution);
                emit RefundIssued(_campaignId, contributor, contribution);
            }
        }
        
        campaign.currentFunding = 0;
    }
    
    /**
     * @dev Emergency stop/resume campaign (only owner)
     */
    function emergencyStopCampaign(uint256 _campaignId, bool _stop) 
        external 
        onlyOwner 
        campaignExists(_campaignId) 
    {
        campaigns[_campaignId].emergencyStop = _stop;
        emit EmergencyStop(_campaignId, _stop);
    }
    
    /**
     * @dev Update platform fee rate (only owner)
     */
    function updatePlatformFeeRate(uint256 _newFeeRate) external onlyOwner {
        require(_newFeeRate <= 1000, "Fee rate cannot exceed 10%"); // Max 10%
        uint256 oldFee = platformFeeRate;
        platformFeeRate = _newFeeRate;
        emit PlatformFeeUpdated(oldFee, _newFeeRate);
    }
    
    /**
     * @dev Update contract addresses (only owner)
     */
    function updateContracts(address _oracle, address _zkpVerifier, address _multisigWallet) 
        external 
        onlyOwner 
    {
        if (_oracle != address(0)) oracle = IOracle(_oracle);
        if (_zkpVerifier != address(0)) zkpVerifier = IZKP(_zkpVerifier);
        if (_multisigWallet != address(0)) multisigWallet = _multisigWallet;
    }
    
    // View Functions
    function getCampaign(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (
            address creator,
            CampaignType campaignType,
            string memory title,
            string memory description,
            uint256 fundingGoal,
            uint256 currentFunding,
            uint256 deadline,
            CampaignStatus status
        ) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.creator,
            campaign.campaignType,
            campaign.title,
            campaign.description,
            campaign.fundingGoal,
            campaign.currentFunding,
            campaign.deadline,
            campaign.status
        );
    }
    
    function getCampaignMilestones(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (Milestone[] memory) 
    {
        return campaigns[_campaignId].milestones;
    }
    
    function getUserCampaigns(address _user) external view returns (uint256[] memory) {
        return userCampaigns[_user];
    }
    
    function getUserContributions(address _user) external view returns (uint256[] memory) {
        return userContributions[_user];
    }
    
    function getCampaignContributions(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (Contribution[] memory) 
    {
        return campaignContributions[_campaignId];
    }
    
    function getContractInfo() 
        external 
        view 
        returns (
            address oracleAddress,
            address zkpAddress,
            address multisigAddress,
            uint256 feeRate,
            uint256 totalCampaigns
        ) 
    {
        return (
            address(oracle),
            address(zkpVerifier),
            multisigWallet,
            platformFeeRate,
            _campaignIds.current()
        );
    }
}