"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { client } from "@/lib/auth-client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Component as ChangePlanDialog } from "@/app/account/change-plan";
import React from "react";
import { subscriptionPlans, SubscriptionPlan } from "@/lib/config/plans";
import { Check } from "lucide-react";

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
  // Fetch subscription data using useQuery, similar to demo
  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const res = await client.subscription.list({
        fetchOptions: {
          throw: false, // Don't throw on error, handle it below
        },
      });
      if ('error' in res && res.error) {
        console.error("Error fetching subscriptions:", res.error);
        toast.error(res.error.message || "Failed to load subscription details.");
        return []; // Return empty array on error
      }
      // If res is an array, return it; otherwise unwrap data property
      if (Array.isArray(res)) {
        return res;
      }
      return res.data ?? [];
    },
    refetchOnWindowFocus: false, // Optional: disable refetch on window focus
  });

  // Ensure subscriptions is always an array and find the active one
  const activeSubscription = React.useMemo(() => {
    const subs = Array.isArray(subscriptions) ? subscriptions : [];
    return subs.find((sub) => sub.status === "active" || sub.status === "trialing");
  }, [subscriptions]);

  // Find the detailed plan object matching the active subscription
  const activePlanDetails = React.useMemo(() => {
    if (!activeSubscription?.plan) return null;
    // Match based on plan NAME stored in the subscription object
    return subscriptionPlans.find(p => p.name.toLowerCase() === activeSubscription.plan?.toLowerCase());
  }, [activeSubscription]);

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-transparent">
      <CardHeader>
        <CardTitle className="text-zinc-900 dark:text-zinc-100">
          Current Plan
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          Manage your plan and billing details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingSubscriptions ? (
          <SubscriptionSkeleton />
        ) : (
          <>
            {activeSubscription ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
                      {activePlanDetails?.name || activeSubscription.plan || "N/A"}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {activePlanDetails?.description || "Your current subscription plan."}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {activePlanDetails?.name || activeSubscription.plan || "N/A"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status:</span>
                  <Badge
                    variant={activeSubscription.status === "active" || activeSubscription.status === "trialing" ? "secondary" : "outline"}
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
                {activePlanDetails?.features && activePlanDetails.features.length > 0 && (
                  <div className="pt-4 border-t border-border mt-4">
                    <h4 className="text-sm font-medium mb-2 text-zinc-800 dark:text-zinc-200">Plan Features:</h4>
                    <ul className="space-y-1.5">
                      {activePlanDetails.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                          <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="pt-4">
                   <ChangePlanDialog 
                     currentPlan={activeSubscription.plan?.toLowerCase()} 
                     isTrial={activeSubscription.status === 'trialing'}
                   />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4 space-y-3">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  You currently do not have an active subscription.
                </p>
                <div className="pt-4">
                 <ChangePlanDialog />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Skeleton component for loading state
function SubscriptionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-6 w-24 bg-muted rounded"></div>
          <div className="h-4 w-40 bg-muted rounded mt-2"></div>
        </div>
        <div className="h-6 w-16 bg-muted rounded"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-4 w-12 bg-muted rounded"></div>
        <div className="h-6 w-20 bg-muted rounded"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-4 w-20 bg-muted rounded"></div>
        <div className="h-4 w-24 bg-muted rounded"></div>
      </div>
      <div className="pt-4 border-t border-border mt-4">
        <div className="h-4 w-28 bg-muted rounded mb-3"></div>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-muted rounded mr-2"></div>
            <div className="h-4 w-full bg-muted rounded"></div>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-muted rounded mr-2"></div>
            <div className="h-4 w-3/4 bg-muted rounded"></div>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-muted rounded mr-2"></div>
            <div className="h-4 w-1/2 bg-muted rounded"></div>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <div className="h-9 w-32 bg-muted rounded"></div>
      </div>
    </div>
  );
} 