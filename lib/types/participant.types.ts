export type ParticipantDetail = {
  id: string
  full_name: string
  email: string
  national_id: string
  qr_token: string
  vehicles: ParticipantVehicle[]
  registrations: ParticipantRegistration[]
}

export type ParticipantVehicle = {
  id: string
  brand: string
  model: string
  license_plate: string
}

export type ParticipantRegistrationItem = {
  id: string
  entry_number: number | null
  checkin_date: string | null
  vehicle: ParticipantVehicle
}

export type ParticipantPayment = {
  id: string
  provider: "STRIPE" | "PAYPAL" | "MANUAL"
  amount: string // Decimal serialised as string
  status: "COMPLETED" | "FAILED"
}

export type ParticipantRegistration = {
  id: string
  status: "PENDING" | "PAID" | "CANCELLED"
  items: ParticipantRegistrationItem[]
  payments: ParticipantPayment[]
}

export type ParticipantRow = {
  id: string
  full_name: string
  email: string
  national_id: string
  qr_token: string
  registration_status: "PENDING" | "PAID" | "CANCELLED" | null
}
