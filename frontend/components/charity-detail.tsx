"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Bitcoin,
  ArrowLeft,
  Users,
  Target,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import DonationForm from "@/components/donation-form";
import useFetchCampaigns, { Campaign } from "@/hooks/use-fetch-campaigns";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import WithdrawForm from "./withdraw-form";

export default function CharityDetail({ charityId }: { charityId: number }) {
  const { fetchCampaignDetails, loading, error } = useFetchCampaigns();
  const [charity, setCharity] = useState<Campaign | null>(null);
  const account = useActiveAccount();
  const address = account?.address;

  useEffect(() => {
    async function run() {
      const campaign = await fetchCampaignDetails(charityId);

      console.log(campaign);
      if (campaign) {
        setCharity(campaign);
      }
    }

    run();
  }, []);

  if (error) {
    return notFound();
  }

  if (loading || !charity) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader2 className="text-[#F5A623] w-14 h-14 text-2xl animate-spin" />
      </div>
    );
  }

  const percentage = Math.min(
    Math.round((charity.raisedAmount / charity.goal) * 100),
    100
  );

  // Check if the current user is the owner of the campaign
  const isOwner =
    address && address.toLowerCase() === charity.owner.toLowerCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/charities">
          <Button
            variant="outline"
            size="sm"
            className="border-border/40 hover:border-[#F5A623]/60 hover:bg-gradient-to-br hover:from-[#F7931A]/10 hover:to-[#F5A623]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Charities
          </Button>
        </Link>
        {charity.featured && (
          <Badge className="bg-gradient-to-r from-[#F7931A] to-[#F5A623] text-white">
            Featured
          </Badge>
        )}
        {isOwner && (
          <Badge className="bg-gradient-to-r from-[#6FCF97] to-[#27AE60] text-white ml-auto">
            Your Campaign
          </Badge>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
          <div className="relative h-64 w-full md:h-80">
            <Image
              src={charity.imageURI || "/placeholder.svg"}
              alt={charity.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-3xl font-bold">{charity.name}</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {charity.description}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold">About This Cause</h2>
                  <p className="mt-2 text-muted-foreground">{charity.story}</p>
                </div>

                <div>
                  <h2 className="text-xl font-bold">Our Impact</h2>
                  <ul className="mt-2 space-y-2">
                    {charity.impacts.map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <CheckCircle className="mt-0.5 h-5 w-5 text-[#F5A623]" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F7931A] to-[#F5A623] text-white shadow-glow-sm mx-auto">
                        <Bitcoin className="h-6 w-6" />
                      </div>
                      <div className="mt-2 text-lg font-bold">
                        {charity.raisedAmount} RBTC
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Raised of {charity.goal} RBTC
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2D9CDB] to-[#56CCF2] text-white shadow-glow-sm mx-auto">
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="mt-2 text-lg font-bold">
                        {charity?.donations}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Donations
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#6FCF97] to-[#27AE60] text-white shadow-glow-sm mx-auto">
                        <Target className="h-6 w-6" />
                      </div>
                      <div className="mt-2 text-lg font-bold">
                        {percentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Funded
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {charity.isActive && (
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isOwner ? (
              <WithdrawForm
                campaignId={charityId}
                raisedAmount={charity.raisedAmount}
              />
            ) : (
              <DonationForm campaignId={charityId} verified={charity?.verified} />
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}
