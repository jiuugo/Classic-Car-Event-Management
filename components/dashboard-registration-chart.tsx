"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Cell, Pie, PieChart, Label } from "recharts"
import type { DashboardStats } from "@/app/actions/dashboard.server"

const chartConfig: ChartConfig = {
  PAID: {
    label: "Paid",
    color: "oklch(0.65 0.15 160)",
  },
  PENDING: {
    label: "Pending",
    color: "oklch(0.75 0.15 70)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "oklch(0.60 0.20 25)",
  },
}

export function DashboardRegistrationChart({
  stats,
}: {
  stats: DashboardStats
}) {
  const data = [
    {
      name: "Paid",
      value: stats.registrationsByStatus.PAID,
      fill: chartConfig.PAID.color!,
    },
    {
      name: "Pending",
      value: stats.registrationsByStatus.PENDING,
      fill: chartConfig.PENDING.color!,
    },
    {
      name: "Cancelled",
      value: stats.registrationsByStatus.CANCELLED,
      fill: chartConfig.CANCELLED.color!,
    },
  ].filter((d) => d.value > 0)

  const total =
    stats.registrationsByStatus.PAID +
    stats.registrationsByStatus.PENDING +
    stats.registrationsByStatus.CANCELLED

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registration Status</CardTitle>
          <CardDescription>Breakdown by payment status</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            No registrations yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Status</CardTitle>
        <CardDescription>Breakdown by payment status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[260px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={2}
              stroke="var(--background)"
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          Registrations
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-2 flex items-center justify-center gap-4">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs">
              <div
                className="size-2.5 rounded-full"
                style={{ backgroundColor: d.fill }}
              />
              <span className="text-muted-foreground">
                {d.name}: {d.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
