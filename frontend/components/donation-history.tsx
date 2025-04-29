"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import useDonations, { DonationRecord } from "@/hooks/use-donations";
import { formatDate, formatTime } from "@/lib/utils";
import { useActiveAccount } from "thirdweb/react";
import Image from "next/image";
import Link from "next/link";

export default function DonationHistory() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const { getDonorDonations, isLoading, error } = useDonations();
  const account = useActiveAccount();

  useEffect(() => {
    async function run() {
      const donations = await getDonorDonations();
      setDonations(donations);
    }
    run();
  }, [account]);

  if (error) {
    return <div>An error occured fetching donations</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader2 className="text-[#F5A623] w-14 h-14 text-2xl animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {donations.length < 1 && (
        <>You don't have any donations yet, Make a donation to a charity</>
      )}
      <div className="space-y-4">
        {donations.map((donation) => (
          <div key={donation.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted overflow-hidden">
                  <Image
                    src={donation.campaignImage || "/placeholder.jpg"}
                    alt="campaign-image"
                    width={20}
                    height={20}
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <Link href={`/charities/${donation.campaignId}`}>
                    <h3 className="font-medium">{donation.campaignName}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(donation.timestamp)} at{" "}
                    {formatTime(donation.timestamp)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between sm:justify-start sm:gap-16">
              <div>
                <div className="text-sm text-muted-foreground">Amount</div>
                <div className="font-medium">{donation.amount} RBTC</div>
              </div>
              {donation.nftId && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    NFT Received
                  </div>
                  <div className="font-medium">{donation.nftId}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
