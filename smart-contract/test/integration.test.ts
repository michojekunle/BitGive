import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  BitGiveRegistry,
  CampaignManager,
  DonationManager,
  NFTReward,
} from "../typechain-types";
import { deployContracts, createCampaign } from "./helpers";

describe("BitGive Integration Tests", function () {
  let registry: BitGiveRegistry;
  let campaignManager: CampaignManager;
  let donationManager: DonationManager;
  let nftReward: NFTReward;
  let campaign: CampaignManager.CampaignInfoStruct;
  let owner: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;
  let campaignOwner: HardhatEthersSigner;
  let donor: HardhatEthersSigner;
  let campaignId: number;
  const tokenURI = 'https://ipfs:23rnrfioerjoiorjndfioriojfjofr';

  beforeEach(async function () {
    [owner, verifier, campaignOwner, donor] = await ethers.getSigners();

    const contracts = await deployContracts();
    registry = contracts.registry;
    campaignManager = contracts.campaignManager;
    donationManager = contracts.donationManager;
    nftReward = contracts.nftReward;

    // Add verifier role
    await registry.addVerifier(verifier.address);

    // Create a campaign
    campaign = await createCampaign(campaignManager, campaignOwner);
    campaignId = 0; // First campaign has ID 0

    // Verify and activate the campaign
    await campaignManager.connect(verifier).verifyCampaign(campaignId, true);
    await campaignManager.connect(verifier).setActive(campaignId, true);
  });

  describe("End-to-End Donation Flow", function () {
    it("Should process donation through donation manager and mint NFT", async function () {
      const donationAmount = ethers.parseEther("0.01"); // Gold tier

      // Process donation
      await expect(
        donationManager
          .connect(donor)
          .processDonation(campaignId, tokenURI, { value: donationAmount })
      )
        .to.emit(donationManager, "DonationProcessed")
        .withArgs(
          0,
          donor.address,
          campaignId,
          donationAmount,
          'Gold Donor #1',
          "Gold"
        );

      // Check NFT was minted
      expect(await nftReward.balanceOf(donor.address)).to.equal(1);

      const campaign = await campaignManager.getCampaignInfo(campaignId);

      // Check campaign received funds
      expect(campaign.raisedAmount).to.equal(donationAmount);

      // Check donation records in donation manager
      const donationRecord = await donationManager.donations(0);
      expect(donationRecord.donor).to.equal(donor.address);
      expect(donationRecord.campaignId).to.equal(campaignId);
      expect(donationRecord.amount).to.equal(donationAmount);
      expect(donationRecord.tier).to.equal("Gold");

      // Check NFT metadata
      const tokenId = 0;
      const metadata = await nftReward.getNFTMetadata(tokenId);
      expect(metadata.tier).to.equal("Gold");
      expect(metadata.campaignId).to.equal(campaignId);
    });

    it("Should handle multiple donations from different donors", async function () {
      // First donation - Gold tier
      await donationManager.connect(donor).processDonation(campaignId, tokenURI, {
        value: ethers.parseEther("0.01"),
      });

      // Second donation - Silver tier from a different donor
      const donor2 = (await ethers.getSigners())[4];
      await donationManager.connect(donor2).processDonation(campaignId, tokenURI, {
        value: ethers.parseEther("0.005"),
      });

      // Check NFT balances
      expect(await nftReward.balanceOf(donor.address)).to.equal(1);
      expect(await nftReward.balanceOf(donor2.address)).to.equal(1);

      // Check tier counters
      expect(await nftReward.tierCounter("Gold")).to.equal(1);
      expect(await nftReward.tierCounter("Silver")).to.equal(1);

      // Check donation counts
      expect(await donationManager.getDonationCount()).to.equal(2);

      // Check campaign raised amount
      const donation1 = ethers.parseEther("0.01");
      const donation2 = ethers.parseEther("0.005");

      const expectedRaised =
        donation1 + donation2;

      const campaign = await campaignManager.getCampaignInfo(campaignId);

      expect(campaign.raisedAmount).to.equal(expectedRaised);
    });
  });

  describe("Campaign Lifecycle", function () {
    it("Should handle the full campaign lifecycle", async function () {
      // 1. Create campaign
      const campaign2 = await createCampaign(
        campaignManager,
        campaignOwner,
        "Lifecycle Campaign",
        "Test Description",
        "Test Long Description",
        ethers.parseEther("2").toString(),
        30,
        ["Impact 1", "Impact 2"],
        "https://example.com/image.jpg"
      );

      // 2. Verify campaign
      await campaignManager.connect(verifier).verifyCampaign(campaign2.id, true);

      // 3. Activate campaign
      await campaignManager.connect(verifier).setActive(campaign2.id, true);

      // 4. Feature campaign
      await campaignManager
        .connect(verifier)
        .setFeaturedCampaign(campaign2.id, true);

      // 5. Make donations
      await donationManager.connect(donor).processDonation(campaign2.id, tokenURI, {
        value: ethers.parseEther("0.5"),
      });

      // 7. Withdraw funds
      await campaignManager
        .connect(campaignOwner)
        .withdrawFunds(campaign2.id, BigInt(campaign2.raisedAmount) / BigInt(2));

      const campaign2Updated = await campaignManager.getCampaignInfo(campaign2.id);

      // 8. Check campaign status
      expect(campaign2Updated.isActive).to.be.true;
      expect(campaign2Updated.verified).to.be.true;
      expect(campaign2Updated.featured).to.be.true;

      // 9. Check campaign details
      expect(campaign2.description).to.equal("Test Description");
      expect(campaign2.story).to.equal("Test Long Description");

      // 10. Check impacts
      expect(campaign2.impacts.length).to.equal(2);
      expect(campaign2.impacts[1]).to.equal("Impact 2");
    });
  });

  describe("Platform Management", function () {
    it("Should handle platform pausing", async function () {
      // Pause platform
      await registry.setPaused(true);
      expect(await registry.isActive()).to.be.false;

      // Try to make a donation
      await expect(
        donationManager.connect(donor).processDonation(campaignId, tokenURI, {
          value: ethers.parseEther("0.01"),
        })
      ).to.be.revertedWithCustomError(campaignManager, "PlatformPaused()");

      // Try to create a campaign
      await expect(
        createCampaign(campaignManager, campaignOwner)
      ).to.be.revertedWithCustomError(campaignManager, "PlatformPaused()");

      // Unpause platform
      await registry.setPaused(false);
      expect(await registry.isActive()).to.be.true;

      // Now donation should work
      await expect(
        donationManager.connect(donor).processDonation(campaignId, tokenURI, {
          value: ethers.parseEther("0.01"),
        })
      ).to.not.be.reverted;
    });
  });
});
