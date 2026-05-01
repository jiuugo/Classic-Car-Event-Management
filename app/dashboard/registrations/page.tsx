import { getRegistrations } from "@/app/actions/registrations.server"
import RegistrationList from "@/components/registration-list"

export const dynamic = "force-dynamic"

export default async function RegistrationsPage(props: {
  searchParams?: Promise<{
    email?: string
    status?: string
    paymentStatus?: string
  }>
}) {
  const searchParams = props.searchParams ? await props.searchParams : {}

  const email = searchParams.email ?? undefined
  const status = searchParams.status ?? undefined
  const paymentStatus = searchParams.paymentStatus ?? undefined

  const result = await getRegistrations({ email, status, paymentStatus })

  const registrations = result.success ? result.data : []

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Registrations & Payments</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Billing control, payment dispute resolution, and capacity monitoring.
        Search by email and filter by registration or payment status.
      </p>

      <div className="mt-4">
        <RegistrationList
          registrations={registrations}
          currentFilters={{ email, status, paymentStatus }}
        />
      </div>
    </div>
  )
}
