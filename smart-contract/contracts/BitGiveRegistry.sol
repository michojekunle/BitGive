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

    address public campaignManagerAddress;
    address public donationManagerAddress;

    address public nftRewardAddress;
    bool public paused;

    event ContractAddressUpdated(
        string contractName,
        address indexed newAddress
    );
    event PlatformPaused(bool paused);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        paused = false;
    }

    /**
     * @dev Sets the address of the campaign factory contract
     * @param _campaignManagerAddress Address of the campaign factory contract
     */
    function setCampaignManagerAddress(
        address _campaignManagerAddress
    ) external onlyRole(ADMIN_ROLE) {
        require(_campaignManagerAddress != address(0), "Invalid address");
        campaignManagerAddress = _campaignManagerAddress;
        emit ContractAddressUpdated("CampaignFactory", _campaignManagerAddress);
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
}
