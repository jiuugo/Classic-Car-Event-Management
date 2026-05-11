import { requireAdmin } from "@/lib/auth"
import { getDashboardUsers } from "@/app/actions/dashboard-users.server"
import DashboardUserList from "@/components/dashboard-user-list"
import SettingsCreateButton from "@/components/settings-create-button"

export default async function Page() {
  const currentUser = await requireAdmin()

  const result = await getDashboardUsers()
  const users = result?.success ? (result.data ?? []) : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Configuración</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestiona los usuarios y roles del dashboard.
          </p>
        </div>
        <SettingsCreateButton />
      </div>

      <div className="mt-4">
        <DashboardUserList users={users} currentUserId={currentUser.id} />
      </div>
    </div>
  )
}
