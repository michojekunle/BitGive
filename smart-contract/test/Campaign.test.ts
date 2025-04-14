import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { BitGiveRegistry, CampaignFactory, Campaign } from "../typechain-types";
import { deployContracts, createCampaign, timeTravel, ROLES } from "./helpers";

describe("Campaign", function () {
  let registry: BitGiveRegistry;
  let campaignFactory: CampaignFactory;
  let campaign: Campaign;
  let owner: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;
  let campaignOwner: HardhatEthersSigner;
  let donor1: HardhatEthersSigner;
  let donor2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, admin, verifier, campaignOwner, donor1, donor2] =
      await ethers.getSigners();

    const contracts = await deployContracts();
    registry = contracts.registry;
    campaignFactory = contracts.campaignFactory;

    // Add verifier role
    await registry.addVerifier(verifier.address);

    // Create a campaign
    campaign = await createCampaign(
      campaignFactory,
      campaignOwner,
      "Test Campaign",
      "Test Description",
      "Test Long Description",
      "Education",
      ethers.parseEther("1").toString(),
      30,
      ["Impact 1", "Impact 2"],
      "https://example.com/image.jpg"
    );

    // Verify and activate the campaign
    await campaignFactory.connect(verifier).verifyCampaign(0, true);
    await campaign.connect(verifier).setActive(true);
  });

  describe("Deployment", function () {
    it("Should set the correct initial state", async function () {
      expect(await campaign.name()).to.equal("Test Campaign");
      expect(await campaign.description()).to.equal("Test Description");
      expect(await campaign.story()).to.equal(
        "Test Long Description"
      );
      expect(await campaign.goal()).to.equal(ethers.parseEther("1"));
      expect(await campaign.raisedAmount()).to.equal(0n);
      expect(await campaign.owner()).to.equal(campaignOwner.address);
      expect(await campaign.isActive()).to.be.true;

      // Check impacts
      expect(await campaign.impacts(0)).to.equal("Impact 1");
      expect(await campaign.impacts(1)).to.equal("Impact 2");

      // Check registry
      expect(await campaign.registry()).to.equal(await registry.getAddress());
    });
  });

  describe("Donations", function () {
    it("Should accept donations and update state", async function () {
      const donationAmount = ethers.parseEther("0.1");
      const platformFee = await registry.calculatePlatformFee(donationAmount);
      const campaignAmount = donationAmount - platformFee;

      const initialDonorBalance = await ethers.provider.getBalance(
        donor1.address
      );
      const initialCampaignBalance = await ethers.provider.getBalance(
        await campaign.getAddress()
      );
      const initialRegistryBalance = await ethers.provider.getBalance(
        await registry.getAddress()
      );

      const tx = await campaign
        .connect(donor1)
        .donate("", { value: donationAmount });
      const receipt = await tx.wait();
      const gasUsed = receipt?.gasUsed ?? 0n;
      const gasPrice = receipt?.gasPrice ?? 0n;
      const gasCost = gasUsed * gasPrice;

      const finalDonorBalance = await ethers.provider.getBalance(
        donor1.address
      );
      const finalCampaignBalance = await ethers.provider.getBalance(
        await campaign.getAddress()
      );
      const finalRegistryBalance = await ethers.provider.getBalance(
        await registry.getAddress()
      );

      // Check balances changed correctly
      expect(
        initialDonorBalance - finalDonorBalance - BigInt(gasCost)
      ).to.equal(donationAmount);
      expect(finalCampaignBalance - initialCampaignBalance).to.equal(
        campaignAmount
      );
      expect(finalRegistryBalance - initialRegistryBalance).to.equal(
        platformFee
      );

      // Check campaign state
      expect(await campaign.raisedAmount()).to.equal(campaignAmount);

      // Check donation record
      const donationCount = await campaign.getDonationCount();
      expect(donationCount).to.equal(1);

      const donation = await campaign.donations(0);
      expect(donation.donor).to.equal(donor1.address);
      expect(donation.amount).to.equal(campaignAmount);
      expect(donation.nftId).to.equal("");
    });

    it("Should track multiple donations correctly", async function () {
      // First donation
      await campaign
        .connect(donor1)
        .donate("", { value: ethers.parseEther("0.1") });

      // Second donation
      await campaign
        .connect(donor2)
        .donate("", { value: ethers.parseEther("0.2") });

      // Third donation from first donor
      await campaign
        .connect(donor1)
        .donate("", { value: ethers.parseEther("0.3") });

      // Check donation count
      expect(await campaign.getDonationCount()).to.equal(3);

      // Check donor-specific donations
      const donor1Donations = await campaign.getDonationsByDonor(
        donor1.address
      );
      expect(donor1Donations.length).to.equal(2);
      expect(donor1Donations[0]).to.equal(0);
      expect(donor1Donations[1]).to.equal(2);

      const donor2Donations = await campaign.getDonationsByDonor(
        donor2.address
      );
      expect(donor2Donations.length).to.equal(1);
      expect(donor2Donations[0]).to.equal(1);

      // Check total amount by donor
      const platformFee1 = await registry.calculatePlatformFee(
        ethers.parseEther("0.1")
      );
      const platformFee2 = await registry.calculatePlatformFee(
        ethers.parseEther("0.3")
      );
      const expectedDonor1Amount =
        ethers.parseEther("0.1") -
        platformFee1 +
        (ethers.parseEther("0.3") - platformFee2);

      expect(await campaign.donorTotalAmount(donor1.address)).to.equal(
        expectedDonor1Amount
      );
    });

    it("Should reject donations when campaign is inactive", async function () {
      // Deactivate the campaign
      await campaign.connect(verifier).setActive(false);

      await expect(
        campaign.connect(donor1).donate("", { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Campaign is not active");
    });

    it("Should reject donations when platform is paused", async function () {
      // Pause the platform
      await registry.setPaused(true);

      await expect(
        campaign.connect(donor1).donate("", { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Platform is paused");
    });

    it("Should reject donations after campaign has ended", async function () {
      // Fast forward time to after campaign end
      const duration = await campaign.duration();
      await timeTravel(Number(duration * BigInt(24 * 60 * 60) + BigInt(1)));

      await expect(
        campaign.connect(donor1).donate("", { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Campaign has ended");
    });

    it("Should accept direct ETH transfers via receive function", async function () {
      const donationAmount = ethers.parseEther("0.1");
      const platformFee = await registry.calculatePlatformFee(donationAmount);
      const campaignAmount = donationAmount - platformFee;

      await expect(
        donor1.sendTransaction({
          to: campaign.registry(),
          value: donationAmount,
        })
      ).to.changeEtherBalances(
        [donor1, campaign, registry],
        [donationAmount * BigInt(-1), campaignAmount, platformFee]
      );

      expect(await campaign.raisedAmount()).to.equal(campaignAmount);
    });
  });

  describe("Fund Withdrawal", function () {
    beforeEach(async function () {
      // Make a donation to the campaign
      await campaign
        .connect(donor1)
        .donate("", { value: ethers.parseEther("0.5") });
    });

    it("Should allow owner to withdraw funds", async function () {
      const campaignBalance = await ethers.provider.getBalance(
        campaign.registry()
      );

      await expect(
        campaign.connect(campaignOwner).withdrawFunds(campaignBalance)
      ).to.changeEtherBalance(campaignOwner, campaignBalance);

      expect(await ethers.provider.getBalance(campaign.registry())).to.equal(0);
    });

    it("Should allow partial withdrawal", async function () {
      const campaignBalance = await ethers.provider.getBalance(
        campaign.registry()
      );
      const withdrawAmount = campaignBalance / BigInt(2);

      await expect(
        campaign.connect(campaignOwner).withdrawFunds(withdrawAmount)
      ).to.changeEtherBalance(campaignOwner, withdrawAmount);

      expect(await ethers.provider.getBalance(campaign.registry())).to.equal(
        campaignBalance - withdrawAmount
      );
    });

    it("Should not allow non-owner to withdraw funds", async function () {
      const campaignBalance = await ethers.provider.getBalance(
        campaign.registry()
      );

      await expect(
        campaign.connect(donor1).withdrawFunds(campaignBalance)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should not allow withdrawal of more than available balance", async function () {
      const campaignBalance = await ethers.provider.getBalance(
        campaign.registry()
      );
      const excessAmount = campaignBalance + BigInt(1);

      await expect(
        campaign.connect(campaignOwner).withdrawFunds(excessAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Campaign Updates", function () {
    it("Should allow owner to update image URI", async function () {
      const newImageURI = "https://example.com/new-image.jpg";

      await campaign.connect(campaignOwner).updateImageURI(newImageURI);
      expect(await campaign.imageURI()).to.equal(newImageURI);
    });

    it("Should allow owner to update description", async function () {
      const newDescription = "New Description";
      const newLongDescription = "New Long Description";

      await campaign
        .connect(campaignOwner)
        .updateDescription(newDescription, newLongDescription);
      expect(await campaign.description()).to.equal(newDescription);
      expect(await campaign.story()).to.equal(newLongDescription);
    });

    it("Should allow owner to update impacts", async function () {
      const newImpacts = ["New Impact 1", "New Impact 2", "New Impact 3"];

      await campaign.connect(campaignOwner).updateImpacts(newImpacts);

      expect(await campaign.getImpacts()).to.deep.equal(newImpacts);
      expect(await campaign.impacts(0)).to.equal(newImpacts[0]);
      expect(await campaign.impacts(1)).to.equal(newImpacts[1]);
      expect(await campaign.impacts(2)).to.equal(newImpacts[2]);
    });

    it("Should not allow non-owner to update campaign", async function () {
      await expect(
        campaign
          .connect(donor1)
          .updateImageURI("https://example.com/new-image.jpg")
      ).to.be.revertedWith("Only owner can call this function");

      await expect(
        campaign
          .connect(donor1)
          .updateDescription("New Description", "New Long Description")
      ).to.be.revertedWith("Only owner can call this function");

      await expect(
        campaign.connect(donor1).updateImpacts(["New Impact"])
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Campaign Status", function () {
    it("Should allow verifier to activate/deactivate campaign", async function () {
      await campaign.connect(verifier).setActive(false);
      expect(await campaign.isActive()).to.be.false;

      await campaign.connect(verifier).setActive(true);
      expect(await campaign.isActive()).to.be.true;
    });

    it("Should not allow non-verifier to change campaign status", async function () {
      await expect(
        campaign.connect(donor1).setActive(false)
      ).to.be.revertedWith("Caller is not a verifier");
    });

    it("Should correctly report if campaign has ended", async function () {
      // Initially, campaign should not have ended
      expect(await campaign.hasEnded()).to.be.false;

      // Fast forward time to after campaign end
      const duration = await campaign.duration();
      await timeTravel(Number(duration * BigInt(24 * 60 * 60) + BigInt(1)));

      // Now campaign should have ended
      expect(await campaign.hasEnded()).to.be.true;
    });

    it("Should correctly report if goal is reached", async function () {
      // Initially, goal should not be reached
      expect(await campaign.goalReached()).to.be.false;

      // Make a donation that reaches the goal
      const goal = await campaign.goal();
      const donationAmount = goal * BigInt(12) / BigInt(10); // 120% of goal to account for platform fee
      await campaign.connect(donor1).donate("", { value: donationAmount });

      // Now goal should be reached
      expect(await campaign.goalReached()).to.be.true;
    });
  });

  describe("Campaign Queries", function () {
    beforeEach(async function () {
      // Make some donations
      await campaign
        .connect(donor1)
        .donate("NFT1", { value: ethers.parseEther("0.1") });
      await campaign
        .connect(donor2)
        .donate("NFT2", { value: ethers.parseEther("0.2") });
    });

    it("Should get all donations", async function () {
      const donations = await campaign.getAllDonations();
      expect(donations.length).to.equal(2);

      expect(donations[0].donor).to.equal(donor1.address);
      expect(donations[0].nftId).to.equal("NFT1");

      expect(donations[1].donor).to.equal(donor2.address);
      expect(donations[1].nftId).to.equal("NFT2");
    });

    it("Should get campaign details", async function () {
      const details = await campaign.getCampaignDetails();

      expect(details._name).to.equal("Test Campaign");
      expect(details._description).to.equal("Test Description");
      expect(details._story).to.equal("Test Long Description");
      expect(details._goal).to.equal(ethers.parseEther("1"));
      expect(details._isActive).to.be.true;

      // Check raised amount (accounting for platform fees)
      const donation1 = ethers.parseEther("0.1");
      const donation2 = ethers.parseEther("0.2");
      const platformFee1 = await registry.calculatePlatformFee(donation1);
      const platformFee2 = await registry.calculatePlatformFee(donation2);
      const expectedRaised =
        donation1 - platformFee1 + (donation2 - platformFee2);

      expect(details._raisedAmount).to.equal(expectedRaised);
    });
  });
});
