"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KeyRound, Loader2, Trash2, Edit, Clock, Info, CheckCircle2, X, MessageSquare, HelpCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
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

// Explicitly type ApiKeyListItem based on expected return structure
// This avoids importing potentially non-exported 'ApiKey' from 'better-auth'
type ApiKeyListItem = {
    id: string;
    name: string | null;
    enabled: boolean;
    prefix: string | null;
    start: string;
    createdAt: string; // Assuming string representation from server
    expiresAt: string | null; // Assuming string representation
    metadata?: Record<string, any> | null; // Allow flexible metadata
    // Add other fields if needed based on authClient.apiKey.list() response
};
type DeleteError = { message?: string }; // Basic error type

function ApiKeyCardSkeleton() {
  return (
    <div className="flex justify-between items-center p-4 border rounded-lg space-x-4">
      <div className="space-y-2 flex-grow">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/5" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-16" /> 
        <Skeleton className="h-8 w-8" /> 
      </div>
    </div>
  );
}

// Helper functions for formatting limits
const formatRateLimit = (rl: ApiKeyLimits['rateLimit']) => {
    if (!rl) return <span className="italic text-muted-foreground">None</span>;
    const perMinute = rl.windowSeconds === 60 ? rl.requests : (rl.requests / rl.windowSeconds * 60).toFixed(1);
    return `${rl.requests} req / ${rl.windowSeconds}s (${perMinute}/min)`;
};

