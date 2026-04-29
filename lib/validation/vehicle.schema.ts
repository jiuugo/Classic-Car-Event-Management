import { z } from "zod"

export const VehicleSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  license_plate: z.string().min(2, "License plate is required"),
})

export type VehicleInput = z.infer<typeof VehicleSchema>

export const VehicleUpdateSchema = VehicleSchema.partial()
export type VehicleUpdateInput = z.infer<typeof VehicleUpdateSchema>
