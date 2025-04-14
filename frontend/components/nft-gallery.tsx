import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import Image from "next/image"

export default function NftGallery() {
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
    <Card>
      <CardHeader>
        <CardTitle>NFT Collection</CardTitle>
        <CardDescription>Your donation rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nfts.map((nft) => (
            <Card key={nft.id} className="overflow-hidden">
              <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-orange-100 to-blue-100">
                <Image src={nft.image || "/placeholder.svg"} alt={nft.title} fill className="object-cover" />
                <div className="absolute bottom-2 right-2 rounded-full bg-white/90 p-1 shadow-sm backdrop-blur">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
