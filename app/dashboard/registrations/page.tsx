import { getRegistrations } from "@/app/actions/registrations.server"
import RegistrationList from "@/components/registration-list"

export const dynamic = "force-dynamic"

export default async function RegistrationsPage(props: {
  searchParams?: Promise<{
    status?: string
    paymentStatus?: string
  }>
}) {
  const searchParams = props.searchParams ? await props.searchParams : {}

  const status = searchParams.status ?? undefined
  const paymentStatus = searchParams.paymentStatus ?? undefined

  const result = await getRegistrations({ status, paymentStatus })

  const registrations = result.success ? result.data : []

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Inscripciones y Pagos</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Control de facturación, resolución de disputas de pago y monitoreo de
        capacidad. Filtra por estado de inscripción o pago.
      </p>

      <div className="mt-4">
        <RegistrationList
          registrations={registrations}
          currentFilters={{ status, paymentStatus }}
        />
      </div>
    </div>
  )
}
