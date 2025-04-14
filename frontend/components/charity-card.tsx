import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bitcoin } from "lucide-react"
import Image from "next/image"

interface CharityCardProps {
  name: string
  description: string
  image: string
  raised: number
  goal: number
  id: string
}

export default function CharityCard({ name, description, image, raised, goal, id }: CharityCardProps) {
  const percentage = Math.min(Math.round((raised / goal) * 100), 100)

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 w-full">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" priority />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {name}
          <div className="flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            <Bitcoin className="mr-1 h-3 w-3" />
            Verified
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <Progress value={percentage} className="h-2" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>
            Raised: <span className="font-medium">{raised} RBTC</span>
          </span>
          <span>
            Goal: <span className="font-medium">{goal} RBTC</span>
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#F5A623] text-white hover:bg-[#E09612]">Support Now</Button>
      </CardFooter>
    </Card>
  )
}
