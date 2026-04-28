import { NextResponse } from "next/server"
import {
  submitInscription,
  InscriptionResult,
} from "@/app/actions/inscription.server"

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    const result: InscriptionResult = await submitInscription(payload)

    if (!result.success) {
      // If unique constraint (P2002), return 409 Conflict so clients can treat specially
      const status = result.code === "P2002" ? 409 : 400
      return NextResponse.json(result, { status })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
