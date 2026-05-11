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
  if (row.registration_status === "PENDING") return "bg-yellow-500/5 dark:bg-yellow-500/20"
  if (row.registration_status === "CANCELLED") return "bg-red-500/5 dark:bg-red-500/20"
  return "bg-gray-500/5 dark:bg-gray-500/20"
}

export default function VehicleList({
  vehicles,
  brands,
  currentFilters,
}: {
  vehicles: VehicleRow[]
  brands: string[]
  currentFilters: {
    q?: string
    brand?: string
    status?: string
    showUnpaid?: boolean
  }
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

  function clearSearch() {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(currentFilters)) {
      if (k === "q") continue
      if (v && v !== "false") params.set(k, String(v))
    }
    router.push(`/dashboard/vehicles?${params.toString()}`)
  }

  const columns: ColumnDef<VehicleRow>[] = [
    {
      accessorKey: "brand",
      header: "Marca",
    },
    {
      accessorKey: "model",
      header: "Modelo",
    },
    {
      accessorKey: "license_plate",
      header: "Matrícula",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
          {row.original.license_plate}
        </code>
      ),
    },
    {
      id: "owner",
      header: "Propietario",
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
      header: "Dorsal",
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
      header: "Estado",
      accessorFn: (row) =>
        row.registration_item?.checkin_date ? "present" : "absent",
      cell: ({ row }) => {
        const checked = !!row.original.registration_item?.checkin_date
        return checked ? (
          <Badge variant="default">Presente</Badge>
        ) : (
          <Badge variant="outline">Ausente</Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => <VehicleRowActions vehicle={row.original} />,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Flota de Vehículos</CardTitle>
          <div className="text-sm text-muted-foreground">
            {vehicles.length} vehículo{vehicles.length !== 1 ? "s" : ""}
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
              <SelectValue placeholder="Todas las marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todas las marcas</SelectItem>
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
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="present">Presente</SelectItem>
                <SelectItem value="absent">Ausente</SelectItem>
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
            <Label htmlFor="showUnpaid" className="cursor-pointer text-sm">
              Mostrar no pagados
            </Label>
          </div>

          {/* Active search chip */}
          {currentFilters.q && (
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <span>Búsqueda: {currentFilters.q}</span>
              <button
                onClick={clearSearch}
                className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            </div>
          )}
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
