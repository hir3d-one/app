import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";

export default function TeamPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-4">
          <h1 className="text-2xl font-bold">Team</h1>
          <p>This is the Team page.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 