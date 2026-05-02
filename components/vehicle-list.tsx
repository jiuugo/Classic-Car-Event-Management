"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DataTable from "@/components/data-table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { VehicleRow } from "@/lib/types/vehicle.types"
import VehicleRowActions from "./vehicle-row-actions"

function StatusBadge({
  status,
  participantId,
}: {
  status: VehicleRow["registration_status"]
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

function rowClassName(row: VehicleRow) {
  if (row.registration_status === "PAID") return ""
  if (row.registration_status === "PENDING")
    return "bg-yellow-500/5"
  if (row.registration_status === "CANCELLED")
    return "bg-red-500/5"
  return "bg-gray-500/5"
}

export default function VehicleList({
  vehicles,
  brands,
  currentFilters,
}: {
  vehicles: VehicleRow[]
  brands: string[]
  currentFilters: { brand?: string; status?: string; showUnpaid?: boolean }
}) {
  const router = useRouter()

  /** Build a new URL preserving existing filters and overriding the given key */
  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams()
    const merged = { ...currentFilters, [key]: value }
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "false") params.set(k, String(v))
    }
    router.push(`/dashboard/vehicles?${params.toString()}`)
  }

  function toggleShowUnpaid(checked: boolean) {
    const params = new URLSearchParams()
    const merged = { ...currentFilters, showUnpaid: checked }
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "false") params.set(k, String(v))
    }
    router.push(`/dashboard/vehicles?${params.toString()}`)
  }

  const columns: ColumnDef<VehicleRow>[] = [
    {
      accessorKey: "brand",
      header: "Brand",
    },
    {
      accessorKey: "model",
      header: "Model",
    },
    {
      accessorKey: "license_plate",
      header: "License Plate",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
          {row.original.license_plate}
        </code>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      accessorFn: (row) => row.participant.full_name,
      cell: ({ row }) => (
        <Link
          href={`/dashboard/participants/${row.original.participant.id}`}
          className="text-primary underline-offset-4 hover:underline"
        >
          {row.original.participant.full_name}
        </Link>
      ),
    },
    {
      id: "entry_number",
      header: "Bib #",
      accessorFn: (row) => row.registration_item?.entry_number ?? null,
      cell: ({ row }) => {
        const num = row.original.registration_item?.entry_number
        return num != null ? (
          <span className="font-medium">{num}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      id: "registration_status",
      header: "Inscripción",
      accessorFn: (row) => row.registration_status ?? "none",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.registration_status}
          participantId={row.original.participant.id}
        />
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) =>
        row.registration_item?.checkin_date ? "present" : "absent",
      cell: ({ row }) => {
        const checked = !!row.original.registration_item?.checkin_date
        return checked ? (
          <Badge variant="default">Present</Badge>
        ) : (
          <Badge variant="outline">Absent</Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <VehicleRowActions vehicle={row.original} />,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Vehicle Fleet</CardTitle>
          <div className="text-sm text-muted-foreground">
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Toolbar: Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Brand filter */}
          <Select
            value={currentFilters.brand ?? ""}
            onValueChange={(v) => updateFilter("brand", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All brands</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Attendance filter */}
          <Select
            value={currentFilters.status ?? ""}
            onValueChange={(v) => updateFilter("status", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Show unpaid toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="showUnpaid"
              checked={currentFilters.showUnpaid ?? false}
              onCheckedChange={(v) => toggleShowUnpaid(!!v)}
            />
            <Label htmlFor="showUnpaid" className="text-sm cursor-pointer">
              Mostrar no pagados
            </Label>
          </div>
        </div>

        <DataTable
          data={vehicles}
          columns={columns}
          enablePagination
          pageSize={20}
          getRowClassName={rowClassName}
        />
      </CardContent>
    </Card>
  )
}
