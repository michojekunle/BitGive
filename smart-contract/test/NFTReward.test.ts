import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { BitGiveRegistry, NFTReward } from "../typechain-types";
import { deployContracts, ROLES } from "./helpers";

describe("NFTReward", function () {
  let registry: BitGiveRegistry;
  let nftReward: NFTReward;
  let owner: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let donationManager: HardhatEthersSigner;
  let recipient1: HardhatEthersSigner;
  let recipient2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, admin, donationManager, recipient1, recipient2] =
      await ethers.getSigners();

    const contracts = await deployContracts();
    registry = contracts.registry;
    nftReward = contracts.nftReward;

    // Set donation manager in registry for testing
    await registry.setDonationManagerAddress(donationManager.address);
  });

  describe("Deployment", function () {
    it("Should set the right registry address", async function () {
      expect(await nftReward.registry()).to.equal(registry.getAddress());
    });

    it("Should set the right name and symbol", async function () {
      expect(await nftReward.name()).to.equal("BitGive Donor NFT");
      expect(await nftReward.symbol()).to.equal("BGIVE");
    });

    it("Should set the default base URI", async function () {
      expect(await nftReward.baseURI()).to.equal("https://bitgive.io/api/nft/");
    });

    it("Should grant minter role to owner", async function () {
      expect(await nftReward.hasRole(ROLES.MINTER_ROLE, owner.address)).to.be
        .true;
    });
  });

  describe("NFT Minting", function () {
    it("Should allow minter to mint NFT", async function () {
      const tx = await nftReward
        .connect(owner)
        .mintNFT(recipient1.address, "Gold", "Test Campaign", 0);

      const receipt = await tx.wait();
      const event = (receipt as any)?.events?.find((e: any) => e.event === "NFTMinted");
      expect(event).to.not.be.undefined;

      const tokenId = event?.args?.tokenId;

      // Check NFT ownership
      expect(await nftReward.ownerOf(tokenId)).to.equal(recipient1.address);
      expect(await nftReward.balanceOf(recipient1.address)).to.equal(1);

      // Check NFT metadata
      const metadata = await nftReward.getNFTMetadata(tokenId);
      expect(metadata.tokenId).to.equal(tokenId);
      expect(metadata.tier).to.equal("Gold");
      expect(metadata.campaignName).to.equal("Test Campaign");
      expect(metadata.campaignId).to.equal(0);

      // Check token URI
      const tokenURI = await nftReward.tokenURI(tokenId);
      expect(tokenURI).to.include("https://bitgive.io/api/nft/");
      expect(tokenURI).to.include("tier=Gold");
      expect(tokenURI).to.include("campaign=0");

      // Check tier counter
      expect(await nftReward.tierCounter("Gold")).to.equal(1);

      // Check owner tokens
      const ownerTokens = await nftReward.getTokensByOwner(recipient1.address);
      expect(ownerTokens.length).to.equal(1);
      expect(ownerTokens[0]).to.equal(tokenId);
    });

    it("Should allow donation manager to mint NFT", async function () {
      await expect(
        nftReward
          .connect(donationManager)
          .mintNFT(recipient1.address, "Silver", "Test Campaign", 0)
      ).to.not.be.reverted;
    });

    it("Should not allow non-minter to mint NFT", async function () {
      await expect(
        nftReward
          .connect(recipient2)
          .mintNFT(recipient1.address, "Gold", "Test Campaign", 0)
      ).to.be.revertedWith("Caller is not a minter");
    });

    it("Should mint multiple NFTs with correct tier counters", async function () {
      // Mint first Gold NFT
      await nftReward
        .connect(owner)
        .mintNFT(recipient1.address, "Gold", "Test Campaign", 0);

      // Mint second Gold NFT
      await nftReward
        .connect(owner)
        .mintNFT(recipient2.address, "Gold", "Test Campaign", 0);

      // Mint Silver NFT
      await nftReward
        .connect(owner)
        .mintNFT(recipient1.address, "Silver", "Test Campaign", 0);

      // Check tier counters
      expect(await nftReward.tierCounter("Gold")).to.equal(2);
      expect(await nftReward.tierCounter("Silver")).to.equal(1);

      // Check total NFTs
      expect(await nftReward.getTotalNFTs()).to.equal(3);

      // Check recipient1 tokens
      const recipient1Tokens = await nftReward.getTokensByOwner(
        recipient1.address
      );
      expect(recipient1Tokens.length).to.equal(2);

      // Check recipient2 tokens
      const recipient2Tokens = await nftReward.getTokensByOwner(
        recipient2.address
      );
      expect(recipient2Tokens.length).to.equal(1);
    });

    it("Should return NFT ID in correct format", async function () {
      const nftId1 = await nftReward
        .connect(owner)
        .mintNFT(recipient1.address, "Gold", "Test Campaign", 0);

      expect(nftId1).to.equal("Gold Donor #1");

      // Actually mint the NFT
      await nftReward
        .connect(owner)
        .mintNFT(recipient1.address, "Gold", "Test Campaign", 0);

      // Check second NFT ID
      const nftId2 = await nftReward
        .connect(owner)
        .mintNFT(recipient2.address, "Gold", "Test Campaign", 0);

      expect(nftId2).to.equal("Gold Donor #2");
    });
  });

  describe("NFT Management", function () {
    beforeEach(async function () {
      // Mint some NFTs
      await nftReward
        .connect(owner)
        .mintNFT(recipient1.address, "Gold", "Campaign 1", 0);

      await nftReward
        .connect(owner)
        .mintNFT(recipient1.address, "Silver", "Campaign 2", 1);

      await nftReward
        .connect(owner)
        .mintNFT(recipient2.address, "Bronze", "Campaign 1", 0);
    });

    it("Should allow admin to update base URI", async function () {
      const newBaseURI = "https://new-api.bitgive.io/nft/";

      await nftReward.connect(owner).setBaseURI(newBaseURI);
      expect(await nftReward.baseURI()).to.equal(newBaseURI);

      // Check token URI is updated
      const tokenURI = await nftReward.tokenURI(0);
      expect(tokenURI).to.include(newBaseURI);
    });

    it("Should get NFT metadata", async function () {
      const metadata = await nftReward.getNFTMetadata(0);
      expect(metadata.tier).to.equal("Gold");
      expect(metadata.campaignName).to.equal("Campaign 1");
      expect(metadata.campaignId).to.equal(0);
    });

    it("Should get tokens by owner", async function () {
      const recipient1Tokens = await nftReward.getTokensByOwner(
        recipient1.address
      );
      expect(recipient1Tokens.length).to.equal(2);
      expect(recipient1Tokens[0]).to.equal(0);
      expect(recipient1Tokens[1]).to.equal(1);

      const recipient2Tokens = await nftReward.getTokensByOwner(
        recipient2.address
      );
      expect(recipient2Tokens.length).to.equal(1);
      expect(recipient2Tokens[0]).to.equal(2);
    });

    it("Should get tier count", async function () {
      expect(await nftReward.getTierCount("Gold")).to.equal(1);
      expect(await nftReward.getTierCount("Silver")).to.equal(1);
      expect(await nftReward.getTierCount("Bronze")).to.equal(1);
    });

    it("Should get total NFTs", async function () {
      expect(await nftReward.getTotalNFTs()).to.equal(3);
    });

    it("Should revert when querying non-existent token", async function () {
      await expect(nftReward.getNFTMetadata(99)).to.be.revertedWith(
        "Token does not exist"
      );
    });
  });
});
