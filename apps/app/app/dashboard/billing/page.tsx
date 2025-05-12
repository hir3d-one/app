"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { SubscriptionSection } from "@/components/dashboard/account/subscription-section";
import { UsageSection } from "@/components/dashboard/account/usage-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function BillingPage() {
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await client.subscription.list({
        fetchOptions: {
          throw: false,
        },
      });
      if ('error' in res && res.error) {
        console.error("Error fetching invoices:", res.error);
        toast.error(res.error.message || "Failed to load invoice details.");
        return [];
      }
      return Array.isArray(res) ? res : res.data ?? [];
    },
    initialData: [],
    refetchOnWindowFocus: false,
  });

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Billing" />
        <div className="flex flex-col w-full p-4">
          <Tabs defaultValue="subscription" className="w-full">
            <TabsList className="w-auto mb-4">
              <TabsTrigger value="subscription">Subscription & Usage</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription" className="space-y-4">
              <SubscriptionSection />
              <UsageSection />
            </TabsContent>
            
            <TabsContent value="invoices">
              <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-transparent p-4">
                {isLoadingInvoices ? (
                  <div className="flex justify-center items-center h-20">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                  </div>
                ) : invoices && invoices.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      <div>Date</div>
                      <div>Invoice Number</div>
                      <div>Amount</div>
                      <div>Status</div>
                    </div>
                    {invoices.map((invoice: any) => (
                      <div key={invoice.id} className="grid grid-cols-4 gap-4 py-2 text-sm">
                        <div>{new Date(invoice.created * 1000).toLocaleDateString()}</div>
                        <div>{invoice.number}</div>
                        <div>{(invoice.amount_paid / 100).toLocaleString('en-US', { style: 'currency', currency: invoice.currency || 'USD' })}</div>
                        <div className="capitalize">{invoice.status}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">No invoices found.</p>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="payment-methods">
              <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-transparent p-6">
                <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                  Payment methods will appear here.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 