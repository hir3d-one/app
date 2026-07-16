"use client";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KeyRound, Loader2, Trash2, Edit, Clock, Info, CheckCircle2, X, MessageSquare, HelpCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import CopyButton from "@/components/ui/copy-button";
import { CreateApiKeyDialog } from "@/components/dashboard/api-keys/create-api-key-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UpdateApiKeyDialog } from "@/components/dashboard/api-keys/update-api-key-dialog";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { subscriptionPlans, type SubscriptionPlan, type ApiKeyLimits } from "@/lib/config/plans";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define types explicitly to avoid dependency/export issues
type ApiKeyListItem = {
    id: string;
    name: string | null;
    enabled: boolean;
    prefix: string | null;
    start: string;
    createdAt: string;
    expiresAt: string | null;
    metadata?: Record<string, any> | null;
};
type DeleteError = { message?: string };

// Type based on better-auth stripe plugin schema/docs
type SubscriptionListItem = {
  id: string;
  plan: string; // Plan name (ID)
  referenceId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid";
  periodStart: Date | null;
  periodEnd: Date | null;
  cancelAtPeriodEnd: boolean | null;
  seats: number | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  // limits might be included here depending on config, but we'll fetch from plans.ts
};

function ApiKeyCardSkeleton() {
  return (
    <div className="flex justify-between items-center p-4 border rounded-lg space-x-4 bg-muted/50">
      <div className="space-y-2 flex-grow">
        <Skeleton className="h-5 w-1/3 bg-muted-foreground/20" />
        <Skeleton className="h-4 w-1/4 bg-muted-foreground/20" />
        <Skeleton className="h-3 w-1/5 bg-muted-foreground/20" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-16 bg-muted-foreground/20" />
        <Skeleton className="h-8 w-8 bg-muted-foreground/20" />
      </div>
    </div>
  );
}

const formatRateLimit = (rl: ApiKeyLimits['rateLimit']) => {
    if (!rl) return <span className="italic text-muted-foreground">None</span>;
    const perMinute = rl.windowSeconds === 60 ? rl.requests : (rl.requests / rl.windowSeconds * 60).toFixed(1);
    return `${rl.requests} req / ${rl.windowSeconds}s (${perMinute}/min)`;
};

