"use server"

import { randomUUID } from "crypto"
import { ZodError } from "zod"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { requireStaffOrAdmin } from "@/lib/auth"
import {
  InscriptionSchema,
  InscriptionInput,
  ManualInscriptionSchema,
  ManualInscriptionInput,
} from "@/lib/validation/registration.schema"
import { mapPrismaError } from "@/lib/errors"
import { sendEmail } from "@/lib/email"
import { generateConfirmationEmailHtml } from "@/lib/email-templates"

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
      // 1. Find or create participant
      let participant = await tx.participant.findFirst({
        where: {
          OR: [
            { email: parsed.email },
            { national_id: parsed.national_id },
          ],
        },
      })

      if (participant) {
        // Update name to latest submission
        await tx.participant.update({
          where: { id: participant.id },
          data: {
            full_name: parsed.full_name,
            // Sync both identifiers so they match the latest form submission
            email: parsed.email,
            national_id: parsed.national_id,
          },
        })

        // Cancel all PENDING registrations from this participant.
        // This cascade-deletes their RegistrationItems, freeing the
        // vehicle_id @unique slot so we can re-link them below.
        await tx.registration.updateMany({
          where: {
            participant_id: participant.id,
            status: "PENDING",
          },
          data: { status: "CANCELLED" },
        })

        // Delete orphaned RegistrationItems from the just-cancelled registrations
        await tx.registrationItem.deleteMany({
          where: {
            registration: {
              participant_id: participant.id,
              status: "CANCELLED",
            },
          },
        })
      } else {
        participant = await tx.participant.create({
          data: {
            id: randomUUID(),
            full_name: parsed.full_name,
            email: parsed.email,
            national_id: parsed.national_id,
            qr_token: randomUUID(),
          },
        })
      }

      // 2. Create the new Registration (PENDING)
      await tx.registration.create({
        data: {
          id: regId,
          participant_id: participant.id,
          status: "PENDING",
        },
      })

      // 3. Upsert vehicles and create RegistrationItems
      for (const v of parsed.vehicles) {
        // Check if a vehicle with this plate already exists
        const existingVehicle = await tx.vehicle.findUnique({
          where: { license_plate: v.license_plate },
        })

        let vehicle
        if (existingVehicle) {
          // Ownership check: plate must belong to this participant
          if (existingVehicle.participant_id !== participant.id) {
            throw new Error(
              `La matrícula ${v.license_plate} ya está registrada por otro participante.`
            )
          }
          // Update vehicle details in case brand/model changed
          vehicle = await tx.vehicle.update({
            where: { id: existingVehicle.id },
            data: { brand: v.brand, model: v.model },
          })
        } else {
          vehicle = await tx.vehicle.create({
            data: {
              id: randomUUID(),
              participant_id: participant.id,
              brand: v.brand,
              model: v.model,
              license_plate: v.license_plate,
            },
          })
        }

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

    // Handle our own thrown errors (e.g. vehicle ownership check)
    if (err instanceof Error && !("code" in err)) {
      return { success: false, error: err.message }
    }

    const { message, fields, code } = mapPrismaError(err)

    // Map DB column names to form field keys and friendly messages
    const dbToFormKey: Record<string, string> = {
      license_plate: "license_plate",
    }

    const friendlyPerField: Record<string, string> = {
      license_plate:
        "Esta matrícula ya está registrada por otro participante. Si es tu vehículo y crees que es un error, contacta con la organización.",
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

    // Send confirmation email — non-blocking: payment is already confirmed
    try {
      const reg = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
          participant: true,
          items: {
            include: { vehicle: true },
          },
        },
      })

      if (reg?.participant) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ""
        const qrImageUrl = siteUrl
          ? `${siteUrl}/api/qr?token=${encodeURIComponent(reg.participant.qr_token)}`
          : ""

        const html = generateConfirmationEmailHtml({
          participantName: reg.participant.full_name,
          email: reg.participant.email,
          nationalId: reg.participant.national_id,
          qrImageUrl,
          vehicles: reg.items.map((i) => ({
            brand: i.vehicle.brand,
            model: i.vehicle.model,
            license_plate: i.vehicle.license_plate,
            entry_number: i.entry_number,
          })),
          totalPaid: amountEur.toFixed(2),
          registrationId: reg.id,
        })

        await sendEmail({
          to: reg.participant.email,
          subject: "Inscripción confirmada — II Concentración de coches clásicos Villa de la Robla",
          html,
          idempotencyKey: `registration-confirm/${reg.id}`,
        })
      }
    } catch (emailErr) {
      console.error(
        "[confirmPayment] Failed to send confirmation email:",
        emailErr
      )
    }

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
        `[reconcile] Failed to check session for registration ${reg.id}:\n`,
        err
      )
      failed.push(reg.id)
    }
  }

  return { total: pendingRegistrations.length, reconciled, failed }
}

