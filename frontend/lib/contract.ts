import campaignManagerAbi from "../abi/campaign-manager.json";
import donationManagerAbi from "../abi/donation-manager.json";
import nftRewardAbi from "../abi/nft-reward.json";
import registryAbi from "../abi/registry.json";


export const contracts = {
    campaignManager: {
        address: "0x57A783371456B956cfB7FaC2bAB7478fc98b85E4",
        abi: campaignManagerAbi,
    },
    donationManager: {
        address: "0x0aA1A5c7970FC6716a589da1E861E2DB7f0dbdf2",
        abi: donationManagerAbi,
    },
    nftReward: {
        address: "0x6Be0fC1FA590d4300e9C1Af59f551dFA082464ef",
        abi: nftRewardAbi,
    },
    registry: {
        address: "0x8DB607b6a6BEdF7cab97A641aF05CdA5c2558334",
        abi: registryAbi,
    }
}