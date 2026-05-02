export type CheckinVehicle = {
  id: string
  brand: string
  model: string
  license_plate: string
}

export type CheckinItem = {
  id: string
  entry_number: number | null
  checkin_date: string | null
  vehicle: CheckinVehicle
}

export type ParticipantCheckinData = {
  id: string
  full_name: string
  email: string
  national_id: string
  qr_token: string
  items: CheckinItem[]
}
