"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  UsersIcon,
  CarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from "@phosphor-icons/react"
import type { DashboardStats } from "@/app/actions/dashboard.server"

export function DashboardKpiCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: "Total Participantes",
      value: stats.totalParticipants.toLocaleString(),
      icon: <UsersIcon className="size-4" weight="duotone" />,
      footer: `${stats.totalVehicles} vehículo${stats.totalVehicles !== 1 ? "s" : ""} registrado${stats.totalVehicles !== 1 ? "s" : ""}`,
      accent:
        "text-blue-600 bg-blue-500/10 dark:text-blue-400 dark:bg-blue-500/20",
    },
    {
      label: "Vehículos Registrados",
      value: stats.totalVehicles.toLocaleString(),
      icon: <CarIcon className="size-4" weight="duotone" />,
      footer: `${stats.checkedInVehicles} registrados de ${stats.totalRegistrationItems} vehículos totales`,
      accent:
        "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20",
    },
    {
      label: "Ingresos Totales",
      value: `${stats.totalRevenue.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
      icon: <CurrencyDollarIcon className="size-4" weight="duotone" />,
      footer: `${stats.paymentsByStatus.COMPLETED} pago${stats.paymentsByStatus.COMPLETED !== 1 ? "s" : ""} completado${stats.paymentsByStatus.COMPLETED !== 1 ? "s" : ""}`,
      accent:
        "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20",
    },
    {
      label: "Asistencia en Vivo",
      value: `${stats.liveAttendanceRate}%`,
      icon: <ChartBarIcon className="size-4" weight="duotone" />,
      footer: `${stats.checkedInVehicles} de ${stats.totalRegistrationItems} vehículos en el recinto`,
      accent:
        "text-purple-600 bg-purple-500/10 dark:text-purple-400 dark:bg-purple-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card"
        >
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <span
                className={`flex size-6 items-center justify-center rounded-md ${card.accent}`}
              >
                {card.icon}
              </span>
              {card.label}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-muted-foreground">
                En vivo
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">{card.footer}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
