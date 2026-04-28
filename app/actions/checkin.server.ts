"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireStaffOrAdmin } from "@/lib/auth"
import { CheckinItemsSchema } from "@/lib/validation/checkin.schema"
import { mapPrismaError } from "@/lib/errors"

export async function findByQrToken(qrToken: string) {
  try {
    const participant = await prisma.participant.findUnique({
      where: { qr_token: qrToken },
      include: {
        vehicles: true,
        registrations: {
          include: {
            items: {
              include: { vehicle: true },
            },
          },
        },
      },
    })

    return { success: true, data: participant }
  } catch (err) {
    return { success: false, error: mapPrismaError(err).message }
  }
}

export async function searchByLicensePlate(licensePlate: string) {
  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { license_plate: licensePlate },
      include: { participant: true, registration_item: true },
    })

    return { success: true, data: vehicle }
  } catch (err) {
    return { success: false, error: mapPrismaError(err).message }
  }
}

export async function checkinRegistrationItems(input: {
  itemIds: string[]
  mode?: "mark" | "undo" | "toggle"
}) {
  try {
    await requireStaffOrAdmin()

    const parsed = CheckinItemsSchema.parse({ itemIds: input.itemIds })

    const now = new Date()
    const mode = input.mode ?? "mark"

    let updatedCount = 0

    if (mode === "mark") {
      const result = await prisma.registrationItem.updateMany({
        where: { id: { in: parsed.itemIds }, checkin_date: null },
        data: { checkin_date: now },
      })
      updatedCount = (result as any).count ?? 0
    } else if (mode === "undo") {
      const result = await prisma.registrationItem.updateMany({
        where: { id: { in: parsed.itemIds }, NOT: { checkin_date: null } },
        data: { checkin_date: null },
      })
      updatedCount = (result as any).count ?? 0
    } else {
      // toggle
      const items = await prisma.registrationItem.findMany({
        where: { id: { in: parsed.itemIds } },
        select: { id: true, checkin_date: true },
      })

      const toMark = items
        .filter((i) => i.checkin_date == null)
        .map((i) => i.id)
      const toUndo = items
        .filter((i) => i.checkin_date != null)
        .map((i) => i.id)

      const results = await prisma.$transaction([
        toMark.length
          ? prisma.registrationItem.updateMany({
              where: { id: { in: toMark }, checkin_date: null },
              data: { checkin_date: now },
            })
          : prisma.$executeRaw`SELECT 1`,
        toUndo.length
          ? prisma.registrationItem.updateMany({
              where: { id: { in: toUndo }, NOT: { checkin_date: null } },
              data: { checkin_date: null },
            })
          : prisma.$executeRaw`SELECT 1`,
      ])

      const r1 = Array.isArray(results) && (results[0] as any)?.count
      const r2 = Array.isArray(results) && (results[1] as any)?.count
      updatedCount = (r1 ?? 0) + (r2 ?? 0)
    }

    try {
      revalidatePath("/dashboard/checkin")
    } catch (e) {
      // ignore revalidation errors in environments that don't support it
    }

    return { success: true, updatedCount }
  } catch (err) {
    return { success: false, error: mapPrismaError(err).message }
  }
}
