"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts"

// Mock data for the pie chart
const data = [
  { name: "Clean Water Fund", value: 4.5, color: "#F5A623" },
  { name: "Education for All", value: 3.2, color: "#2D9CDB" },
  { name: "Disaster Relief", value: 2.8, color: "#F7931A" },
  { name: "Medical Aid", value: 1.5, color: "#6FCF97" },
  { name: "Other Causes", value: 0.45, color: "#9B51E0" },
]

export default function DonationStats() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Donation Distribution</CardTitle>
        <CardDescription>How donations are allocated across charities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} RBTC`, "Donated"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#F5A623]" />
              <span>Clean Water Fund</span>
            </div>
            <div className="font-medium">4.5 RBTC</div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#2D9CDB]" />
              <span>Education for All</span>
            </div>
            <div className="font-medium">3.2 RBTC</div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#F7931A]" />
              <span>Disaster Relief</span>
            </div>
            <div className="font-medium">2.8 RBTC</div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#6FCF97]" />
              <span>Medical Aid</span>
            </div>
            <div className="font-medium">1.5 RBTC</div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#9B51E0]" />
              <span>Other Causes</span>
            </div>
            <div className="font-medium">0.45 RBTC</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
