"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import ParticipantRowActions from "./participant-row-actions"
import DataTable from "@/components/data-table/data-table"
import type { ColumnDef } from "@tanstack/react-table"

export default function ParticipantList({
  participants,
  q,
}: {
  participants: any[]
  q?: string
}) {
  const columns: ColumnDef<any>[] = [
    { accessorKey: "full_name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "national_id", header: "National ID" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ParticipantRowActions participant={row.original} />,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {participants.length} participants
          </div>
        </div>

        <DataTable
          data={participants}
          columns={columns}
          enablePagination
          pageSize={10}
        />
      </CardContent>
    </Card>
  )
}
