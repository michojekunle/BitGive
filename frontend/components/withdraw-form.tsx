"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ArrowDownToLine, Loader2 } from "lucide-react";
import { parseEther } from "viem";
import { toast } from "sonner";
import {
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
  readContract,
  resolveMethod,
} from "thirdweb";
import { contracts } from "@/lib/contract";
import { client, rootstockTestnet } from "@/lib/config";
import { useActiveAccount } from "thirdweb/react";

interface WithdrawFormProps {
  campaignId: number;
  raisedAmount: number;
}

export default function WithdrawForm({
  campaignId,
  raisedAmount,
}: WithdrawFormProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const account = useActiveAccount();

  const contract = getContract({
    client,
    address: contracts.campaignManager.address,
    chain: rootstockTestnet,
  });

  const withdrawFunds = async (campaignId: number, amount: bigint) => {
    if (!account) return;

    const tx = prepareContractCall({
      contract,
      // @ts-ignore
      method: resolveMethod("withdrawFunds"),
      params: [campaignId, amount],
    });

    await sendAndConfirmTransaction({
      transaction: tx,
      account,
    });
  };

  const checkCanWithdraw = async (campaignId: number): Promise<boolean> => {
    const goalReached = (await readContract({
      contract,
      method: resolveMethod("goalReached"),
      params: [campaignId],
    })) as unknown as boolean;

    const hasEnded = (await readContract({
      contract,
      method: resolveMethod("hasEnded"),
      params: [campaignId],
    })) as unknown as boolean;

    return goalReached || hasEnded;
  };

  const handleWithdraw = async () => {
    const canWithdraw = await checkCanWithdraw(campaignId);

    if (!canWithdraw) {
        toast.error("You Cannot withdraw at this time", {
          description: "You cannot withdraw at this time as the goal has not been reached or the campaign has not ended.",
        });
        return;
    }

    try {
      setIsWithdrawing(true);

      // Convert amount to wei
      const amountInWei = parseEther(raisedAmount.toString());

      // Call the withdraw function
      await withdrawFunds(campaignId, amountInWei);

      toast.success("Funds withdrawn successfully", {
        description: `${raisedAmount} RBTC has been withdrawn to your wallet`,
      });
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast.error(error?.message || "Withdrawal failed", {
        description: "There was an error withdrawing funds. Please try again.",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold">Withdraw Funds</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg bg-gradient-to-br from-[#F7931A]/10 to-[#F5A623]/10 p-4 border border-[#F5A623]/20">
            <div className="flex items-center">
              <Wallet className="h-5 w-5 text-[#F5A623] mr-2" />
              <span className="text-sm font-medium">Available Balance</span>
            </div>
            <div className="mt-2 text-2xl font-bold">{raisedAmount} RBTC</div>
            <p className="text-xs text-muted-foreground">
              This is the total amount raised for this campaign.  
            </p>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-[#F7931A] to-[#F5A623] text-white hover:from-[#F7931A]/90 hover:to-[#F5A623]/90 shadow-glow-sm"
            onClick={handleWithdraw}
            disabled={
              isWithdrawing
            }
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Withdrawing...
              </>
            ) : (
              <>
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Withdraw Funds
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground">
            <p>
              Funds will be transferred directly to your connected wallet
              address. Withdrawal transactions may take a few minutes to process
              on the blockchain.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
