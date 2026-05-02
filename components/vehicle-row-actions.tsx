"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
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
    </div>
  )
}
