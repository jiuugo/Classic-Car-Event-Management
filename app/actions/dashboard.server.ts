"use server"

import prisma from "@/lib/prisma"
import { mapPrismaError } from "@/lib/errors"

export type DashboardStats = {
  totalParticipants: number
  totalVehicles: number
  totalRevenue: number
  liveAttendanceRate: number
  checkedInVehicles: number
  totalRegistrationItems: number
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
    participantName: string
    status: "PENDING" | "PAID" | "CANCELLED"
    vehicleCount: number
  }[]
}

export async function getDashboardStats(): Promise<
  { success: true; data: DashboardStats } | { success: false; error: string }
> {
  try {
    // Run all aggregate queries in parallel
    const [
      totalParticipants,
      totalVehicles,
      totalRegistrationItems,
      checkedInItems,
      revenueResult,
      pendingRegs,
      paidRegs,
      cancelledRegs,
      completedPayments,
      failedPayments,
      recentRegs,
    ] = await Promise.all([
      prisma.participant.count(),
      prisma.vehicle.count(),
      prisma.registrationItem.count(),
      prisma.registrationItem.count({
        where: { checkin_date: { not: null } },
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
        orderBy: { id: "desc" },
        include: {
          participant: { select: { full_name: true } },
          _count: { select: { items: true } },
        },
      }),
    ])

    const totalRevenue = Number(revenueResult._sum.amount ?? 0)
    const liveAttendanceRate =
      totalRegistrationItems > 0
        ? Math.round((checkedInItems / totalRegistrationItems) * 100)
        : 0

    const data: DashboardStats = {
      totalParticipants,
      totalVehicles,
      totalRevenue,
      liveAttendanceRate,
      checkedInVehicles: checkedInItems,
      totalRegistrationItems,
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
