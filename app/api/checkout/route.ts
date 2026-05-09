import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import stripe from "@/lib/stripe"
import { submitInscription } from "@/app/actions/inscription.server"
import type { InscriptionInput } from "@/lib/validation/registration.schema"
import { InscriptionSchema } from "@/lib/validation/registration.schema"

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error("Missing STRIPE_PRICE_ID – add it to .env")
    }

    const payload: InscriptionInput = await request.json()

    // Validate before anything
    const parsed = InscriptionSchema.parse(payload)
    const vehicleCount = parsed.vehicles.length

    // Generate a stable registration ID upfront so we can pass it in
    // Stripe metadata AND use the same ID in the DB — no race condition.
    const registrationId = randomUUID()

    const origin = new URL(request.url).origin

    // 1) Create DB records FIRST (PENDING status).
    //    Data is persisted before the user ever reaches Stripe.
    const result = await submitInscription(parsed, registrationId)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          fieldErrors: result.fieldErrors,
        },
        { status: 400 }
      )
    }

    // 2) Create Stripe Checkout session with registration_id in metadata.
    //    If this fails the registration stays PENDING — harmless, admin can clean up.
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: parsed.email,
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: vehicleCount,
          },
        ],
        metadata: { registration_id: registrationId },
        success_url: `${origin}/register/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/register?cancelled=true`,
      },
      { idempotencyKey: `checkout-${registrationId}` }
    )

    // 3) Store the Stripe session ID on the registration for reconciliation lookups.
    //    Non-critical — if this fails the webhook still works via metadata.
    try {
      const prisma = (await import("@/lib/prisma")).default
      await prisma.registration.update({
        where: { id: registrationId },
        data: { stripe_session_id: session.id },
      })
    } catch (err) {
      console.warn("[checkout] Failed to store stripe_session_id:", err)
    }

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (err: unknown) {
    console.error("[checkout] Error:", err)
    const message = err instanceof Error ? err.message : "Server error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
