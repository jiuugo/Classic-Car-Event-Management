"use server"

import { randomUUID } from "crypto"
import { ZodError } from "zod"
import prisma from "@/lib/prisma"
import {
  InscriptionSchema,
  InscriptionInput,
} from "@/lib/validation/registration.schema"
import { mapPrismaError } from "@/lib/errors"

export type InscriptionResult = {
  success: boolean
  error?: string
  registrationId?: string
  fieldErrors?: Record<string, string>
  code?: string
}

/**
 * Creates a full inscription with PENDING status.
 * Records are persisted BEFORE payment so that data is never lost.
 * The Stripe webhook will later flip the status to PAID.
 *
 * @param registrationId – pre-generated UUID for the registration
 */
export async function submitInscription(
  data: InscriptionInput,
  registrationId?: string
): Promise<InscriptionResult> {
  try {
    const parsed = InscriptionSchema.parse(data)

    const regId = registrationId ?? randomUUID()

    await prisma.$transaction(async (tx) => {
      const participant = await tx.participant.create({
        data: {
          id: randomUUID(),
          full_name: parsed.full_name,
          email: parsed.email,
          national_id: parsed.national_id,
          qr_token: randomUUID(),
        },
      })

      await tx.registration.create({
        data: {
          id: regId,
          participant_id: participant.id,
          status: "PENDING",
        },
      })

      for (const v of parsed.vehicles) {
        const vehicle = await tx.vehicle.create({
          data: {
            id: randomUUID(),
            participant_id: participant.id,
            brand: v.brand,
            model: v.model,
            license_plate: v.license_plate,
          },
        })

        await tx.registrationItem.create({
          data: {
            id: randomUUID(),
            registration_id: regId,
            vehicle_id: vehicle.id,
          },
        })
      }
    })

    return { success: true, registrationId: regId }
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      const firstError = err.issues?.[0]?.message
      return { success: false, error: firstError || "Validation error" }
    }

    const { message, fields, code } = mapPrismaError(err)

    // Map DB column names to form field keys and friendly messages
    const dbToFormKey: Record<string, string> = {
      national_id: "national_id",
      email: "email",
      license_plate: "license_plate",
      qr_token: "qr_token",
    }

    const friendlyPerField: Record<string, string> = {
      email:
        "Este email ya está registrado. Si es tu cuenta, intenta iniciar sesión o usa otro email. Si crees que es un error, contacta con la organización.",
      national_id:
        "Ya existe una inscripción con este DNI/NIE. Si crees que es un error, contacta con la organización para que lo revisen.",
      license_plate:
        "Esta matrícula ya está registrada en otra inscripción. Si es tu vehículo y crees que es un error, contacta con la organización.",
      qr_token: "Ya existe un participante con este identificador",
    }

    let fieldErrors: Record<string, string> | undefined = undefined
    if (Array.isArray(fields) && fields.length > 0) {
      fieldErrors = {}
      for (const f of fields) {
        const key = dbToFormKey[f] ?? f
        fieldErrors[key] = friendlyPerField[f] ?? message
      }
    }

    return { success: false, error: message, fieldErrors, code }
  }
}

/**
 * Marks a registration as PAID and records the payment.
 * Idempotent — skips if the registration is already PAID.
 */
export async function confirmPayment(
  registrationId: string,
  amountEur: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: { status: true },
    })

    // Already confirmed — nothing to do
    if (!registration || registration.status === "PAID") {
      return { success: true }
    }

    await prisma.$transaction(async (tx) => {
      await tx.registration.update({
        where: { id: registrationId },
        data: { status: "PAID" },
      })

      await tx.payment.create({
        data: {
          id: randomUUID(),
          registration_id: registrationId,
          provider: "STRIPE",
          amount: amountEur,
          status: "COMPLETED",
        },
      })
    })

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { success: false, error: message }
  }
}

/**
 * Reconcile a registration by its Stripe session ID.
 * Used as a safety net on the success page.
 */
export async function reconcileBySessionId(
  stripeSessionId: string,
  amountEur: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const registration = await prisma.registration.findUnique({
      where: { stripe_session_id: stripeSessionId },
      select: { id: true, status: true },
    })

    if (!registration) {
      return { success: false, error: "Registration not found" }
    }

    if (registration.status === "PAID") {
      return { success: true }
    }

    return confirmPayment(registration.id, amountEur)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { success: false, error: message }
  }
}

/**
 * Reconcile ALL pending registrations that have a stripe_session_id.
 * Queries the Stripe API to check actual payment status.
 * Should be called periodically (cron) or manually (admin action).
 */
export async function reconcilePendingRegistrations(): Promise<{
  total: number
  reconciled: string[]
  failed: string[]
}> {
  // Dynamic import to avoid loading Stripe on every server action import
  const stripeClient = (await import("@/lib/stripe")).default

  const pendingRegistrations = await prisma.registration.findMany({
    where: {
      status: "PENDING",
      stripe_session_id: { not: null },
    },
    select: { id: true, stripe_session_id: true },
  })

  const reconciled: string[] = []
  const failed: string[] = []

  for (const reg of pendingRegistrations) {
    try {
      const session = await stripeClient.checkout.sessions.retrieve(
        reg.stripe_session_id!
      )

      if (session.payment_status === "paid") {
        const amountEur = (session.amount_total ?? 0) / 100
        const result = await confirmPayment(reg.id, amountEur)
        if (result.success) {
          reconciled.push(reg.id)
        } else {
          failed.push(reg.id)
        }
      }
      // If not paid, leave as PENDING — payment may still come through
    } catch (err) {
      console.error(
        `[reconcile] Failed to check session for registration ${reg.id}:`,
        err
      )
      failed.push(reg.id)
    }
  }

  return { total: pendingRegistrations.length, reconciled, failed }
}
