import { z } from "zod"

export const ParticipantSchema = z.object({
  full_name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Email no válido"),
  national_id: z.string().min(2, "El DNI/NIE es obligatorio"),
})

export type ParticipantInput = z.infer<typeof ParticipantSchema>

export const ParticipantUpdateSchema = ParticipantSchema.partial()
export type ParticipantUpdateInput = z.infer<typeof ParticipantUpdateSchema>
