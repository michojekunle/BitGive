import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  BitGiveRegistry,
  CampaignManager,
  DonationManager,
  NFTReward,
} from "../typechain-types";
import { deployContracts, createCampaign, ROLES } from "./helpers";

describe("DonationManager", function () {
  let registry: BitGiveRegistry;
  let campaignManager: CampaignManager;
  let donationManager: DonationManager;
  let campaign: CampaignManager.CampaignInfoStruct;
  let nftReward: NFTReward;
  let owner: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;
  let campaignOwner: HardhatEthersSigner;
  let donor1: HardhatEthersSigner;
  let donor2: HardhatEthersSigner;
  let campaignId: number;
  const tokenURI = 'https://ipfs:23rnrfioerjoiorjndfioriojfjofr';

  beforeEach(async function () {
    [owner, admin, verifier, campaignOwner, donor1, donor2] =
      await ethers.getSigners();

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

  describe("Deployment", function () {
    it("Should set the right registry address", async function () {
      expect(await donationManager.registry()).to.equal(await registry.getAddress());
    });

    it("Should set the right NFT reward address", async function () {
      expect(await donationManager.nftReward()).to.equal(await nftReward.getAddress());
    });
  });

  describe("Donation Processing", function () {
    it("Should process donation and mint NFT for Gold tier", async function () {
      const donationAmount = ethers.parseEther("0.01"); // Gold tier

      await expect(
        donationManager
          .connect(donor1)
          .processDonation(campaignId, tokenURI, { value: donationAmount })
      )
        .to.emit(donationManager, "DonationProcessed")
        .withArgs(
          0,
          donor1.address,
          campaignId,
          donationAmount,
          'Gold Donor #1',
          "Gold"
        );

      // Check donation record
      const donation = await donationManager.donations(0);
      expect(donation.donor).to.equal(donor1.address);
      expect(donation.campaignId).to.equal(campaignId);
      expect(donation.amount).to.equal(donationAmount);
      expect(donation.tier).to.equal("Gold");

      // Check NFT was minted
      expect(await nftReward.balanceOf(donor1.address)).to.equal(1);

      const campaign = await campaignManager.getCampaignInfo(campaignId);
      // Check campaign received funds
      expect(campaign.raisedAmount).to.equal(donationAmount);
    });

    it("Should process donation and mint NFT for Silver tier", async function () {
      const donationAmount = ethers.parseEther("0.005"); // Silver tier

      await donationManager
        .connect(donor1)
        .processDonation(campaignId, tokenURI, { value: donationAmount });

      const donation = await donationManager.donations(0);
      expect(donation.tier).to.equal("Silver");

      // Check NFT was minted
      expect(await nftReward.balanceOf(donor1.address)).to.equal(1);
    });

    it("Should process donation and mint NFT for Bronze tier", async function () {
      const donationAmount = ethers.parseEther("0.001"); // Bronze tier

      await donationManager
        .connect(donor1)
        .processDonation(campaignId, tokenURI, { value: donationAmount });

      const donation = await donationManager.donations(0);
      expect(donation.tier).to.equal("Bronze");

      // Check NFT was minted
      expect(await nftReward.balanceOf(donor1.address)).to.equal(1);
    });

    it("Should process donation without NFT for small donations", async function () {
      const donationAmount = ethers.parseEther("0.0005"); // Below Bronze tier

      await donationManager
        .connect(donor1)
        .processDonation(campaignId, tokenURI, { value: donationAmount });

      const donation = await donationManager.donations(0);
      expect(donation.tier).to.equal("None");
      expect(donation.nftId).to.equal("");

      // Check no NFT was minted
      expect(await nftReward.balanceOf(donor1.address)).to.equal(0);
    });

    it("Should reject donations to unverified campaigns", async function () {
      // Create a new unverified campaign
      await createCampaign(campaignManager, campaignOwner);
      const unverifiedCampaignId = 1;

      await expect(
        donationManager.connect(donor1).processDonation(unverifiedCampaignId, tokenURI, {
          value: ethers.parseEther("0.01"),
        })
      ).to.be.revertedWithCustomError(donationManager, "CampaignNotVerified()");
    });

    it("Should reject donations to inactive campaigns", async function () {
      // Deactivate the campaign
      await campaignManager.connect(verifier).setActive(campaignId, false);

      await expect(
        donationManager.connect(donor1).processDonation(campaignId, tokenURI, {
          value: ethers.parseEther("0.01"),
        })
      ).to.be.revertedWithCustomError(donationManager, "CampaignNotActive()");
    });

    it("Should reject donations when platform is paused", async function () {
      // Pause the platform
      await registry.setPaused(true);

      await expect(
        donationManager.connect(donor1).processDonation(campaignId, tokenURI, {
          value: ethers.parseEther("0.01"),
        })
      ).to.be.revertedWithCustomError(donationManager, "PlatformPaused()");
    });
  });

  describe("Donation Queries", function () {
    beforeEach(async function () {
      // Process multiple donations
      await donationManager.connect(donor1).processDonation(campaignId, tokenURI, {
        value: ethers.parseEther("0.01"),
      });
      await donationManager.connect(donor2).processDonation(campaignId, tokenURI, {
        value: ethers.parseEther("0.005"),
      });
      await donationManager.connect(donor1).processDonation(campaignId, tokenURI, {
        value: ethers.parseEther("0.001"),
      });
    });

    it("Should get donations by donor", async function () {
      const donor1Donations = await donationManager.getDonationsByDonor(
        donor1.address
      );
      expect(donor1Donations.length).to.equal(2);
      expect(donor1Donations[0]).to.equal(0);
      expect(donor1Donations[1]).to.equal(2);

      const donor2Donations = await donationManager.getDonationsByDonor(
        donor2.address
      );
      expect(donor2Donations.length).to.equal(1);
      expect(donor2Donations[0]).to.equal(1);
    });

    it("Should get donations by campaign", async function () {
      const campaignDonations = await donationManager.getDonationsByCampaign(
        campaignId
      );
      expect(campaignDonations.length).to.equal(3);
      expect(campaignDonations[0]).to.equal(0);
      expect(campaignDonations[1]).to.equal(1);
      expect(campaignDonations[2]).to.equal(2);
    });

    it("Should get donation details", async function () {
      const donation = await donationManager.getDonationDetails(0);
      expect(donation.donor).to.equal(donor1.address);
      expect(donation.campaignId).to.equal(campaignId);
      expect(donation.amount).to.equal(ethers.parseEther("0.01"));
      expect(donation.tier).to.equal("Gold");
    });

    it("Should get donation count", async function () {
      expect(await donationManager.getDonationCount()).to.equal(3);
    });

    it("Should get recent donations", async function () {
      const recentDonations = await donationManager.getRecentDonations(2);
      expect(recentDonations.length).to.equal(2);

      // Most recent first
      expect(recentDonations[0].id).to.equal(2);
      expect(recentDonations[0].donor).to.equal(donor1.address);
      expect(recentDonations[0].tier).to.equal("Bronze");

      expect(recentDonations[1].id).to.equal(1);
      expect(recentDonations[1].donor).to.equal(donor2.address);
      expect(recentDonations[1].tier).to.equal("Silver");
    });
  });
});
