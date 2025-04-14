"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bitcoin, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import DonationForm from "@/components/donation-form"

export default function RecentDonations() {
  // Mock data for recent donations
  const donations = [
    {
      id: 1,
      charity: "Clean Water Fund",
      amount: "0.05 RBTC",
      date: "Apr 13, 2025",
      status: "completed",
    },
    {
      id: 2,
      charity: "Education for All",
      amount: "0.02 RBTC",
      date: "Apr 10, 2025",
      status: "completed",
    },
    {
      id: 3,
      charity: "Disaster Relief",
      amount: "0.01 RBTC",
      date: "Apr 5, 2025",
      status: "completed",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <motion.div className="col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Your recent contributions</CardDescription>
            </div>
            <Link href="/donations">
              <Button
                variant="outline"
                size="sm"
                className="group border-border/40 hover:border-[#F5A623]/60 hover:bg-gradient-to-br hover:from-[#F7931A]/10 hover:to-[#F5A623]/10"
              >
                See All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {donations.map((donation, index) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#F7931A] to-[#F5A623] text-white shadow-glow-sm">
                          <Bitcoin className="h-4 w-4" />
                        </div>
                        <div className="flex-1 truncate">
                          <h3 className="font-medium truncate">{donation.charity}</h3>
                          <p className="text-xs text-muted-foreground">{donation.date}</p>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-lg font-bold">{donation.amount}</div>
                        <div className="text-xs text-muted-foreground">Donation Amount</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="xl:col-span-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DonationForm />
      </motion.div>
    </div>
  )
}
