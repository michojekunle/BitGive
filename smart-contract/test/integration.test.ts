import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  BitGiveRegistry,
  CampaignFactory,
  Campaign,
  DonationManager,
  NFTReward,
} from "../typechain-types";
import { deployContracts, createCampaign } from "./helpers";

describe("BitGive Integration Tests", function () {
  let registry: BitGiveRegistry;
  let campaignFactory: CampaignFactory;
  let donationManager: DonationManager;
  let nftReward: NFTReward;
  let campaign: Campaign;
  let owner: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;
  let campaignOwner: HardhatEthersSigner;
  let donor: HardhatEthersSigner;
  let campaignId: number;

  beforeEach(async function () {
    [owner, verifier, campaignOwner, donor] = await ethers.getSigners();

    const contracts = await deployContracts();
    registry = contracts.registry;
    campaignFactory = contracts.campaignFactory;
    donationManager = contracts.donationManager;
    nftReward = contracts.nftReward;

    // Add verifier role
    await registry.addVerifier(verifier.address);

    // Create a campaign
    campaign = await createCampaign(campaignFactory, campaignOwner);
    campaignId = 0; // First campaign has ID 0

    // Verify and activate the campaign
    await campaignFactory.connect(verifier).verifyCampaign(campaignId, true);
    await campaign.connect(verifier).setActive(true);
  });

  describe("End-to-End Donation Flow", function () {
    it("Should process donation through donation manager and mint NFT", async function () {
      const donationAmount = ethers.parseEther("0.01"); // Gold tier

      // Process donation
      await expect(
        donationManager
          .connect(donor)
          .processDonation(campaignId, { value: donationAmount })
      )
        .to.emit(donationManager, "DonationProcessed")
        .withArgs(
          0,
          donor.address,
          campaignId,
          donationAmount,
          /Gold Donor #1/,
          "Gold"
        );

      // Check NFT was minted
      expect(await nftReward.balanceOf(donor.address)).to.equal(1);

      // Check campaign received funds
      const platformFee = await registry.calculatePlatformFee(donationAmount);
      const campaignAmount = donationAmount - platformFee;
      expect(await campaign.raisedAmount()).to.equal(campaignAmount);

      // Check donation records in donation manager
      const donationRecord = await donationManager.donations(0);
      expect(donationRecord.donor).to.equal(donor.address);
      expect(donationRecord.campaignId).to.equal(campaignId);
      expect(donationRecord.amount).to.equal(donationAmount);
      expect(donationRecord.tier).to.equal("Gold");

      // Check donation records in campaign
      const campaignDonation = await campaign.donations(0);
      expect(campaignDonation.donor).to.equal(donor.address);
      expect(campaignDonation.amount).to.equal(campaignAmount);

      // Check NFT metadata
      const tokenId = 0;
      const metadata = await nftReward.getNFTMetadata(tokenId);
      expect(metadata.tier).to.equal("Gold");
      expect(metadata.campaignId).to.equal(campaignId);
    });

    it("Should handle multiple donations from different donors", async function () {
      // First donation - Gold tier
      await donationManager.connect(donor).processDonation(campaignId, {
        value: ethers.parseEther("0.01"),
      });

      // Second donation - Silver tier from a different donor
      const donor2 = (await ethers.getSigners())[4];
      await donationManager.connect(donor2).processDonation(campaignId, {
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
      expect(await campaign.getDonationCount()).to.equal(2);

      // Check campaign raised amount
      const donation1 = ethers.parseEther("0.01");
      const donation2 = ethers.parseEther("0.005");
      const platformFee1 = await registry.calculatePlatformFee(donation1);
      const platformFee2 = await registry.calculatePlatformFee(donation2);
      const expectedRaised =
        donation1 - platformFee1 + (donation2 - platformFee2);

      expect(await campaign.raisedAmount()).to.equal(expectedRaised);
    });
  });

  describe("Campaign Lifecycle", function () {
    it("Should handle the full campaign lifecycle", async function () {
      // 1. Create campaign
      const campaign2 = await createCampaign(
        campaignFactory,
        campaignOwner,
        "Lifecycle Campaign",
        "Test Description",
        "Test Long Description",
        ethers.parseEther("2").toString(),
        30,
        ["Impact 1", "Impact 2"],
        "https://example.com/image.jpg"
      );
      const campaignId2 = 1; // Second campaign has ID 1

      // 2. Verify campaign
      await campaignFactory.connect(verifier).verifyCampaign(campaignId2, true);

      // 3. Activate campaign
      await campaign2.connect(verifier).setActive(true);

      // 4. Feature campaign
      await campaignFactory
        .connect(verifier)
        .setFeaturedCampaign(campaignId2, true);

      // 5. Make donations
      await donationManager.connect(donor).processDonation(campaignId2, {
        value: ethers.parseEther("0.5"),
      });

      // 6. Update campaign details
      await campaign2
        .connect(campaignOwner)
        .updateDescription("Updated Description", "Updated Long Description");

      await campaign2
        .connect(campaignOwner)
        .updateImpacts([
          "Updated Impact 1",
          "Updated Impact 2",
          "New Impact 3",
        ]);

      // 7. Withdraw funds
      const campaignBalance = await ethers.provider.getBalance(
        campaign2.registry()
      );
      await campaign2
        .connect(campaignOwner)
        .withdrawFunds(campaignBalance / BigInt(2));

      // 8. Check campaign status
      expect(await campaign2.isActive()).to.be.true;
      expect(await campaignFactory.campaigns(campaignId2)).to.include({
        verified: true,
        featured: true,
      });

      // 9. Check campaign details
      const details = await campaign2.getCampaignDetails();
      expect(details._description).to.equal("Updated Description");
      expect(details._story).to.equal("Updated Long Description");

      // 10. Check impacts
      const impacts = await campaign2.getImpacts();
      expect(impacts.length).to.equal(3);
      expect(impacts[2]).to.equal("New Impact 3");
    });
  });

  describe("Platform Management", function () {
    it("Should handle platform fee changes", async function () {
      // Initial fee is 2.5% (250 basis points)
      const initialFee = await registry.platformFeePercentage();
      expect(initialFee).to.equal(250);

      // Make a donation with initial fee
      const donationAmount = ethers.parseEther("1");
      const initialPlatformFee = await registry.calculatePlatformFee(
        donationAmount
      );
      expect(initialPlatformFee).to.equal(donationAmount * BigInt(250) / BigInt(10000));

      // Update platform fee to 5% (500 basis points)
      await registry.updatePlatformFee(500);
      expect(await registry.platformFeePercentage()).to.equal(500);

      // Check new fee calculation
      const newPlatformFee = await registry.calculatePlatformFee(
        donationAmount
      );
      expect(newPlatformFee).to.equal(donationAmount * BigInt(250) / BigInt(10000));

      // Make a donation with new fee
      await donationManager
        .connect(donor)
        .processDonation(campaignId, { value: donationAmount });

      // Check campaign received correct amount
      const campaignAmount = donationAmount - newPlatformFee;
      expect(await campaign.raisedAmount()).to.equal(campaignAmount);
    });

    it("Should handle platform pausing", async function () {
      // Pause platform
      await registry.setPaused(true);
      expect(await registry.isActive()).to.be.false;

      // Try to make a donation
      await expect(
        donationManager.connect(donor).processDonation(campaignId, {
          value: ethers.parseEther("0.01"),
        })
      ).to.be.revertedWith("Platform is paused");

      // Try to create a campaign
      await expect(
        createCampaign(campaignFactory, campaignOwner)
      ).to.be.revertedWith("Platform is paused");

      // Unpause platform
      await registry.setPaused(false);
      expect(await registry.isActive()).to.be.true;

      // Now donation should work
      await expect(
        donationManager.connect(donor).processDonation(campaignId, {
          value: ethers.parseEther("0.01"),
        })
      ).to.not.be.reverted;
    });
  });
});
