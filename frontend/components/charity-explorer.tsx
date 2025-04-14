"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Bitcoin, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"

export default function CharityExplorer() {
  const charities = [
    {
      id: "clean-water",
      name: "Clean Water Fund",
      description:
        "Bringing safe drinking water to communities in need. Your donation helps build wells and water filtration systems in areas affected by drought.",
      image: "/placeholder.svg?height=160&width=320",
      raised: 0.75,
      goal: 1.5,
      featured: true,
    },
    {
      id: "education",
      name: "Education for All",
      description:
        "Providing educational resources to underprivileged children worldwide. Help us build schools and supply learning materials.",
      image: "/placeholder.svg?height=160&width=320",
      raised: 0.45,
      goal: 2.0,
      trending: true,
    },
    {
      id: "disaster-relief",
      name: "Disaster Relief",
      description:
        "Supporting communities affected by natural disasters with immediate aid and long-term rebuilding assistance.",
      image: "/placeholder.svg?height=160&width=320",
      raised: 1.2,
      goal: 3.0,
    },
  ]

  const [search, setSearch] = useState("")
  const [filteredCharities, setFilteredCharities] = useState(charities)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const lowerSearch = search.toLowerCase()
      setFilteredCharities(
        charities.filter((charity) =>
          charity.name.toLowerCase().includes(lowerSearch)
        )
      )
    }, 300) // Debounce delay in ms

    return () => clearTimeout(timeout)
  }, [search])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Charity Explorer</CardTitle>
        <CardDescription>Discover and support causes you care about</CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search charities..."
            className="w-full rounded-md bg-muted pl-8 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCharities.map((charity) => (
            <Card key={charity.id}>
              <div className="relative h-40 w-full">
                <Image
                  src={charity.image || "/placeholder.svg"}
                  alt={charity.name}
                  fill
                  className="object-cover"
                />
                {charity?.featured && (
                  <Badge className="absolute left-2 top-2 bg-[#F5A623]">Featured</Badge>
                )}
                {charity?.trending && (
                  <Badge className="absolute left-2 top-2 bg-[#2D9CDB]">Trending</Badge>
                )}
              </div>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{charity.name}</CardTitle>
                  <div className="flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    <Bitcoin className="mr-1 h-3 w-3" />
                    Verified
                  </div>
                </div>
                <CardDescription className="line-clamp-2">{charity.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="mb-2">
                  <Progress value={(charity.raised / charity.goal) * 100} className="h-2" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>
                    Raised: <span className="font-medium">{charity.raised} RBTC</span>
                  </span>
                  <span>
                    Goal: <span className="font-medium">{charity.goal} RBTC</span>
                  </span>
                </div>
                <Link href={`/charities/${charity.id}`}>
                  <Button className="mt-4 w-full bg-[#F5A623] text-white hover:bg-[#E09612]">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
