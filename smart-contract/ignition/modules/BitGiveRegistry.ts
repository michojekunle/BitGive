// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BitGiveRegistryModule = buildModule("BitGiveRegistryModule", (m) => {

  const BitGiveRegistry = m.contract("BitGiveRegistry");

  return { BitGiveRegistry };
});

export default BitGiveRegistryModule;
