"use server"

import { randomUUID } from "crypto"
import { ZodError } from "zod"
import prisma from "@/lib/prisma"
import { InscriptionSchema, InscriptionInput } from "@/lib/validation/registration.schema"
import { mapPrismaError } from "@/lib/errors"
import { redirect } from "next/navigation"

export type InscriptionResult = {
  success: boolean
  error?: string
  registrationId?: string
}

export async function submitInscription(
  data: InscriptionInput
): Promise<InscriptionResult> {
  try {
    const parsed = InscriptionSchema.parse(data)

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

      const vehicle = await tx.vehicle.create({
        data: {
          id: randomUUID(),
          participant_id: participant.id,
          brand: parsed.brand,
          model: parsed.model,
          license_plate: parsed.license_plate,
        },
      })

      const registration = await tx.registration.create({
        data: {
          id: randomUUID(),
          participant_id: participant.id,
          status: "PENDING",
        },
      })

      await tx.registrationItem.create({
        data: {
          id: randomUUID(),
          registration_id: registration.id,
          vehicle_id: vehicle.id,
        },
      })
    })

    return { success: true, registrationId: "" }
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      const firstError = err.issues?.[0]?.message
      return { success: false, error: firstError || "Validation error" }
    }

    const { message } = mapPrismaError(err)
    return { success: false, error: message }
  }
}

export async function createInscription(formData: FormData): Promise<InscriptionResult> {
  const payload: InscriptionInput = {
    full_name: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    national_id: String(formData.get("national_id") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    model: String(formData.get("model") ?? ""),
    license_plate: String(formData.get("license_plate") ?? ""),
    accept_terms: formData.get("accept_terms") === "on",
  }

  const result = await submitInscription(payload)

  if (result.success) {
    redirect("/register/success")
  }

  return result
}