import DashboardLayout from "@/components/dashboard-layout"
import CharityExplorer from "@/components/owner-charities-explorer"

export default function CharitiesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Your Charities</h1>
        <p className="text-muted-foreground">See and track all your charities</p>
        <CharityExplorer />
      </div>
    </DashboardLayout>
  )
}
