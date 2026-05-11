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

export async function createParticipant(data: {
  full_name: string
  email: string
  national_id: string
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireStaffOrAdmin()

    const parsed = ParticipantSchema.parse(data)

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

    return { success: true }
  } catch (err) {
    const message = mapPrismaError(err).message ?? "Server error"
    return { success: false, error: message }
  }
}

function getBestRegistrationStatus(
  registrations: { status: "PENDING" | "PAID" | "CANCELLED" }[]
): "PENDING" | "PAID" | "CANCELLED" | null {
  if (registrations.some((r) => r.status === "PAID")) return "PAID"
  if (registrations.some((r) => r.status === "PENDING")) return "PENDING"
  if (registrations.some((r) => r.status === "CANCELLED")) return "CANCELLED"
  return null
}

export async function getParticipants(showUnpaid?: boolean) {
  try {
    const where: any = {}

    if (!showUnpaid) {
      where.registrations = {
        some: {
          status: "PAID",
        },
      }
    }

    const items = await prisma.participant.findMany({
      where,
      take: 50,
      orderBy: { full_name: "asc" },
      include: {
        registrations: { select: { status: true } },
      },
    })

    const data = items.map((p) => ({
      ...p,
      registration_status: getBestRegistrationStatus(p.registrations),
    }))

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: mapPrismaError(err).message ?? "Server error",
    }
  }
}

export async function searchParticipants(query: string, showUnpaid?: boolean) {
  try {
    const where: any = {
      OR: [
        { full_name: { contains: query, mode: "insensitive" } },
        { national_id: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    }

    if (!showUnpaid) {
      where.registrations = {
        some: {
          status: "PAID",
        },
      }
    }

    const items = await prisma.participant.findMany({
      where,
      take: 50,
      orderBy: { full_name: "asc" },
      include: {
        registrations: { select: { status: true } },
      },
    })

    const data = items.map((p) => ({
      ...p,
      registration_status: getBestRegistrationStatus(p.registrations),
    }))

    return { success: true, data }
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
      revalidatePath(`/dashboard/participants/${id}`)
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

export async function deleteParticipant(id: string) {
  try {
    await requireStaffOrAdmin()

    // Safeguard: block deletion if there are completed payments linked
    const completedPayments = await prisma.payment.findFirst({
      where: {
        registration: { participant_id: id },
        status: "COMPLETED",
      },
    })

    if (completedPayments) {
      return {
        success: false,
        error:
          "No se puede eliminar un participante con pagos completados. Cancela o reembolsa todos los pagos primero.",
      }
    }

    await prisma.participant.delete({ where: { id } })

    try {
      revalidatePath("/dashboard/participants")
    } catch (e) {
      // ignore revalidation errors
    }

    return { success: true }
  } catch (err) {
    const message =
      mapPrismaError(err).message ?? (err as any)?.message ?? "Server error"
    return { success: false, error: message }
  }
}
