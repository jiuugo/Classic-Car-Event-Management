"use client"

import React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CarIcon, ArrowSquareOutIcon } from "@phosphor-icons/react"
import type { ParticipantVehicle } from "@/lib/types/participant.types"

export default function ParticipantVehiclesTab({
  vehicles,
}: {
  vehicles: ParticipantVehicle[]
}) {
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center">
        <CarIcon className="size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No vehicles registered for this participant.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {vehicles.map((vehicle) => (
        <Card
          key={vehicle.id}
          className="group transition-shadow hover:shadow-md"
        >
          <CardContent className="flex items-center gap-4 p-4">
            {/* Vehicle icon */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CarIcon className="size-5" weight="duotone" />
            </div>

            {/* Vehicle info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                {vehicle.brand} {vehicle.model}
              </p>
              <code className="text-xs text-muted-foreground font-mono">
                {vehicle.license_plate}
              </code>
            </div>

            {/* Link to fleet */}
            <Link
              href={`/dashboard/vehicles?q=${encodeURIComponent(vehicle.license_plate)}`}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="View in Vehicle Fleet"
            >
              <ArrowSquareOutIcon className="size-4" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
