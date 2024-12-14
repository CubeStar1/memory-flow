"use client"

import { BarChart3, Cpu, Home, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"

const navItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    isActive: false,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Cpu,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="px-6 py-5 border-b">
        <h1 className="text-sm font-semibold">Virtual Memory Dashboard</h1>
      </div>
      <SidebarHeader>
        <NavMain items={navItems} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects
          projects={[
            {
              name: "Memory Analysis",
              url: "/analytics",
              icon: BarChart3,
            },
            {
              name: "System Monitor",
              url: "/monitoring",
              icon: Cpu,
            },
          ]}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: "Admin",
            email: "admin@system.local",
            avatar: "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
} 