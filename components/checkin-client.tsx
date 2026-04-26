"use client"

import React, { useEffect, useState, useTransition } from "react"
import { checkinRegistrationItems } from "@/app/actions/checkin.server"

type VehiclePreview = {
  license_plate: string
  brand?: string | null
  model?: string | null
}

type Item = {
  id: string
  entry_number?: number | null
  checkin_date?: string | null
  vehicle?: VehiclePreview | null
}

export function CheckinClient({
  items,
  query,
}: {
  items: Item[]
  query?: string
}) {
  const [localItems, setLocalItems] = useState<Item[]>(items)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setLocalItems(items)
    setSelected({})
    setMessage(null)
  }, [items])

  const toggle = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  const selectAll = () => {
    const map: Record<string, boolean> = {}
    localItems.forEach((it) => (map[it.id] = true))
    setSelected(map)
  }

  const clearSelection = () => setSelected({})

  const confirm = () => {
    const ids = Object.keys(selected).filter((k) => selected[k])
    if (ids.length === 0) {
      setMessage("Select at least one item to check-in.")
      return
    }

    startTransition(async () => {
      setMessage(null)
      try {
        const res = await checkinRegistrationItems({ itemIds: ids })
        if (res && (res as any).success) {
          const now = new Date().toISOString()
          setLocalItems((prev) =>
            prev.map((it) =>
              ids.includes(it.id) ? { ...it, checkin_date: now } : it
            )
          )
          setMessage(
            `Checked-in ${(res as any).updatedCount ?? ids.length} item(s).`
          )
          clearSelection()
        } else {
          setMessage(((res as any)?.error as string) ?? "Unknown error")
        }
      } catch (err: any) {
        setMessage(err?.message ?? String(err))
      }
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">Search: </div>
        <div className="font-medium">{query ?? "—"}</div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-md border px-2 py-1 text-sm"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-md border px-2 py-1 text-sm"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={isPending}
            className="rounded-md bg-primary px-3 py-1 text-sm text-white disabled:opacity-60"
          >
            {isPending ? "Checking..." : "Confirm Check-in"}
          </button>
        </div>
      </div>

      {message && <div className="mt-2 text-sm">{message}</div>}

      <ul className="mt-4 space-y-2">
        {localItems.length === 0 && (
          <li className="text-sm text-muted-foreground">
            No registration items found.
          </li>
        )}
        {localItems.map((it) => (
          <li
            key={it.id}
            className="flex items-center justify-between rounded-md border px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!selected[it.id]}
                onChange={() => toggle(it.id)}
              />
              <div>
                <div className="font-medium">
                  {it.vehicle?.license_plate ?? "—"}{" "}
                  {it.vehicle?.brand ? `· ${it.vehicle.brand}` : ""}
                </div>
                <div className="text-xs text-muted-foreground">
                  Bib: {it.entry_number ?? "—"}
                </div>
              </div>
            </div>
            <div className="text-sm">
              {it.checkin_date ? (
                <span className="text-emerald-600">Present</span>
              ) : (
                <span className="text-muted-foreground">Not present</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
