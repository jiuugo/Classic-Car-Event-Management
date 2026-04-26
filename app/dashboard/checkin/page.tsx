import React from "react"
import {
  findByQrToken,
  searchByLicensePlate,
} from "@/app/actions/checkin.server"
import { CheckinClient } from "@/components/checkin-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  const q = searchParams?.q ?? undefined

  let items: any[] = []

  if (q) {
    // Try QR token first
    const p = await findByQrToken(q)
    if (p?.success && p.data) {
      // participant -> collect registration items
      const participant = p.data
      if (participant.registrations) {
        for (const reg of participant.registrations) {
          if (reg.items) {
            for (const it of reg.items) {
              items.push({
                id: it.id,
                entry_number: it.entry_number,
                checkin_date: it.checkin_date
                  ? new Date(it.checkin_date).toISOString()
                  : null,
                vehicle: it.vehicle
                  ? {
                      license_plate: it.vehicle.license_plate,
                      brand: it.vehicle.brand,
                      model: it.vehicle.model,
                    }
                  : null,
              })
            }
          }
        }
      }
    } else {
      // fallback: try license plate
      const v = await searchByLicensePlate(q)
      if (v?.success && v.data) {
        const vehicle = v.data
        if (vehicle.registration_item) {
          const it = vehicle.registration_item
          items.push({
            id: it.id,
            entry_number: it.entry_number,
            checkin_date: it.checkin_date
              ? new Date(it.checkin_date).toISOString()
              : null,
            vehicle: {
              license_plate: vehicle.license_plate,
              brand: vehicle.brand,
              model: vehicle.model,
            },
          })
        }
      }
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Check-in Hub</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Scan QR token or search by license plate to find registration items.
      </p>

      <div className="mt-4 flex gap-2">
        <form method="get" className="flex w-full gap-2">
          <Input
            name="q"
            defaultValue={q}
            placeholder="QR token or license plate"
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="mt-6">
        <CheckinClient items={items} query={q} />
      </div>
    </div>
  )
}
