"use client";

import { useEffect, useState } from "react";
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
import { Bitcoin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import useFetchCampaigns, { Campaign } from "@/hooks/use-fetch-campaigns";
import { useActiveAccount } from "thirdweb/react";

export default function CharityExplorer() {
  const [charities, setCharities] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [filteredCharities, setFilteredCharities] = useState(charities);
  const { getOwnerCampaigns, loading, error } = useFetchCampaigns();
  const account = useActiveAccount();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const lowerSearch = search.toLowerCase();
      setFilteredCharities(
        charities.filter((charity) =>
          charity.name.toLowerCase().includes(lowerSearch)
        )
      );
    }, 400); // Debounce delay in ms

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    async function run() {
      if (!account) return;
      const campaigns = await getOwnerCampaigns(account?.address);
      
      setCharities(campaigns);
      setFilteredCharities(campaigns);
    }
    run();
  }, [account]);

  return (
    <>
      <div className="relative mt-2 flex items-center">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search charities..."
          className="w-full rounded-md bg-muted pl-8 outline-none border-none ring-0 "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center w-full h-full">
          <Loader2 className="text-[#F5A623] w-11 h-11 text-2xl animate-spin" />
        </div>
      )}
      {error && <div>An error occured fetching owner charities</div>}

      {charities.length === 0 && !loading && (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-muted-foreground">You haven't created any charities yet</p>
        </div>
      )}

      {filteredCharities.length === 0 && !loading && search && (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-muted-foreground">No charities found matching your search.</p>
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCharities.map((charity) => (
          <Card key={charity.id} className="overflow-hidden">
            <div className="relative h-40 w-full ">
              <Image
                src={charity.imageURI || "/placeholder.svg"}
                alt={charity.name}
                fill
                className="object-cover"
              />
              {charity?.featured && (
                <Badge className="absolute left-2 top-2 bg-[#F5A623]">
                  Featured
                </Badge>
              )}
            </div>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{charity.name}</CardTitle>
                {charity?.verified && (
                  <div className="flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    <Bitcoin className="mr-1 h-3 w-3" />
                    Verified
                  </div>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {charity.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="mb-2">
                <Progress
                  value={(charity.raisedAmount / charity.goal) * 100}
                  className="h-2"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>
                  Raised:{" "}
                  <span className="font-medium">
                    {charity.raisedAmount} RBTC
                  </span>
                </span>
                <span>
                  Goal: <span className="font-medium">{charity.goal} RBTC</span>
                </span>
              </div>
              <Link href={`/charities/${charity.id}`}>
                <Button className="mt-4 w-full bg-[#F5A623] text-white hover:bg-[#E09612]">
                  Learn More
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
