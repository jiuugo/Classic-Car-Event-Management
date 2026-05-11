import { z } from "zod"

export const VehicleSchema = z.object({
  brand: z.string().min(1, "La marca es obligatoria"),
  model: z.string().min(1, "El modelo es obligatorio"),
  license_plate: z.string().min(2, "La matrícula es obligatoria"),
})

export type VehicleInput = z.infer<typeof VehicleSchema>

export const VehicleUpdateSchema = VehicleSchema.partial()
export type VehicleUpdateInput = z.infer<typeof VehicleUpdateSchema>
