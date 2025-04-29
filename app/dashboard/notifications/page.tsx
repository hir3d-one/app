import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";

export default function NotificationsPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold">Notifications</h1>
          <p>Notifications are coming soon.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 