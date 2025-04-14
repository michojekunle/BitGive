"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export default function CharityList() {
  // Mock data for featured charities
  const charities = [
    {
      id: "clean-water",
      name: "Clean Water Fund",
      description: "Bringing safe drinking water to communities in need.",
      image: "/placeholder.svg?height=80&width=160",
      raised: 0.75,
      goal: 1.5,
      featured: true,
    },
    {
      id: "education",
      name: "Education for All",
      description: "Providing educational resources to underprivileged children.",
      image: "/placeholder.svg?height=80&width=160",
      raised: 0.45,
      goal: 2.0,
      trending: true,
    },
  ]

  return (
    <Card className="h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Featured Charities</CardTitle>
        <CardDescription>Causes that need your support</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {charities.map((charity, index) => (
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
                    <Image src={charity.image || "/placeholder.svg"} alt={charity.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{charity.name}</h3>
                      {charity.featured && (
                        <Badge className="bg-gradient-to-r from-[#F7931A] to-[#F5A623] text-white">Featured</Badge>
                      )}
                      {charity.trending && (
                        <Badge className="bg-gradient-to-r from-[#2D9CDB] to-[#56CCF2] text-white">Trending</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{charity.description}</p>
                    <div className="mt-2">
                      <Progress value={(charity.raised / charity.goal) * 100} className="h-2" />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span>
                        Raised: <span className="font-medium">{charity.raised} RBTC</span>
                      </span>
                      <span>
                        Goal: <span className="font-medium">{charity.goal} RBTC</span>
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
  )
}
