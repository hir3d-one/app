import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import UserCardClient from "./UserCardClient";
import { OrganizationCard } from "./organization-card";

export default async function AccountPage() {
  const [session, activeSessions, deviceSessions, organization, subscriptions] =
    await Promise.all([
      auth.api.getSession({ headers: await headers() }),
      auth.api.listSessions({ headers: await headers() }),
      auth.api.listDeviceSessions({ headers: await headers() }),
      auth.api.getFullOrganization({ headers: await headers() }),
      auth.api.listActiveSubscriptions({ headers: await headers() }),
    ]).catch(() => {
      redirect('/sign-in');
    });
  
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Account" />
        <div className="flex flex-col w-full p-4 space-y-4">
          <UserCardClient
            session={JSON.parse(JSON.stringify(session))}
            activeSessions={JSON.parse(JSON.stringify(activeSessions))}
            subscription={
              subscriptions.find(
                (sub: any) => sub.status === 'active' || sub.status === 'trialing'
              )
            }
          />
          <OrganizationCard
            session={JSON.parse(JSON.stringify(session))}
            activeOrganization={JSON.parse(JSON.stringify(organization))}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 