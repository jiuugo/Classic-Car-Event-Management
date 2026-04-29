import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import { submitInscription } from "@/app/actions/inscription.server"
import type { VehicleInput } from "@/lib/validation/registration.schema"

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    // Extract form data from metadata
    const meta = session.metadata ?? {}
    const vehicles: VehicleInput[] = JSON.parse(meta.vehicles || "[]")

    const inscriptionData = {
      full_name: meta.full_name ?? "",
      email: meta.email ?? "",
      national_id: meta.national_id ?? "",
      vehicles,
      accept_terms: true, // they accepted before paying
    }

    // amount_total is in cents
    const amountEur = (session.amount_total ?? 0) / 100

    const result = await submitInscription(inscriptionData, amountEur)

    if (!result.success) {
      console.error("[stripe-webhook] Inscription failed:", result.error)
      // We still return 200 so Stripe doesn't retry, but log the error.
      // In production you'd want an alert / dead-letter queue here.
    }

    console.log(
      "[stripe-webhook] Inscription created:",
      result.registrationId
    )
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
