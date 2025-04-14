import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bitcoin, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function DonationHistory() {
  // Mock data for donation history
  const donations = [
    {
      id: 1,
      charity: "Clean Water Fund",
      amount: "0.05 RBTC",
      date: "Apr 13, 2025",
      time: "14:32",
      status: "completed",
      txHash: "0x1a2b3c...",
      nft: "Gold Donor #45",
    },
    {
      id: 2,
      charity: "Education for All",
      amount: "0.02 RBTC",
      date: "Apr 10, 2025",
      time: "09:15",
      status: "completed",
      txHash: "0x4d5e6f...",
      nft: "Silver Donor #123",
    },
    {
      id: 3,
      charity: "Disaster Relief",
      amount: "0.01 RBTC",
      date: "Apr 5, 2025",
      time: "18:47",
      status: "completed",
      txHash: "0x7g8h9i...",
      nft: "Bronze Donor #78",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation History</CardTitle>
        <CardDescription>Your past contributions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {donations.map((donation) => (
            <div key={donation.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Bitcoin className="h-5 w-5 text-[#F7931A]" />
                  </div>
                  <div>
                    <h3 className="font-medium">{donation.charity}</h3>
                    <p className="text-sm text-muted-foreground">
                      {donation.date} at {donation.time}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    donation.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {donation.status === "completed" ? "Completed" : "Pending"}
                </Badge>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-medium">{donation.amount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">NFT Received</div>
                  <div className="font-medium">{donation.nft}</div>
                </div>
                <div>
                  <Link
                    href={`https://explorer.rootstock.io/tx/${donation.txHash}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    View Transaction
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
