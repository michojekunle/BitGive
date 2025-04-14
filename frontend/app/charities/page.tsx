import DashboardLayout from "@/components/dashboard-layout"
import CharityExplorer from "@/components/charity-explorer"

export default function CharitiesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Explore Charities</h1>
        <p className="text-muted-foreground">Browse and support causes you care about</p>
        <CharityExplorer />
      </div>
    </DashboardLayout>
  )
}
