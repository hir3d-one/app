import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";

export default function LifecyclePage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Lifecycle" />
        <div className="p-4">
          {/* <h1 className="text-2xl font-bold">Lifecycle</h1> */}
          <p>This is the Lifecycle page.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 