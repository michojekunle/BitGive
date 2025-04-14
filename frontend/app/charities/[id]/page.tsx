import DashboardLayout from "@/components/dashboard-layout"
import CharityDetail from "@/components/charity-detail"
import { notFound } from "next/navigation"

const charities: Record<string, {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  raised: number;
  goal: number;
  donors: number;
  featured?: boolean;
  trending?: boolean;
  impact: string[];
}> = {
  "clean-water": {
    id: "clean-water",
    name: "Clean Water Fund",
    description:
      "Bringing safe drinking water to communities in need. Your donation helps build wells and water filtration systems in areas affected by drought.",
    longDescription:
      "The Clean Water Fund is dedicated to providing clean, safe drinking water to communities around the world that lack access to this basic necessity. With your support, we build sustainable water systems, including wells, filtration systems, and rainwater harvesting infrastructure. We also educate communities on water conservation and sanitation practices to ensure long-term impact. Every donation directly contributes to our mission of ensuring everyone has access to clean water, regardless of where they live.",
    image: "/placeholder.svg?height=400&width=800",
    raised: 0.75,
    goal: 1.5,
    donors: 28,
    featured: true,
    impact: [
      "Built 12 wells in drought-affected regions",
      "Provided clean water to over 5,000 people",
      "Reduced waterborne diseases by 60% in target communities",
    ],
  },
  education: {
    id: "education",
    name: "Education for All",
    description:
      "Providing educational resources to underprivileged children worldwide. Help us build schools and supply learning materials.",
    longDescription:
      "Education for All believes that every child deserves access to quality education regardless of their socioeconomic background. We work in underserved communities to build schools, provide educational materials, and train teachers. Our programs focus on both academic education and practical skills that help children thrive in their communities. We also provide scholarships to talented students who would otherwise be unable to continue their education. Your donations help us break the cycle of poverty through education.",
    image: "/placeholder.svg?height=400&width=800",
    raised: 0.45,
    goal: 2.0,
    donors: 15,
    trending: true,
    impact: [
      "Built 3 schools in rural communities",
      "Provided educational materials to 2,000 students",
      "Awarded 50 scholarships to promising students",
    ],
  },
  "disaster-relief": {
    id: "disaster-relief",
    name: "Disaster Relief",
    description:
      "Supporting communities affected by natural disasters with immediate aid and long-term rebuilding assistance.",
    longDescription: "Our Disaster Relief program provides immediate assistance to communities affected by natural disasters such as earthquakes, floods, hurricanes, and wildfires. We deliver emergency supplies, temporary shelter, medical aid, and food to those in need. Beyond immediate relief, we stay committed to helping communities rebuild their homes, infrastructure, and livelihoods. Your donations enable us to respond quickly when disasters strike and provide sustained support throughout the recovery process.",
    image: "/placeholder.svg?height=400&width=800",
    raised: 1.2,
    goal: 3.0,
    donors: 42,
    impact: [
      "Provided emergency relief to 10,000 people after recent floods",
      "Rebuilt 75 homes destroyed by natural disasters",
      "Established 5 community centers for long-term recovery support",
    ],
  },
}

export default function CharityDetailPage({ params }: { params: { id: string } }) {
  const charity = charities[params?.id || ""];

  if (!charity) {
    notFound()
  }

  return (
    <DashboardLayout>
      <CharityDetail charity={charity} />
    </DashboardLayout>
  )
}
