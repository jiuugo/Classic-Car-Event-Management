/*
  Centralized Stripe client singleton.
  Requires STRIPE_SECRET_KEY in the environment.
*/
import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "Missing STRIPE_SECRET_KEY – add it to .env"
  )
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
})

export default stripe
