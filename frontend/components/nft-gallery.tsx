"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Share2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import useGetNfts, { NFTMetadata } from "@/hooks/use-get-nfts";
import { formatDate } from "@/lib/utils";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";

export default function NftGallery() {
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const { getOwnerNFTs, isLoading, error } = useGetNfts();
  const account = useActiveAccount();

  const handleShare = (uri: string) => {
    navigator.clipboard
      .writeText(uri)
      .then(() => {
        toast.success("NFT link copied to clipboard! 🎉", {
          position: "top-center",
        });
      })
      .catch((error): any => {
        console.error("Failed to copy:", error);
        toast.error(error?.message || "Failed to copy the NFT link.", {
          position: "top-center",
        });
      });
  };

  useEffect(() => {
    async function run() {
      const nfts = await getOwnerNFTs();
      setNfts(nfts);
    }
    run();
  }, [account]);

  if (error) {
    return <div>An error occured fetching nfts</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader2 className="text-[#F5A623]  w-14 h-14 text-2xl animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {nfts.length < 1 && (
        <>You don't have any nfts yet, Donate to start collecting! 🤩</>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {nfts.map((nft) => (
          <Card key={nft.id} className="overflow-hidden">
            <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-orange-100 to-blue-100">
              <Image
                src={nft.image || "/placeholder.svg"}
                alt={nft.title}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-2 right-2 rounded-full p-1 shadow-sm backdrop-blur">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleShare(`https://rootstock-testnet.blockscout.com/token/0x6bE0fc1fa590d4300E9c1aF59F551Dfa082464EF/instance/${nft.id}`)}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              </div>
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-base">{nft.title}</CardTitle>
              <CardDescription>{nft.charity}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <Badge
                  className={
                    nft.tier === "Gold"
                      ? "bg-yellow-100 text-yellow-800 hover:text-white"
                      : nft.tier === "Silver"
                      ? "bg-gray-100 text-gray-800 hover:text-white"
                      : "bg-amber-100 text-amber-800 hover:text-white"
                  }
                >
                  {nft.tier}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(nft.date)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
