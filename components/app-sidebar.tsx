"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  SquaresFourIcon,
  ListIcon,
  UsersIcon,
  CameraIcon,
  FileTextIcon,
  GearIcon,
  ChartLineIcon,
  CarIcon,
} from "@phosphor-icons/react"
import Link from "next/link"

export function AppSidebar({
  role = "STAFF",
  user = {
    name: "Usuario",
    email: "",
  },
  ...props
}: {
  role?: "ADMIN" | "STAFF"
  user?: { name: string; email: string }
} & React.ComponentProps<typeof Sidebar>) {
  const navUser = {
    name: user.name,
    email: user.email,
    avatar: "",
  }

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <SquaresFourIcon />,
    },
    {
      title: "Check-in Hub",
      url: "/dashboard/checkin",
      icon: <CameraIcon />,
    },
    {
      title: "Raffle Room",
      url: "/dashboard/raffle",
      icon: <FileTextIcon />,
    },
    {
      title: "Participants",
      url: "/dashboard/participants",
      icon: <UsersIcon />,
    },
    {
      title: "Vehicles",
      url: "/dashboard/vehicles",
      icon: <ListIcon />,
    },
    {
      title: "Registrations & Payments",
      url: "/dashboard/registrations",
      icon: <ChartLineIcon />,
    },
  ]

  const navSecondary = [
    ...(role === "ADMIN"
      ? [
          {
            title: "Settings",
            url: "/dashboard/settings",
            icon: <GearIcon />,
          },
        ]
      : []),
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <CarIcon className="size-5!" />
                <span className="text-base font-semibold">Clasicos Robla</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
