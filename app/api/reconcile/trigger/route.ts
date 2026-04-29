import { NextResponse } from "next/server"
import { reconcilePendingRegistrations } from "@/app/actions/inscription.server"

/**
 * POST /api/reconcile/trigger
 *
 * Internal endpoint called from the dashboard "Reconciliar Pagos" button.
 * No token required — intended to be behind dashboard auth.
 */
export async function POST() {
  try {
    const result = await reconcilePendingRegistrations()

    console.log(
      `[reconcile/trigger] Checked ${result.total} pending registrations. ` +
        `Reconciled: ${result.reconciled.length}, Failed: ${result.failed.length}`
    )

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error("[reconcile/trigger] Error:", err)
    const message = err instanceof Error ? err.message : "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
