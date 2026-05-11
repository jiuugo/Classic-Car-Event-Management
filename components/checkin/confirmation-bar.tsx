"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowCounterClockwise, CheckCircle } from "@phosphor-icons/react"

export function ConfirmationBar({
  selectedCount,
  totalCount,
  isPending,
  onConfirm,
  onNextScan,
}: {
  selectedCount: number
  totalCount: number
  isPending: boolean
  onConfirm: () => void
  onNextScan: () => void
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/80 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="h-6 px-2 text-xs">
            {selectedCount} seleccionado{selectedCount !== 1 ? "s" : ""}
          </Badge>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            de {totalCount} vehículo{totalCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            onClick={onNextScan}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            <ArrowCounterClockwise className="size-4" />
            <span className="hidden sm:inline">Siguiente escaneo</span>
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isPending || selectedCount === 0}
            className="w-full sm:w-auto"
          >
            <CheckCircle className="size-4" />
            {isPending
              ? "Registrando…"
              : `Confirmar entrada${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
