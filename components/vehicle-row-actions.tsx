"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import VehicleEditForm from "./vehicle-edit-form"

export default function VehicleRowActions({ vehicle }: { vehicle: any }) {
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Delete this vehicle?")) return

    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        toast.error(json?.error ?? "Failed to delete")
        return
      }

        toast.success("Vehicle deleted")
        window.location.reload()
    } catch (err) {
      toast.error(String(err))
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </SheetTrigger>

        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Edit vehicle</SheetTitle>
            <SheetDescription>
              Update vehicle information below.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6">
            <VehicleEditForm vehicle={vehicle} onClose={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <Button variant="destructive" size="sm" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  )
}
