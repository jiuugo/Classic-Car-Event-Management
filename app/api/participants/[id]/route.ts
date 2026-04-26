import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireStaffOrAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function DELETE(request: Request, ctx: any) {
  try {
    await requireStaffOrAdmin()

    // `ctx.params` can be a plain object or a promise depending on runtime/types.
    const params = (ctx.params && typeof ctx.params.then !== "function")
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
