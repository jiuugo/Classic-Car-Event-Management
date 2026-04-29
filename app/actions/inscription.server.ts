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
 * Creates a full inscription (participant + N vehicles + registration + items).
 * Called from the Stripe webhook after successful payment, or directly for free
 * registrations.
 *
 * @param paymentAmount – the total amount paid (in EUR)
 */
export async function submitInscription(
  data: InscriptionInput,
  paymentAmount?: number
): Promise<InscriptionResult> {
  try {
    const parsed = InscriptionSchema.parse(data)

    let registrationId = ""

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

      const registration = await tx.registration.create({
        data: {
          id: randomUUID(),
          participant_id: participant.id,
          status: paymentAmount ? "PAID" : "PENDING",
        },
      })

      registrationId = registration.id

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
            registration_id: registration.id,
            vehicle_id: vehicle.id,
          },
        })
      }

      if (paymentAmount) {
        await tx.payment.create({
          data: {
            id: randomUUID(),
            registration_id: registration.id,
            provider: "STRIPE",
            amount: paymentAmount,
            status: "COMPLETED",
          },
        })
      }
    })

    return { success: true, registrationId }
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
