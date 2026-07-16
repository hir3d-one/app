"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Define a type for expected usage data (adjust as needed)
type UsageData = {
  requestsMade: number;
  requestsLimit: number;
  storageUsedGB: number;
  storageLimitGB: number;
};

export function UsageSection() {
  const { data: usage, isLoading: isLoadingUsage } = useQuery<UsageData>({
    queryKey: ["usageData"],
    queryFn: async () => {
      return { requestsMade: 0, requestsLimit: 1000, storageUsedGB: 0, storageLimitGB: 5 };
    },
    // Provide some default/initial data structure
    initialData: { requestsMade: 0, requestsLimit: 1000, storageUsedGB: 0, storageLimitGB: 5 },
    refetchOnWindowFocus: false,
  });

  const requestsPercentage = usage.requestsLimit > 0 ? (usage.requestsMade / usage.requestsLimit) * 100 : 0;
  const storagePercentage = usage.storageLimitGB > 0 ? (usage.storageUsedGB / usage.storageLimitGB) * 100 : 0;

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-transparent">
      <CardHeader>
        <CardTitle className="text-zinc-900 dark:text-zinc-100">Usage This Billing Period</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingUsage ? (
          <UsageSkeleton />
        ) : usage ? (
          <div className="space-y-4">
            {/* API Requests Usage */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">API Requests</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {usage.requestsMade.toLocaleString()} / {usage.requestsLimit.toLocaleString()}
                </span>
              </div>
              <Progress value={requestsPercentage} aria-label={`${requestsPercentage.toFixed(0)}% API requests used`} />
            </div>

            {/* Storage Usage */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Storage</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {usage.storageUsedGB.toFixed(1)} GB / {usage.storageLimitGB} GB
                </span>
              </div>
              <Progress value={storagePercentage} aria-label={`${storagePercentage.toFixed(0)}% storage used`} />
            </div>

             {/* Add more usage metrics as needed */}
          </div>
        ) : (
          <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 py-4">
            Could not load usage data.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Skeleton component for loading state
function UsageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse py-2">
      {/* Placeholder for API Requests */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-4 w-20 bg-muted rounded"></div>
        </div>
        <div className="h-2 w-full bg-muted rounded"></div>
      </div>

      {/* Placeholder for Storage */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 w-16 bg-muted rounded"></div>
          <div className="h-4 w-20 bg-muted rounded"></div>
        </div>
        <div className="h-2 w-full bg-muted rounded"></div>
      </div>
    </div>
  );
}
