import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { 
  BitGiveRegistry, 
  CampaignFactory, 
  Campaign, 
  DonationManager, 
  NFTReward 
} from "../typechain-types";

export interface DeployedContracts {
  registry: BitGiveRegistry;
  campaignFactory: CampaignFactory;
  nftReward: NFTReward;
  donationManager: DonationManager;
}

export async function deployContracts(): Promise<DeployedContracts> {
  // Deploy BitGiveRegistry
  const BitGiveRegistryFactory = await ethers.getContractFactory("BitGiveRegistry");
  const registry = await BitGiveRegistryFactory.deploy();

  // Deploy CampaignFactory
  const CampaignFactoryFactory = await ethers.getContractFactory("CampaignFactory");
  const campaignFactory = await CampaignFactoryFactory.deploy(await registry.getAddress());

  // Deploy NFTReward
  const NFTRewardFactory = await ethers.getContractFactory("NFTReward");
  const nftReward = await NFTRewardFactory.deploy(await registry.getAddress());

  // Deploy DonationManager
  const DonationManagerFactory = await ethers.getContractFactory("DonationManager");
  const donationManager = await DonationManagerFactory.deploy(await registry.getAddress());

  // Set contract addresses in registry
  await registry.setCampaignFactoryAddress(await campaignFactory.getAddress());
  await registry.setNftRewardAddress(await nftReward.getAddress());
  await registry.setDonationManagerAddress(await donationManager.getAddress());

  // Set NFT reward address in donation manager
  await donationManager.setNFTRewardAddress();

  return {
    registry,
    campaignFactory,
    nftReward,
    donationManager
  };
}

export async function createCampaign(
  campaignFactory: CampaignFactory,
  owner: HardhatEthersSigner,
  name: string = "Test Campaign",
  description: string = "Test Description",
  story: string = "Test Long Description",
  goal: string = ethers.parseEther("1").toString(),
  duration: number = 30,
  impacts: string[] = ["Impact 1", "Impact 2"],
  imageURI: string = "https://example.com/image.jpg"
): Promise<Campaign> {
  const registryAddress = await campaignFactory.registry();
  const registry = await ethers.getContractAt("BitGiveRegistry", registryAddress);
  const creationFee = await registry.campaignCreationFee();

  const tx = await campaignFactory.connect(owner).createCampaign(
    name,
    description,
    story,
    goal,
    duration,
    impacts,
    imageURI,
    { value: creationFee }
  );

  const receipt = await tx.wait();
  const event = receipt?.logs
    .filter((log :any) => log.fragment?.name === "CampaignCreated")
    .map((log: any) => campaignFactory.interface.parseLog(log))[0];
    
  const campaignAddress = event?.args.campaignAddress;

  return await ethers.getContractAt("Campaign", campaignAddress) as Campaign;
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