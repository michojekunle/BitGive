"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Bitcoin, LucideFileWarning } from "lucide-react";
import { motion } from "framer-motion";
import useDonations from "@/hooks/use-donations";
import { useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";

type Stats = {
  totalDonated: number;
  donors: number;
  charitiesSupported: number;
  nftsMinted: number;
};

export default function DonationSummary() {
  const { isLoading, error, getDonationStats } = useDonations();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function run() {
      const stats = await getDonationStats();
      setStats(stats);
    }
    run();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const ErrorIcon = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <AlertTriangle className="text-red-500 cursor-help mt-4 w-5 h-5" />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Unable to fetch data</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Donation Summary</CardTitle>
        <CardDescription>Overview of BitGive's impact</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          className="grid grid-cols-2 gap-4 xl:grid-cols-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="col-span-2 sm:col-span-1">
            <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#F7931A] to-[#F5A623] text-white shadow-glow-sm">
                    <Bitcoin className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Total Donated</span>
                </div>
                {isLoading ? (
                  <Skeleton className="mt-2 w-12 h-7" />
                ) : error ? (
                  <ErrorIcon />
                ) : (
                  <div className="mt-2 text-2xl font-bold">
                    {stats?.totalDonated.toFixed(4)} RBTC
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2D9CDB] to-[#56CCF2] text-white shadow-glow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Donors</span>
                </div>
                {isLoading ? (
                  <Skeleton className="mt-2 w-12 h-7" />
                ) : error ? (
                  <ErrorIcon />
                ) : (
                  <div className="mt-2 text-2xl font-bold">{stats?.donors}</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#F7931A] to-[#F5A623] text-white shadow-glow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Charities</span>
                </div>
                {isLoading ? (
                  <Skeleton className="mt-2 w-12 h-7" />
                ) : error ? (
                  <ErrorIcon />
                ) : (
                  <div className="mt-2 text-2xl font-bold">
                    {stats?.charitiesSupported}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6FCF97] to-[#27AE60] text-white shadow-glow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <rect width="20" height="12" x="2" y="6" rx="2" />
                      <path d="M14 2v4" />
                      <path d="M10 2v4" />
                      <path d="M10 18v4" />
                      <path d="M14 18v4" />
                      <path d="M6 10h.01" />
                      <path d="M6 14h.01" />
                      <path d="M18 10h.01" />
                      <path d="M18 14h.01" />
                      <path d="M10 10h4v4h-4z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">NFTs Minted</span>
                </div>
                {isLoading ? (
                  <Skeleton className="mt-2 w-12 h-7" />
                ) : error ? (
                  <ErrorIcon />
                ) : (
                  <div className="mt-2 text-2xl font-bold">
                    {stats?.nftsMinted}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
