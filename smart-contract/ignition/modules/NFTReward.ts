// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTRewardModule = buildModule("NFTRewardModule", (m) => {
  const registryAddress = "0x8DB607b6a6BEdF7cab97A641aF05CdA5c2558334";
  
  const NFTReward = m.contract("NFTReward", [registryAddress]);

  return { NFTReward };
});

export default NFTRewardModule;
