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

export async function checkinRegistrationItems(input: { itemIds: string[] }) {
  try {
    await requireStaffOrAdmin()

    const parsed = CheckinItemsSchema.parse(input)

    const now = new Date()

    const result = await prisma.registrationItem.updateMany({
      where: { id: { in: parsed.itemIds }, checkin_date: null },
      data: { checkin_date: now },
    })

    try {
      revalidatePath("/dashboard/checkin")
    } catch (e) {
      // ignore revalidation errors in environments that don't support it
    }

    return { success: true, updatedCount: (result as any).count ?? 0 }
  } catch (err) {
    return { success: false, error: mapPrismaError(err).message }
  }
}
