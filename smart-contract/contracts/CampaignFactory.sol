// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BitGiveRegistry.sol";
import "./Campaign.sol";

/// @title CampaignFactory - Optimized for deployment cost and gas
contract CampaignFactory is AccessControl, ReentrancyGuard {
    BitGiveRegistry public immutable registry;
    uint256 private campaignIdCounter;

    struct CampaignInfo {
        uint256 id;
        address campaignAddress;
        address owner;
        string name;
        uint256 goal;
        uint256 createdAt;
        uint256 duration;
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

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed campaignAddress,
        address indexed owner,
        string name,
        uint256 goal,
        uint256 duration
    );
    event CampaignVerified(uint256 indexed campaignId, bool verified);
    event CampaignFeatured(uint256 indexed campaignId, bool featured);

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
    ) external payable nonReentrant returns (uint256) {
        _requirePlatformActive();
        if (bytes(_name).length == 0) revert EmptyName();
        if (_goal == 0) revert InvalidGoal();
        if (_duration < 7 || _duration > 90) revert InvalidDuration();

        uint256 fee = registry.campaignCreationFee();
        if (msg.value < fee) revert InsufficientFee();

        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }

        uint256 campaignId = campaignIdCounter++;

        CampaignStructs.CampaignInit memory input = CampaignStructs
            .CampaignInit({
                id: campaignId,
                owner: msg.sender,
                isActive: true,
                name: _name,
                description: _description,
                story: _story,
                goal: _goal,
                raisedAmount: 0,
                createdAt: block.timestamp,
                duration: _duration,
                impacts: _impacts,
                imageURI: _imageURI
            });

        Campaign newCampaign = new Campaign(input, address(registry));

        campaigns[campaignId] = CampaignInfo({
            id: campaignId,
            campaignAddress: address(newCampaign),
            owner: msg.sender,
            name: _name,
            goal: _goal,
            createdAt: block.timestamp,
            duration: _duration,
            verified: false,
            featured: false
        });

        ownerCampaigns[msg.sender].push(campaignId);

        emit CampaignCreated(
            campaignId,
            address(newCampaign),
            msg.sender,
            _name,
            _goal,
            _duration
        );
        return campaignId;
    }

    function verifyCampaign(uint256 _campaignId, bool _verified) external {
        _requireVerifier();
        if (_campaignId >= campaignIdCounter) revert CampaignNotExist();

        CampaignInfo storage campaign = campaigns[_campaignId];
        campaign.verified = _verified;

        _updateArray(_verified, verifiedCampaigns, _campaignId);
        emit CampaignVerified(_campaignId, _verified);
    }

    function setFeaturedCampaign(uint256 _campaignId, bool _featured) external {
        _requireVerifier();
        if (_campaignId >= campaignIdCounter) revert CampaignNotExist();
        if (!campaigns[_campaignId].verified) revert CampaignNotVerified();

        CampaignInfo storage campaign = campaigns[_campaignId];
        campaign.featured = _featured;

        _updateArray(_featured, featuredCampaigns, _campaignId);
        emit CampaignFeatured(_campaignId, _featured);
    }

    function getAllCampaigns() external view returns (uint256[] memory result) {
        result = new uint256[](campaignIdCounter);
        for (uint256 i; i < campaignIdCounter; ++i) {
            result[i] = i;
        }
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

    function getCampaignInfo(
        uint256 _campaignId
    ) external view returns (CampaignInfo memory) {
        if (_campaignId >= campaignIdCounter) revert CampaignNotExist();
        return campaigns[_campaignId];
    }

    function getCampaignCount() external view returns (uint256) {
        return campaignIdCounter;
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
}