const formatLimitValue = (value: number | null | undefined) => {
    if (value === Infinity || value === null || value === undefined || !isFinite(value)) return <span className="italic text-muted-foreground">Unlimited</span>;
    return value.toLocaleString();
};

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  // Session is mainly for user context now, not direct plan info
  const { data: session, isPending: isLoadingSession } = useSession();

  // Query 1: Fetch API Keys
  const { data: apiKeys = [], isLoading: isLoadingApiKeys } = useQuery<ApiKeyListItem[], Error>({
    queryKey: ["apiKeys"],
    queryFn: async (): Promise<ApiKeyListItem[]> => {
      const { data, error } = await authClient.apiKey.list();
      if (error) {
        console.error("Error fetching API keys:", error);
        const errorMessage = (error as any)?.message || "Failed to load API keys.";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      const keys = (data?.apiKeys ?? []).map((key): ApiKeyListItem => ({
          id: key.id,
          name: key.name ?? null,
          enabled: key.enabled,
          prefix: key.prefix ?? null,
          start: key.start ?? "",
          createdAt: key.createdAt.toISOString(),
          expiresAt: key.expiresAt?.toISOString() ?? null,
          metadata: key.metadata ?? null,
      }));
      return keys;
    },
    refetchOnWindowFocus: false,
  });

  // Query 2: Fetch Subscriptions
  const { data: subscriptions = [], isLoading: isLoadingSubscriptions } = useQuery<SubscriptionListItem[], Error>({
      queryKey: ["subscriptions", session?.user?.id], // Include user ID in key if needed
      queryFn: async (): Promise<SubscriptionListItem[]> => {
          // Use default referenceId (user) or specify if needed
          const { data, error } = await authClient.subscription.list();
          if (error) {
              console.error("Error fetching subscriptions:", error);
              // Don't necessarily throw an error, maybe just show message
              toast.warning("Could not load subscription details.", { duration: 5000 });
              return []; // Return empty array on error
          }
          // Cast the response data
          return (data as any[] || []).map((sub: any): SubscriptionListItem => ({
              ...sub,
              // Ensure date fields are Date objects if needed, otherwise keep as string
              periodStart: sub.periodStart ? new Date(sub.periodStart) : null,
              periodEnd: sub.periodEnd ? new Date(sub.periodEnd) : null,
              trialStart: sub.trialStart ? new Date(sub.trialStart) : null,
              trialEnd: sub.trialEnd ? new Date(sub.trialEnd) : null,
          }));
      },
      enabled: !!session?.user?.id, // Only run query if user session is available
      refetchOnWindowFocus: false,
  });

  // Find active subscription and corresponding plan details
  const activeSubscription = useMemo(() => {
      return subscriptions.find(sub => sub.status === 'active' || sub.status === 'trialing');
  }, [subscriptions]);

  const userPlan: SubscriptionPlan | null = useMemo(() => {
      if (!activeSubscription?.plan) return null;
      return subscriptionPlans.find(p => p.id.toLowerCase() === activeSubscription.plan.toLowerCase()) ?? null;
  }, [activeSubscription]);

  const userApiKeyLimits: ApiKeyLimits | null = useMemo(() => {
      return userPlan?.apiKeyLimits ?? null;
  }, [userPlan]);

  // Delete Mutation
  const deleteMutation: UseMutationResult<any, Error, string> = useMutation<any, Error, string>({
    mutationFn: (keyId: string) => authClient.apiKey.delete({ keyId }),
    onSuccess: (_, deletedKeyId) => {
      toast.success("API Key deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
    onError: (error) => {
       toast.error(error?.message || "Failed to delete API key.");
    }
  });

  const handleKeyCreated = (key: string) => {
    setNewlyCreatedKey(key);
    queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
  };

  // Combined loading state includes subscription loading now
  const isLoading = isLoadingApiKeys || isLoadingSession || isLoadingSubscriptions;

  const maxKeysForUser = userApiKeyLimits?.maxKeys ?? Infinity;
  const canCreateMoreKeys = apiKeys.length < maxKeysForUser;
  const createButtonDisabled = isLoading || !canCreateMoreKeys; // Disable if loading OR limit reached
  const createButtonTooltip = isLoadingSubscriptions
      ? "Loading subscription details..."
      : isLoadingApiKeys
      ? "Loading API keys..."
      : !activeSubscription || !userPlan
      ? "Cannot determine your current plan limits."
      : !canCreateMoreKeys
      ? `You have reached the maximum of ${formatLimitValue(maxKeysForUser)} API keys for the ${userPlan.name} plan.`
      : "Create a new API key"; // Default tooltip when enabled

  return (
    <TooltipProvider>
      <>
        <SiteHeader title="API Keys" />
        <div className="flex flex-col w-full p-6 space-y-6">
          <div className="flex justify-between items-center gap-4 flex-wrap">
             <div className="flex items-center gap-2">
               <h2 className="text-2xl font-semibold tracking-tight">Manage API Keys</h2>
               <Dialog>
                  <Tooltip>
                     <TooltipTrigger asChild>
                         <DialogTrigger asChild disabled={isLoadingSubscriptions}>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label="View Current Plan Limits">
                                 {isLoadingSubscriptions ? <Loader2 className="h-4 w-4 animate-spin" /> : <Info className="h-4 w-4" />}
                             </Button>
                         </DialogTrigger>
                     </TooltipTrigger>
                     <TooltipContent className="bg-foreground text-background dark:bg-muted dark:text-muted-foreground border-border px-2 py-1 text-xs rounded-sm shadow-md">
                       View Current Plan Limits
                     </TooltipContent>
                  </Tooltip>
                 <DialogContent className="sm:max-w-md">
                   <DialogHeader>
                     <DialogTitle>Current API Key Limits</DialogTitle>
                     {userPlan ? (
                        <DialogDescription>
                           Limits based on your active <strong>{userPlan.name}</strong> plan.
                        </DialogDescription>
                     ) : (
                         <DialogDescription>
                           Could not determine your active subscription plan.
                        </DialogDescription>
                     )}
                   </DialogHeader>
                   <div className="mt-4 space-y-3">
                      {isLoadingSubscriptions ? (
                          <div className="flex justify-center items-center h-20">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
                          </div>
                      ) : userPlan && userApiKeyLimits ? (
                        <dl className="text-sm space-y-2">
                           <div className="flex justify-between items-center">
                               <dt className="text-muted-foreground">Max Keys:</dt>
                               <dd className="font-medium">{formatLimitValue(userApiKeyLimits.maxKeys)}</dd>
                           </div>
                           <div className="flex justify-between items-center">
                               <dt className="text-muted-foreground">Default Expiry:</dt>
                               <dd className="font-medium">{userApiKeyLimits.defaultExpiresDays ? `${userApiKeyLimits.defaultExpiresDays} days` : <span className="italic">Never</span>}</dd>
                           </div>
                           <div className="flex justify-between items-center">
                               <dt className="text-muted-foreground">Rate Limit:</dt>
                               <dd className="font-medium text-right">{formatRateLimit(userApiKeyLimits.rateLimit)}</dd>
                           </div>
                           <div className="flex justify-between items-center">
                               <dt className="text-muted-foreground">Usage Limit:</dt>
                               <dd className="font-medium">{formatLimitValue(userApiKeyLimits.usageLimit)}</dd>
                           </div>
                        </dl>
                      ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No active subscription found or limits not defined for your plan.</p>
                      )}
                   </div>
                 </DialogContent>
               </Dialog>
             </div>

             <CreateApiKeyDialog onKeyCreated={handleKeyCreated}>
                <Button disabled={createButtonDisabled}>
                   <KeyRound className="mr-2 h-4 w-4" /> Create New Key
                   {!isLoading && activeSubscription && userPlan && isFinite(maxKeysForUser) && ` (${apiKeys.length}/${formatLimitValue(maxKeysForUser)})`}
                </Button>
             </CreateApiKeyDialog>
          </div>

           {newlyCreatedKey && (
              <Card className="border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-900/30 p-4 relative group">
                <CardHeader className="p-0 pb-2 flex flex-row items-start">
                  <div className="flex-shrink-0 mr-3 pt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                      <CardTitle className="text-base font-medium text-sky-700 dark:text-sky-300">New API Key Created</CardTitle>
                      <CardDescription className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">
                        Please copy your new API key now. You won't be able to see it again!
                      </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex items-center space-x-3 pt-2 pl-8">
                   <pre className="text-sm p-2 bg-background dark:bg-muted/50 border border-sky-200 dark:border-sky-800 rounded-md flex-grow overflow-x-auto shadow-inner">
                     <code>{newlyCreatedKey}</code>
                   </pre>
                   <CopyButton textToCopy={newlyCreatedKey || ''} />
                   <Button variant="ghost" size="icon" onClick={() => setNewlyCreatedKey(null)} className="h-8 w-8 text-muted-foreground hover:bg-muted/50" aria-label="Dismiss new key banner">
                     <X className="h-4 w-4" />
                   </Button>
                </CardContent>
              </Card>
            )}

          <Card className="border dark:bg-transparent overflow-hidden">
            <CardHeader className="bg-muted/30 dark:bg-muted/20 border-b">
              <CardTitle className="text-lg">Your API Keys</CardTitle>
              <CardDescription>
                Manage API keys used to authenticate requests.
                 {!isLoading && activeSubscription && userPlan && isFinite(maxKeysForUser) && ` You have created ${apiKeys.length} of ${formatLimitValue(maxKeysForUser)} allowed keys.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               {isLoadingApiKeys ? (
                 <div className="space-y-px p-6">
                    {[...Array(3)].map((_, i) => <ApiKeyCardSkeleton key={i} />)}
                 </div>
               ) : apiKeys.length === 0 ? (
                 <div className="text-center p-10 text-muted-foreground">
                   <KeyRound className="mx-auto h-10 w-10 mb-3 text-muted-foreground/50"/>
                   <p className="font-medium">No API keys found.</p>
                   <p className="text-sm">Get started by creating a new key.</p>
                 </div>
              ) : (
                <div className="divide-y">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 hover:bg-muted/10 transition-colors">
                       <div className="flex-grow space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                             <p className="font-medium text-base truncate" title={key.name ?? 'Untitled Key'}>{key.name || <span className="italic text-muted-foreground">Untitled Key</span>}</p>
                             <Badge variant={key.enabled ? "default" : "destructive"} className={`text-xs whitespace-nowrap ${key.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-300' : ''}`}>
                               {key.enabled ? 'Active' : 'Inactive'}
                             </Badge>
                          </div>
                         <p className="text-sm text-muted-foreground font-mono flex items-center gap-1.5 truncate" title={key.id}>
                           <span className="text-xs font-sans text-muted-foreground/80 shrink-0">ID:</span> <span className="truncate">{key.id}</span>
                         </p>
                         <p className="text-sm text-muted-foreground font-mono flex items-center gap-1.5">
                            <span className="text-xs font-sans text-muted-foreground/80 shrink-0">Key:</span>
                           {key.prefix ? `${key.prefix}_` : ''}{key.start}...
                         </p>
                         {key.metadata?.comment && (
                             <p className="text-xs text-muted-foreground italic flex items-center gap-1.5 pt-1 truncate" title={typeof key.metadata.comment === 'string' ? key.metadata.comment : ''}>
                                <MessageSquare className="h-3 w-3 shrink-0"/>
                                <span className="truncate">{typeof key.metadata.comment === 'string' ? key.metadata.comment : JSON.stringify(key.metadata.comment)}</span>
                            </p>
                         )}
                         <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                            <span className="flex items-center gap-1 whitespace-nowrap">
                                <Clock className="h-3 w-3" />
                                Created {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                            </span>
                            {key.expiresAt && (
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                    <Clock className="h-3 w-3" />
                                    Expires {formatDistanceToNow(new Date(key.expiresAt), { addSuffix: true })}
                                </span>
                             )}
                         </div>
                       </div>
                       <div className="flex space-x-1 items-center shrink-0 self-center sm:self-auto">
                          <UpdateApiKeyDialog apiKeyId={key.id} initialData={key}>
                            <Button
                               variant="ghost"
                               size="icon"
                               aria-label="Edit Key"
                               className="h-8 w-8 text-muted-foreground"
                            >
                               <Edit className="h-4 w-4" />
                            </Button>
                          </UpdateApiKeyDialog>
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={deleteMutation.isPending && deleteMutation.variables === key.id}
                                    aria-label="Delete Key"
                                    className="h-8 w-8 text-red-600 hover:text-red-700"
                                  >
                                    {deleteMutation.isPending && deleteMutation.variables === key.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Delete Key</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the API key
                                  <span className="font-medium mx-1">{key.name || key.id}</span>
                                  and revoke its access.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(key.id)}
                                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                  disabled={deleteMutation.isPending}
                                >
                                  {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  Yes, delete key
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    </TooltipProvider>
  );
}
