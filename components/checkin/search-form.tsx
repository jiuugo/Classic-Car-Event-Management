"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { searchParticipantForCheckin } from "@/app/actions/checkin.server"
import type { ParticipantCheckinData } from "@/lib/types/checkin.types"
import { MagnifyingGlass } from "@phosphor-icons/react"

export function SearchForm({
  onResult,
}: {
  onResult: (data: ParticipantCheckinData) => void
}) {
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = query.trim()
    if (!trimmed) return

    startTransition(async () => {
      const res = await searchParticipantForCheckin(trimmed)
      if (res.success) {
        onResult(res.data)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="checkin-search">
          Búsqueda manual
        </Label>
        <p className="text-xs text-muted-foreground">
          Introduce matrícula, DNI/NIE o código QR
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          id="checkin-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej. 1234-ABC o 12345678A"
          className="flex-1"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending || !query.trim()}>
          <MagnifyingGlass className="size-4" />
          <span className="sr-only">Buscar</span>
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  )
}
