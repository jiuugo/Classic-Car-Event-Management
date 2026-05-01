export type RegistrationRow = {
  id: string
  participantName: string
  participantId: string
  participantEmail: string
  status: "PENDING" | "PAID" | "CANCELLED"
  vehicleCount: number
  totalAmount: string | null
  paymentProvider: "STRIPE" | "PAYPAL" | "MANUAL" | null
  paymentStatus: "COMPLETED" | "FAILED" | null
  createdAt: string
}

export type RegistrationDetailVehicle = {
  id: string
  brand: string
  model: string
  license_plate: string
}

export type RegistrationDetailItem = {
  id: string
  entry_number: number | null
  checkin_date: string | null
  vehicle: RegistrationDetailVehicle
}

export type RegistrationDetailPayment = {
  id: string
  provider: "STRIPE" | "PAYPAL" | "MANUAL"
  amount: string
  status: "COMPLETED" | "FAILED"
}

export type RegistrationDetailParticipant = {
  id: string
  full_name: string
  email: string
  national_id: string
}

export type RegistrationDetail = {
  id: string
  status: "PENDING" | "PAID" | "CANCELLED"
  stripe_session_id: string | null
  createdAt: string
  updatedAt: string
  participant: RegistrationDetailParticipant
  items: RegistrationDetailItem[]
  payments: RegistrationDetailPayment[]
}
