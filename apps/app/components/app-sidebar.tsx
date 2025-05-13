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
  ArchiveIcon,
  StarIcon,
  ZapIcon,
  BriefcaseIcon,
  UsersRoundIcon,
  BookUserIcon,
  PlusCircleIcon,
  MailIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
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
    { title: "Job Searches", url: "/dashboard/jobs", icon: BriefcaseIcon },
    { title: "Candidate Pool", url: "/dashboard/candidates", icon: UsersRoundIcon },
  ],
  navMyTools: [
    { title: "Shortlisted Candidates", url: "/dashboard/shortlisted", icon: StarIcon },
    { title: "Saved Searches", url: "/dashboard/saved-searches", icon: SearchIcon },
    { title: "Templates", url: "/dashboard/templates", icon: BookUserIcon },
    { title: "Archived Jobs", url: "/dashboard/jobs/archived", icon: ArchiveIcon },
  ],
  navGrowthInsights: [
    { title: "Promote Jobs", url: "/dashboard/promote", icon: ZapIcon },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChartIcon },
  ],
  navSecondary: [
    {
      title: "Account",
      url: "/dashboard/account",
      icon: UserCircleIcon,
    },
    // {
    //   title: "Billing",
    //   url: "/dashboard/account/billing",
    //   icon: CreditCardIcon,
    // },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: BellIcon,
    },
    {
      title: "Help & Support",
      url: "/dashboard/help",
      icon: HelpCircleIcon,
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
        <SidebarMenu className="p-2">
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Create Job Search"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <PlusCircleIcon />
              <span>Create Job Search</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <MailIcon />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        <NavMain items={data.navMain} />
        <NavMain items={data.navMyTools} title="MY TOOLS" />
        <NavMain items={data.navGrowthInsights} title="GROWTH & INSIGHTS" />
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
