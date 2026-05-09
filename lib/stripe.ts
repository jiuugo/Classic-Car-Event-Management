/*
  Centralized Stripe client singleton.
  Requires STRIPE_SECRET_KEY in the environment.
*/
import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY – add it to .env")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
})

export default stripe
