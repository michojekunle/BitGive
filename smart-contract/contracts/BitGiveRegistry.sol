// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BitGiveRegistry
 * @dev Central registry for the BitGive platform that manages roles and platform settings
 */
contract BitGiveRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    address public campaignFactoryAddress;
    address public donationManagerAddress;
    address public nftRewardAddress;

    uint256 public platformFeePercentage; // In basis points (1/100 of a percent)
    uint256 public campaignCreationFee; // In wei

    bool public paused;

    event ContractAddressUpdated(
        string contractName,
        address indexed newAddress
    );
    event PlatformFeeUpdated(uint256 newFeePercentage);
    event CampaignCreationFeeUpdated(uint256 newFee);
    event PlatformPaused(bool paused);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        platformFeePercentage = 250; // 2.5% default fee
        campaignCreationFee = 0.001 ether; // 0.001 RBTC default fee
        paused = false;
    }

    /**
     * @dev Sets the address of the campaign factory contract
     * @param _campaignFactoryAddress Address of the campaign factory contract
     */
    function setCampaignFactoryAddress(
        address _campaignFactoryAddress
    ) external onlyRole(ADMIN_ROLE) {
        require(_campaignFactoryAddress != address(0), "Invalid address");
        campaignFactoryAddress = _campaignFactoryAddress;
        emit ContractAddressUpdated("CampaignFactory", _campaignFactoryAddress);
    }

    /**
     * @dev Sets the address of the donation manager contract
     * @param _donationManagerAddress Address of the donation manager contract
     */
    function setDonationManagerAddress(
        address _donationManagerAddress
    ) external onlyRole(ADMIN_ROLE) {
        require(_donationManagerAddress != address(0), "Invalid address");
        donationManagerAddress = _donationManagerAddress;
        emit ContractAddressUpdated("DonationManager", _donationManagerAddress);
    }

    /**
     * @dev Sets the address of the NFT reward contract
     * @param _nftRewardAddress Address of the NFT reward contract
     */
    function setNftRewardAddress(
        address _nftRewardAddress
    ) external onlyRole(ADMIN_ROLE) {
        require(_nftRewardAddress != address(0), "Invalid address");
        nftRewardAddress = _nftRewardAddress;
        emit ContractAddressUpdated("NFTReward", _nftRewardAddress);
    }

    /**
     * @dev Updates the platform fee percentage
     * @param _platformFeePercentage New platform fee percentage in basis points
     */
    function updatePlatformFee(
        uint256 _platformFeePercentage
    ) external onlyRole(ADMIN_ROLE) {
        require(_platformFeePercentage <= 1000, "Fee cannot exceed 10%");
        platformFeePercentage = _platformFeePercentage;
        emit PlatformFeeUpdated(_platformFeePercentage);
    }

    /**
     * @dev Updates the campaign creation fee
     * @param _campaignCreationFee New campaign creation fee in wei
     */
    function updateCampaignCreationFee(
        uint256 _campaignCreationFee
    ) external onlyRole(ADMIN_ROLE) {
        campaignCreationFee = _campaignCreationFee;
        emit CampaignCreationFeeUpdated(_campaignCreationFee);
    }

    /**
     * @dev Pauses or unpauses the platform
     * @param _paused New paused state
     */
    function setPaused(bool _paused) external onlyRole(ADMIN_ROLE) {
        paused = _paused;
        emit PlatformPaused(_paused);
    }

    /**
     * @dev Adds a verifier role to an address
     * @param _verifier Address to grant verifier role
     */
    function addVerifier(address _verifier) external onlyRole(ADMIN_ROLE) {
        grantRole(VERIFIER_ROLE, _verifier);
    }

    /**
     * @dev Removes a verifier role from an address
     * @param _verifier Address to revoke verifier role
     */
    function removeVerifier(address _verifier) external onlyRole(ADMIN_ROLE) {
        revokeRole(VERIFIER_ROLE, _verifier);
    }

    /**
     * @dev Checks if the platform is active
     */
    function isActive() public view returns (bool) {
        return !paused;
    }

    /**
     * @dev Calculates the platform fee for a given amount
     * @param _amount Amount to calculate fee for
     * @return Fee amount
     */
    function calculatePlatformFee(
        uint256 _amount
    ) public view returns (uint256) {
        return (_amount * platformFeePercentage) / 10000;
    }

    /**
     * @dev Receive function to accept platform fees
     */
    receive() external payable {}
}
