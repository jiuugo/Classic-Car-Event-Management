import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireStaffOrAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import {
  updateParticipant,
  getParticipantById,
} from "@/app/actions/participants.server"

export async function GET(request: Request, ctx: any) {
  try {
    await requireStaffOrAdmin()

    const params =
      ctx.params && typeof ctx.params.then !== "function"
        ? ctx.params
        : await ctx.params

    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const res = await getParticipantById(id)

    if (!res?.success) {
      return NextResponse.json(
        { error: res?.error ?? "Not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: res.data }, { status: 200 })
  } catch (err: any) {
    const message = err?.message ?? "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request, ctx: any) {
  try {
    await requireStaffOrAdmin()

    // `ctx.params` can be a plain object or a promise depending on runtime/types.
    const params =
      ctx.params && typeof ctx.params.then !== "function"
        ? ctx.params
        : await ctx.params

    const id = params?.id

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    await prisma.participant.delete({ where: { id } })

    try {
      revalidatePath("/dashboard/participants")
    } catch (e) {
      // ignore if revalidation not supported
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    const message = err?.message ?? "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request, ctx: any) {
  try {
    // `ctx.params` can be a plain object or a promise depending on runtime/types.
    const params =
      ctx.params && typeof ctx.params.then !== "function"
        ? ctx.params
        : await ctx.params

    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const payload = await request.json().catch(() => ({}))

    const res = await updateParticipant(id, payload)

    if (res?.success) {
      return NextResponse.json(
        { success: true, data: res.data },
        { status: 200 }
      )
    }

    const errMsg = res?.error ?? "Failed to update"
    return NextResponse.json({ error: errMsg }, { status: 422 })
  } catch (err: any) {
    const message = err?.message ?? "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
