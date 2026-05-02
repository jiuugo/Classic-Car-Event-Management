"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import ParticipantRowActions from "./participant-row-actions"
import DataTable from "@/components/data-table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { ParticipantRow } from "@/lib/types/participant.types"

function StatusBadge({
  status,
  participantId,
}: {
  status: ParticipantRow["registration_status"]
  participantId: string
}) {
  const badge = (() => {
    switch (status) {
      case "PAID":
        return <Badge variant="default">Pagado</Badge>
      case "PENDING":
        return <Badge variant="secondary">Pendiente</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">Sin registro</Badge>
    }
  })()

  return (
    <Link
      href={`/dashboard/participants/${participantId}?tab=registrations`}
      className="hover:underline"
    >
      {badge}
    </Link>
  )
}

function rowClassName(row: ParticipantRow) {
  if (row.registration_status === "PAID") return ""
  if (row.registration_status === "PENDING")
    return "bg-yellow-500/5"
  if (row.registration_status === "CANCELLED")
    return "bg-red-500/5"
  return "bg-gray-500/5"
}

export default function ParticipantList({
  participants,
  q,
  showUnpaid,
}: {
  participants: ParticipantRow[]
  q?: string
  showUnpaid?: boolean
}) {
  const router = useRouter()

  function toggleShowUnpaid(checked: boolean) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (checked) params.set("showUnpaid", "true")
    router.push(`/dashboard/participants?${params.toString()}`)
  }

  const columns: ColumnDef<ParticipantRow>[] = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/participants/${row.original.id}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {row.original.full_name}
        </Link>
      ),
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "national_id", header: "National ID" },
    {
      id: "registration_status",
      header: "Inscripción",
      accessorFn: (row) => row.registration_status ?? "none",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.registration_status}
          participantId={row.original.id}
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ParticipantRowActions participant={row.original} />,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Participants</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="showUnpaid"
                checked={showUnpaid ?? false}
                onCheckedChange={(v) => toggleShowUnpaid(!!v)}
              />
              <Label htmlFor="showUnpaid" className="text-sm cursor-pointer">
                Mostrar no pagados
              </Label>
            </div>
            <div className="text-sm text-muted-foreground">
              {participants.length} participants
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={participants}
          columns={columns}
          enablePagination
          pageSize={10}
          getRowClassName={rowClassName}
        />
      </CardContent>
    </Card>
  )
}
