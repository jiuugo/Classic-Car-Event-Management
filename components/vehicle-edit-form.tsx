"use client"

import React, { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { updateVehicle } from "@/app/actions/vehicles.server"

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
        const result = await updateVehicle(vehicle.id, {
          brand,
          model,
          license_plate: licensePlate,
        })

        if (!result.success) {
          toast.error(result.error ?? "Error al actualizar el vehículo")
          return
        }

        toast.success("Vehículo actualizado")
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
        <Label>Marca</Label>
        <Input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Modelo</Label>
        <Input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Matrícula</Label>
        <Input
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          required
        />
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={isPending}>
          Guardar
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={() => onClose && onClose()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
