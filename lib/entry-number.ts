import type { Prisma } from "@/app/generated/prisma/client"

type TransactionClient = Prisma.TransactionClient

export async function assignNextEntryNumbers(
  tx: TransactionClient,
  registrationId: string
): Promise<void> {
  const items = await tx.registrationItem.findMany({
    where: { registration_id: registrationId, entry_number: null },
    select: { id: true },
  })

  if (items.length === 0) return

  const maxResult = await tx.registrationItem.aggregate({
    _max: { entry_number: true },
  })
  let next = (maxResult._max.entry_number ?? 100) + 1

  for (const item of items) {
    await tx.registrationItem.update({
      where: { id: item.id },
      data: { entry_number: next++ },
    })
  }
}
