import DashboardLayout from "@/components/dashboard-layout"
import DonationSummary from "@/components/donation-summary"
import CharityList from "@/components/charity-list"
import RecentActivity from "@/components/recent-activity"
import RecentDonations from "@/components/recent-donations"

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top row */}
        <div className="col-span-2">
          <DonationSummary />
        </div>

        {/* Middle row */}
        <div className="md:col-span-2 lg:col-span-1">
          <CharityList />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <RecentActivity />
        </div>

        {/* Bottom row */}
        <div className="col-span-2">
          <RecentDonations />
        </div>
      </div>
    </DashboardLayout>
  )
}
