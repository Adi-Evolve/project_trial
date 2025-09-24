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

contract CrowdfundingPlatform is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _campaignIds;
    
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
    }
    
    struct Milestone {
        string description;
        uint256 fundAmount;
        uint256 deadline;
        MilestoneStatus status;
        bool fundsReleased;
    }
    
    struct Campaign {
        uint256 campaignId;
        address creator;
        CampaignType campaignType;
        string title;
        string description;
        string ipfsHash; // Campaign documents
        uint256 goalAmount;
        uint256 raisedAmount;
        uint256 deadline;
        CampaignStatus status;
        Milestone[] milestones;
        mapping(address => uint256) contributions;
        address[] contributors;
    }
    
    struct ZKPContribution {
        bytes32 commitment;
        uint256 minAmount;
        bool isVerified;
    }
    
    // State Variables
    mapping(address => User) public users;
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256[]) public userCampaigns;
    mapping(address => uint256[]) public userContributions;
    mapping(bytes32 => ZKPContribution) public zkpContributions;
    
    address public multisigWallet;
    IOracle public oracleContract;
    IZKP public zkpContract;
    
    uint256 public platformFeePercent = 300; // 3% (300 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    // Events
    event UserRegistered(address indexed user, UserType userType);
    event UserVerified(address indexed user, UserType userType);
    event CampaignCreated(uint256 indexed campaignId, address indexed creator, CampaignType campaignType);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event MilestoneCompleted(uint256 indexed campaignId, uint256 milestoneIndex);
    event FundsReleased(uint256 indexed campaignId, uint256 amount);
    event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event ZKPContributionMade(uint256 indexed campaignId, bytes32 indexed commitment);
    
    // Modifiers
    modifier onlyVerifiedUser() {
        require(users[msg.sender].isVerified, "User not verified");
        _;
    }
    
    modifier onlyCreator(uint256 _campaignId) {
        require(campaigns[_campaignId].creator == msg.sender, "Not campaign creator");
        _;
    }
    
    modifier onlyMultisig() {
        require(msg.sender == multisigWallet, "Only multisig can call");
        _;
    }
    
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= _campaignIds.current(), "Campaign does not exist");
        _;
    }
    
    constructor(address _multisigWallet) Ownable(msg.sender) {
        multisigWallet = _multisigWallet;
    }
    
    // User Management Functions
    function registerUser(UserType _userType, string memory _ipfsHash) external {
        require(_userType != UserType.NONE, "Invalid user type");
        require(users[msg.sender].walletAddress == address(0), "User already registered");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            userType: _userType,
            isVerified: false,
            ipfsHash: _ipfsHash,
            registrationTime: block.timestamp
        });
        
        emit UserRegistered(msg.sender, _userType);
    }
    
    function verifyUser(address _user) external onlyMultisig {
        require(users[_user].walletAddress != address(0), "User not registered");
        require(!users[_user].isVerified, "User already verified");
        
        users[_user].isVerified = true;
        emit UserVerified(_user, users[_user].userType);
    }
    
    // Campaign Management Functions
    function createCampaign(
        CampaignType _campaignType,
        string memory _title,
        string memory _description,
        string memory _ipfsHash,
        uint256 _goalAmount,
        uint256 _deadline,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneFunds,
        uint256[] memory _milestoneDeadlines
    ) external onlyVerifiedUser returns (uint256) {
        require(
            users[msg.sender].userType == UserType.PROJECT_CREATOR || 
            users[msg.sender].userType == UserType.NGO_CREATOR,
            "Not authorized to create campaigns"
        );
        require(_goalAmount > 0, "Goal amount must be positive");
        require(_deadline > block.timestamp, "Deadline must be in future");
        
        if (_campaignType == CampaignType.PROJECT) {
            require(_milestoneDescriptions.length > 0, "Projects must have milestones");
            require(
                _milestoneDescriptions.length == _milestoneFunds.length &&
                _milestoneFunds.length == _milestoneDeadlines.length,
                "Milestone arrays length mismatch"
            );
        }
        
        _campaignIds.increment();
        uint256 newCampaignId = _campaignIds.current();
        
        Campaign storage newCampaign = campaigns[newCampaignId];
        newCampaign.campaignId = newCampaignId;
        newCampaign.creator = msg.sender;
        newCampaign.campaignType = _campaignType;
        newCampaign.title = _title;
        newCampaign.description = _description;
        newCampaign.ipfsHash = _ipfsHash;
        newCampaign.goalAmount = _goalAmount;
        newCampaign.deadline = _deadline;
        newCampaign.status = CampaignStatus.ACTIVE;
        
        // Add milestones for projects
        if (_campaignType == CampaignType.PROJECT) {
            uint256 totalMilestoneFunds = 0;
            for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
                require(_milestoneDeadlines[i] <= _deadline, "Milestone deadline exceeds campaign deadline");
                newCampaign.milestones.push(Milestone({
                    description: _milestoneDescriptions[i],
                    fundAmount: _milestoneFunds[i],
                    deadline: _milestoneDeadlines[i],
                    status: MilestoneStatus.PENDING,
                    fundsReleased: false
                }));
                totalMilestoneFunds += _milestoneFunds[i];
            }
            require(totalMilestoneFunds <= _goalAmount, "Total milestone funds exceed goal");
        }
        
        userCampaigns[msg.sender].push(newCampaignId);
        emit CampaignCreated(newCampaignId, msg.sender, _campaignType);
        
        return newCampaignId;
    }
    
    // Contribution Functions
    function contribute(uint256 _campaignId) external payable campaignExists(_campaignId) onlyVerifiedUser nonReentrant {
        require(users[msg.sender].userType == UserType.BACKER, "Only backers can contribute");
        require(msg.value > 0, "Contribution must be positive");
        
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign not active");
        require(block.timestamp < campaign.deadline, "Campaign deadline passed");
        require(campaign.creator != msg.sender, "Cannot contribute to own campaign");
        
        // Track first-time contributor
        if (campaign.contributions[msg.sender] == 0) {
            campaign.contributors.push(msg.sender);
            userContributions[msg.sender].push(_campaignId);
        }
        
        campaign.contributions[msg.sender] += msg.value;
        campaign.raisedAmount += msg.value;
        
        emit ContributionMade(_campaignId, msg.sender, msg.value);
        
        // Check if goal reached
        if (campaign.raisedAmount >= campaign.goalAmount) {
            campaign.status = CampaignStatus.COMPLETED;
        }
    }
    
    // ZKP Contribution Function
    function contributeWithZKP(
        uint256 _campaignId,
        bytes32 _commitment,
        uint256 _minAmount,
        bytes calldata _proof
    ) external payable campaignExists(_campaignId) onlyVerifiedUser nonReentrant {
        require(address(zkpContract) != address(0), "ZKP contract not set");
        require(zkpContract.verifyProof(_commitment, _proof), "Invalid ZKP proof");
        require(msg.value >= _minAmount, "Contribution below declared minimum");
        
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign not active");
        require(block.timestamp < campaign.deadline, "Campaign deadline passed");
        
        zkpContributions[_commitment] = ZKPContribution({
            commitment: _commitment,
            minAmount: _minAmount,
            isVerified: true
        });
        
        if (campaign.contributions[msg.sender] == 0) {
            campaign.contributors.push(msg.sender);
            userContributions[msg.sender].push(_campaignId);
        }
        
        campaign.contributions[msg.sender] += msg.value;
        campaign.raisedAmount += msg.value;
        
        emit ZKPContributionMade(_campaignId, _commitment);
        emit ContributionMade(_campaignId, msg.sender, msg.value);
    }
    
    // Milestone and Fund Release Functions
    function requestMilestoneVerification(uint256 _campaignId, uint256 _milestoneIndex) 
        external 
        campaignExists(_campaignId) 
        onlyCreator(_campaignId) 
    {
        require(address(oracleContract) != address(0), "Oracle contract not set");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignType == CampaignType.PROJECT, "Only for project campaigns");
        require(_milestoneIndex < campaign.milestones.length, "Invalid milestone index");
        require(campaign.milestones[_milestoneIndex].status == MilestoneStatus.PENDING, "Milestone not pending");
        
        oracleContract.requestMilestoneVerification(_campaignId, _milestoneIndex);
    }
    
    function releaseMilestoneFunds(uint256 _campaignId, uint256 _milestoneIndex) 
        external 
        campaignExists(_campaignId) 
        nonReentrant 
    {
        require(address(oracleContract) != address(0), "Oracle contract not set");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignType == CampaignType.PROJECT, "Only for project campaigns");
        require(_milestoneIndex < campaign.milestones.length, "Invalid milestone index");
        
        Milestone storage milestone = campaign.milestones[_milestoneIndex];
        require(!milestone.fundsReleased, "Funds already released");
        require(oracleContract.getMilestoneStatus(_campaignId, _milestoneIndex), "Milestone not verified by oracle");
        
        milestone.status = MilestoneStatus.VERIFIED;
        milestone.fundsReleased = true;
        
        uint256 releaseAmount = milestone.fundAmount;
        uint256 platformFee = (releaseAmount * platformFeePercent) / BASIS_POINTS;
        uint256 creatorAmount = releaseAmount - platformFee;
        
        // Transfer funds
        (bool success1, ) = payable(campaign.creator).call{value: creatorAmount}("");
        require(success1, "Transfer to creator failed");
        
        (bool success2, ) = payable(multisigWallet).call{value: platformFee}("");
        require(success2, "Transfer to platform failed");
        
        emit MilestoneCompleted(_campaignId, _milestoneIndex);
        emit FundsReleased(_campaignId, releaseAmount);
    }
    
    // NGO Direct Fund Release
    function releaseNGOFunds(uint256 _campaignId) 
        external 
        campaignExists(_campaignId) 
        onlyMultisig 
        nonReentrant 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignType == CampaignType.DONATION, "Only for donation campaigns");
        require(campaign.status == CampaignStatus.COMPLETED, "Campaign not completed");
        require(campaign.raisedAmount > 0, "No funds to release");
        
        uint256 totalAmount = campaign.raisedAmount;
        uint256 platformFee = (totalAmount * platformFeePercent) / BASIS_POINTS;
        uint256 ngoAmount = totalAmount - platformFee;
        
        campaign.raisedAmount = 0; // Prevent re-release
        
        (bool success1, ) = payable(campaign.creator).call{value: ngoAmount}("");
        require(success1, "Transfer to NGO failed");
        
        (bool success2, ) = payable(multisigWallet).call{value: platformFee}("");
        require(success2, "Transfer to platform failed");
        
        emit FundsReleased(_campaignId, totalAmount);
    }
    
    // Refund Functions
    function requestRefund(uint256 _campaignId) 
        external 
        campaignExists(_campaignId) 
        nonReentrant 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(
            campaign.status == CampaignStatus.FAILED || 
            (campaign.status == CampaignStatus.ACTIVE && block.timestamp > campaign.deadline && campaign.raisedAmount < campaign.goalAmount),
            "Refund not available"
        );
        
        uint256 contributionAmount = campaign.contributions[msg.sender];
        require(contributionAmount > 0, "No contribution found");
        
        campaign.contributions[msg.sender] = 0;
        campaign.raisedAmount -= contributionAmount;
        
        if (campaign.status == CampaignStatus.ACTIVE) {
            campaign.status = CampaignStatus.FAILED;
        }
        
        (bool success, ) = payable(msg.sender).call{value: contributionAmount}("");
        require(success, "Refund transfer failed");
        
        emit RefundIssued(_campaignId, msg.sender, contributionAmount);
    }
    
    // Admin Functions
    function setOracle(address _oracleAddress) external onlyMultisig {
        oracleContract = IOracle(_oracleAddress);
    }
    
    function setZKPContract(address _zkpAddress) external onlyMultisig {
        zkpContract = IZKP(_zkpAddress);
    }
    
    function setPlatformFee(uint256 _feePercent) external onlyMultisig {
        require(_feePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercent = _feePercent;
    }
    
    function emergencyPause(uint256 _campaignId) external onlyMultisig campaignExists(_campaignId) {
        campaigns[_campaignId].status = CampaignStatus.CANCELLED;
    }
    
    // View Functions
    function getCampaign(uint256 _campaignId) external view campaignExists(_campaignId) returns (
        address creator,
        CampaignType campaignType,
        string memory title,
        string memory description,
        uint256 goalAmount,
        uint256 raisedAmount,
        uint256 deadline,
        CampaignStatus status,
        uint256 milestoneCount
    ) {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.creator,
            campaign.campaignType,
            campaign.title,
            campaign.description,
            campaign.goalAmount,
            campaign.raisedAmount,
            campaign.deadline,
            campaign.status,
            campaign.milestones.length
        );
    }
    
    function getMilestone(uint256 _campaignId, uint256 _milestoneIndex) external view campaignExists(_campaignId) returns (
        string memory description,
        uint256 fundAmount,
        uint256 deadline,
        MilestoneStatus status,
        bool fundsReleased
    ) {
        require(_milestoneIndex < campaigns[_campaignId].milestones.length, "Invalid milestone index");
        Milestone storage milestone = campaigns[_campaignId].milestones[_milestoneIndex];
        return (
            milestone.description,
            milestone.fundAmount,
            milestone.deadline,
            milestone.status,
            milestone.fundsReleased
        );
    }
    
    function getUserContribution(uint256 _campaignId, address _user) external view campaignExists(_campaignId) returns (uint256) {
        return campaigns[_campaignId].contributions[_user];
    }
    
    function getUserCampaigns(address _user) external view returns (uint256[] memory) {
        return userCampaigns[_user];
    }
    
    function getUserContributions(address _user) external view returns (uint256[] memory) {
        return userContributions[_user];
    }
    
    function getTotalCampaigns() external view returns (uint256) {
        return _campaignIds.current();
    }
    
    function getAllCampaigns() external view returns (
        uint256[] memory ids,
        address[] memory creators,
        CampaignType[] memory campaignTypes,
        string[] memory titles,
        string[] memory descriptions,
        uint256[] memory goalAmounts,
        uint256[] memory raisedAmounts,
        uint256[] memory deadlines,
        CampaignStatus[] memory statuses
    ) {
        uint256 totalCampaigns = _campaignIds.current();
        
        ids = new uint256[](totalCampaigns);
        creators = new address[](totalCampaigns);
        campaignTypes = new CampaignType[](totalCampaigns);
        titles = new string[](totalCampaigns);
        descriptions = new string[](totalCampaigns);
        goalAmounts = new uint256[](totalCampaigns);
        raisedAmounts = new uint256[](totalCampaigns);
        deadlines = new uint256[](totalCampaigns);
        statuses = new CampaignStatus[](totalCampaigns);
        
        for (uint256 i = 1; i <= totalCampaigns; i++) {
            Campaign storage campaign = campaigns[i];
            ids[i-1] = campaign.campaignId;
            creators[i-1] = campaign.creator;
            campaignTypes[i-1] = campaign.campaignType;
            titles[i-1] = campaign.title;
            descriptions[i-1] = campaign.description;
            goalAmounts[i-1] = campaign.goalAmount;
            raisedAmounts[i-1] = campaign.raisedAmount;
            deadlines[i-1] = campaign.deadline;
            statuses[i-1] = campaign.status;
        }
    }
    
    // Emergency Functions
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }
    
    receive() external payable {
        revert("Direct payments not accepted");
    }
}