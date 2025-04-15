// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CampaignManagerModule = buildModule("CampaignManagerModule", (m) => {
  const registryAddress = "0x8DB607b6a6BEdF7cab97A641aF05CdA5c2558334";
  
  const CampaignManager = m.contract("CampaignManager", [registryAddress]);

  return { CampaignManager };
});

export default CampaignManagerModule;
