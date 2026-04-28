"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

export default function VehicleList({
  vehicles,
  brands,
  currentFilters,
}: {
  vehicles: VehicleRow[]
  brands: string[]
  currentFilters: { q?: string; brand?: string; status?: string }
}) {
  const router = useRouter()

  /** Build a new URL preserving existing filters and overriding the given key */
  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams()
    const merged = { ...currentFilters, [key]: value }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
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
        {/* Toolbar: Search + Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* License plate search */}
          <form
            className="flex-1"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              updateFilter("q", String(fd.get("q") ?? ""))
            }}
          >
            <Input
              name="q"
              placeholder="Search by license plate…"
              defaultValue={currentFilters.q ?? ""}
              className="max-w-xs"
            />
          </form>

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
        </div>

        <DataTable
          data={vehicles}
          columns={columns}
          enablePagination
          pageSize={20}
        />
      </CardContent>
    </Card>
  )
}