export type ManualInscriptionResult = {
  success: boolean
  error?: string
  registrationId?: string
  fieldErrors?: Record<string, string>
  code?: string
}

/**
 * Creates a full inscription directly by staff/admin.
 * Registration is created as PAID with a MANUAL payment record.
 * No Stripe interaction occurs.
 * Reuses existing participant and vehicles when possible.
 */
export async function createManualInscription(
  data: ManualInscriptionInput
): Promise<ManualInscriptionResult> {
  try {
    await requireStaffOrAdmin()

    const parsed = ManualInscriptionSchema.parse(data)
    const regId = randomUUID()

    await prisma.$transaction(async (tx) => {
      // 1. Find or create participant
      let participant = await tx.participant.findFirst({
        where: {
          OR: [
            { email: parsed.email },
            { national_id: parsed.national_id },
          ],
        },
      })

      if (participant) {
        // Update name to latest submission
        await tx.participant.update({
          where: { id: participant.id },
          data: {
            full_name: parsed.full_name,
            email: parsed.email,
            national_id: parsed.national_id,
          },
        })

        // Cancel all PENDING registrations from this participant
        await tx.registration.updateMany({
          where: {
            participant_id: participant.id,
            status: "PENDING",
          },
          data: { status: "CANCELLED" },
        })

        // Delete orphaned RegistrationItems from the just-cancelled registrations
        await tx.registrationItem.deleteMany({
          where: {
            registration: {
              participant_id: participant.id,
              status: "CANCELLED",
            },
          },
        })
      } else {
        participant = await tx.participant.create({
          data: {
            id: randomUUID(),
            full_name: parsed.full_name,
            email: parsed.email,
            national_id: parsed.national_id,
            qr_token: randomUUID(),
          },
        })
      }

      // 2. Create the new Registration (PAID for manual inscriptions)
      await tx.registration.create({
        data: {
          id: regId,
          participant_id: participant.id,
          status: "PAID",
        },
      })

      // 3. Upsert vehicles and create RegistrationItems
      for (const v of parsed.vehicles) {
        const existingVehicle = await tx.vehicle.findUnique({
          where: { license_plate: v.license_plate },
        })

        let vehicle
        if (existingVehicle) {
          if (existingVehicle.participant_id !== participant.id) {
            throw new Error(
              `La matrícula ${v.license_plate} ya está registrada por otro participante.`
            )
          }
          vehicle = await tx.vehicle.update({
            where: { id: existingVehicle.id },
            data: { brand: v.brand, model: v.model },
          })
        } else {
          vehicle = await tx.vehicle.create({
            data: {
              id: randomUUID(),
              participant_id: participant.id,
              brand: v.brand,
              model: v.model,
              license_plate: v.license_plate,
            },
          })
        }

        await tx.registrationItem.create({
          data: {
            id: randomUUID(),
            registration_id: regId,
            vehicle_id: vehicle.id,
          },
        })
      }

      await tx.payment.create({
        data: {
          id: randomUUID(),
          registration_id: regId,
          provider: "MANUAL",
          amount: parsed.amount,
          status: "COMPLETED",
        },
      })
    })

    try {
      revalidatePath("/dashboard/participants")
      revalidatePath("/dashboard/registrations")
    } catch {
      // ignore revalidation errors
    }

    return { success: true, registrationId: regId }
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      const firstError = err.issues?.[0]?.message
      return { success: false, error: firstError || "Validation error" }
    }

    // Handle our own thrown errors (e.g. vehicle ownership check)
    if (err instanceof Error && !("code" in err)) {
      return { success: false, error: err.message }
    }

    const { message, fields, code } = mapPrismaError(err)

    const dbToFormKey: Record<string, string> = {
      license_plate: "license_plate",
    }

    const friendlyPerField: Record<string, string> = {
      license_plate:
        "Esta matrícula ya está registrada por otro participante. Si es tu vehículo y crees que es un error, contacta con la organización.",
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
