import { useState } from "react";
import {
  getContract,
  prepareContractCall,
  readContract,
  resolveMethod,
  sendAndConfirmTransaction,
  toWei,
} from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { uploadNftMetadata } from "@/lib/utils";
import { contracts } from "@/lib/contract";
import { client, rootstockTestnet } from "@/lib/config";
import { NftBadgeTierUris } from "@/lib/constants";
import useFetchCampaigns from "./use-fetch-campaigns";
import { publicClient } from "@/lib/client";
import { Abi, formatUnits } from "viem";

export interface DonationRecord {
  id: number;
  donor: string;
  campaignAddress: string;
  campaignId: number;
  campaignName?: string;
  campaignImage?: string;
  amount: number;
  timestamp: number;
  nftId: string;
  tier: string;
}

const useDonations = () => {
  const account = useActiveAccount();
  const address = account?.address;
  const { getCampaignsDetails } = useFetchCampaigns();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contract = getContract({
    client,
    address: contracts.donationManager.address,
    chain: rootstockTestnet,
  });

  const nftContract = getContract({
    client,
    address: contracts.nftReward.address,
    chain: rootstockTestnet,
  });

  const campaignManagerContract = getContract({
    client,
    address: contracts.campaignManager.address,
    chain: rootstockTestnet,
  });

  const donateToCampaign = async (
    campaignId: number,
    donationAmount: string,
    tier: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!address) {
        throw new Error("No active account found.");
      }
      if (campaignId < 0 || !donationAmount) return;

      let tokenURI = "";

      if (tier) {
        const imageUri = NftBadgeTierUris[tier];

        const nextTierCount = await readContract({
          contract: nftContract,
          method: resolveMethod("getNextTierCount"),
          params: [tier],
        });

        if (!imageUri) throw new Error("Can't find tier nft badge");
        // Upload the nft metadata to IPFS
        const tokenMetadata = await uploadNftMetadata({
          fileCID: imageUri,
          name: `${tier} Badge #${Number(nextTierCount)}`,
          description: `This NFT represents the ${tier} tier contribution to a charity campaign. Thank you for your support!`,
          charityLink: `https://bit-give.vercel.app/charities/${campaignId}`,
          charityId: `${campaignId}`,
          externalUrl: `https://bit-give.vercel.app`,
        });

        if (!tokenMetadata.tokenUri) {
          throw new Error("Failed to upload image to IPFS.");
        }

        tokenURI = tokenMetadata.tokenUri;
      }

      const tx = prepareContractCall({
        contract,
        // @ts-ignore
        method: resolveMethod("processDonation"),
        params: [campaignId, tokenURI],
        value: toWei(donationAmount),
      });

      const txReceipt = await sendAndConfirmTransaction({
        transaction: tx,
        account,
      });

      setIsLoading(false);
      return txReceipt;
    } catch (err: any) {
      console.log(err);
      setError(err.message || "An error occurred while dontating to campaign.");
      setIsLoading(false);
      throw err;
    }
  };

  const getDonorDonations = async (): Promise<DonationRecord[]> => {
    if (!address) return [];
    try {
      setIsLoading(true);
      setError(null);
      const donationIds = (await readContract({
        contract,
        method: resolveMethod("getDonationsByDonor"),
        params: [address],
      })) as any;

      const rawTxs = donationIds.map((id: any) => ({
        address: contracts.donationManager.address,
        abi: contracts.donationManager.abi as Abi,
        functionName: "getDonationDetails",
        args: [id],
      }));

      const results = await publicClient.multicall({
        contracts: rawTxs,
      });

      const campaignIds = results.map(
        ({ result }: { result?: any; status: string; error?: Error }) =>
          result.campaignId
      );

      const campaigns = await getCampaignsDetails(campaignIds);

      return results
        .filter(({ status }) => status === "success")
        .map(
          (
            { result }: { result?: any; status: string; error?: Error },
            idx: number
          ) => ({
            ...result,
            id: Number(result.id),
            campaignId: Number(result.campaignId),
            timestamp: Number(result.timestamp) * 1000, //converting time to milliseconds
            amount: Number(formatUnits(result.amount, 18)),
            campaignName: campaigns[idx].name,
            campaignImage: campaigns[idx].imageURI,
          })
        );
    } catch (error: any) {
      setError(
        error.message || "An error occured while fetching Donor Donations"
      );
    } finally {
      setIsLoading(false);
    }

    return [];
  };

  const getRecentDonations = async (): Promise<DonationRecord[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const donations = (await readContract({
        contract,
        method: resolveMethod("getRecentDonations"),
        params: [3],
      })) as any;

      const campaignIds = donations.map(
        (donation: any) =>
          donation.campaignId
      );

      const campaigns = await getCampaignsDetails(campaignIds);

      return donations
        .map(
          (
            donation: any ,
            idx: number
          ) => ({
            ...donation,
            id: Number(donation.id),
            campaignId: Number(donation.campaignId),
            timestamp: Number(donation.timestamp) * 1000, //converting time to milliseconds
            amount: Number(formatUnits(donation.amount, 18)),
            campaignName: campaigns[idx].name,
            campaignImage: campaigns[idx].imageURI,
          })
        );
    } catch (error: any) {
      console.error(error)
      setError(
        error.message || "An error occured while fetching Donor Donations"
      );
    } finally {
      setIsLoading(false);
    }

    return [];
  };

  const getDonationStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const donationCount = (await readContract({
        contract,
        method: resolveMethod("getDonationCount"),
        params: [],
      })) as any;

      const campaigns = (await readContract({
        contract: campaignManagerContract,
        method: resolveMethod("getAllCampaigns"),
        params: [],
      })) as any;

      const donations = (await readContract({
        contract,
        method: resolveMethod("getRecentDonations"),
        params: [donationCount],
      })) as any;

      const nftsMinted = (await readContract({
        contract: nftContract,
        method: resolveMethod("getTotalNFTs"),
        params: [],
      })) as any;

      const totalDonated = donations.reduce((acc: number, donation: any) => acc + Number(donation.amount), 0);

      const countUniqueDonors = (donations: { donor: string; amount: number }[]) => {
        return donations.reduce<Set<string>>((acc, donation) => {
          acc.add(donation.donor);
          return acc;
        }, new Set()).size;
      };

      const donors = countUniqueDonors(donations);

      return ({
        donors,
        charitiesSupported: Number(campaigns.length),
        nftsMinted: Number(nftsMinted),
        totalDonated: Number(formatUnits(totalDonated, 18)),
      })
    } catch (error: any) {
      console.error(error)
      setError(
        error.message || "An error occurred while fetching Donor Donations"
      );
    } finally {
      setIsLoading(false);
    }
    return null;
  }

  return { donateToCampaign, getDonorDonations, getRecentDonations, getDonationStats, isLoading, error };
};

export default useDonations;
