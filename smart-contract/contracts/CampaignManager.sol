// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BitGiveRegistry.sol";

/// @title CampaignManager - Combines CampaignFactory and Campaign functionality
contract CampaignManager is AccessControl, ReentrancyGuard {
    BitGiveRegistry public immutable registry;
    uint256 private campaignIdCounter;

    struct CampaignInfo {
        uint256 id;
        address owner;
        string name;
        string description;
        string story;
        uint256 goal;
        uint256 raisedAmount;
        uint256 createdAt;
        uint256 duration;
        string[] impacts;
        string imageURI;
        bool isActive;
        bool verified;
        bool featured;
    }

    mapping(uint256 => CampaignInfo) private campaigns;
    mapping(address => uint256[]) private ownerCampaigns;
    uint256[] private featuredCampaigns;
    uint256[] private verifiedCampaigns;

    error InvalidRegistry();
    error EmptyName();
    error InvalidGoal();
    error InvalidDuration();
    error InsufficientFee();
    error CampaignNotExist();
    error CampaignNotVerified();
    error NotOwner();
    error NotVerifier();
    error InactiveCampaign();
    error PlatformPaused();
    error CampaignEnded();
    error ZeroAmount();
    error FeeTransferFailed();
    error WithdrawFailed();
    error InsufficientFunds();

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed owner,
        string name,
        uint256 goal,
        uint256 duration
    );
    event CampaignVerified(uint256 indexed campaignId, bool verified);
    event CampaignFeatured(uint256 indexed campaignId, bool featured);
    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 timestamp,
        string nftId
    );
    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed recipient,
        uint256 amount
    );
    event CampaignStatusChanged(uint256 indexed campaignId, bool isActive);

    constructor(address _registryAddress) {
        if (_registryAddress == address(0)) revert InvalidRegistry();
        registry = BitGiveRegistry(payable(_registryAddress));
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createCampaign(
        string memory _name,
        string memory _description,
        string memory _story,
        uint256 _goal,
        uint256 _duration,
        string[] memory _impacts,
        string memory _imageURI
    ) external nonReentrant returns (uint256) {
        _requirePlatformActive();
        if (bytes(_name).length == 0) revert EmptyName();
        if (_goal == 0) revert InvalidGoal();
        if (_duration < 7 || _duration > 90) revert InvalidDuration();

        uint256 campaignId = campaignIdCounter++;

        campaigns[campaignId] = CampaignInfo({
            id: campaignId,
            owner: msg.sender,
            name: _name,
            description: _description,
            story: _story,
            goal: _goal,
            raisedAmount: 0,
            createdAt: block.timestamp,
            duration: _duration,
            impacts: _impacts,
            imageURI: _imageURI,
            isActive: true,
            verified: false,
            featured: false
        });

        ownerCampaigns[msg.sender].push(campaignId);

        emit CampaignCreated(campaignId, msg.sender, _name, _goal, _duration);
        return campaignId;
    }

    function donate(
        uint256 _campaignId,
        string memory _nftId
    ) external payable nonReentrant {
        CampaignInfo storage campaign = _getCampaign(_campaignId);
        _requireActiveCampaign(campaign);

        if (msg.value == 0) revert ZeroAmount();

        campaign.raisedAmount += msg.value;

        emit DonationReceived(
            _campaignId,
            msg.sender,
            msg.value,
            block.timestamp,
            _nftId
        );
    }

    // fix to withdraw all campaign funds
    function withdrawFunds(
        uint256 _campaignId,
        uint256 _amount
    ) external nonReentrant {
        CampaignInfo storage campaign = _getCampaign(_campaignId);
        _onlyOwner(campaign);

        if (_amount > address(this).balance) revert InsufficientFunds();

        (bool sent, ) = payable(campaign.owner).call{value: _amount}("");
        if (!sent) revert WithdrawFailed();

        emit FundsWithdrawn(_campaignId, campaign.owner, _amount);
    }

    function verifyCampaign(uint256 _campaignId, bool _verified) external {
        _requireVerifier();
        CampaignInfo storage campaign = _getCampaign(_campaignId);

        campaign.verified = _verified;
        _updateArray(_verified, verifiedCampaigns, _campaignId);

        emit CampaignVerified(_campaignId, _verified);
    }

    function setFeaturedCampaign(uint256 _campaignId, bool _featured) external {
        _requireVerifier();
        CampaignInfo storage campaign = _getCampaign(_campaignId);

        if (!campaign.verified) revert CampaignNotVerified();

        campaign.featured = _featured;
        _updateArray(_featured, featuredCampaigns, _campaignId);

        emit CampaignFeatured(_campaignId, _featured);
    }

    function setActive(uint256 _campaignId, bool _isActive) external {
        CampaignInfo storage campaign = _getCampaign(_campaignId);
        _requireVerifier();

        campaign.isActive = _isActive;
        emit CampaignStatusChanged(_campaignId, _isActive);
    }

    function getCampaignInfo(
        uint256 _campaignId
    ) external view returns (CampaignInfo memory) {
        return _getCampaign(_campaignId);
    }

    function getAllCampaigns() external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](campaignIdCounter);
        for (uint256 i; i < campaignIdCounter; ++i) {
            result[i] = i;
        }
        return result;
    }

    function getVerifiedCampaigns() external view returns (uint256[] memory) {
        return verifiedCampaigns;
    }

    function getFeaturedCampaigns() external view returns (uint256[] memory) {
        return featuredCampaigns;
    }

    function getCampaignsByOwner(
        address _owner
    ) external view returns (uint256[] memory) {
        return ownerCampaigns[_owner];
    }

    function hasEnded(uint256 _campaignId) external view returns (bool) {
        CampaignInfo memory campaign = _getCampaign(_campaignId);
        return
            block.timestamp >=
            campaign.createdAt + (campaign.duration * 1 days);
    }

    function goalReached(uint256 _campaignId) external view returns (bool) {
        CampaignInfo memory campaign = _getCampaign(_campaignId);
        return campaign.raisedAmount >= campaign.goal;
    }

    function _getCampaign(
        uint256 _campaignId
    ) private view returns (CampaignInfo storage) {
        if (_campaignId >= campaignIdCounter) revert CampaignNotExist();
        return campaigns[_campaignId];
    }

    function _requireVerifier() private view {
        if (
            !registry.hasRole(keccak256("VERIFIER_ROLE"), msg.sender) &&
            !registry.hasRole(keccak256("ADMIN_ROLE"), msg.sender)
        ) revert NotVerifier();
    }

    function _requirePlatformActive() private view {
        if (!registry.isActive()) revert PlatformPaused();
    }

    function _requireActiveCampaign(
        CampaignInfo storage campaign
    ) private view {
        if (!campaign.isActive) revert InactiveCampaign();
        if (!registry.isActive()) revert PlatformPaused();
        if (
            block.timestamp >= campaign.createdAt + (campaign.duration * 1 days)
        ) revert CampaignEnded();
    }

    function _onlyOwner(CampaignInfo storage campaign) private view {
        if (msg.sender != campaign.owner) revert NotOwner();
    }

    function _updateArray(bool add, uint256[] storage arr, uint256 id) private {
        if (add) {
            for (uint256 i; i < arr.length; ++i) {
                if (arr[i] == id) return;
            }
            arr.push(id);
        } else {
            for (uint256 i; i < arr.length; ++i) {
                if (arr[i] == id) {
                    arr[i] = arr[arr.length - 1];
                    arr.pop();
                    break;
                }
            }
        }
    }

    receive() external payable {}
}
