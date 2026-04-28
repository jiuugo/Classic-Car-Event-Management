import { z } from "zod"

export const ParticipantStepSchema = z.object({
  full_name: z.string().min(2, "Nombre completo es requerido"),
  email: z.string().email("Email inválido"),
  national_id: z.string().min(2, "DNI/NIE es requerido"),
})

export const VehicleStepSchema = z.object({
  brand: z.string().min(1, "Marca es requerida"),
  model: z.string().min(1, "Modelo es requerido"),
  license_plate: z.string().min(1, "Matrícula es requerida"),
})

export const TermsStepSchema = z.object({
  accept_terms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos",
  }),
})

export const InscriptionSchema = ParticipantStepSchema.merge(VehicleStepSchema).merge(TermsStepSchema)

export type InscriptionInput = z.infer<typeof InscriptionSchema>