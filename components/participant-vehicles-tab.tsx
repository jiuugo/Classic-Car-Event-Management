"use client"

import React, { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CarIcon, ArrowSquareOutIcon } from "@phosphor-icons/react"
import { checkinRegistrationItems } from "@/app/actions/checkin.server"
import type {
  ParticipantVehicle,
  ParticipantRegistration,
} from "@/lib/types/participant.types"

export default function ParticipantVehiclesTab({
  vehicles,
  registrations,
}: {
  vehicles: ParticipantVehicle[]
  registrations: ParticipantRegistration[]
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()

  const vehicleItemMap = React.useMemo(() => {
    const map = new Map<
      string,
      {
        id: string
        entry_number: number | null
        checkin_date: string | null
        registrationStatus: "PENDING" | "PAID" | "CANCELLED"
      }
    >()
    for (const reg of registrations) {
      for (const item of reg.items) {
        map.set(item.vehicle.id, {
          id: item.id,
          entry_number: item.entry_number,
          checkin_date: item.checkin_date,
          registrationStatus: reg.status,
        })
      }
    }
    return map
  }, [registrations])

  const toggle = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  const selectAll = () => {
    const map: Record<string, boolean> = {}
    vehicles.forEach((v) => {
      const item = vehicleItemMap.get(v.id)
      if (item && item.registrationStatus === "PAID") map[item.id] = true
    })
    setSelected(map)
  }

  const clearSelection = () => setSelected({})

  const selectedIds = Object.keys(selected).filter((k) => selected[k])
  const selectedCount = selectedIds.length

  const handleAction = () => {
    if (selectedCount === 0) {
      toast.error("Selecciona al menos un elemento.")
      return
    }

    const selectedItems = vehicles
      .map((v) => vehicleItemMap.get(v.id))
      .filter(
        (item): item is NonNullable<typeof item> => !!item && selected[item.id]
      )

    const allChecked = selectedItems.every((it) => !!it.checkin_date)
    const allUnchecked = selectedItems.every((it) => !it.checkin_date)
    const mode = allUnchecked ? "mark" : allChecked ? "undo" : "toggle"

    if (selectedCount > 5) {
      const confirmed = confirm(
        `Estás a punto de ${mode === "mark" ? "marcar" : mode === "undo" ? "deshacer" : "alternar"} ${selectedCount} elementos. ¿Continuar?`
      )
      if (!confirmed) return
    }

    startTransition(async () => {
      try {
        const res = await checkinRegistrationItems({
          itemIds: selectedIds,
          mode: mode as "mark" | "undo" | "toggle",
        })

        if (res && (res as any).success) {
          const msg = `${(res as any).updatedCount ?? selectedCount} elemento(s) actualizado(s).`
          toast.success(msg)
          clearSelection()
          router.refresh()
        } else {
          const err = ((res as any)?.error as string) ?? "Error desconocido"
          toast.error(err)
        }
      } catch (err: any) {
        toast.error(err?.message ?? String(err))
      }
    })
  }

  const actionLabel = (() => {
    if (selectedCount === 0) return "Seleccionar elementos"
    const selectedItems = vehicles
      .map((v) => vehicleItemMap.get(v.id))
      .filter(
        (item): item is NonNullable<typeof item> => !!item && selected[item.id]
      )
    if (selectedItems.length === 0) return "Seleccionar elementos"
    const allChecked = selectedItems.every((it) => !!it.checkin_date)
    const allUnchecked = selectedItems.every((it) => !it.checkin_date)
    if (allUnchecked) return "Marcar como registrados"
    if (allChecked) return "Deshacer registro de seleccionados"
    return "Alternar registro de seleccionados"
  })()

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center">
        <CarIcon className="size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No hay vehículos registrados para este participante.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Vehículos Registrados
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Seleccionar todos
          </Button>
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Limpiar
          </Button>
          <span className="text-sm text-muted-foreground">
            {vehicles.length} vehículo{vehicles.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* List */}
      <ul className="space-y-3">
        {vehicles.map((vehicle) => {
          const item = vehicleItemMap.get(vehicle.id)
          return (
            <li
              key={vehicle.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div className="flex items-center gap-3">
                {item && item.registrationStatus === "PAID" ? (
                  <Checkbox
                    checked={!!selected[item.id]}
                    onCheckedChange={() => toggle(item.id)}
                    aria-label={`Select item ${item.entry_number ?? item.id}`}
                  />
                ) : (
                  <div className="size-4" />
                )}
                <div>
                  <div className="text-sm font-semibold">
                    {vehicle.brand} {vehicle.model}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {vehicle.license_plate}
                    {item ? ` · Bib: ${item.entry_number ?? "—"}` : ""}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item ? (
                  item.registrationStatus === "PAID" ? (
                    item.checkin_date ? (
                      <Badge variant="default">Presente</Badge>
                    ) : (
                      <Badge variant="outline">Ausente</Badge>
                    )
                  ) : (
                    <Badge variant="secondary">
                      {item.registrationStatus === "PENDING"
                        ? "Pago pendiente"
                        : "Inscripción cancelada"}
                    </Badge>
                  )
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Sin inscripción
                  </span>
                )}
                <Link
                  href={`/dashboard/vehicles?q=${encodeURIComponent(vehicle.license_plate)}`}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Ver en flota de vehículos"
                >
                  <ArrowSquareOutIcon className="size-4" />
                </Link>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Bottom action bar */}
      <div className="sticky bottom-0 mt-2 border-t bg-background p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {selectedCount} seleccionados
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={selectedCount === 0}
            >
              Limpiar
            </Button>
            <Button
              onClick={handleAction}
              disabled={isPending || selectedCount === 0}
              variant={selectedCount === 0 ? "outline" : "default"}
            >
              {isPending ? "Procesando..." : actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
