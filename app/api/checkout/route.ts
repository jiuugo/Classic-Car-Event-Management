import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import type { InscriptionInput } from "@/lib/validation/registration.schema"
import { InscriptionSchema } from "@/lib/validation/registration.schema"

const PRICE_PER_VEHICLE_CENTS = 1000 // 10 €

export async function POST(request: Request) {
  try {
    const payload: InscriptionInput = await request.json()

    // Validate before creating a Stripe session
    const parsed = InscriptionSchema.parse(payload)

    const vehicleCount = parsed.vehicles.length
    const totalCents = vehicleCount * PRICE_PER_VEHICLE_CENTS

    // We store the form data in metadata so the webhook can create the records
    // Stripe metadata values must be strings ≤ 500 chars each.
    // For safety we split vehicles into a separate key.
    const metadata: Record<string, string> = {
      full_name: parsed.full_name,
      email: parsed.email,
      national_id: parsed.national_id,
      vehicles: JSON.stringify(parsed.vehicles),
    }

    const origin = new URL(request.url).origin

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: parsed.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: PRICE_PER_VEHICLE_CENTS,
            product_data: {
              name: "Inscripción vehículo clásico",
              description:
                "Entrada para la Concentración de Clásicos Villa de la Robla",
            },
          },
          quantity: vehicleCount,
        },
      ],
      metadata,
      success_url: `${origin}/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/register?cancelled=true`,
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (err: unknown) {
    console.error("[checkout] Error creating session:", err)
    const message = err instanceof Error ? err.message : "Server error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
