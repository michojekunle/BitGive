import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { 
  BitGiveRegistry, 
  CampaignManager, 
  DonationManager, 
  NFTReward
} from "../typechain-types";

export interface DeployedContracts {
  registry: BitGiveRegistry;
  campaignManager: CampaignManager;
  nftReward: NFTReward;
  donationManager: DonationManager;
}

export async function deployContracts(): Promise<DeployedContracts> {
  // Deploy BitGiveRegistry
  const BitGiveRegistryFactory = await ethers.getContractFactory("BitGiveRegistry");
  const registry = await BitGiveRegistryFactory.deploy();

  // Deploy CampaignManager
  const CampaignManagerFactory = await ethers.getContractFactory("CampaignManager");
  const campaignManager = await CampaignManagerFactory.deploy(await registry.getAddress());

  // Deploy NFTReward
  const NFTRewardFactory = await ethers.getContractFactory("NFTReward");
  const nftReward = await NFTRewardFactory.deploy(await registry.getAddress());

  // Deploy DonationManager
  const DonationManagerFactory = await ethers.getContractFactory("DonationManager");
  const donationManager = await DonationManagerFactory.deploy(await registry.getAddress());

  // Set contract addresses in registry
  await registry.setCampaignManagerAddress(await campaignManager.getAddress());
  await registry.setNftRewardAddress(await nftReward.getAddress());
  await registry.setDonationManagerAddress(await donationManager.getAddress());

  // Set NFT reward address in donation manager
  await donationManager.setNFTRewardAddress();

  return {
    registry,
    campaignManager,
    nftReward,
    donationManager
  };
}

export async function createCampaign(
  campaignManager: CampaignManager,
  owner: HardhatEthersSigner,
  name: string = "Test Campaign",
  description: string = "Test Description",
  story: string = "Test Long Description",
  goal: string = ethers.parseEther("1").toString(),
  duration: number = 30,
  impacts: string[] = ["Impact 1", "Impact 2"],
  imageURI: string = "https://example.com/image.jpg"
): Promise<CampaignManager.CampaignInfoStruct> {
  const tx = await campaignManager.connect(owner).createCampaign(
    name,
    description,
    story,
    goal,
    duration,
    impacts,
    imageURI,
  );

  const receipt = await tx.wait();
  const event = receipt?.logs
    .filter((log: any) => log.fragment?.name === "CampaignCreated")
    .map((log: any) => campaignManager.interface.parseLog(log))[0];

  const campaignId = event?.args?.campaignId;    
  const campaign = campaignManager.connect(owner).getCampaignInfo(campaignId);

  return campaign;
}

export async function timeTravel(seconds: number): Promise<void> {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

export const ROLES = {
  DEFAULT_ADMIN_ROLE: ethers.ZeroHash,
  ADMIN_ROLE: ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE")),
  VERIFIER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE")),
  MINTER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"))
};