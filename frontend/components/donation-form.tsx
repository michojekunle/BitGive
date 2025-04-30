"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bitcoin, ExternalLink, Info } from "lucide-react";
import { motion } from "framer-motion";
import useDonations from "@/hooks/use-donations";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";
import ConnectBtn from "./connect-btn";

export default function DonationForm({
  campaignId,
  verified,
}: {
  campaignId: number;
  verified: boolean;
}) {
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState("");
  const { donateToCampaign, isLoading, error } = useDonations();
  const account = useActiveAccount();

  const handleAmountSelect = (value: string) => {
    setAmount(value);
  };

  const handleDonate = async () => {
    const loadingToast = toast.loading("Donating to campaign");
    try {
      setStatus("awaiting");
      const tier = getNftTier();
      const txReceipt = await donateToCampaign(
        campaignId,
        amount,
        tier ? tier : ""
      );
      if (error) throw error;

      if (txReceipt?.status === "success") {
        setStatus("success");
        toast.success("Donated to campaign successfully");
        setTxHash(txReceipt.transactionHash);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error donating to campaign, please try again");
      setStatus(null);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Determine NFT tier based on amount
  const getNftTier = () => {
    const amountNum = Number.parseFloat(amount || "0");
    if (amountNum >= 0.01) return "Gold";
    if (amountNum >= 0.005) return "Silver";
    if (amountNum >= 0.001) return "Bronze";
    return null;
  };

  const tier = getNftTier();

  return (
    <Card className="h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Make a Donation</CardTitle>
        <CardDescription>Support this cause you care about</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Donation Amount (RBTC)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.001"
            min="0.00001"
            className="border-border/40 bg-background/50"
          />
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAmountSelect("0.001")}
              className={`border-border/40 ${
                amount === "0.001"
                  ? "border-[#F5A623]/60 bg-gradient-to-br from-[#F7931A]/10 to-[#F5A623]/10"
                  : ""
              }`}
            >
              0.001
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAmountSelect("0.005")}
              className={`border-border/40 ${
                amount === "0.005"
                  ? "border-[#F5A623]/60 bg-gradient-to-br from-[#F7931A]/10 to-[#F5A623]/10"
                  : ""
              }`}
            >
              0.005
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAmountSelect("0.01")}
              className={`border-border/40 ${
                amount === "0.01"
                  ? "border-[#F5A623]/60 bg-gradient-to-br from-[#F7931A]/10 to-[#F5A623]/10"
                  : ""
              }`}
            >
              0.01
            </Button>
          </div>
        </div>

        {tier && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-4"
          >
            <h4 className="mb-2 text-sm font-medium">NFT Reward Preview</h4>
            <div className="flex sm:flex-col md:flex-row items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-[#F7931A]/20 to-[#F5A623]/20 shadow-glow-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-xs font-bold ${
                      tier === "Gold"
                        ? "text-[#F5A623]"
                        : tier === "Silver"
                        ? "text-gray-400"
                        : "text-amber-700"
                    }`}
                  >
                    {tier}
                  </span>
                </div>
              </div>
              <div>
                <h5 className="font-medium">{tier} Donor NFT</h5>
                <p className="text-xs text-muted-foreground">
                  Receive this unique NFT as a thank you for your donation
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {account ? (
          <Button
            className="w-full bg-gradient-to-r from-[#F7931A] to-[#F5A623] text-white hover:from-[#F5A623] hover:to-[#F7931A] shadow-glow-sm"
            onClick={handleDonate}
            disabled={!amount || !!status || isLoading || !verified}
          >
            <Bitcoin className="mr-2 h-4 w-4" />
            Donate with RBTC
          </Button>
        ) : (
          <ConnectBtn />
        )}

        {!verified && (
          <div className="rounded-lg border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-4">
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center justify-center w-full p-1 ">
                <Info className="mt-0.5 h-8 w-8 text-[#F5A623]" />
              </div>
              <div>
                <h4 className="font-medium">Campaign Not Verified</h4>
                <p className="text-sm text-muted-foreground">
                  Campaign is still undergoing verification, Once the campaign
                  is verified, you'll be able to donate. Please check back in a
                  while.
                </p>
              </div>
            </div>
          </div>
        )}

        {status && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="w-full rounded-lg border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-3 text-center text-sm"
          >
            {status === "awaiting" && (
              <span className="text-muted-foreground">
                Awaiting confirmation...
              </span>
            )}
            {status === "success" && (
              <span className="flex items-center justify-center gap-1 font-medium text-green-500">
                Success! Donation Completed{" "}
                {tier && " with NFT minted successfully"}
                <a
                  href={`https://rootstock-testnet.blockscout.com/tx/${txHash}`}
                  target="_blank"
                  className="ml-1 inline-flex items-center text-xs text-[#F5A623] hover:text-[#F7931A] transition-colors"
                >
                  View Transaction
                  <ExternalLink className="ml-0.5 h-3 w-3" />
                </a>
              </span>
            )}
          </motion.div>
        )}
      </CardFooter>
    </Card>
  );
}
