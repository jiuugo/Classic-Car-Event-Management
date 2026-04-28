import { getDashboardStats } from "@/app/actions/dashboard.server"
import { DashboardKpiCards } from "@/components/dashboard-kpi-cards"
import { DashboardRegistrationChart } from "@/components/dashboard-registration-chart"
import { DashboardAttendanceCard } from "@/components/dashboard-attendance-card"
import {
  DashboardQuickActions,
  DashboardRecentRegistrations,
} from "@/components/dashboard-quick-actions"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const result = await getDashboardStats()

  const stats = result.success
    ? result.data
    : {
        totalParticipants: 0,
        totalVehicles: 0,
        totalRevenue: 0,
        liveAttendanceRate: 0,
        checkedInVehicles: 0,
        totalRegistrationItems: 0,
        registrationsByStatus: { PENDING: 0, PAID: 0, CANCELLED: 0 },
        paymentsByStatus: { COMPLETED: 0, FAILED: 0 },
        recentRegistrations: [],
      }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 lg:px-6">
      {/* KPI Cards row */}
      <DashboardKpiCards stats={stats} />

      {/* Charts + Quick actions row */}
      <div className="grid gap-6 px-4 lg:grid-cols-3 lg:px-6">
        {/* Registration donut chart */}
        <DashboardRegistrationChart stats={stats} />

        {/* Attendance progress */}
        <DashboardAttendanceCard stats={stats} />

        {/* Quick actions */}
        <DashboardQuickActions />
      </div>

      {/* Recent registrations */}
      <div className="px-4 lg:px-6">
        <DashboardRecentRegistrations
          registrations={stats.recentRegistrations}
        />
      </div>
    </div>
  )
}
