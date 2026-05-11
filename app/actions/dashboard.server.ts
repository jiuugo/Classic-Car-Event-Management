"use server"

import prisma from "@/lib/prisma"
import { mapPrismaError } from "@/lib/errors"

export type DashboardStats = {
  /** Participants with at least one PAID registration */
  confirmedParticipants: number
  /** Vehicles linked to a PAID registration item */
  confirmedVehicles: number
  totalRevenue: number
  liveAttendanceRate: number
  /** Checked-in vehicles (from PAID registrations only) */
  checkedInVehicles: number
  /** Total vehicles expected (from PAID registrations only) */
  expectedVehicles: number
  registrationsByStatus: {
    PENDING: number
    PAID: number
    CANCELLED: number
  }
  paymentsByStatus: {
    COMPLETED: number
    FAILED: number
  }
  recentRegistrations: {
    id: string
    participantId: string
    participantName: string
    status: "PENDING" | "PAID" | "CANCELLED"
    vehicleCount: number
  }[]
}

export async function getDashboardStats(): Promise<
  { success: true; data: DashboardStats } | { success: false; error: string }
> {
  try {
    const paidFilter = {
      registration: { status: "PAID" as const },
    }

    // Run all aggregate queries in parallel
    const [
      confirmedParticipants,
      confirmedVehicles,
      expectedVehicles,
      checkedInItems,
      revenueResult,
      pendingRegs,
      paidRegs,
      cancelledRegs,
      completedPayments,
      failedPayments,
      recentRegs,
    ] = await Promise.all([
      // Participants with at least one PAID registration
      prisma.participant.count({
        where: {
          registrations: { some: { status: "PAID" } },
        },
      }),
      // Distinct vehicles linked through a PAID registration item
      prisma.vehicle.count({
        where: {
          registration_item: {
            is: paidFilter,
          },
        },
      }),
      // Registration items from PAID registrations only
      prisma.registrationItem.count({
        where: paidFilter,
      }),
      // Checked-in items from PAID registrations only
      prisma.registrationItem.count({
        where: {
          ...paidFilter,
          checkin_date: { not: null },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
      prisma.registration.count({ where: { status: "PENDING" } }),
      prisma.registration.count({ where: { status: "PAID" } }),
      prisma.registration.count({ where: { status: "CANCELLED" } }),
      prisma.payment.count({ where: { status: "COMPLETED" } }),
      prisma.payment.count({ where: { status: "FAILED" } }),
      prisma.registration.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          participant: { select: { id: true, full_name: true } },
          _count: { select: { items: true } },
        },
      }),
    ])

    const totalRevenue = Number(revenueResult._sum.amount ?? 0)
    const liveAttendanceRate =
      expectedVehicles > 0
        ? Math.round((checkedInItems / expectedVehicles) * 100)
        : 0

    const data: DashboardStats = {
      confirmedParticipants,
      confirmedVehicles,
      totalRevenue,
      liveAttendanceRate,
      checkedInVehicles: checkedInItems,
      expectedVehicles,
      registrationsByStatus: {
        PENDING: pendingRegs,
        PAID: paidRegs,
        CANCELLED: cancelledRegs,
      },
      paymentsByStatus: {
        COMPLETED: completedPayments,
        FAILED: failedPayments,
      },
      recentRegistrations: recentRegs.map((r) => ({
        id: r.id,
        participantId: r.participant.id,
        participantName: r.participant.full_name,
        status: r.status as "PENDING" | "PAID" | "CANCELLED",
        vehicleCount: r._count.items,
      })),
    }

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: mapPrismaError(err).message ?? "Server error",
    }
  }
}
