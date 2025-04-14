// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BitGiveRegistry.sol";
import "../libraries/CampaignLib.sol";
import "../interfaces/ICampaignStructs.sol";
import "../interfaces/IBitGiveRegistry.sol";

error NotOwner();
error NotVerifier();
error InactiveCampaign();
error PlatformPaused();
error CampaignEnded();
error ZeroAmount();
error FeeTransferFailed();
error WithdrawFailed();
error InsufficientFunds();

contract Campaign is ReentrancyGuard {
    using CampaignLib for CampaignStructs.CampaignData;

    CampaignStructs.CampaignData public campaign;

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        string nftId;
    }

    Donation[] private donations;
    mapping(address => uint256) public donorTotalAmount;
    mapping(address => uint256[]) private donorDonations;
    uint256 private donationIdCounter;

    event DonationReceived(
        uint256 indexed donationId,
        address indexed donor,
        uint256 amount,
        uint256 timestamp,
        string nftId
    );

    event FundsWithdrawn(address indexed recipient, uint256 amount);
    event CampaignUpdated(string field, string value);
    event CampaignStatusChanged(bool isActive);

    constructor(CampaignStructs.CampaignInit memory input, address registry) {
        campaign.initCampaign(input, registry);
    }

    function donate(string memory _nftId) external payable nonReentrant {
        _requireActiveCampaign();
        if (msg.value == 0) revert ZeroAmount();

        uint256 fee = IBitGiveRegistry(campaign.registry).calculatePlatformFee(
            msg.value
        );
        uint256 netAmount = msg.value - fee;

        (bool feeSent, ) = payable(address(campaign.registry)).call{value: fee}(
            ""
        );
        if (!feeSent) revert FeeTransferFailed();

        campaign.raisedAmount += netAmount;

        uint256 donationId = donationIdCounter++;
        donations.push(
            Donation(msg.sender, netAmount, block.timestamp, _nftId)
        );
        donorTotalAmount[msg.sender] += netAmount;
        donorDonations[msg.sender].push(donationId);

        emit DonationReceived(
            donationId,
            msg.sender,
            netAmount,
            block.timestamp,
            _nftId
        );
    }

    function withdrawFunds(uint256 _amount) external nonReentrant {
        _onlyOwner();
        if (_amount > address(this).balance) revert InsufficientFunds();

        (bool sent, ) = payable(campaign.owner).call{value: _amount}("");
        if (!sent) revert WithdrawFailed();

        emit FundsWithdrawn(campaign.owner, _amount);
    }

    function setActive(bool _isActive) external {
        _onlyVerifier();
        campaign.isActive = _isActive;
        emit CampaignStatusChanged(_isActive);
    }

    function getAllDonations() external view returns (Donation[] memory) {
        return donations;
    }

    function getDonationsByDonor(
        address _donor
    ) external view returns (uint256[] memory) {
        return donorDonations[_donor];
    }

    function getDonationCount() external view returns (uint256) {
        return donationIdCounter;
    }

    function getImpacts() external view returns (string[] memory) {
        return campaign.impacts;
    }

    function getCampaignDetails()
        external
        view
        returns (
            string memory name,
            string memory description,
            string memory story,
            uint256 goal,
            uint256 raisedAmount,
            uint256 createdAt,
            uint256 duration,
            string memory imageURI,
            bool isActive
        )
    {
        CampaignStructs.CampaignData storage c = campaign;
        return (
            c.name,
            c.description,
            c.story,
            c.goal,
            c.raisedAmount,
            c.createdAt,
            c.duration,
            c.imageURI,
            c.isActive
        );
    }

    function hasEnded() external view returns (bool) {
        return
            block.timestamp >=
            campaign.createdAt + (campaign.duration * 1 days);
    }

    function goalReached() external view returns (bool) {
        return campaign.raisedAmount >= campaign.goal;
    }

    receive() external payable {
        if (
            campaign.isActive &&
            IBitGiveRegistry(campaign.registry).isActive() &&
            block.timestamp < campaign.createdAt + (campaign.duration * 1 days)
        ) {
            uint256 fee = IBitGiveRegistry(campaign.registry)
                .calculatePlatformFee(msg.value);
            uint256 net = msg.value - fee;

            (bool sent, ) = payable(address(campaign.registry)).call{
                value: fee
            }("");
            if (!sent) revert FeeTransferFailed();

            campaign.raisedAmount += net;
        }
    }

    // ------------------------
    // 🛡️ INTERNAL CHECKS
    // ------------------------

    function _onlyOwner() private view {
        if (msg.sender != campaign.owner) revert NotOwner();
    }

    function _onlyVerifier() private view {
        if (
            !IBitGiveRegistry(campaign.registry).hasRole(
                keccak256("VERIFIER_ROLE"),
                msg.sender
            ) &&
            !IBitGiveRegistry(campaign.registry).hasRole(
                keccak256("ADMIN_ROLE"),
                msg.sender
            )
        ) revert NotVerifier();
    }

    function _requireActiveCampaign() private view {
        if (!campaign.isActive) revert InactiveCampaign();
        if (!IBitGiveRegistry(campaign.registry).isActive())
            revert PlatformPaused();
        if (
            block.timestamp >= campaign.createdAt + (campaign.duration * 1 days)
        ) revert CampaignEnded();
    }
}
