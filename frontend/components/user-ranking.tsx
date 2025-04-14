import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

export default function UserRanking() {
  // Mock data for user rankings
  const topDonors = [
    {
      id: 1,
      name: "Alex Johnson",
      avatar: "/placeholder.svg",
      initials: "AJ",
      amount: "1.25 RBTC",
      rank: 1,
      nfts: 5,
    },
    {
      id: 2,
      name: "Maria Garcia",
      avatar: "/placeholder.svg",
      initials: "MG",
      amount: "0.95 RBTC",
      rank: 2,
      nfts: 4,
    },
    {
      id: 3,
      name: "Sam Wilson",
      avatar: "/placeholder.svg",
      initials: "SW",
      amount: "0.82 RBTC",
      rank: 3,
      nfts: 3,
    },
    {
      id: 4,
      name: "Taylor Kim",
      avatar: "/placeholder.svg",
      initials: "TK",
      amount: "0.75 RBTC",
      rank: 4,
      nfts: 3,
    },
    {
      id: 5,
      name: "Jordan Lee",
      avatar: "/placeholder.svg",
      initials: "JL",
      amount: "0.68 RBTC",
      rank: 5,
      nfts: 2,
    },
  ]

  // Current user rank (mock)
  const currentUser = {
    name: "You",
    avatar: "/placeholder.svg",
    initials: "YO",
    amount: "0.45 RBTC",
    rank: 12,
    nfts: 3,
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Donor Leaderboard</CardTitle>
        <CardDescription>Top contributors to our causes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topDonors.map((donor) => (
            <div key={donor.id} className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {donor.rank}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={donor.avatar || "/placeholder.svg"} alt={donor.name} />
                <AvatarFallback>{donor.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{donor.name}</span>
                  {donor.rank === 1 && <Trophy className="h-4 w-4 text-[#F5A623]" />}
                </div>
                <div className="text-xs text-muted-foreground">{donor.nfts} NFTs collected</div>
              </div>
              <div className="text-sm font-medium">{donor.amount}</div>
            </div>
          ))}

          <div className="my-2 border-t pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-medium text-orange-800">
                {currentUser.rank}
              </div>
              <Avatar className="h-8 w-8 border-2 border-orange-200">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                <AvatarFallback>{currentUser.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currentUser.name}</span>
                  <Badge variant="outline" className="px-1 text-xs">
                    You
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">{currentUser.nfts} NFTs collected</div>
              </div>
              <div className="text-sm font-medium">{currentUser.amount}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
