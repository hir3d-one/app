"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import type { ApiKey } from "better-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ChevronDown } from "lucide-react";

// Helper types and functions (can be shared with create dialog)
type ApiKeyData = Omit<ApiKey, 'key'>; // We don't get the key value when fetching

const secondsToDays = (seconds: number | null | undefined): number | null => {
  if (seconds === null || seconds === undefined) return null;
  return Math.round(seconds / (24 * 60 * 60));
};

const msToTime = (ms: number | null | undefined): { value: number | null, unit: 'days' | 'hours' | 'minutes' } => {
    if (ms === null || ms === undefined) return { value: null, unit: 'days' };
    if (ms % (24 * 60 * 60 * 1000) === 0) return { value: ms / (24 * 60 * 60 * 1000), unit: 'days' };
    if (ms % (60 * 60 * 1000) === 0) return { value: ms / (60 * 60 * 1000), unit: 'hours' };
    return { value: ms / (60 * 1000), unit: 'minutes' }; // Default to minutes if not exact days/hours
};

const daysToSeconds = (days: number | null | undefined): number | undefined => {
  if (days === null || days === undefined || days <= 0) return undefined;
  return days * 24 * 60 * 60;
};

const timeToMs = (value: number | null | undefined, unit: 'days' | 'hours' | 'minutes'): number | undefined => {
  if (value === null || value === undefined || value <= 0) return undefined;
  switch (unit) {
    case 'days': return value * 24 * 60 * 60 * 1000;
    case 'hours': return value * 60 * 60 * 1000;
    case 'minutes': return value * 60 * 1000;
    default: return undefined;
  }
};


interface UpdateApiKeyDialogProps {
  apiKeyId: string;
  initialData?: ApiKeyData; // Optional initial data to avoid re-fetch flash
  children: React.ReactNode; // Trigger
}

function UpdateFormSkeleton() {
    return (
        <div className="grid gap-4 py-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-4 items-center gap-4">
                    <Skeleton className="h-5 w-1/4 justify-self-end" />
                    <Skeleton className="h-9 w-full col-span-3" />
                </div>
            ))}
             <div className="flex items-center space-x-2 pt-4">
                 <Skeleton className="h-6 w-10" />
                 <Skeleton className="h-5 w-3/4" />
             </div>
        </div>
    );
}


