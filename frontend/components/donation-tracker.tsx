import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

export default function DonationTracker() {
  // Mock data for demonstration
  const stats = {
    totalDonated: 2.45,
    donors: 37,
    charitiesSupported: 3,
  }

  const topCharities = [
    { name: "Clean Water Fund", amount: 0.75, donors: 15 },
    { name: "Disaster Relief", amount: 1.2, donors: 12 },
    { name: "Education for All", amount: 0.5, donors: 10 },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-3xl font-bold text-[#F5A623]">{stats.totalDonated} RBTC</div>
            <p className="text-sm text-muted-foreground">Total Donated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-3xl font-bold text-[#2D9CDB]">{stats.donors}</div>
            <p className="text-sm text-muted-foreground">Supporters</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-3xl font-bold text-[#F7931A]">{stats.charitiesSupported}</div>
            <p className="text-sm text-muted-foreground">Causes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-medium">Top Charities</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Charity</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Donors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCharities.map((charity) => (
                <TableRow key={charity.name}>
                  <TableCell className="font-medium">{charity.name}</TableCell>
                  <TableCell className="text-right">{charity.amount} RBTC</TableCell>
                  <TableCell className="text-right">{charity.donors}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 text-center">
            <Link
              href="https://explorer.rootstock.io/"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              View on Rootstock Explorer
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
