"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bitcoin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function RecentActivity() {
  // Mock data for recent activity
  const activities = [
    {
      id: 1,
      type: "donation",
      user: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg",
        initials: "AJ",
      },
      charity: "Clean Water Fund",
      amount: "0.05 RBTC",
      time: "2 minutes ago",
      txHash: "0x1a2b3c...",
    },
    {
      id: 2,
      type: "nft",
      user: {
        name: "Maria Garcia",
        avatar: "/placeholder.svg",
        initials: "MG",
      },
      nft: "Silver Donor #124",
      charity: "Education for All",
      time: "15 minutes ago",
      txHash: "0x4d5e6f...",
    },
    {
      id: 3,
      type: "donation",
      user: {
        name: "Sam Wilson",
        avatar: "/placeholder.svg",
        initials: "SW",
      },
      charity: "Disaster Relief",
      amount: "0.1 RBTC",
      time: "32 minutes ago",
      txHash: "0x7g8h9i...",
    },
  ]

  return (
    <Card className="h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest donations and NFT mints</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
                <div className="flex items-start gap-3 p-3">
                  <Avatar className="h-8 w-8 border border-border/40">
                    <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                    <AvatarFallback>{activity.user.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.user.name}</span>
                      <Badge variant="outline" className="px-1 text-xs border-border/40">
                        {activity.type === "donation" ? "Donated" : "Minted NFT"}
                      </Badge>
                    </div>
                    {activity.type === "donation" ? (
                      <p className="text-sm text-muted-foreground">
                        Donated <span className="font-medium">{activity.amount}</span> to{" "}
                        <span className="font-medium">{activity.charity}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Received <span className="font-medium">{activity.nft}</span> from{" "}
                        <span className="font-medium">{activity.charity}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.time}</span>
                      <span>•</span>
                      <Link
                        href={`https://explorer.rootstock.io/tx/${activity.txHash}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-[#F5A623] hover:text-[#F7931A] transition-colors"
                      >
                        View Transaction
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#F7931A] to-[#F5A623] text-white shadow-glow-sm">
                    <Bitcoin className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