export function UpdateApiKeyDialog({ apiKeyId, initialData, children }: UpdateApiKeyDialogProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch existing key data when dialog opens
  const { data: apiKeyData, isLoading: isLoadingKey } = useQuery<ApiKeyData>({
    queryKey: ['apiKey', apiKeyId],
    queryFn: async () => {
      // Fetching key details requires the `getApiKey` method (not list)
      // Assuming better-auth has a getApiKey method
      // const { data, error } = await authClient.apiKey.get({ keyId: apiKeyId }); 
      // MOCKING getApiKey as it's not in the provided client context definition
      console.warn("UpdateApiKeyDialog: Mocking fetch for key ID:", apiKeyId);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const mockKey: ApiKeyData = initialData ?? { 
          id: apiKeyId, 
          name: 'Mock Fetched Key', 
          prefix: 'mock',
          start: 'abc',
          userId: 'mockUser',
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expiresAt: null, // Adjust as needed for testing
          // Add mock advanced fields if needed for testing
          metadata: { mock: true },
          permissions: { files: ['read'] },
          rateLimitEnabled: false,
          remaining: null,
          // ... other fields set to null/default
          refillInterval: null,
          refillAmount: null,
          lastRefillAt: null,
          rateLimitTimeWindow: null,
          rateLimitMax: null,
          requestCount: 0,
          lastRequest: null,
      };
      // Replace mock with actual fetch when available:
      // if (error) throw new Error(error.message || "Failed to fetch API key details.");
      // return data;
      return mockKey;
    },
    enabled: isOpen, // Only fetch when the dialog is open
    initialData: initialData, // Use initial data if provided
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Form State - only for editable fields
  const [name, setName] = useState("");

  // Effect to populate editable form field when data loads
  useEffect(() => {
    if (apiKeyData) {
      setName(apiKeyData.name || "");
    }
  }, [apiKeyData]);

  const updateMutation = useMutation({
    // Only pass editable fields
    mutationFn: (params: { keyId: string; name?: string }) => 
        authClient.apiKey.update(params),
    onSuccess: (result) => {
       if (result.error) {
         toast.error(result.error.message || "Failed to update API key.");
      } else {
          toast.success("API Key updated successfully!");
          queryClient.invalidateQueries({ queryKey: ['apiKeys'] }); 
          queryClient.invalidateQueries({ queryKey: ['apiKey', apiKeyId] }); 
          setIsOpen(false); 
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "An unexpected error occurred while updating.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyData) return; 

    // Only include editable fields in update payload
    const updateData: { keyId: string; name?: string } = {
      keyId: apiKeyId,
      name: name !== apiKeyData.name ? (name || undefined) : undefined, // Only send name if changed
    };

    // Don't submit if nothing changed
    if (updateData.name === undefined) {
       toast.info("No changes detected.");
       setIsOpen(false);
       return;
    }

    updateMutation.mutate(updateData);
  };

  // Helper to format metadata/permissions for display - simplified for just comment
  const formatCommentDisplay = (metadata: any) => {
      const comment = metadata?.comment;
      if (!comment) return <span className="text-muted-foreground italic">Not set</span>;
      return <p className="text-sm bg-muted p-2 rounded">{comment}</p>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Update API Key</DialogTitle>
          <DialogDescription>
             Viewing details for API key: {isLoadingKey ? <Skeleton className="h-4 w-20 inline-block"/> : <span className="font-mono">{apiKeyData?.prefix ? `${apiKeyData.prefix}_` : ''}{apiKeyData?.start}...</span>}
             <br/> <span className="text-xs">Only the name can be updated via this interface. Other changes require server-side configuration.</span>
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingKey ? (
            <UpdateFormSkeleton />
        ) : !apiKeyData ? (
            <p className="text-red-500 text-center py-10">Failed to load API key data.</p>
        ) : (
            // Display section for read-only info + editable name
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Name (Editable) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update-name" className="text-right font-semibold">
                  Name
                </Label>
                <Input
                  id="update-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., My Production Key"
                  disabled={updateMutation.isLoading}
                />
              </div>

              {/* Other fields (Read-Only Display) */}
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label className="text-right text-muted-foreground">Prefix</Label>
                 <p className="col-span-3 font-mono text-sm p-2 bg-muted rounded">{apiKeyData.prefix || <span className="italic">None</span>}</p>
               </div>
                <div className="grid grid-cols-4 items-center gap-4">
                 <Label className="text-right text-muted-foreground">Status</Label>
                 <div className="col-span-3">
                     <Badge variant={apiKeyData.enabled ? "default" : "destructive"} className={apiKeyData.enabled ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-300" : ""}>{apiKeyData.enabled ? 'Active' : 'Inactive'}</Badge>
                 </div>
               </div>
                <div className="grid grid-cols-4 items-center gap-4">
                 <Label className="text-right text-muted-foreground">Expires</Label>
                 <p className="col-span-3 text-sm">{apiKeyData.expiresAt ? format(new Date(apiKeyData.expiresAt), 'PPP p') : <span className="italic">Never</span>}</p>
               </div>
               <div className="grid grid-cols-4 items-start gap-4">
                 <Label className="text-right text-muted-foreground pt-1">Comment</Label>
                 <div className="col-span-3">{formatCommentDisplay(apiKeyData.metadata)}</div>
               </div>

               {/* Display Advanced Options (Read-Only) */}
                <details className="pt-4 group">
                    <summary className="text-sm font-medium cursor-pointer list-none flex items-center group-open:mb-2">Advanced Options (Read-Only) 
                        <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                     <div className="grid gap-3 py-4 pl-4 border-l-2 border-muted text-sm">
                         <div className="grid grid-cols-3 items-center gap-x-4 gap-y-1">
                            <Label className="text-right text-muted-foreground">Usage Limit</Label>
                            <p className="col-span-2">{apiKeyData.remaining ?? <span className="italic">Unlimited</span>}</p>
                         </div>
                         <div className="grid grid-cols-3 items-center gap-x-4 gap-y-1">
                            <Label className="text-right text-muted-foreground">Refill Amount</Label>
                            <p className="col-span-2">{apiKeyData.refillAmount ?? <span className="italic">N/A</span>}</p>
                         </div>
                         <div className="grid grid-cols-3 items-center gap-x-4 gap-y-1">
                            <Label className="text-right text-muted-foreground">Refill Interval</Label>
                            <p className="col-span-2">{apiKeyData.refillInterval ? `${msToTime(apiKeyData.refillInterval).value} ${msToTime(apiKeyData.refillInterval).unit}` : <span className="italic">N/A</span>}</p>
                         </div>
                         <div className="grid grid-cols-3 items-center gap-x-4 gap-y-1">
                            <Label className="text-right text-muted-foreground">Rate Limited</Label>
                            <p className="col-span-2">{apiKeyData.rateLimitEnabled ? `Yes (${apiKeyData.rateLimitMax} req / ${msToTime(apiKeyData.rateLimitTimeWindow).value} ${msToTime(apiKeyData.rateLimitTimeWindow).unit})` : 'No'}</p>
                         </div>
                     </div>
                </details>
            </div> // End display section
        )} 
        
        <DialogFooter>
           <DialogClose asChild>
             <Button variant="outline" disabled={updateMutation.isLoading || isLoadingKey}>Cancel</Button>
           </DialogClose>
          <Button 
            type="button" // Changed from submit as form isn't wrapping everything
            onClick={handleSubmit} // Trigger submit logic manually
            disabled={updateMutation.isLoading || isLoadingKey || !apiKeyData || name === apiKeyData?.name} // Also disable if name hasn't changed
           >
            {updateMutation.isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 