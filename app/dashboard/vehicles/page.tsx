import { getVehicles, getDistinctBrands } from "@/app/actions/vehicles.server"
import VehicleList from "@/components/vehicle-list"

export default async function Page(props: {
  searchParams?: Promise<{ brand?: string; status?: string }>
}) {
  const searchParams = props.searchParams ? await props.searchParams : {}

  const brand = searchParams.brand ?? undefined
  const status = searchParams.status as "present" | "absent" | undefined

  const [vehiclesResult, brands] = await Promise.all([
    getVehicles({
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
        Directory of all registered vehicles. Filter by brand or attendance
        status.
      </p>

      <div className="mt-4">
        <VehicleList
          vehicles={vehicles}
          brands={brands}
          currentFilters={{ brand, status }}
        />
      </div>
    </div>
  )
}
