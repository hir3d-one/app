"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Settings } from "lucide-react";
import { client } from "@/lib/auth-client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Subscription } from "@better-auth/stripe";

// Helper to format date
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (e) {
        return "Invalid Date";
    }
}

export function SubscriptionSection() {
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  // Fetch subscription data using useQuery, similar to demo
  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const res = await client.subscription.list({
        fetchOptions: {
          throw: false, // Don't throw on error, handle it below
        },
      });
      if (res.error) {
        console.error("Error fetching subscriptions:", res.error);
        toast.error(res.error.message || "Failed to load subscription details.");
        return []; // Return empty array on error
      }
      return res;
    },
    initialData: [], // Start with empty array
    refetchOnWindowFocus: false, // Optional: disable refetch on window focus
  });

  // Assuming user has at most one active/trialing subscription for this simplified view
  const activeSubscription = subscriptions?.find(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );

  const handleManageBilling = async () => {
    setIsPortalLoading(true);
    const res = await client.subscription.createBillingPortalSession(
        { returnUrl: window.location.href }, // Return to the current page
        {
            fetchOptions: {
                onSuccess: (data) => {
                    if (data.url) {
                        window.location.href = data.url; // Redirect to Stripe Portal
                    } else {
                        toast.error("Could not retrieve billing portal URL.");
                        setIsPortalLoading(false);
                    }
                },
                onError: (error) => {
                    const message = error?.error?.message || "Failed to open billing portal.";
                    toast.error(message);
                    setIsPortalLoading(false);
                }
            }
        }
    );
    // Note: No need to set isLoading false on success due to redirect
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-transparent">
      <CardHeader>
        <CardTitle className="text-zinc-900 dark:text-zinc-100">
          Subscription
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          Manage your plan and billing details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingSubscriptions ? (
          <div className="flex justify-center items-center h-20">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : activeSubscription ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Current Plan:</span>
              <Badge variant="secondary" className="capitalize">
                {activeSubscription.plan || "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status:</span>
              <Badge
                variant={activeSubscription.status === "active" || activeSubscription.status === "trialing" ? "success" : "outline"}
                className="capitalize"
              >
                {activeSubscription.status}
              </Badge>
            </div>
            {activeSubscription.status === "trialing" && activeSubscription.trialEnd && (
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Trial Ends:</span>
                    <span className="text-sm text-zinc-900 dark:text-zinc-100">{formatDate(activeSubscription.trialEnd)}</span>
                </div>
            )}
             {activeSubscription.status === "active" && activeSubscription.currentPeriodEnd && (
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Renews On:</span>
                    <span className="text-sm text-zinc-900 dark:text-zinc-100">{formatDate(activeSubscription.currentPeriodEnd)}</span>
                </div>
            )}
             {activeSubscription.cancelAtPeriodEnd && activeSubscription.currentPeriodEnd && (
                <div className="flex justify-between items-center text-yellow-600 dark:text-yellow-400">
                    <span className="text-sm font-medium ">Cancels On:</span>
                    <span className="text-sm">{formatDate(activeSubscription.currentPeriodEnd)}</span>
                </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
            You are currently on the Free plan.
          </p>
        )}
      </CardContent>
      <CardFooter className="border-t border-zinc-100 dark:border-zinc-800 px-6 py-4 flex justify-end">
        <Button
          variant="outline"
          onClick={handleManageBilling}
          disabled={isPortalLoading}
        >
          {isPortalLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Settings className="mr-2 h-4 w-4" />
          )}
          Manage Billing & Plan
        </Button>
      </CardFooter>
    </Card>
  );
} 