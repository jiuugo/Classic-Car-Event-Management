"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import {
  DashboardUserCreateSchema,
  DashboardUserUpdateSchema,
} from "@/lib/validation/dashboard-user.schema"
import { mapPrismaError } from "@/lib/errors"
import type { DashboardUserRow } from "@/lib/types/dashboard-user.types"

export async function getDashboardUsers(): Promise<
  | { success: true; data: DashboardUserRow[] }
  | { success: false; error: string }
> {
  try {
    await requireAdmin()

    const users = await prisma.dashboardUser.findMany({
      select: { id: true, email: true, role: true },
      orderBy: { email: "asc" },
    })

    return { success: true, data: users }
  } catch (err) {
    return {
      success: false,
      error: mapPrismaError(err).message ?? "Server error",
    }
  }
}

export async function createDashboardUser(data: {
  email: string
  password: string
  confirm_password: string
  role: "ADMIN" | "STAFF"
}): Promise<
  | { success: true; data: DashboardUserRow }
  | { success: false; error: string }
> {
  try {
    await requireAdmin()

    const parsed = DashboardUserCreateSchema.parse(data)
    const password_hash = await bcrypt.hash(parsed.password, 12)

    const user = await prisma.dashboardUser.create({
      data: {
        email: parsed.email,
        password_hash,
        role: parsed.role,
      },
      select: { id: true, email: true, role: true },
    })

    try {
      revalidatePath("/dashboard/settings")
    } catch {
      // ignore in environments that don't support revalidation
    }

    return { success: true, data: user }
  } catch (err) {
    const mapped = mapPrismaError(err)
    let message = mapped.message ?? "Server error"

    // Friendly message for duplicate email
    if (mapped.code === "P2002") {
      message = "Ya existe un usuario con este email."
    }

    return { success: false, error: message }
  }
}

export async function updateDashboardUser(
  id: string,
  payload: {
    email?: string
    password?: string
    role?: "ADMIN" | "STAFF"
  }
): Promise<
  | { success: true; data: DashboardUserRow }
  | { success: false; error: string }
> {
  try {
    const currentUser = await requireAdmin()

    const parsed = DashboardUserUpdateSchema.parse(payload)

    // Prevent admin from changing their own role
    if (id === currentUser.id && parsed.role && parsed.role !== currentUser.role) {
      return {
        success: false,
        error: "No puedes cambiar tu propio rol.",
      }
    }

    const updateData: {
      email?: string
      password_hash?: string
      role?: "ADMIN" | "STAFF"
    } = {}

    if (parsed.email) updateData.email = parsed.email
    if (parsed.role) updateData.role = parsed.role
    if (parsed.password && parsed.password.length > 0) {
      updateData.password_hash = await bcrypt.hash(parsed.password, 12)
    }

    const updated = await prisma.dashboardUser.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, role: true },
    })

    try {
      revalidatePath("/dashboard/settings")
    } catch {
      // ignore revalidation errors
    }

    return { success: true, data: updated }
  } catch (err) {
    const mapped = mapPrismaError(err)
    let message = mapped.message ?? "Server error"

    if (mapped.code === "P2002") {
      message = "Ya existe un usuario con este email."
    }

    return { success: false, error: message }
  }
}

export async function deleteDashboardUser(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const currentUser = await requireAdmin()

    if (id === currentUser.id) {
      return {
        success: false,
        error: "No puedes eliminar tu propia cuenta.",
      }
    }

    await prisma.dashboardUser.delete({ where: { id } })

    try {
      revalidatePath("/dashboard/settings")
    } catch {
      // ignore revalidation errors
    }

    return { success: true }
  } catch (err) {
    const message =
      mapPrismaError(err).message ?? (err as any)?.message ?? "Server error"
    return { success: false, error: message }
  }
}
