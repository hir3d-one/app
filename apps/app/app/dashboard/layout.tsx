import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { showPromoteJobsFeature, showAnalyticsFeature } from '@/lib/flags';
import { DashboardFlagsProvider, DashboardFlags } from '@/contexts/dashboard-flags-context';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Evaluate the flags on the server
  const shouldShowPromoteJobs = await showPromoteJobsFeature();
  const shouldShowAnalytics = await showAnalyticsFeature();

  const flags: DashboardFlags = {
    showPromoteJobs: shouldShowPromoteJobs,
    showAnalytics: shouldShowAnalytics,
  };

  return (
    <SidebarProvider>
      <AppSidebar 
        variant="inset" // Assuming 'inset' is the common variant
        showPromoteJobs={shouldShowPromoteJobs}
        showAnalytics={shouldShowAnalytics}
      />
      <SidebarInset>
        <DashboardFlagsProvider flags={flags}>
          {/* Individual pages will render their own SiteHeader if needed */}
          {children}
        </DashboardFlagsProvider>
      </SidebarInset>
    </SidebarProvider>
  );
} 