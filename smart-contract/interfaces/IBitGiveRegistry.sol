// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/IAccessControl.sol";

interface IBitGiveRegistry is IAccessControl {
    function setCampaignFactoryAddress(
        address _campaignFactoryAddress
    ) external;

    function setDonationManagerAddress(
        address _donationManagerAddress
    ) external;

    function setNftRewardAddress(address _nftRewardAddress) external;

    function updatePlatformFee(uint256 _platformFeePercentage) external;

    function updateCampaignCreationFee(uint256 _campaignCreationFee) external;

    function setPaused(bool _paused) external;

    function addVerifier(address _verifier) external;

    function removeVerifier(address _verifier) external;

    function isActive() external view returns (bool);

    function calculatePlatformFee(
        uint256 _amount
    ) external view returns (uint256);
}
