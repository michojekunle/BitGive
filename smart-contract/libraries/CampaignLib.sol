// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ICampaignStructs.sol";

library CampaignLib {
    using CampaignLib for CampaignStructs.CampaignData;

    function initCampaign(
        CampaignStructs.CampaignData storage data,
        CampaignStructs.CampaignInit memory input,
        address _registry
    ) internal {
        data.id = input.id;
        data.owner = input.owner;
        data.name = input.name;
        data.description = input.description;
        data.story = input.story;
        data.goal = input.goal;
        data.deadline = block.timestamp + input.duration;
        data.imageURI = input.imageURI;
        data.registry = _registry;
        data.isActive = true;
        data.raisedAmount = 0;
        for (uint256 i = 0; i < input.impacts.length; i++) {
            data.impacts.push(input.impacts[i]);
        }
    }
}
