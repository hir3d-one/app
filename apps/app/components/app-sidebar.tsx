"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  UserCircleIcon,
  CreditCardIcon,
  BellIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { OrganisationsSwitcher } from "@/components/team-switcher"
import { Logo } from "@/components/logo"
import { useSession } from "@/lib/auth-client"
import { useState, useEffect } from "react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
    { title: "Lifecycle", url: "/dashboard/lifecycle", icon: ListIcon },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChartIcon },
    { title: "Projects", url: "/dashboard/projects", icon: FolderIcon },
    { title: "Team", url: "/dashboard/team", icon: UsersIcon },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: FileCodeIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Account",
      url: "/dashboard/account",
      icon: UserCircleIcon,
    },
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: CreditCardIcon,
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: BellIcon,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: DatabaseIcon,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: FileIcon,
    },
  ],
}

function NavUserSidebarSkeleton() {
  return (
    <div className="flex items-center gap-2 p-2">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div className="flex flex-col flex-1 gap-1">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-2 w-28 rounded" />
      </div>
      <Skeleton className="ml-auto size-4 rounded" />
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <OrganisationsSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {mounted && !isPending && session ? (
          <NavUser
            user={{
              name: session.user.name || "",
              email: session.user.email,
              avatar: session.user.image || "",
            }}
          />
        ) : (
          <NavUserSidebarSkeleton />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
