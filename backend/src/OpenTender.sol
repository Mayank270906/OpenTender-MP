// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/access/AccessControl.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract OpenTender is Ownable, AccessControl, ReentrancyGuard {
    // --- Roles ---
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant BIDDER_ROLE = keccak256("BIDDER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // --- Enums & Structs ---

    enum TenderStatus {
        Open,
        BiddingClosed,
        RevealClosed,
        Finalized,
        Canceled
    }

    enum Category {
        Construction,
        IT,
        Logistics,
        Research,
        Healthcare,
        Other
    }

    struct Tender {
        uint256 id;
        address creator;
        string title;
        string description;
        Category category;
        string ipfsHash; // Stores detailed docs off-chain
        uint256 deadline; // When bidding stops
        uint256 revealDeadline; // When revealing stops
        uint256 minBid;
        TenderStatus status;
        uint256 createdAt;
    }

    struct Bid {
        address bidder;
        bytes32 commitment; // Hash of (amount + secret)
        uint256 revealedAmount;
        bool isRevealed;
        uint256 timestamp;
    }

    struct Winner {
        address bidder;
        uint256 amount;
        uint256 selectedAt;
    }

    struct CompanyProfile {
        string name;
        string registrationId;
        string contactEmail;
        string ipfsHash; // Logo or docs
        bool isRegistered;
        uint256 reputationTotal;
        uint256 ratingCount;
    }

    // --- State Variables ---

    uint256 public tenderCount;

    // Mapping from Tender ID -> Tender Details
    mapping(uint256 => Tender) public tenders;

    // Mapping from Tender ID -> List of Bidders
    mapping(uint256 => address[]) public tenderBidders;

    // Mapping from Tender ID -> Bidder Address -> Bid Details
    mapping(uint256 => mapping(address => Bid)) public bids;

    // Mapping from Tender ID -> Winner Details
    mapping(uint256 => Winner) public winners;

    // Mapping from Address -> Company Profile
    mapping(address => CompanyProfile) public companies;

    // Mapping from Tender ID -> bool (true if rated)
    mapping(uint256 => bool) public tenderRated;

    // --- Events ---

    event CompanyRegistered(address indexed company, string name);
    event TenderCreated(uint256 indexed tenderId, address indexed creator, string title, Category category);
    event BidSubmitted(uint256 indexed tenderId, address indexed bidder);
    event BidRevealed(uint256 indexed tenderId, address indexed bidder, uint256 amount);
    event TenderClosed(uint256 indexed tenderId, address indexed winner, uint256 amount);
    event TenderCanceled(uint256 indexed tenderId);
    event BidderRated(address indexed bidder, uint256 rating, uint256 newReputationScore);

    // --- Modifiers ---

    modifier tenderExists(uint256 _tenderId) {
        require(_tenderId > 0 && _tenderId <= tenderCount, "Tender does not exist");
        _;
    }

    modifier onlyCreator(uint256 _tenderId) {
        require(tenders[_tenderId].creator == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not creator or admin");
        _;
    }

    modifier onlyRegistered() {
        require(companies[msg.sender].isRegistered, "Company not registered");
        _;
    }

    // --- Constructor ---

    constructor() Ownable(msg.sender) {
        // Grant admin and creator roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);
        _grantRole(BIDDER_ROLE, msg.sender);
    }

    // --- Main Functions ---

    /**
     * @dev Register a company profile. Grants BIDDER_ROLE automatically.
     */
    function registerCompany(
        string memory _name,
        string memory _regId,
        string memory _email,
        string memory _ipfsHash
    ) external {
        require(!companies[msg.sender].isRegistered, "Already registered");
        require(bytes(_name).length > 0, "Name required");

        companies[msg.sender] = CompanyProfile({
            name: _name,
            registrationId: _regId,
            contactEmail: _email,
            ipfsHash: _ipfsHash,
            isRegistered: true,
            reputationTotal: 0,
            ratingCount: 0
        });

        _grantRole(BIDDER_ROLE, msg.sender);
        emit CompanyRegistered(msg.sender, _name);
    }

    /**
     * @dev Create a new tender. Requires CREATOR_ROLE.
     */
    function createTender(
        string memory _title,
        string memory _description,
        Category _category,
        string memory _ipfsHash,
        uint256 _biddingDuration,
        uint256 _revealDuration,
        uint256 _minBid
    ) external onlyRole(CREATOR_ROLE) returns (uint256) {
        require(_biddingDuration > 0, "Bidding duration too short");
        require(_revealDuration > 0, "Reveal duration too short");

        tenderCount++;
        uint256 biddingDeadline = block.timestamp + _biddingDuration;
        uint256 revealDeadline = biddingDeadline + _revealDuration;

        tenders[tenderCount] = Tender({
            id: tenderCount,
            creator: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            ipfsHash: _ipfsHash,
            deadline: biddingDeadline,
            revealDeadline: revealDeadline,
            minBid: _minBid,
            status: TenderStatus.Open,
            createdAt: block.timestamp
        });

        emit TenderCreated(tenderCount, msg.sender, _title, _category);
        return tenderCount;
    }

    /**
     * @dev Submit a "Commitment". Requires BIDDER_ROLE (Registered Company).
     */
    function submitBid(uint256 _tenderId, bytes32 _commitment) external tenderExists(_tenderId) onlyRole(BIDDER_ROLE) {
        Tender storage tender = tenders[_tenderId];

        require(tender.status == TenderStatus.Open, "Tender not open");
        require(block.timestamp < tender.deadline, "Bidding deadline passed");
        require(bids[_tenderId][msg.sender].timestamp == 0, "Bid already submitted");

        bids[_tenderId][msg.sender] = Bid({
            bidder: msg.sender,
            commitment: _commitment,
            revealedAmount: 0,
            isRevealed: false,
            timestamp: block.timestamp
        });

        tenderBidders[_tenderId].push(msg.sender);
        emit BidSubmitted(_tenderId, msg.sender);
    }

    /**
     * @dev Reveal the actual bid amount.
     */
    function revealBid(uint256 _tenderId, uint256 _amount, string memory _secret) external tenderExists(_tenderId) {
        Tender storage tender = tenders[_tenderId];

        require(block.timestamp >= tender.deadline, "Bidding still active");
        require(block.timestamp < tender.revealDeadline, "Reveal phase over");
        require(tender.status == TenderStatus.Open, "Tender is closed");

        Bid storage bid = bids[_tenderId][msg.sender];
        require(bid.timestamp > 0, "No bid found");
        require(!bid.isRevealed, "Already revealed");

        // --- CRYPTOGRAPHIC VERIFICATION ---
        bytes32 generatedHash = keccak256(abi.encodePacked(_amount, _secret));

        require(generatedHash == bid.commitment, "Hash mismatch! Invalid amount/secret");
        require(_amount >= tender.minBid, "Bid below minimum");

        bid.revealedAmount = _amount;
        bid.isRevealed = true;

        emit BidRevealed(_tenderId, msg.sender, _amount);
    }

    /**
     * @dev Close tender and calculate the winner (Lowest Bidder).
     */
    function closeTender(uint256 _tenderId) external tenderExists(_tenderId) nonReentrant {
        Tender storage tender = tenders[_tenderId];

        require(block.timestamp >= tender.revealDeadline, "Reveal phase not over");
        require(tender.status == TenderStatus.Open, "Already closed");

        address lowestBidder = address(0);
        uint256 lowestAmount = type(uint256).max;
        bool winnerFound = false;

        address[] memory currentBidders = tenderBidders[_tenderId];

        // Iterate to find the lowest valid revealed bid
        for (uint256 i = 0; i < currentBidders.length; i++) {
            address bidderAddr = currentBidders[i];
            Bid memory bid = bids[_tenderId][bidderAddr];

            if (bid.isRevealed) {
                if (bid.revealedAmount < lowestAmount) {
                    lowestAmount = bid.revealedAmount;
                    lowestBidder = bidderAddr;
                    winnerFound = true;
                }
            }
        }

        if (winnerFound) {
            winners[_tenderId] = Winner({bidder: lowestBidder, amount: lowestAmount, selectedAt: block.timestamp});
            tender.status = TenderStatus.Finalized;
            emit TenderClosed(_tenderId, lowestBidder, lowestAmount);
        } else {
            // No valid bids revealed
            tender.status = TenderStatus.Finalized;
            emit TenderClosed(_tenderId, address(0), 0);
        }
    }

    /**
     * @dev Rate the winning bidder. Only Creator can rate.
     */
    function rateBidder(uint256 _tenderId, uint256 _rating) external onlyCreator(_tenderId) {
        require(!tenderRated[_tenderId], "Already rated");
        require(tenders[_tenderId].status == TenderStatus.Finalized, "Tender not finalized");
        require(winners[_tenderId].bidder != address(0), "No winner to rate");
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");

        address winnerAddr = winners[_tenderId].bidder;
        CompanyProfile storage profile = companies[winnerAddr];
        
        // If the winner hasn't registered (e.g. legacy or direct addr), we can't store rating effectively on profile
        // But since submitBid requires BIDDER_ROLE which requires registration, they should have a profile.
        // However, we should check just in case.
        require(profile.isRegistered, "Winner not registered");

        profile.reputationTotal += _rating;
        profile.ratingCount += 1;
        tenderRated[_tenderId] = true;

        emit BidderRated(winnerAddr, _rating, profile.reputationTotal / profile.ratingCount);
    }

    /**
     * @dev Cancel a tender (Only Creator/Admin, before bidding ends).
     */
    function cancelTender(uint256 _tenderId) external onlyCreator(_tenderId) {
        Tender storage tender = tenders[_tenderId];
        require(tender.status == TenderStatus.Open, "Cannot cancel closed tender");

        tender.status = TenderStatus.Canceled;
        emit TenderCanceled(_tenderId);
    }

    // --- View Functions ---

    function getBidsCount(uint256 _tenderId) external view returns (uint256) {
        return tenderBidders[_tenderId].length;
    }

    function getBidDetails(uint256 _tenderId, address _bidder) external view returns (bool revealed, uint256 amount) {
        Bid memory bid = bids[_tenderId][_bidder];
        if (bid.isRevealed) {
            return (true, bid.revealedAmount);
        }
        return (false, 0);
    }
    
    function getCompanyProfile(address _company) external view returns (CompanyProfile memory) {
        return companies[_company];
    }
}
