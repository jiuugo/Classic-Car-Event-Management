"use server"

import { randomUUID } from "crypto"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireStaffOrAdmin } from "@/lib/auth"
import {
  ParticipantSchema,
  ParticipantUpdateSchema,
} from "@/lib/validation/participant.schema"
import { mapPrismaError } from "@/lib/errors"

export async function createParticipant(formData: FormData): Promise<void> {
  try {
    await requireStaffOrAdmin()

    const payload = {
      full_name: String(formData.get("full_name") ?? ""),
      email: String(formData.get("email") ?? ""),
      national_id: String(formData.get("national_id") ?? ""),
    }

    const parsed = ParticipantSchema.parse(payload)

    await prisma.participant.create({
      data: {
        full_name: parsed.full_name,
        email: parsed.email,
        national_id: parsed.national_id,
        qr_token: randomUUID(),
      },
    })

    try {
      revalidatePath("/dashboard/participants")
    } catch (e) {
      // ignore in environments that don't support revalidation
    }

    // Form actions should return void. The page will re-render after the action.
    return
  } catch (err) {
    const message = mapPrismaError(err).message ?? "Server error"
    // Throw so the framework can handle the error (and the developer can capture it)
    throw new Error(message)
  }
}

export async function searchParticipants(query: string) {
  try {
    const items = await prisma.participant.findMany({
      where: {
        OR: [
          { full_name: { contains: query, mode: "insensitive" } },
          { national_id: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 50,
      orderBy: { full_name: "asc" },
    })

    return { success: true, data: items }
  } catch (err) {
    return {
      success: false,
      error: mapPrismaError(err).message ?? "Server error",
    }
  }
}

export async function getParticipantById(id: string) {
  try {
    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        vehicles: true,
        registrations: {
          include: { items: { include: { vehicle: true } }, payments: true },
        },
      },
    })

    return { success: true, data: participant }
  } catch (err) {
    return {
      success: false,
      error: mapPrismaError(err).message ?? "Server error",
    }
  }
}

export async function updateParticipant(id: string, payload: any) {
  try {
    await requireStaffOrAdmin()

    const parsed = ParticipantUpdateSchema.parse(payload)

    const updated = await prisma.participant.update({
      where: { id },
      data: parsed,
    })

    try {
      revalidatePath("/dashboard/participants")
    } catch (e) {
      // ignore revalidation errors
    }

    return { success: true, data: updated }
  } catch (err) {
    const message =
      mapPrismaError(err).message ?? (err as any)?.message ?? "Server error"
    return { success: false, error: message }
  }
}
