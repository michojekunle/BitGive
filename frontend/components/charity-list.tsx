"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import useFetchCampaigns, { Campaign } from "@/hooks/use-fetch-campaigns";
import { useState, useEffect } from "react";

export default function CharityList() {
  const [charities, setCharities] = useState<Campaign[]>([]);
  const { getFeaturedCampaigns, loading, error } = useFetchCampaigns();

  useEffect(() => {
    async function run() {
      const campaigns = await getFeaturedCampaigns();
      if (campaigns) setCharities(campaigns);
    }
    run();
  }, []);

  return (
    <Card className="h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Featured Charities</CardTitle>
        <CardDescription>Causes that need your support</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center w-full h-full">
            <Loader2 className="text-[#F5A623] w-11 h-11 text-2xl animate-spin" />
          </div>
        )}
        {error && <div>An error occured fetching featured charities</div>}
        {charities.slice(0, 3).map((charity, index) => (
          <motion.div
            key={charity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/charities/${charity.id}`}>
              <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-md hover:border-border/60 transition-all duration-300">
                <div className="flex gap-3 p-3">
                  <div className="relative h-20 w-40 overflow-hidden rounded-md">
                    <Image
                      src={charity.imageURI || "/placeholder.svg"}
                      alt={charity.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{charity.name}</h3>
                      {charity.featured && (
                        <Badge className="bg-gradient-to-r from-[#F7931A] to-[#F5A623] text-white">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {charity.description}
                    </p>
                    <div className="mt-2">
                      <Progress
                        value={(charity.raisedAmount / charity.goal) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span>
                        Raised:{" "}
                        <span className="font-medium">
                          {charity.raisedAmount} RBTC
                        </span>
                      </span>
                      <span>
                        Goal:{" "}
                        <span className="font-medium">{charity.goal} RBTC</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}

        <div className="text-center">
          <Link href="/charities">
            <Button
              variant="outline"
              size="sm"
              className="group border-border/40 hover:border-[#F5A623]/60 hover:bg-gradient-to-br hover:from-[#F7931A]/10 hover:to-[#F5A623]/10"
            >
              View All Charities
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
