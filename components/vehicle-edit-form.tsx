"use client"

import React, { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function VehicleEditForm({
  vehicle,
  onClose,
}: {
  vehicle: any
  onClose?: () => void
}) {
  const [brand, setBrand] = useState(vehicle?.brand ?? "")
  const [model, setModel] = useState(vehicle?.model ?? "")
  const [licensePlate, setLicensePlate] = useState(vehicle?.license_plate ?? "")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        const res = await fetch(`/api/vehicles/${vehicle.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand,
            model,
            license_plate: licensePlate,
          }),
        })

        const json = await res.json().catch(() => null)

        if (!res.ok) {
          toast.error(json?.error ?? "Failed to update vehicle")
          return
        }

        toast.success("Vehicle updated")
        if (onClose) onClose()
        router.refresh()
      } catch (err) {
        toast.error(String(err))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div>
        <Label>Brand</Label>
        <Input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Model</Label>
        <Input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>License Plate</Label>
        <Input
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          required
        />
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={isPending}>
          Save
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={() => onClose && onClose()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
