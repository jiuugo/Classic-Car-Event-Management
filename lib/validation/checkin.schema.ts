import { z } from "zod"

export const CheckinItemsSchema = z.object({
  itemIds: z.array(z.string()).min(1, "itemIds must contain at least one id"),
})

export type CheckinItemsInput = z.infer<typeof CheckinItemsSchema>
