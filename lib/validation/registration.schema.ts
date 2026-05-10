import { z } from "zod"

export const ParticipantStepSchema = z.object({
  full_name: z.string().min(2, "Escribe tu nombre completo"),
  email: z.string().email("El formato del email no es correcto (ej.: nombre@correo.com)"),
  national_id: z.string().min(2, "Escribe tu DNI o NIE"),
})

export const VehicleStepSchema = z.object({
  brand: z.string().min(1, "Indica la marca"),
  model: z.string().min(1, "Indica el modelo"),
  license_plate: z.string().min(1, "Indica la matrícula"),
})

export const VehiclesArraySchema = z.object({
  vehicles: z
    .array(VehicleStepSchema)
    .min(1, "Añade al menos un vehículo"),
})

export const TermsStepSchema = z.object({
  accept_terms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones para inscribirte",
  }),
})

export const InscriptionSchema =
  ParticipantStepSchema.merge(VehiclesArraySchema).merge(TermsStepSchema)

export const ManualInscriptionSchema = ParticipantStepSchema.merge(
  VehiclesArraySchema
).extend({
  amount: z.number().min(0, "El importe debe ser 0 o mayor"),
})

export type VehicleInput = z.infer<typeof VehicleStepSchema>
export type InscriptionInput = z.infer<typeof InscriptionSchema>
export type ManualInscriptionInput = z.infer<typeof ManualInscriptionSchema>
