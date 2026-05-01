"use server"

import prisma from "@/lib/prisma"
import { mapPrismaError } from "@/lib/errors"
import type { VehicleRow } from "@/lib/types/vehicle.types"
import { requireStaffOrAdmin } from "@/lib/auth"
import { VehicleUpdateSchema } from "@/lib/validation/vehicle.schema"
import { revalidatePath } from "next/cache"

export type VehicleFilters = {
  licensePlate?: string
  brand?: string
  attendance?: "present" | "absent"
}

/**
 * Fetch vehicles with owner and registration-item data.
 * Supports filtering by license plate (search), brand, and attendance status.
 */
export async function getVehicles(
  filters?: VehicleFilters
): Promise<{ success: true; data: VehicleRow[] } | { success: false; error: string }> {
  try {
    const where: any = {}

    if (filters?.licensePlate) {
      where.license_plate = {
        contains: filters.licensePlate,
        mode: "insensitive",
      }
    }

    if (filters?.brand) {
      where.brand = {
        equals: filters.brand,
        mode: "insensitive",
      }
    }

    if (filters?.attendance === "present") {
      where.registration_item = {
        checkin_date: { not: null },
      }
    } else if (filters?.attendance === "absent") {
      where.OR = [
        { registration_item: null },
        { registration_item: { checkin_date: null } },
      ]
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        participant: { select: { id: true, full_name: true } },
        registration_item: {
          select: { entry_number: true, checkin_date: true },
        },
      },
      orderBy: { brand: "asc" },
      take: 200,
    })

    // Serialise dates to ISO strings for client hydration
    const data: VehicleRow[] = vehicles.map((v) => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      license_plate: v.license_plate,
      participant: {
        id: v.participant.id,
        full_name: v.participant.full_name,
      },
      registration_item: v.registration_item
        ? {
            entry_number: v.registration_item.entry_number,
            checkin_date: v.registration_item.checkin_date
              ? v.registration_item.checkin_date.toISOString()
              : null,
          }
        : null,
    }))

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: mapPrismaError(err).message ?? "Server error",
    }
  }
}

/**
 * Get distinct brands for the filter dropdown.
 */
export async function getDistinctBrands(): Promise<string[]> {
  try {
    const results = await prisma.vehicle.findMany({
      distinct: ["brand"],
      select: { brand: true },
      orderBy: { brand: "asc" },
    })
    return results.map((r) => r.brand)
  } catch {
    return []
  }
}

export async function getVehicleById(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { participant: true, registration_item: true }
    })

    return { success: true, data: vehicle }
  } catch (err) {
    return {
      success: false,
      error: mapPrismaError(err).message ?? "Server error",
    }
  }
}

export async function updateVehicle(id: string, payload: any) {
  try {
    await requireStaffOrAdmin()

    const parsed = VehicleUpdateSchema.parse(payload)

    const updated = await prisma.vehicle.update({
      where: { id },
      data: parsed,
    })

    try {
      revalidatePath("/dashboard/vehicles")
    } catch (e) {
      // ignore
    }

    return { success: true, data: updated }
  } catch (err) {
    const message =
      mapPrismaError(err).message ?? (err as any)?.message ?? "Server error"
    return { success: false, error: message }
  }
}

export async function deleteVehicle(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireStaffOrAdmin()

    await prisma.vehicle.delete({ where: { id } })

    try {
      revalidatePath("/dashboard/vehicles")
    } catch (e) {
      // ignore
    }

    return { success: true }
  } catch (err) {
    const message =
      mapPrismaError(err).message ?? (err as any)?.message ?? "Server error"
    return { success: false, error: message }
  }
}
