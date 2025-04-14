import DashboardLayout from "@/components/dashboard-layout"
import CreateCampaignForm from "@/components/create-campaign-form"

export default function CreateCampaignPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Create a Charity Campaign</h1>
        <p className="text-muted-foreground">Start your own fundraising initiative for a cause you care about</p>
        <CreateCampaignForm />
      </div>
    </DashboardLayout>
  )
}
