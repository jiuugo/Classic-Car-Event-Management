"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DataTable from "@/components/data-table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { DashboardUserRow } from "@/lib/types/dashboard-user.types"
import DashboardUserRowActions from "./dashboard-user-row-actions"

function RoleBadge({ role }: { role: DashboardUserRow["role"] }) {
  switch (role) {
    case "ADMIN":
      return <Badge variant="default">Administrador</Badge>
    case "STAFF":
      return <Badge variant="secondary">Personal</Badge>
    default:
      return <Badge variant="outline">{role}</Badge>
  }
}

export default function DashboardUserList({
  users,
  currentUserId,
}: {
  users: DashboardUserRow[]
  currentUserId: string
}) {
  const columns: ColumnDef<DashboardUserRow>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <DashboardUserRowActions
          user={row.original}
          currentUserId={currentUserId}
        />
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Usuarios del Dashboard</CardTitle>
          <div className="text-sm text-muted-foreground">
            {users.length} usuario{users.length !== 1 ? "s" : ""}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={users}
          columns={columns}
          enablePagination
          pageSize={10}
        />
      </CardContent>
    </Card>
  )
}
