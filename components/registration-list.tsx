"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import type { RegistrationRow } from "@/lib/types/registration.types"
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from "@phosphor-icons/react"

const statusConfig: Record<
  string,
  {
    label: string
    variant: "default" | "outline" | "destructive" | "secondary"
    icon: React.ReactNode
  }
> = {
  PENDING: {
    label: "Pendiente",
    variant: "outline",
    icon: <ClockIcon className="size-3" />,
  },
  PAID: {
    label: "Pagado",
    variant: "default",
    icon: <CheckCircleIcon className="size-3" />,
  },
  CANCELLED: {
    label: "Cancelado",
    variant: "destructive",
    icon: <XCircleIcon className="size-3" />,
  },
}

const paymentStatusConfig: Record<
  string,
  { label: string; variant: "default" | "destructive" | "outline" }
> = {
  COMPLETED: { label: "Completado", variant: "default" },
  FAILED: { label: "Fallido", variant: "destructive" },
}

export default function RegistrationList({
  registrations,
  currentFilters,
}: {
  registrations: RegistrationRow[]
  currentFilters: {
    status?: string
    paymentStatus?: string
  }
}) {
  const router = useRouter()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams()
    const merged = { ...currentFilters, [key]: value }
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "all") params.set(k, v)
    }
    router.push(`/dashboard/registrations?${params.toString()}`)
  }

  const columns: ColumnDef<RegistrationRow>[] = [
    {
      id: "id",
      header: "ID Pedido",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          {row.original.id.slice(0, 8)}…
        </code>
      ),
    },
    {
      id: "participantName",
      header: "Comprador",
      accessorFn: (row) => row.participantName,
      cell: ({ row }) => (
        <Link
          href={`/dashboard/participants/${row.original.participantId}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {row.original.participantName}
        </Link>
      ),
    },
    {
      accessorKey: "participantEmail",
      header: "Email",
    },
    {
      id: "status",
      header: "Estado",
      accessorFn: (row) => row.status,
      cell: ({ row }) => {
        const config = statusConfig[row.original.status] ?? statusConfig.PENDING
        return (
          <Badge variant={config.variant} className="gap-1">
            {config.icon}
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "vehicleCount",
      header: "Vehículos",
    },
    {
      id: "totalAmount",
      header: "Importe",
      accessorFn: (row) => row.totalAmount,
      cell: ({ row }) => {
        const amount = row.original.totalAmount
        return amount != null ? (
          <span>{Number(amount).toFixed(2)} €</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      id: "paymentProvider",
      header: "Proveedor",
      accessorFn: (row) => row.paymentProvider,
      cell: ({ row }) => {
        const provider = row.original.paymentProvider
        return provider ? (
          <Badge variant="secondary" className="text-[10px]">
            {provider}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      id: "paymentStatus",
      header: "Pago",
      accessorFn: (row) => row.paymentStatus,
      cell: ({ row }) => {
        const ps = row.original.paymentStatus
        if (!ps) return <span className="text-muted-foreground">—</span>
        const config = paymentStatusConfig[ps] ?? paymentStatusConfig.COMPLETED
        return (
          <Badge variant={config.variant} className="text-[10px]">
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Creado",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("es-ES")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/registrations/${row.original.id}`}>
            <EyeIcon className="mr-1 size-4" />
            Ver
          </Link>
        </Button>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Inscripciones y Pagos</CardTitle>
          <div className="text-sm text-muted-foreground">
            {registrations.length}{" "}
            {registrations.length === 1
              ? "inscripción"
              : "inscripciones"}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="PAID">Pagado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={currentFilters.paymentStatus ?? ""}
            onValueChange={(v) =>
              updateFilter("paymentStatus", v === "all" ? "" : v)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos los pagos" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos los pagos</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
                <SelectItem value="FAILED">Fallido</SelectItem>
                <SelectItem value="none">Sin pago</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          data={registrations}
          columns={columns}
          enablePagination
          pageSize={20}
        />
      </CardContent>
    </Card>
  )
}
