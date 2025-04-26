import { useState } from "react";
import { getContract, readContract, resolveMethod } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { contracts } from "@/lib/contract";
import { client, rootstockTestnet } from "@/lib/config";
import useFetchCampaigns from "./use-fetch-campaigns";
import { publicClient } from "@/lib/client";
import { Abi, formatUnits } from "viem";

export interface NFTMetadata {
  id: number;
  title: string;
  image: string;
  charity: string;
  date: number;
  tier: string;
}

const useGetNfts = () => {
  const account = useActiveAccount();
  const address = account?.address;
  const { getCampaignsDetails } = useFetchCampaigns();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contract = getContract({
    client,
    address: contracts.nftReward.address,
    chain: rootstockTestnet,
  });

  const getOwnerNFTs = async (): Promise<NFTMetadata[]> => {
    if (!address) return [];
    try {
      setIsLoading(true);
      const tokenIds = (await readContract({
        contract,
        method: resolveMethod("getTokensByOwner"),
        params: [address],
      })) as any;

      const rawMetadataTxs = tokenIds.map((id: any) => ({
        address: contracts.nftReward.address,
        abi: contracts.nftReward.abi as Abi,
        functionName: "getNFTMetadata",
        args: [id],
      }));

      const rawTokenUriTxs = tokenIds.map((id: any) => ({
        address: contracts.nftReward.address,
        abi: contracts.nftReward.abi as Abi,
        functionName: "tokenURI",
        args: [id],
      }));

      const rawTxs = [...rawMetadataTxs, ...rawTokenUriTxs];

      const results = await publicClient.multicall({
        contracts: rawTxs,
      });

      const midIndex = results.length / 2;
      const nftMetadataResults = results.slice(0, midIndex);
      const tokenUriResults = results.slice(midIndex);

      const tokenUris = tokenUriResults.map(
        ({ result }: { result?: any; status: string; error?: Error }) => result
      );

      const tokenDetails = await Promise.all(
        tokenUris.map(async (uri) => {
          const response = await fetch(uri);
          return response.json();
        })
      );

      console.log(tokenDetails);

      return nftMetadataResults.map(
          (
            { result }: { result?: any; status: string; error?: Error },
            idx: number
          ) => ({
            id: Number(result.id),
            title: tokenDetails[idx].name,
            image: tokenDetails[idx].image,
            date: Number(result.timestamp) * 1000, //converting time to milliseconds
            tier: result.tier,
            charity: result.campaignName,
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

  return { getOwnerNFTs, isLoading, error };
};

export default useGetNfts;
