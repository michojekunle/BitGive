import { useState } from "react";
import {
  getContract,
  prepareContractCall,
  resolveMethod,
  sendAndConfirmTransaction,
} from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { uploadImageToIPFS } from "@/lib/utils";
import { contracts } from "@/lib/contract";
import { client, rootstockTestnet } from "@/lib/config";

const useCreateCampaign = () => {
  const account = useActiveAccount();
  const address = account?.address;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCampaign = async (campaignData: {
    name: string;
    description: string;
    story: string;
    image: File;
    goal: number;
    duration: number;
    impacts: string[];
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!address) {
        throw new Error("No active account found.");
      }
      if (
        !campaignData.name ||
        !campaignData.description ||
        !campaignData.image ||
        !campaignData.goal ||
        !campaignData.duration ||
        !campaignData.impacts.length
      )
        return;

      // Upload the image to IPFS
      const imageUrl = await uploadImageToIPFS(
        campaignData.image,
        campaignData.name
      );

      if (!imageUrl) {
        throw new Error("Failed to upload image to IPFS.");
      }

      // Get the contract instance
      const contract = getContract({
        client,
        address: contracts.campaignManager.address,
        chain: rootstockTestnet,
      });

      const tx = prepareContractCall({
        contract,
        // @ts-ignore
        method: resolveMethod("createCampaign"),
        params: [
          campaignData.name,
          campaignData.description,
          campaignData.story,
          campaignData.goal * 10 ** 18,
          campaignData.duration,
          campaignData.impacts,
          imageUrl,
        ],
      });

      await sendAndConfirmTransaction({
        transaction: tx,
        account,
      });

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the campaign.");
      setIsLoading(false);
      throw err;
    }
  };

  return { createCampaign, isLoading, error };
};

export default useCreateCampaign;
