import { getVehicles, getDistinctBrands } from "@/app/actions/vehicles.server"
import VehicleList from "@/components/vehicle-list"

export default async function Page(props: {
  searchParams?: Promise<{
    q?: string
    brand?: string
    status?: string
    showUnpaid?: string
  }>
}) {
  const searchParams = props.searchParams ? await props.searchParams : {}

  const q = searchParams.q ?? undefined
  const brand = searchParams.brand ?? undefined
  const status = searchParams.status as "present" | "absent" | undefined
  const showUnpaid = searchParams.showUnpaid === "true"

  const [vehiclesResult, brands] = await Promise.all([
    getVehicles({
      licensePlate: q,
      brand,
      attendance: status,
      showUnpaid,
    }),
    getDistinctBrands(),
  ])

  const vehicles = vehiclesResult.success ? vehiclesResult.data : []

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Flota de Vehículos</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Directorio de todos los vehículos registrados. Filtra por marca o estado
        de asistencia.
      </p>

      <div className="mt-4">
        <VehicleList
          vehicles={vehicles}
          brands={brands}
          currentFilters={{ q, brand, status, showUnpaid }}
        />
      </div>
    </div>
  )
}
