"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardStats } from "@/app/actions/dashboard.server"

export function DashboardAttendanceCard({ stats }: { stats: DashboardStats }) {
  const { checkedInVehicles, expectedVehicles, liveAttendanceRate } = stats

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asistencia en Vivo</CardTitle>
        <CardDescription>
          Vehículos confirmados actualmente en el recinto
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Progress bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold tracking-tight tabular-nums">
              {checkedInVehicles}
            </span>
            <span className="text-sm text-muted-foreground">
              / {expectedVehicles} vehículos confirmados
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(liveAttendanceRate, 100)}%`,
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {liveAttendanceRate}% tasa de asistencia
          </p>
        </div>

        {/* Payment breakdown */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
              {stats.paymentsByStatus.COMPLETED}
            </p>
            <p className="text-xs text-muted-foreground">Pagos completados</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold text-red-600 tabular-nums dark:text-red-400">
              {stats.paymentsByStatus.FAILED}
            </p>
            <p className="text-xs text-muted-foreground">Pagos fallidos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
