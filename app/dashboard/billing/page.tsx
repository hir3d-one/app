import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { SubscriptionSection } from "@/components/account/subscription-section";

export default function BillingPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="px-4 py-4">
          <SubscriptionSection />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 