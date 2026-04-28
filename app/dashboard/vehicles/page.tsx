import { getVehicles, getDistinctBrands } from "@/app/actions/vehicles.server"
import VehicleList from "@/components/vehicle-list"

export default async function Page(props: {
  searchParams?: Promise<{ q?: string; brand?: string; status?: string }>
}) {
  const searchParams = props.searchParams ? await props.searchParams : {}
  
  const q = searchParams.q ?? undefined
  const brand = searchParams.brand ?? undefined
  const status = searchParams.status as "present" | "absent" | undefined

  const [vehiclesResult, brands] = await Promise.all([
    getVehicles({
      licensePlate: q,
      brand,
      attendance: status,
    }),
    getDistinctBrands(),
  ])

  const vehicles = vehiclesResult.success ? vehiclesResult.data : []

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Vehicle Fleet</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Directory of all registered vehicles. Search by license plate, filter by
        brand or attendance status.
      </p>

      <div className="mt-4">
        <VehicleList
          vehicles={vehicles}
          brands={brands}
          currentFilters={{ q, brand, status }}
        />
      </div>
    </div>
  )
}
