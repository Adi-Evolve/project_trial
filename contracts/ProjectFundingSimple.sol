// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ProjectFunding
 * @dev Smart contract for handling project donations with intermediary wallet
 */
contract ProjectFunding {
    
    // Platform wallet (your MetaMask wallet as intermediary)
    address payable public platformWallet;
    uint256 public platformFeePercentage = 250; // 2.5% fee (250 basis points)
    address public owner;
    bool public paused = false;
    
    // Reentrancy guard
    bool private _locked = false;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }
    
    struct Project {
        address payable creator;
        string projectId;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 deadline;
        bool isActive;
        bool fundsWithdrawn;
    }
    
    struct Donation {
        address donor;
        uint256 amount;
        uint256 platformFee;
        uint256 creatorAmount;
        uint256 timestamp;
        string message;
        bool transferred;
    }
    
    // Mappings
    mapping(string => Project) public projects;
    mapping(string => Donation[]) public projectDonations;
    mapping(address => uint256) public userDonations;
    mapping(string => bool) public projectExists;
    mapping(string => uint256) public pendingWithdrawals;
    
    // Events
    event ProjectCreated(
        string indexed projectId,
        address indexed creator,
        uint256 targetAmount,
        uint256 deadline
    );
    
    event DonationReceived(
        string indexed projectId,
        address indexed donor,
        uint256 totalAmount,
        uint256 platformFee,
        uint256 creatorAmount,
        string message,
        uint256 timestamp
    );
    
    event FundsTransferred(
        string indexed projectId,
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );
    
    event PlatformFeeCollected(
        uint256 amount,
        uint256 timestamp
    );
    
    event ProjectStatusUpdated(
        string indexed projectId,
        bool isActive
    );
    
    constructor() {
        owner = msg.sender;
        platformWallet = payable(msg.sender); // Set deployer as platform wallet initially
    }
    
    /**
     * @dev Set platform wallet address (only owner)
     */
    function setPlatformWallet(address payable _platformWallet) external onlyOwner {
        require(_platformWallet != address(0), "Invalid platform wallet address");
        platformWallet = _platformWallet;
    }
    
    /**
     * @dev Set platform fee percentage (only owner)
     */
    function setPlatformFee(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercentage = _feePercentage;
    }
    
    /**
     * @dev Create a new project for fundraising
     */
    function createProject(
        string memory _projectId,
        uint256 _targetAmount,
        uint256 _deadline
    ) external whenNotPaused {
        require(!projectExists[_projectId], "Project already exists");
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        
        projects[_projectId] = Project({
            creator: payable(msg.sender),
            projectId: _projectId,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            deadline: _deadline,
            isActive: true,
            fundsWithdrawn: false
        });
        
        projectExists[_projectId] = true;
        
        emit ProjectCreated(_projectId, msg.sender, _targetAmount, _deadline);
    }
    
    /**
     * @dev Donate to a project (Step 1: Funds go to platform wallet first)
     */
    function donate(
        string memory _projectId,
        string memory _message
    ) external payable nonReentrant whenNotPaused {
        require(projectExists[_projectId], "Project does not exist");
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        Project storage project = projects[_projectId];
        require(project.isActive, "Project is not active");
        require(block.timestamp <= project.deadline, "Project deadline has passed");
        
        // Calculate platform fee and creator amount
        uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
        uint256 creatorAmount = msg.value - platformFee;
        
        // Update project raised amount (only creator amount counts towards target)
        project.raisedAmount += creatorAmount;
        
        // Update user total donations
        userDonations[msg.sender] += msg.value;
        
        // Add to pending withdrawals for the creator
        pendingWithdrawals[_projectId] += creatorAmount;
        
        // Record donation
        projectDonations[_projectId].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            platformFee: platformFee,
            creatorAmount: creatorAmount,
            timestamp: block.timestamp,
            message: _message,
            transferred: false
        }));
        
        // Transfer platform fee immediately
        if (platformFee > 0) {
            platformWallet.transfer(platformFee);
            emit PlatformFeeCollected(platformFee, block.timestamp);
        }
        
        emit DonationReceived(
            _projectId,
            msg.sender,
            msg.value,
            platformFee,
            creatorAmount,
            _message,
            block.timestamp
        );
    }
    
    /**
     * @dev Transfer funds to project creator (Step 2: Platform transfers to creator)
     */
    function transferToCreator(string memory _projectId) external nonReentrant {
        require(projectExists[_projectId], "Project does not exist");
        
        Project storage project = projects[_projectId];
        uint256 amountToTransfer = pendingWithdrawals[_projectId];
        
        require(amountToTransfer > 0, "No funds to transfer");
        require(
            msg.sender == owner || msg.sender == project.creator,
            "Only owner or creator can trigger transfer"
        );
        
        // Reset pending withdrawals
        pendingWithdrawals[_projectId] = 0;
        
        // Transfer funds to creator
        project.creator.transfer(amountToTransfer);
        
        // Mark donations as transferred
        Donation[] storage donations = projectDonations[_projectId];
        for (uint i = 0; i < donations.length; i++) {
            if (!donations[i].transferred) {
                donations[i].transferred = true;
            }
        }
        
        emit FundsTransferred(_projectId, project.creator, amountToTransfer, block.timestamp);
    }
    
    /**
     * @dev Get project details
     */
    function getProject(string memory _projectId) external view returns (
        address creator,
        uint256 targetAmount,
        uint256 raisedAmount,
        uint256 deadline,
        bool isActive,
        bool fundsWithdrawn
    ) {
        require(projectExists[_projectId], "Project does not exist");
        
        Project memory project = projects[_projectId];
        return (
            project.creator,
            project.targetAmount,
            project.raisedAmount,
            project.deadline,
            project.isActive,
            project.fundsWithdrawn
        );
    }
    
    /**
     * @dev Get pending withdrawal amount for a project
     */
    function getPendingWithdrawal(string memory _projectId) external view returns (uint256) {
        return pendingWithdrawals[_projectId];
    }
    
    /**
     * @dev Get donation count for a project
     */
    function getDonationCount(string memory _projectId) external view returns (uint256) {
        return projectDonations[_projectId].length;
    }
    
    /**
     * @dev Get donation details by index
     */
    function getDonation(string memory _projectId, uint256 _index) external view returns (
        address donor,
        uint256 amount,
        uint256 platformFee,
        uint256 creatorAmount,
        uint256 timestamp,
        string memory message,
        bool transferred
    ) {
        require(_index < projectDonations[_projectId].length, "Invalid donation index");
        
        Donation memory donation = projectDonations[_projectId][_index];
        return (
            donation.donor,
            donation.amount,
            donation.platformFee,
            donation.creatorAmount,
            donation.timestamp,
            donation.message,
            donation.transferred
        );
    }
    
    /**
     * @dev Update project status (only project creator or owner)
     */
    function updateProjectStatus(string memory _projectId, bool _isActive) external {
        require(projectExists[_projectId], "Project does not exist");
        
        Project storage project = projects[_projectId];
        require(
            msg.sender == project.creator || msg.sender == owner,
            "Only project creator or owner can update status"
        );
        
        project.isActive = _isActive;
        emit ProjectStatusUpdated(_projectId, _isActive);
    }
    
    /**
     * @dev Emergency functions
     */
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
}