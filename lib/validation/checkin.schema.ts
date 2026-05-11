import { z } from "zod"

export const CheckinItemsSchema = z.object({
  itemIds: z.array(z.string()).min(1, "Selecciona al menos un elemento"),
})

export type CheckinItemsInput = z.infer<typeof CheckinItemsSchema>
