// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library CampaignStructs {
    struct CampaignData {
        uint256 id;
        address owner;
        string name;
        string description;
        string story;
        uint256 goal;
        uint256 raisedAmount;
        uint256 deadline;
        uint256 duration;
        uint256 createdAt;
        string[] impacts;
        string imageURI;
        address registry;
        bool isActive;
    }

    struct CampaignInit {
        uint256 id;
        address owner;
        bool isActive;
        string name;
        string description;
        string story;
        uint256 goal;
        uint256 raisedAmount;
        uint256 createdAt;
        uint256 duration;
        string[] impacts;
        string imageURI;
    }
}
