import { NextResponse } from "next/server"
import { createParticipant } from "@/app/actions/participants.server"

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    const form = new FormData()
    form.set("full_name", String(payload.full_name ?? ""))
    form.set("email", String(payload.email ?? ""))
    form.set("national_id", String(payload.national_id ?? ""))

    await createParticipant(form)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: any) {
    const message = err?.message ?? "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
