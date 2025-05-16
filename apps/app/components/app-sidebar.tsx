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
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

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

// Define the shape of navigation items if not already implicitly defined by NavMain props
interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  disabled?: boolean; // Optional: if you ever want to disable rather than hide
}

const baseNavData = {
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
  // Growth Insights will be constructed dynamically
  navSecondary: [
    { title: "Account", url: "/dashboard/account", icon: UserCircleIcon },
    { title: "Notifications", url: "/dashboard/notifications", icon: BellIcon },
    { title: "Help & Support", url: "/dashboard/help", icon: HelpCircleIcon },
  ],
};

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

// Define props for AppSidebar, including the feature flags
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  showPromoteJobs?: boolean;
  showAnalytics?: boolean;
}

export function AppSidebar({ showPromoteJobs, showAnalytics, ...props }: AppSidebarProps) {
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Dynamically construct navGrowthInsights based on feature flags
  const navGrowthInsights: NavItem[] = [];
  if (showPromoteJobs) {
    navGrowthInsights.push({ title: "Promote Jobs", url: "/dashboard/promote", icon: ZapIcon });
  }
  if (showAnalytics) {
    navGrowthInsights.push({ title: "Analytics", url: "/dashboard/analytics", icon: BarChartIcon });
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <OrganisationsSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="p-2">
          <SidebarMenuItem className="flex items-center gap-2">
            <Link href="/dashboard/jobs/create" className="flex-grow">
              <SidebarMenuButton
                tooltip="Create Job Search"
                className="w-full min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              >
                <PlusCircleIcon />
                <span>Create Job Search</span>
              </SidebarMenuButton>
            </Link>
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

        <NavMain items={baseNavData.navMain} />
        <NavMain items={baseNavData.navMyTools} title="MY TOOLS" />
        {/* Only render Growth & Insights section if there are items to show */}
        {navGrowthInsights.length > 0 && (
          <NavMain items={navGrowthInsights} title="GROWTH & INSIGHTS" />
        )}
        <NavSecondary items={baseNavData.navSecondary} className="mt-auto" />
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