const formatLimitValue = (value: number | null | undefined) => {
    // Handle Infinity specifically for display
    if (value === Infinity || value === null || value === undefined || !isFinite(value)) return <span className="italic text-muted-foreground">Unlimited</span>;
    return value.toLocaleString();
};

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  // Use inferred session type and isPending
  const { data: session, isPending: isLoadingSession } = useSession();

  // Safely access plan ID using optional chaining
  const userPlanId = session?.user?.subscription?.planId?.toLowerCase() || 
                   session?.subscription?.planId?.toLowerCase() || 
                   null;
  const userPlan: SubscriptionPlan | null = userPlanId 
      ? subscriptionPlans.find(p => p.id.toLowerCase() === userPlanId) ?? null 
      : null;
  const userApiKeyLimits: ApiKeyLimits | null = userPlan?.apiKeyLimits ?? null;

  // Ensure queryFn returns the correct type ApiKeyListItem[]
  const { data: apiKeys = [], isLoading: isLoadingApiKeys } = useQuery<ApiKeyListItem[], Error>({
    queryKey: ["apiKeys"],
    queryFn: async (): Promise<ApiKeyListItem[]> => {
      // Type the response from the client call if possible, otherwise cast carefully
      const { data, error } = await authClient.apiKey.list();
      if (error) {
        console.error("Error fetching API keys:", error);
        const errorMessage = (error as any)?.message || "Failed to load API keys.";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      // Ensure data conforms to ApiKeyListItem[] before returning
      const keys = (data as any[] || []).map((key: any) => ({
          id: key.id,
          name: key.name ?? null,
          enabled: key.enabled,
          prefix: key.prefix ?? null,
          start: key.start,
          createdAt: key.createdAt,
          expiresAt: key.expiresAt ?? null,
          metadata: key.metadata ?? null,
      }));
      return keys;
    },
    refetchOnWindowFocus: false,
  });
  
  // Explicitly type useMutation
  const deleteMutation: UseMutationResult<any, Error, string> = useMutation<any, Error, string>({
    mutationFn: (keyId: string) => authClient.apiKey.delete({ keyId }),
    onSuccess: (_, deletedKeyId) => {
      toast.success("API Key deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      // Optionally remove the key directly from the cache for instant feedback
      // queryClient.setQueryData<ApiKeyListItem[]>(["apiKeys"], (oldData) => 
      //   oldData ? oldData.filter(key => key.id !== deletedKeyId) : []
      // );
    },
    onError: (error) => {
       toast.error(error?.message || "Failed to delete API key.");
    }
  });
  
  const handleKeyCreated = (key: string) => {
    setNewlyCreatedKey(key);
    queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
  };
  
  const isLoading = isLoadingApiKeys || isLoadingSession; 

  const maxKeysForUser = userApiKeyLimits?.maxKeys ?? Infinity;
  const canCreateMoreKeys = apiKeys.length < maxKeysForUser;
  const createButtonDisabled = isLoading || !canCreateMoreKeys;
  const createButtonTooltip = isLoading 
      ? "Loading plan information..." 
      : !userPlan 
      ? "Cannot determine your current plan limits."
      : !canCreateMoreKeys 
      ? `You have reached the maximum of ${formatLimitValue(maxKeysForUser)} API keys for the ${userPlan.name} plan.`
      : undefined;

  return (
    <TooltipProvider> 
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="API Keys" />
          <div className="flex flex-col w-full p-4 space-y-6">
            <div className="flex justify-between items-center gap-4 flex-wrap">
               <div className="flex items-center gap-2">
                 <h2 className="text-2xl font-semibold">Manage API Keys</h2>
                 <Dialog>
                    <Tooltip>
                       <TooltipTrigger asChild>
                           <DialogTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                   <Info className="h-4 w-4" />
                               </Button>
                           </DialogTrigger>
                       </TooltipTrigger>
                       <TooltipContent>View Plan Limits</TooltipContent>
                    </Tooltip>
                   <DialogContent className="sm:max-w-lg">
                     <DialogHeader>
                       <DialogTitle>API Key Limits by Plan</DialogTitle>
                       <DialogDescription>
                         The following limits apply based on subscription plan.
                       </DialogDescription>
                     </DialogHeader>
                     <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {subscriptionPlans.map(plan => (
                          <div key={plan.id} className="p-4 border rounded-lg bg-muted/30">
                            <h3 className="font-semibold mb-2 text-lg">{plan.name}</h3>
                            <dl className="text-sm space-y-1.5">
                               <div className="flex justify-between">
                                   <dt className="text-muted-foreground">Max Keys:</dt>
                                   <dd className="font-medium">{formatLimitValue(plan.apiKeyLimits.maxKeys)}</dd>
                               </div>
                               <div className="flex justify-between">
                                   <dt className="text-muted-foreground">Default Expiry:</dt>
                                   <dd className="font-medium">{plan.apiKeyLimits.defaultExpiresDays ? `${plan.apiKeyLimits.defaultExpiresDays} days` : <span className="italic">Never</span>}</dd>
                               </div>
                               <div className="flex justify-between">
                                   <dt className="text-muted-foreground">Rate Limit:</dt>
                                   <dd className="font-medium">{formatRateLimit(plan.apiKeyLimits.rateLimit)}</dd>
                               </div>
                               <div className="flex justify-between">
                                   <dt className="text-muted-foreground">Usage Limit:</dt>
                                   <dd className="font-medium">{formatLimitValue(plan.apiKeyLimits.usageLimit)}</dd>
                               </div>
                            </dl>
                          </div>
                        ))}
                     </div>
                   </DialogContent>
                 </Dialog>
               </div>

               <CreateApiKeyDialog onKeyCreated={handleKeyCreated}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={createButtonDisabled ? 0 : undefined}> 
                        <Button disabled={createButtonDisabled}>
                           <KeyRound className="mr-2 h-4 w-4" /> Create New Key 
                           {!isLoading && userPlan && isFinite(maxKeysForUser) && `(${apiKeys.length}/${formatLimitValue(maxKeysForUser)})`} 
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {createButtonTooltip && (
                       <TooltipContent>{createButtonTooltip}</TooltipContent>
                    )}
                  </Tooltip>
               </CreateApiKeyDialog>
            </div>
            
             {newlyCreatedKey && (
                <Card className="border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-900/30 p-4">
                  <CardHeader className="p-0 pb-2 flex flex-row items-start">
                    <div className="flex-shrink-0 mr-3">
                      <CheckCircle2 className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-medium text-sky-700 dark:text-sky-300">New API Key Created</CardTitle>
                        <CardDescription className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">
                          Please copy your new API key. You won't be able to see it again!
                        </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex items-center space-x-3 pt-2">
                     <pre className="text-sm p-2 bg-background dark:bg-muted/50 border border-sky-200 dark:border-sky-800 rounded-md flex-grow overflow-x-auto">
                       <code>{newlyCreatedKey}</code>
                     </pre>
                     {/* Removed variant/size props from CopyButton */}
                     <CopyButton textToCopy={newlyCreatedKey || ''} /> 
                     <Button variant="ghost" size="icon" onClick={() => setNewlyCreatedKey(null)} className="h-8 w-8">
                       <X className="h-4 w-4" />
                     </Button>
                  </CardContent>
                </Card>
              )}

            <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-transparent">
              <CardHeader>
                <CardTitle>Your API Keys</CardTitle>
                <CardDescription>
                  Manage API keys used to authenticate requests to your resources.
                   {!isLoading && userPlan && isFinite(maxKeysForUser) && ` You have created ${apiKeys.length} of ${formatLimitValue(maxKeysForUser)} allowed keys.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 {isLoadingApiKeys ? (
                   <div className="space-y-4">
                      <ApiKeyCardSkeleton />
                      <ApiKeyCardSkeleton />
                   </div>
                 ) : apiKeys.length === 0 ? (
                   <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                     You haven't created any API keys yet.
                   </p>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg gap-4 hover:bg-muted/50 transition-colors">
                         <div className="flex-grow space-y-1.5">
                            <div className="flex items-center gap-2">
                               <p className="font-medium text-base">{key.name || <span className="italic text-muted-foreground">Untitled Key</span>}</p>
                               <Badge variant={key.enabled ? "default" : "destructive"} className={`text-xs ${key.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-300' : ''}`}>
                                 {key.enabled ? 'Active' : 'Inactive'}
                               </Badge>
                            </div>
                           <p className="text-sm text-muted-foreground font-mono flex items-center gap-1.5">
                             <span className="text-xs font-sans text-muted-foreground/80">ID:</span> {key.id}
                           </p> 
                           <p className="text-sm text-muted-foreground font-mono flex items-center gap-1.5">
                              <span className="text-xs font-sans text-muted-foreground/80">Key:</span>
                             {key.prefix ? `${key.prefix}_` : ''}{key.start}...
                           </p> 
                           {/* Safely access metadata comment */}
                           {key.metadata?.comment && (
                               <p className="text-xs text-muted-foreground italic flex items-center gap-1.5 pt-1">
                                  <MessageSquare className="h-3 w-3"/> 
                                  {typeof key.metadata.comment === 'string' ? key.metadata.comment : JSON.stringify(key.metadata.comment)}
                              </p>
                           )}
                           <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                              <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Created {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                              </span>
                              {key.expiresAt && (
                                  <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Expires {formatDistanceToNow(new Date(key.expiresAt), { addSuffix: true })}
                                  </span>
                               )}
                           </div>
                         </div>
                         <div className="flex space-x-1 items-center shrink-0">
                            <UpdateApiKeyDialog apiKeyId={key.id} initialData={key}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                     variant="ghost" 
                                     size="icon" 
                                     aria-label="Edit Key"
                                     className="h-8 w-8"
                                  > 
                                     <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Key</TooltipContent>
                              </Tooltip>
                            </UpdateApiKeyDialog>
                            <AlertDialog>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {/* Reverted to asChild - linter might warn, but often works */}
                                  <AlertDialogTrigger asChild> 
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      disabled={deleteMutation.isPending && deleteMutation.variables === key.id}
                                      aria-label="Delete Key"
                                      className="h-8 w-8"
                                    >
                                      {deleteMutation.isPending && deleteMutation.variables === key.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin"/>
                                      ) : (
                                          <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
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
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
} 