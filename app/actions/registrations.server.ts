"use server"

import { randomUUID } from "crypto"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireStaffOrAdmin } from "@/lib/auth"
import { mapPrismaError } from "@/lib/errors"
import type {
  RegistrationRow,
  RegistrationDetail,
} from "@/lib/types/registration.types"
import type { Prisma } from "@/app/generated/prisma/client"

export async function getRegistrations(filters?: {
  status?: string
  paymentStatus?: string
  email?: string
}): Promise<
  { success: true; data: RegistrationRow[] } | { success: false; error: string }
> {
  try {
    const where: Prisma.RegistrationWhereInput = {}

    if (
      filters?.status &&
      ["PENDING", "PAID", "CANCELLED"].includes(filters.status)
    ) {
      where.status = filters.status as "PENDING" | "PAID" | "CANCELLED"
    }

    if (filters?.email) {
      where.participant = {
        email: { contains: filters.email, mode: "insensitive" },
      }
    }

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        participant: {
          select: { id: true, full_name: true, email: true },
        },
        _count: { select: { items: true } },
        payments: {
          take: 1,
          orderBy: { id: "desc" },
          select: { provider: true, status: true, amount: true },
        },
      },
    })

    const data: RegistrationRow[] = registrations.map((r) => {
      const payment = r.payments[0] ?? null
      return {
        id: r.id,
        participantName: r.participant.full_name,
        participantId: r.participant.id,
        participantEmail: r.participant.email,
        status: r.status as "PENDING" | "PAID" | "CANCELLED",
        vehicleCount: r._count.items,
        totalAmount: payment ? String(payment.amount) : null,
        paymentProvider: payment
          ? (payment.provider as "STRIPE" | "PAYPAL" | "MANUAL")
          : null,
        paymentStatus: payment
          ? (payment.status as "COMPLETED" | "FAILED")
          : null,
        createdAt: r.created_at.toISOString(),
      }
    })

    // Post-filter by payment status if requested
    let filtered = data
    if (filters?.paymentStatus) {
      if (filters.paymentStatus === "none") {
        filtered = data.filter((r) => r.paymentStatus === null)
      } else if (["COMPLETED", "FAILED"].includes(filters.paymentStatus)) {
        filtered = data.filter((r) => r.paymentStatus === filters.paymentStatus)
      }
    }

    return { success: true, data: filtered }
  } catch (err) {
    return {
      success: false,
      error: mapPrismaError(err).message ?? "Server error",
    }
  }
}

export async function getRegistrationById(
  id: string
): Promise<
  | { success: true; data: RegistrationDetail }
  | { success: false; error: string }
> {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        participant: {
          select: { id: true, full_name: true, email: true, national_id: true },
        },
        items: {
          include: {
            vehicle: {
              select: {
                id: true,
                brand: true,
                model: true,
                license_plate: true,
              },
            },
          },
        },
        payments: {
          select: { id: true, provider: true, amount: true, status: true },
        },
      },
    })

    if (!registration) {
      return { success: false, error: "Registration not found" }
    }

    const data: RegistrationDetail = {
      id: registration.id,
      status: registration.status as "PENDING" | "PAID" | "CANCELLED",
      stripe_session_id: registration.stripe_session_id,
      createdAt: registration.created_at.toISOString(),
      updatedAt: registration.updated_at.toISOString(),
      participant: {
        id: registration.participant.id,
        full_name: registration.participant.full_name,
        email: registration.participant.email,
        national_id: registration.participant.national_id,
      },
      items: registration.items.map((item) => ({
        id: item.id,
        entry_number: item.entry_number,
        checkin_date: item.checkin_date
          ? item.checkin_date.toISOString()
          : null,
        vehicle: {
          id: item.vehicle.id,
          brand: item.vehicle.brand,
          model: item.vehicle.model,
          license_plate: item.vehicle.license_plate,
        },
      })),
      payments: registration.payments.map((p) => ({
        id: p.id,
        provider: p.provider as "STRIPE" | "PAYPAL" | "MANUAL",
        amount: String(p.amount),
        status: p.status as "COMPLETED" | "FAILED",
      })),
    }

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: mapPrismaError(err).message ?? "Server error",
    }
  }
}

export async function updateRegistrationStatus(
  id: string,
  status: "PENDING" | "PAID" | "CANCELLED"
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireStaffOrAdmin()

    await prisma.registration.update({
      where: { id },
      data: { status },
    })

    try {
      revalidatePath("/dashboard/registrations")
      revalidatePath(`/dashboard/registrations/${id}`)
    } catch {
      // ignore
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error:
        mapPrismaError(err).message ??
        (err instanceof Error ? err.message : "Server error"),
    }
  }
}

export async function markRegistrationAsPaid(
  id: string,
  amount: number
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireStaffOrAdmin()

    await prisma.$transaction(async (tx) => {
      await tx.registration.update({
        where: { id },
        data: { status: "PAID" },
      })

      await tx.payment.create({
        data: {
          id: randomUUID(),
          registration_id: id,
          provider: "MANUAL",
          amount,
          status: "COMPLETED",
        },
      })
    })

    try {
      revalidatePath("/dashboard/registrations")
      revalidatePath(`/dashboard/registrations/${id}`)
    } catch {
      // ignore
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error:
        mapPrismaError(err).message ??
        (err instanceof Error ? err.message : "Server error"),
    }
  }
}

export async function cancelRegistration(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireStaffOrAdmin()

    const reg = await prisma.registration.findUnique({
      where: { id },
      select: { status: true, stripe_session_id: true },
    })

    if (!reg) {
      return { success: false, error: "Registration not found" }
    }

    if (reg.status === "PAID") {
      return {
        success: false,
        error: "Cannot cancel a paid registration. Refund the payment first.",
      }
    }

    // Expire the Stripe Checkout session so the user can't complete payment
    // after the registration has been cancelled.
    if (reg.stripe_session_id) {
      try {
        const stripeClient = (await import("@/lib/stripe")).default
        await stripeClient.checkout.sessions.expire(reg.stripe_session_id)
      } catch {
        // ignore — session may already be expired, completed, or invalid
      }
    }

    await prisma.registration.update({
      where: { id },
      data: { status: "CANCELLED" },
    })

    try {
      revalidatePath("/dashboard/registrations")
      revalidatePath(`/dashboard/registrations/${id}`)
    } catch {
      // ignore
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error:
        mapPrismaError(err).message ??
        (err instanceof Error ? err.message : "Server error"),
    }
  }
}
