"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CheckinItem } from "@/lib/types/checkin.types"
import { Car } from "@phosphor-icons/react"

export function ItemList({
  items,
  selectedIds,
  onToggle,
  onSelectAllPending,
  onClearSelection,
}: {
  items: CheckinItem[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onSelectAllPending: () => void
  onClearSelection: () => void
}) {
  const pendingItems = items.filter((i) => !i.checkin_date)
  const allPendingSelected =
    pendingItems.length > 0 &&
    pendingItems.every((i) => selectedIds.includes(i.id))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Car className="size-5 text-muted-foreground" />
          Vehículos ({items.length})
        </CardTitle>

        {pendingItems.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={allPendingSelected}
                onCheckedChange={(checked) => {
                  if (checked) onSelectAllPending()
                  else onClearSelection()
                }}
              />
              Seleccionar todos
            </label>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Limpiar
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Este participante no tiene vehículos registrados en inscripciones
            pagadas.
          </p>
        )}

        {items.map((item) => {
          const isCheckedIn = !!item.checkin_date
          const isSelected = selectedIds.includes(item.id)

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border px-4 py-3"
            >
              <Checkbox
                checked={isSelected}
                disabled={isCheckedIn}
                onCheckedChange={() => onToggle(item.id)}
                aria-label={`Seleccionar ${item.vehicle.brand} ${item.vehicle.model}`}
              />

              <div className="flex flex-1 flex-col gap-0.5">
                <div className="text-sm font-medium">
                  {item.vehicle.brand} {item.vehicle.model}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.vehicle.license_plate}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground">
                  Dorsal:{" "}
                  <span className="font-medium text-foreground">
                    {item.entry_number ?? "—"}
                  </span>
                </div>
                {isCheckedIn ? (
                  <Badge variant="default">Presente</Badge>
                ) : (
                  <Badge variant="outline">Pendiente</Badge>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
