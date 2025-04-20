// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BitGiveRegistry.sol";
import "./NFTReward.sol";
import "./CampaignManager.sol";

/**
 * @title DonationManager
 * @dev Manages donations and NFT rewards for the BitGive platform
 */
contract DonationManager is AccessControl, ReentrancyGuard {
    BitGiveRegistry public registry;
    NFTReward public nftReward;
    uint256 private donationIdCounter;

    struct DonationRecord {
        uint256 id;
        address donor;
        address campaignAddress;
        uint256 campaignId;
        uint256 amount;
        uint256 timestamp;
        string nftId;
        string tier;
    }

    mapping(uint256 => DonationRecord) public donations;
    mapping(address => uint256[]) public donorDonations;
    mapping(uint256 => uint256[]) public campaignDonations;

    event DonationProcessed(
        uint256 indexed donationId,
        address indexed donor,
        uint256 indexed campaignId,
        uint256 amount,
        string nftId,
        string tier
    );

    // Custom errors
    error InvalidRegistryAddress();
    error CampaignManagerNotSet();
    error CampaignNotVerified();
    error CampaignNotActive();
    error DonationAmountZero();
    error DonationFailed();
    error DonationDoesNotExist();
    error PlatformPaused();

    constructor(address _registryAddress) {
        if (_registryAddress == address(0)) revert InvalidRegistryAddress();
        registry = BitGiveRegistry(payable(_registryAddress));
        nftReward = NFTReward(registry.nftRewardAddress());
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Sets the NFT reward contract address
     */
    function setNFTRewardAddress() external onlyRole(DEFAULT_ADMIN_ROLE) {
        nftReward = NFTReward(registry.nftRewardAddress());
    }

    /**
     * @dev Processes a donation and mints an NFT reward
     * @param _campaignId ID of the campaign to donate to
     * @return donationId ID of the processed donation
     */
    function processDonation(
        uint256 _campaignId,
        string memory _tokenURI
    ) external payable nonReentrant returns (uint256) {
        _checkPlatformActive();
        if (msg.value == 0) revert DonationAmountZero();

        // Get campaign address from factory
        address CampaignManagerAddress = registry.campaignManagerAddress();
        if (CampaignManagerAddress == address(0))
            revert CampaignManagerNotSet();

        CampaignManager.CampaignInfo memory campaignInfo = CampaignManager(
            payable(CampaignManagerAddress)
        ).getCampaignInfo(_campaignId);

        if (!campaignInfo.verified) revert CampaignNotVerified();
        if (!campaignInfo.isActive) revert CampaignNotActive();

        // Determine NFT tier based on donation amount
        string memory tier;
        if (msg.value >= 0.01 ether) {
            tier = "Gold";
        } else if (msg.value >= 0.005 ether) {
            tier = "Silver";
        } else if (msg.value >= 0.001 ether) {
            tier = "Bronze";
        } else {
            tier = "None";
        }

        // Mint NFT if eligible
        string memory nftId = "";

        if (
            keccak256(abi.encodePacked(tier)) !=
            keccak256(abi.encodePacked("None"))
        ) {
            nftId = nftReward.mintNFT(
                msg.sender,
                tier,
                campaignInfo.name,
                _campaignId,
                _tokenURI
            );
        }

        // Forward donation to campaign
        (bool success, ) = payable(CampaignManagerAddress).call{
            value: msg.value
        }(
            abi.encodeWithSignature(
                "donate(uint256,string)",
                campaignInfo.id,
                nftId
            )
        );

        if (!success) revert DonationFailed();

        // Record donation
        uint256 donationId = donationIdCounter;
        donationIdCounter++;

        donations[donationId] = DonationRecord({
            id: donationId,
            donor: msg.sender,
            campaignAddress: campaignInfo.owner,
            campaignId: _campaignId,
            amount: msg.value,
            timestamp: block.timestamp,
            nftId: nftId,
            tier: tier
        });

        donorDonations[msg.sender].push(donationId);
        campaignDonations[_campaignId].push(donationId);

        emit DonationProcessed(
            donationId,
            msg.sender,
            _campaignId,
            msg.value,
            nftId,
            tier
        );

        return donationId;
    }

    /**
     * @dev Gets all donations by a donor
     * @param _donor Donor address
     * @return Array of donation IDs by the donor
     */
    function getDonationsByDonor(
        address _donor
    ) external view returns (uint256[] memory) {
        return donorDonations[_donor];
    }

    /**
     * @dev Gets all donations for a campaign
     * @param _campaignId Campaign ID
     * @return Array of donation IDs for the campaign
     */
    function getDonationsByCampaign(
        uint256 _campaignId
    ) external view returns (uint256[] memory) {
        return campaignDonations[_campaignId];
    }

    /**
     * @dev Gets donation details
     * @param _donationId Donation ID
     * @return Donation record
     */
    function getDonationDetails(
        uint256 _donationId
    ) external view returns (DonationRecord memory) {
        if (_donationId >= donationIdCounter) revert DonationDoesNotExist();
        return donations[_donationId];
    }

    /**
     * @dev Gets the total number of donations
     * @return Total number of donations
     */
    function getDonationCount() external view returns (uint256) {
        return donationIdCounter;
    }

    /**
     * @dev Gets recent donations
     * @param _count Number of recent donations to retrieve
     * @return Array of recent donation records
     */
    function getRecentDonations(
        uint256 _count
    ) external view returns (DonationRecord[] memory) {
        uint256 count = donationIdCounter;
        if (_count > count) {
            _count = count;
        }

        DonationRecord[] memory result = new DonationRecord[](_count);
        for (uint256 i = 0; i < _count; i++) {
            result[i] = donations[count - i - 1];
        }

        return result;
    }

    // Private functions to replace modifiers
    function _checkPlatformActive() private view {
        if (!registry.isActive()) revert PlatformPaused();
    }
}
