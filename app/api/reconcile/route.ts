import { NextResponse } from "next/server"
import { reconcilePendingRegistrations } from "@/app/actions/inscription.server"

/**
 * GET /api/reconcile?token=<RECONCILE_SECRET>
 *
 * Scans all PENDING registrations with a Stripe session ID and
 * confirms any that have actually been paid. Designed to be called:
 *   - Periodically by a cron job (Vercel Cron, external scheduler)
 *   - Manually via curl during development
 *   - From an admin dashboard button
 *
 * Protected by a simple bearer token from env.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  const secret = process.env.RECONCILE_SECRET

  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await reconcilePendingRegistrations()

    console.log(
      `[reconcile] Checked ${result.total} pending registrations. ` +
        `Reconciled: ${result.reconciled.length}, Failed: ${result.failed.length}`
    )

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error("[reconcile] Error:", err)
    const message = err instanceof Error ? err.message : "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
