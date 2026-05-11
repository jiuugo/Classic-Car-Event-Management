"use client"

import React, { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { deleteDashboardUser } from "@/app/actions/dashboard-users.server"
import DashboardUserEditForm from "./dashboard-user-edit-form"
import type { DashboardUserRow } from "@/lib/types/dashboard-user.types"

export default function DashboardUserRowActions({
  user,
  currentUserId,
}: {
  user: DashboardUserRow
  currentUserId: string
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isSelf = user.id === currentUserId

  function handleDelete() {
    startTransition(async () => {
      try {
        const result = await deleteDashboardUser(user.id)

        if (!result.success) {
          toast.error(result.error ?? "Error al eliminar el usuario")
          return
        }

        toast.success("Usuario eliminado")
        router.refresh()
      } catch (err) {
        toast.error(String(err))
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </SheetTrigger>

        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Editar usuario</SheetTitle>
            <SheetDescription>
              Actualiza los datos del usuario del dashboard.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6">
            <DashboardUserEditForm
              user={user}
              currentUserId={currentUserId}
              onClose={() => setEditOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={isSelf}
            title={isSelf ? "No puedes eliminar tu propia cuenta" : undefined}
          >
            Eliminar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente el usuario{" "}
              <span className="font-medium">{user.email}</span>. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
