import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import prisma from "@/lib/prisma"
import { confirmPayment } from "@/app/actions/inscription.server"

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

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object

    // Primary lookup: find registration by stripe_session_id stored in the DB.
    // Fallback: use registration_id from Stripe metadata.
    let registrationId: string | undefined

    const bySession = await prisma.registration.findUnique({
      where: { stripe_session_id: session.id },
      select: { id: true },
    })

    if (bySession) {
      registrationId = bySession.id
    } else {
      registrationId = session.metadata?.registration_id ?? undefined
    }

    if (!registrationId) {
      console.error(
        "[stripe-webhook] Could not find registration for session:",
        session.id
      )
      // Return 200 — retrying won't help if registration doesn't exist
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Flip PENDING → PAID and record the payment
    const amountEur = (session.amount_total ?? 0) / 100
    const result = await confirmPayment(registrationId, amountEur)

    if (!result.success) {
      console.error(
        "[stripe-webhook] confirmPayment failed:",
        result.error,
        "registrationId:",
        registrationId
      )
      // Return 500 so Stripe retries (exponential backoff, up to 3 days)
      return NextResponse.json(
        { error: "Failed to confirm payment" },
        { status: 500 }
      )
    }

    console.log(
      "[stripe-webhook] Registration confirmed as PAID:",
      registrationId
    )
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
