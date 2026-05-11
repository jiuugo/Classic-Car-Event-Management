"use client"

import React, { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { checkinRegistrationItems } from "@/app/actions/checkin.server"
import { getParticipantById } from "@/app/actions/participants.server"

export default function ParticipantCarsSheet({
  participantId,
}: {
  participantId: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [participantName, setParticipantName] = useState<string>("")
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    let mounted = true
    setLoading(true)
    setError(null)
    setItems([])
    setSelected({})

    getParticipantById(participantId)
      .then((result) => {
        if (!mounted) return
        if (!result.success) {
          setError(result.error ?? "Error al cargar los datos del participante")
          return
        }

        const p = result.data
        if (!p) {
          setError("Participante no encontrado")
          return
        }

        setParticipantName(p.full_name ?? "")

        const regs: any[] = p.registrations ?? []
        const allItems = regs.flatMap((r) =>
          (r.items ?? []).map((it: any) => ({ ...it, registration: r }))
        )
        setItems(allItems)
      })
      .catch((e) => {
        if (!mounted) return
        setError(String(e))
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [open, participantId])

  const toggle = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  const selectAll = () => {
    const map: Record<string, boolean> = {}
    items.forEach((it) => {
      if (it.registration?.status === "PAID") map[it.id] = true
    })
    setSelected(map)
  }

  const clearSelection = () => setSelected({})

  const selectedIds = Object.keys(selected).filter((k) => selected[k])

  const handleAction = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos un elemento.")
      return
    }

    const selectedItems = items.filter((it) => selected[it.id])
    const allChecked = selectedItems.every((it) => !!it.checkin_date)
    const allUnchecked = selectedItems.every((it) => !it.checkin_date)
    const mode = allUnchecked ? "mark" : allChecked ? "undo" : "toggle"

    if (selectedIds.length > 5) {
      const confirmed = confirm(
        `Estás a punto de ${
          mode === "mark" ? "marcar" : mode === "undo" ? "deshacer" : "alternar"
        } ${selectedIds.length} elementos. ¿Continuar?`
      )
      if (!confirmed) return
    }

    startTransition(async () => {
      try {
        const res = await checkinRegistrationItems({
          itemIds: selectedIds,
          mode: mode as any,
        })

        if (res && (res as any).success) {
          const msg = `${(res as any).updatedCount ?? selectedIds.length} elemento(s) actualizado(s).`
          toast.success(msg)
          // re-fetch items
          setLoading(true)
          setError(null)
          const result = await getParticipantById(participantId)

          if (result.success && result.data) {
            const p = result.data
            setParticipantName(p.full_name ?? "")
            const regs: any[] = p.registrations ?? []
            const allItems = regs.flatMap((r) =>
              (r.items ?? []).map((it: any) => ({ ...it, registration: r }))
            )
            setItems(allItems)
            clearSelection()
          } else {
            setError(result.error ?? "Error al actualizar los elementos")
          }
        } else {
          const err = ((res as any)?.error as string) ?? "Error desconocido"
          toast.error(err)
          setError(err)
        }
      } catch (err: any) {
        const e = err?.message ?? String(err)
        toast.error(e)
        setError(e)
      } finally {
        setLoading(false)
      }
    })
  }

  const selectedCount = selectedIds.length

  const allItemsEmpty = items.length === 0

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          Vehículos
        </Button>
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>
            Vehículos{participantName ? ` — ${participantName}` : ""}
          </SheetTitle>
          <SheetDescription>
            Elementos de inscripción de este participante.
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 pb-32">
          <div className="mb-3 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Seleccionar todos
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Limpiar
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              {items.length} vehículos
            </div>
          </div>

          {loading && <div>Cargando...</div>}
          {error && <div className="text-sm text-destructive">{error}</div>}

          {!loading && !error && allItemsEmpty && (
            <div className="text-sm text-muted-foreground">
              No se encontraron vehículos registrados.
            </div>
          )}

          <ul className="mt-3 space-y-3">
            {items.map((item) => {
              const isPaid = item.registration?.status === "PAID"
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded border p-3"
                >
                  <div className="flex items-center gap-3">
                    {isPaid ? (
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
                        {item.vehicle?.license_plate ?? "—"}{" "}
                        {item.vehicle?.brand ? `· ${item.vehicle.brand}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Bib: {item.entry_number ?? "—"}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm">
                    {isPaid ? (
                      item.checkin_date ? (
                        <Badge variant="default">Presente</Badge>
                      ) : (
                        <Badge variant="outline">Ausente</Badge>
                      )
                    ) : (
                      <Badge variant="secondary">
                        {item.registration?.status === "PENDING"
                          ? "Pago pendiente"
                          : "Inscripción cancelada"}
                      </Badge>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="sticky right-0 bottom-0 left-0 border-t bg-background p-4">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {selectedCount} seleccionados
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Limpiar
              </Button>
              <Button
                onClick={handleAction}
                disabled={isPending || selectedCount === 0}
                variant={selectedCount === 0 ? "outline" : "default"}
              >
                {isPending
                  ? "Procesando..."
                  : (() => {
                      if (selectedCount === 0) return "Seleccionar elementos"
                      const selectedItems = items.filter(
                        (it) => selected[it.id]
                      )
                      if (selectedItems.length === 0)
                        return "Seleccionar elementos"
                      const allChecked = selectedItems.every(
                        (it) => !!it.checkin_date
                      )
                      const allUnchecked = selectedItems.every(
                        (it) => !it.checkin_date
                      )
                      if (allUnchecked)
                        return "Marcar como registrados"
                      if (allChecked)
                        return "Deshacer registro de seleccionados"
                      return "Alternar registro de seleccionados"
                    })()}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
