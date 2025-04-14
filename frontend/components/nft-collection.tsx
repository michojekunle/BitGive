import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import Image from "next/image"

export default function NftCollection() {
  // Mock data for NFT collection
  const nfts = [
    {
      id: 1,
      title: "Gold Donor #45",
      image: "/placeholder.svg?height=200&width=200",
      charity: "Clean Water Fund",
      date: "Apr 13, 2025",
      tier: "Gold",
    },
    {
      id: 2,
      title: "Silver Donor #123",
      image: "/placeholder.svg?height=200&width=200",
      charity: "Education for All",
      date: "Apr 10, 2025",
      tier: "Silver",
    },
    {
      id: 3,
      title: "Bronze Donor #78",
      image: "/placeholder.svg?height=200&width=200",
      charity: "Disaster Relief",
      date: "Apr 5, 2025",
      tier: "Bronze",
    },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>NFT Collection</CardTitle>
        <CardDescription>Your donation rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="all">All NFTs</TabsTrigger>
            <TabsTrigger value="gold">Gold</TabsTrigger>
            <TabsTrigger value="silver">Silver</TabsTrigger>
            <TabsTrigger value="bronze">Bronze</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {nfts.map((nft) => (
              <div key={nft.id} className="relative overflow-hidden rounded-lg border">
                <div className="flex items-center gap-3 p-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gradient-to-br from-orange-100 to-blue-100">
                    <Image src={nft.image || "/placeholder.svg"} alt={nft.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{nft.title}</h4>
                    <p className="text-sm text-muted-foreground">{nft.charity}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        className={
                          nft.tier === "Gold"
                            ? "bg-yellow-100 text-yellow-800"
                            : nft.tier === "Silver"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-amber-100 text-amber-800"
                        }
                      >
                        {nft.tier}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{nft.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                </div>
              </div>
            ))}

            <div className="text-center">
              <Button variant="outline" size="sm">
                View All NFTs
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="gold">
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Gold tier NFTs will appear here
            </div>
          </TabsContent>

          <TabsContent value="silver">
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Silver tier NFTs will appear here
            </div>
          </TabsContent>

          <TabsContent value="bronze">
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Bronze tier NFTs will appear here
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
