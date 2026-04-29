"use client"

import React, { useEffect, useState, useTransition } from "react"
import { checkinRegistrationItems } from "@/app/actions/checkin.server"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

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
      toast.error("Select at least one item to check-in.")
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
          const msg = `Checked-in ${(res as any).updatedCount ?? ids.length} item(s).`
          toast.success(msg)
          setMessage(msg)
          clearSelection()
        } else {
          const err = ((res as any)?.error as string) ?? "Unknown error"
          toast.error(err)
          setMessage(err)
        }
      } catch (err: any) {
        const e = err?.message ?? String(err)
        toast.error(e)
        setMessage(e)
      }
    })
  }

  const selectedCount = Object.keys(selected).filter((k) => selected[k]).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Results</CardTitle>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll} type="button">
            Select all
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelection}
            type="button"
          >
            Clear
          </Button>
          <Button
            onClick={confirm}
            disabled={isPending || selectedCount === 0}
            data-testid="confirm-checkin"
          >
            {isPending ? "Checking..." : "Confirm Check-in"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {message && <div className="mb-4 text-sm">{message}</div>}

        <ul className="mt-2 space-y-2">
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
                <Checkbox
                  checked={!!selected[it.id]}
                  onCheckedChange={(val) =>
                    setSelected((s) => ({ ...s, [it.id]: !!val }))
                  }
                  aria-label={`Select item ${it.entry_number ?? it.id}`}
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
                  <Badge variant="default">Present</Badge>
                ) : (
                  <Badge variant="outline">Not present</Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter />
    </Card>
  )
}
