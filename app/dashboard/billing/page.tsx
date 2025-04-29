import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { SubscriptionSection } from "@/components/account/subscription-section";
import { UsageSection } from "@/components/account/usage-section";

export default function BillingPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col w-full p-4 space-y-4">
          <SubscriptionSection />
          <UsageSection />
          {/* TODO: add usage tracking info component here */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 