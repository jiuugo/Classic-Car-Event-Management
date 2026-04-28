export type VehicleRow = {
  id: string
  brand: string
  model: string
  license_plate: string
  participant: {
    id: string
    full_name: string
  }
  registration_item: {
    entry_number: number | null
    checkin_date: string | null // ISO string or null
  } | null
}
