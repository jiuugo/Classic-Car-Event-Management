"use client"

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
} from "@phosphor-icons/react"
import type { DashboardStats } from "@/app/actions/dashboard.server"

const statusVariant: Record<string, "default" | "outline" | "destructive"> = {
  PAID: "default",
  PENDING: "outline",
  CANCELLED: "destructive",
}

export function DashboardQuickActions() {
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
            className="w-full justify-start gap-3 h-12 text-left"
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
            className="w-full justify-start gap-3 h-12 text-left"
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
            className="w-full justify-start gap-3 h-12 text-left"
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
          <p className="text-sm text-muted-foreground py-8 text-center">
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
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
