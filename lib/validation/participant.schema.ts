import { z } from "zod"

export const ParticipantSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  national_id: z.string().min(2, "National ID is required"),
})

export type ParticipantInput = z.infer<typeof ParticipantSchema>
