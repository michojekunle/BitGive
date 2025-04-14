"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Download, TrendingUp } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

// Mock data for the chart
const donationData = [
  { name: "Jan", donations: 0.2 },
  { name: "Feb", donations: 0.4 },
  { name: "Mar", donations: 0.3 },
  { name: "Apr", donations: 0.5 },
  { name: "May", donations: 0.8 },
  { name: "Jun", donations: 0.7 },
  { name: "Jul", donations: 1.2 },
  { name: "Aug", donations: 1.5 },
  { name: "Sep", donations: 1.8 },
  { name: "Oct", donations: 2.0 },
  { name: "Nov", donations: 2.2 },
  { name: "Dec", donations: 2.5 },
]

export default function DonationOverview() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Donation Overview</CardTitle>
          <CardDescription>Track the growth of donations over time</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="yearly">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              <TrendingUp className="h-3 w-3" />
              <span>+27.4% from last year</span>
            </div>
          </div>

          <TabsContent value="daily" className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={donationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value} RBTC`} />
                <Tooltip formatter={(value) => [`${value} RBTC`, "Donations"]} />
                <Area
                  type="monotone"
                  dataKey="donations"
                  stroke="#F5A623"
                  fillOpacity={1}
                  fill="url(#colorDonations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="weekly" className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={donationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value} RBTC`} />
                <Tooltip formatter={(value) => [`${value} RBTC`, "Donations"]} />
                <Area
                  type="monotone"
                  dataKey="donations"
                  stroke="#F5A623"
                  fillOpacity={1}
                  fill="url(#colorDonations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="monthly" className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={donationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value} RBTC`} />
                <Tooltip formatter={(value) => [`${value} RBTC`, "Donations"]} />
                <Area
                  type="monotone"
                  dataKey="donations"
                  stroke="#F5A623"
                  fillOpacity={1}
                  fill="url(#colorDonations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="yearly" className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={donationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value} RBTC`} />
                <Tooltip formatter={(value) => [`${value} RBTC`, "Donations"]} />
                <Area
                  type="monotone"
                  dataKey="donations"
                  stroke="#F5A623"
                  fillOpacity={1}
                  fill="url(#colorDonations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Donated</div>
              <div className="mt-1 flex items-center gap-1">
                <div className="text-2xl font-bold">12.45 RBTC</div>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Donors</div>
              <div className="mt-1 flex items-center gap-1">
                <div className="text-2xl font-bold">237</div>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Charities</div>
              <div className="mt-1 flex items-center gap-1">
                <div className="text-2xl font-bold">18</div>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">NFTs Minted</div>
              <div className="mt-1 flex items-center gap-1">
                <div className="text-2xl font-bold">412</div>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
