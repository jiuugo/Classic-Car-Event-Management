"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
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
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  CameraIcon,
  FileTextIcon,
  GearIcon,
  QuestionIcon,
  MagnifyingGlassIcon,
  DatabaseIcon,
  ChartLineIcon,
  FileIcon,
  CommandIcon,
} from "@phosphor-icons/react"

export function AppSidebar({
  role = "STAFF",
  ...props
}: { role?: "ADMIN" | "STAFF" } & React.ComponentProps<typeof Sidebar>) {
  const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
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
    {
      title: "Get Help",
      url: "#",
      icon: <QuestionIcon />,
    },
    {
      title: "Search",
      url: "#",
      icon: <MagnifyingGlassIcon />,
    },
  ]

  const documents = [
    {
      name: "Data Library",
      url: "#",
      icon: <DatabaseIcon />,
    },
    {
      name: "Reports",
      url: "#",
      icon: <ChartLineIcon />,
    },
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
              <a href="/">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={documents} label="Resources" />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
