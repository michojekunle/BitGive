import campaignManagerAbi from "../abi/campaign-manager.json";
import donationManagerAbi from "../abi/donation-manager.json";
import nftRewardAbi from "../abi/nft-reward.json";
import registryAbi from "../abi/registry.json";


export const contracts = {
    campaignManager: {
        address: "0x20cA2D979F717d87ddcf6ACe153a2C4fcC70A6e0",
        abi: campaignManagerAbi,
    },
    donationManager: {
        address: "0x7107A0A1b0ead52B573262dbd582e96011DF4DcB",
        abi: donationManagerAbi,
    },
    nftReward: {
        address: "0xD0682636229b1c2Aee113c2614A9c0Ab25518B88",
        abi: nftRewardAbi,
    },
    registry: {
        address: "0x8DB607b6a6BEdF7cab97A641aF05CdA5c2558334",
        abi: registryAbi,
    }
}