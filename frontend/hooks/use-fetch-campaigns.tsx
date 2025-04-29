import { useState } from "react";
import {
  getContract,
  readContract,
  resolveMethod,
} from "thirdweb";
import { contracts } from "@/lib/contract";
import { client, rootstockTestnet } from "@/lib/config";
import { publicClient } from "@/lib/client";
import { Abi, formatUnits } from "viem";

export interface Campaign {
  id: number;
  owner: string;
  name: string;
  description: string;
  story: string;
  goal: number;
  raisedAmount: number;
  createdAt: number;
  duration: number;
  impacts: string[];
  imageURI: string;
  isActive: boolean;
  verified: boolean;
  featured: boolean;
  donations?: number;
}

const useFetchCampaigns = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const contract = getContract({
    client,
    address: contracts.campaignManager.address,
    chain: rootstockTestnet,
  });

  const donationManagerContract = getContract({
    client,
    address: contracts.donationManager.address,
    chain: rootstockTestnet,
  });

  const getFeaturedCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const campaignsIds = await readContract({
        contract,
        method: resolveMethod("getFeaturedCampaigns"),
        params: [],
      });

      const featuredCampaigns = await getCampaignsDetails(
        campaignsIds as number[]
      );

      return featuredCampaigns;
    } catch (err: any) {
      setError(err.message || "Failed to fetch featured campaigns");
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignDetails = async (campaignId: number): Promise<Campaign | undefined> => {
    try {
      setLoading(true);
      setError(null);
      const campaignDetails = await readContract({
        contract,
        method: resolveMethod("getCampaignInfo"),
        params: [campaignId],
      }) as any;

      const donations = await readContract({
        contract: donationManagerContract,
        method: resolveMethod("getDonationsByCampaign"),
        params: [campaignId],
      }) as BigInt[]

      return {
        ...campaignDetails,
        createdAt: Number(campaignDetails.createdAt),
        id: Number(campaignDetails.id),
        goal: Number(formatUnits(campaignDetails.goal, 18)),
        raisedAmount: Number(formatUnits(campaignDetails.raisedAmount, 18)),
        donations: donations.length
      };
    } catch (err: any) {
      setError(err.message || "Failed to fetch campaign details");
    } finally {
      setLoading(false);
    }
  };

  const getOwnerCampaigns = async (owner: string) => {
    try {
      setLoading(true);
      setError(null);
      const campaignsIds = await readContract({
        contract,
        method: resolveMethod("getCampaignsByOwner"),
        params: [owner],
      });

      const ownerCampaigns = await getCampaignsDetails(
        campaignsIds as number[]
      );

      return ownerCampaigns;
    } catch (err: any) {
      setError(err.message || "Failed to fetch owner campaign");
    } finally {
      setLoading(false);
    }
  };

  const getAllCampaigns = async (): Promise<Campaign[]> => {
    try {
      setLoading(true);
      setError(null);

      const allCampaignsIds = await readContract({
        contract,
        method: resolveMethod("getAllCampaigns"),
        params: [],
      });

      console.log("All campaigns ids:: ", allCampaignsIds);

      const allCampaigns = await getCampaignsDetails(
        allCampaignsIds as number[]
      );

      console.log("All campaigns:: ", allCampaigns);

      return allCampaigns as Campaign[];
    } catch (err: any) {
      setError(err.message || "Failed to fetch all campaigns");
    } finally {
      setLoading(false);
    }

    return [];
  };

  const getCampaignsDetails = async (ids: number[]) => {
    const rawTxs = ids.map((id) => ({
      address: contracts.campaignManager.address,
      abi: contracts.campaignManager.abi as Abi,
      functionName: "getCampaignInfo",
      args: [id],
    }));

    const results = await publicClient.multicall({
      contracts: rawTxs,
    });

    return results
      .filter(({ status }) => status === "success")
      .map(({ result }: { result?: any; status: string; error?: Error }) => ({
        ...result,
        createdAt: Number(result.createdAt),
        id: Number(result.id),
        goal: Number(formatUnits(result.goal, 18)),
        raisedAmount: Number(formatUnits(result.raisedAmount, 18)),
      }));
  };

  return {
    fetchCampaignDetails,
    getFeaturedCampaigns,
    getOwnerCampaigns,
    getAllCampaigns,
    getCampaignsDetails,
    loading,
    error,
  };
};

export default useFetchCampaigns;
