"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CameraIcon,
  FileTextIcon,
  UsersIcon,
  ArrowRightIcon,
  ArrowsClockwise,
  CheckCircle,
} from "@phosphor-icons/react"
import { toast } from "sonner"
import type { DashboardStats } from "@/app/actions/dashboard.server"
import { reconcilePendingRegistrations } from "@/app/actions/inscription.server"

const statusVariant: Record<string, "default" | "outline" | "destructive"> = {
  PAID: "default",
  PENDING: "outline",
  CANCELLED: "destructive",
}

export function DashboardQuickActions() {
  const [isReconciling, setIsReconciling] = useState(false)

  const handleReconcile = async () => {
    setIsReconciling(true)
    try {
      const result = await reconcilePendingRegistrations()

      console.log(
        `[reconcile/trigger] Checked ${result.total} pending registrations. ` +
          `Reconciled: ${result.reconciled.length}, Failed: ${result.failed.length}`
      )

      if (result.reconciled.length > 0) {
        toast.success(
          `${result.reconciled.length} inscripción(es) actualizada(s) a PAID`
        )
      } else if (result.total === 0) {
        toast.info("No hay inscripciones pendientes con pago por verificar")
      } else {
        toast.info(
          `${result.total} pendiente(s) revisada(s), ninguna requería actualización`
        )
      }

      if (result.failed.length > 0) {
        toast.warning(
          `${result.failed.length} inscripción(es) fallaron al reconciliar`
        )
      }
    } catch {
      toast.error("Error de conexión al reconciliar")
    } finally {
      setIsReconciling(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump to event-day operations</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Link href="/dashboard/checkin">
          <Button
            variant="outline"
            className="h-12 w-full justify-start gap-3 text-left"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CameraIcon className="size-4" weight="duotone" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Check-in Hub</p>
              <p className="text-xs text-muted-foreground">
                Scan QR codes & register arrivals
              </p>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground" />
          </Button>
        </Link>

        <Link href="/dashboard/raffle">
          <Button
            variant="outline"
            className="h-12 w-full justify-start gap-3 text-left"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileTextIcon className="size-4" weight="duotone" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Raffle Room</p>
              <p className="text-xs text-muted-foreground">
                Draw winners from attendees
              </p>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground" />
          </Button>
        </Link>

        <Link href="/dashboard/participants">
          <Button
            variant="outline"
            className="h-12 w-full justify-start gap-3 text-left"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UsersIcon className="size-4" weight="duotone" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Participants</p>
              <p className="text-xs text-muted-foreground">
                Manage attendees & walk-ins
              </p>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground" />
          </Button>
        </Link>

        <Button
          variant="outline"
          className="h-12 w-full justify-start gap-3 text-left"
          onClick={handleReconcile}
          disabled={isReconciling}
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
            {isReconciling ? (
              <ArrowsClockwise className="size-4 animate-spin" weight="bold" />
            ) : (
              <CheckCircle className="size-4" weight="duotone" />
            )}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isReconciling ? "Reconciliando…" : "Reconciliar Pagos"}
            </p>
            <p className="text-xs text-muted-foreground">
              Verificar pagos pendientes con Stripe
            </p>
          </div>
        </Button>
      </CardContent>
    </Card>
  )
}

export function DashboardRecentRegistrations({
  registrations,
}: {
  registrations: DashboardStats["recentRegistrations"]
}) {
  if (registrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
          <CardDescription>Latest sign-ups</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No registrations yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Registrations</CardTitle>
        <CardDescription>Latest sign-ups</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {reg.participantName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reg.vehicleCount} vehicle{reg.vehicleCount !== 1 ? "s" : ""}
                </p>
              </div>
              <Badge
                variant={statusVariant[reg.status] ?? "outline"}
                className="shrink-0 text-[10px]"
              >
                {reg.status}
              </Badge>
            </div>
          ))}
        </div>

        <Link href="/dashboard/registrations">
          <Button variant="ghost" size="sm" className="mt-3 w-full gap-1.5">
            View all registrations
            <ArrowRightIcon className="size-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
