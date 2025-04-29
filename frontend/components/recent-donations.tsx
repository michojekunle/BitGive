"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bitcoin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import useDonations, { DonationRecord } from "@/hooks/use-donations";
import { formatDate } from "@/lib/utils";
import { useActiveAccount } from "thirdweb/react";
import Image from "next/image";

export default function RecentDonations() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const { getRecentDonations, isLoading, error } = useDonations();
  const account = useActiveAccount();

  useEffect(() => {
    async function run() {
      const donations = await getRecentDonations();
      setDonations(donations);
    }
    run();
  }, [account]);

  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>
                Recent contributions to charities
              </CardDescription>
            </div>
            <Link href="/donations">
              <Button
                variant="outline"
                size="sm"
                className="group border-border/40 hover:border-[#F5A623]/60 hover:bg-gradient-to-br hover:from-[#F7931A]/10 hover:to-[#F5A623]/10"
              >
                See All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center w-full h-full">
                <Loader2 className="text-[#F5A623] w-11 h-11 text-2xl animate-spin" />
              </div>
            )}
            {error && <div>An error occured fetching donations</div>}
            {donations.length === 0 && !isLoading && !error && <div className="text-muted-foreground">No recent donations</div>}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {donations.map((donation, index) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#F7931A] to-[#F5A623] text-white shadow-glow-sm overflow-hidden">
                          <Image
                            src={donation.campaignImage || "/placeholder.jpg"}
                            alt="campaign-image"
                            width={20}
                            height={20}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1 truncate">
                          <h3 className="font-medium truncate">
                            {donation.campaignName}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(donation.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-lg font-bold">
                          {donation.amount} RBTC
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Donation Amount
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
  );
}
