import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { BitGiveRegistry } from "../typechain-types";
import { ROLES } from "./helpers";
import { ZeroAddress } from "ethers";

describe("BitGiveRegistry", function () {
  let registry: BitGiveRegistry;
  let owner: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;
  let user: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, admin, verifier, user] = await ethers.getSigners();

    const BitGiveRegistryFactory = await ethers.getContractFactory("BitGiveRegistry");
    registry = await BitGiveRegistryFactory.deploy();

    // Grant admin role to admin
    await registry.grantRole(ROLES.ADMIN_ROLE, admin.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await registry.hasRole(ROLES.DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await registry.hasRole(ROLES.ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should set platform as active by default", async function () {
      expect(await registry.paused()).to.be.false;
      expect(await registry.isActive()).to.be.true;
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to add verifier", async function () {
      await registry.connect(owner).addVerifier(verifier.address);
      expect(await registry.hasRole(ROLES.VERIFIER_ROLE, verifier.address)).to.be.true;
    });

    it("Should allow admin to remove verifier", async function () {
      await registry.connect(owner).addVerifier(verifier.address);
      await registry.connect(owner).removeVerifier(verifier.address);
      expect(await registry.hasRole(ROLES.VERIFIER_ROLE, verifier.address)).to.be.false;
    });

    it("Should not allow non-admin to add verifier", async function () {
      await expect(
        registry.connect(user).addVerifier(verifier.address)
      ).to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Contract Address Management", function () {
    it("Should allow admin to set campaign factory address", async function () {
      await registry.connect(admin).setCampaignManagerAddress(user.address);
      expect(await registry.campaignManagerAddress()).to.equal(user.address);
    });

    it("Should allow admin to set donation manager address", async function () {
      await registry.connect(admin).setDonationManagerAddress(user.address);
      expect(await registry.donationManagerAddress()).to.equal(user.address);
    });

    it("Should allow admin to set NFT reward address", async function () {
      await registry.connect(admin).setNftRewardAddress(user.address);
      expect(await registry.nftRewardAddress()).to.equal(user.address);
    });

    it("Should not allow setting zero address", async function () {
      await expect(
        registry.connect(admin).setCampaignManagerAddress(ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should emit event when address is updated", async function () {
      await expect(registry.connect(admin).setCampaignManagerAddress(user.address))
        .to.emit(registry, "ContractAddressUpdated")
        .withArgs("CampaignFactory", user.address);
    });
  });

  describe("Platform Status", function () {
    it("Should allow admin to pause the platform", async function () {
      await registry.connect(admin).setPaused(true);
      expect(await registry.paused()).to.be.true;
      expect(await registry.isActive()).to.be.false;
    });

    it("Should allow admin to unpause the platform", async function () {
      await registry.connect(admin).setPaused(true);
      await registry.connect(admin).setPaused(false);
      expect(await registry.paused()).to.be.false;
      expect(await registry.isActive()).to.be.true;
    });

    it("Should emit event when platform status changes", async function () {
      await expect(registry.connect(admin).setPaused(true))
        .to.emit(registry, "PlatformPaused")
        .withArgs(true);
    });
  });
});