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
import { Plus } from "@phosphor-icons/react"
import DashboardUserCreateForm from "./dashboard-user-create-form"

export default function SettingsCreateButton() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo usuario
        </Button>
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Crear usuario</SheetTitle>
          <SheetDescription>
            Añade un nuevo usuario al dashboard.
          </SheetDescription>
        </SheetHeader>
        <div className="p-6">
          <DashboardUserCreateForm onClose={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
