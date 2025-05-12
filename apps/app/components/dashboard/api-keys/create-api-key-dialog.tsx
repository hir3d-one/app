"use client";

import { useState, useId } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
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
import { Loader2, KeyRound, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreateApiKeyDialogProps {
  onKeyCreated: (key: string) => void;
  children: React.ReactNode;
}

// Helper to calculate expiresIn seconds from a future date
const calculateExpiresInSeconds = (date: Date | undefined): number | undefined => {
  if (!date) return undefined; // No date means never expires
  const now = new Date();
  // Compare dates only, ignore time of day for 'must be in future' check
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (selectedDay < today) return undefined; // Don't allow past dates
  
  // Calculate difference in seconds from now (including time)
  const futureTime = date.getTime();
  return Math.floor((futureTime - Date.now()) / 1000);
};

export function CreateApiKeyDialog({ onKeyCreated, children }: CreateApiKeyDialogProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [expiresAtDate, setExpiresAtDate] = useState<Date | undefined>(undefined);
  const [comment, setComment] = useState("");
  const nameInputId = useId();
  const expiresInputId = useId();
  const commentInputId = useId();

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof authClient.apiKey.create>[0]) => authClient.apiKey.create(params),
    onSuccess: (result) => {
      if (result.error) {
         toast.error(result.error.message || "Failed to create API key.");
      } else if (result.data?.key) {
        toast.success("API Key created successfully!");
        queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
        onKeyCreated(result.data.key);
        setIsOpen(false);
        setName("");
        setExpiresAtDate(undefined);
        setComment("");
      } else {
         toast.error("Failed to create API key. Unknown error.");
      }
    },
    onError: (error: Error) => {
      toast.error(error?.message || "An unexpected error occurred.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const simpleMetadata = comment.trim() ? { comment: comment.trim() } : undefined;

    const expiresIn = calculateExpiresInSeconds(expiresAtDate);
    
    if (expiresAtDate && expiresIn === undefined) {
        toast.error("Expiration date must be today or in the future.");
        return;
    }

    const apiKeyData: Parameters<typeof authClient.apiKey.create>[0] = {
      name: name.trim() || undefined,
      expiresIn: expiresIn,
      metadata: simpleMetadata,
    };
    
    createMutation.mutate(apiKeyData);
  };

  const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) {
          // Optionally reset fields on close, or keep them for re-opening
          // setName("");
          // setExpiresAtDate(undefined);
          // setComment("");
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <KeyRound className="h-5 w-5"/> Create New API Key
          </DialogTitle>
          <DialogDescription>
            Provide details for your new key. The key secret will only be shown once upon creation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4 pb-2">
          <div className="space-y-2">
            <Label htmlFor={nameInputId}>Name</Label>
            <Input
              id={nameInputId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Production Key, Staging Server Key"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
                A descriptive name to help you identify this key later (optional).
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={expiresInputId}>Expires At</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={expiresInputId}
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiresAtDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiresAtDate ? format(expiresAtDate, "PPP") : <span>Never</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiresAtDate}
                  onSelect={setExpiresAtDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
                {expiresAtDate && (
                    <div className="p-2 border-t">
                       <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full h-8"
                          onClick={() => setExpiresAtDate(undefined)}
                        >
                          Clear (Never Expire)
                        </Button>
                    </div>
                 )}
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
                Select a date when this key should automatically expire. Leave blank if it should never expire.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={commentInputId}>Comment</Label>
            <Input
              id={commentInputId}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional short description (e.g., Used for X service)"
              maxLength={200}
            />
             <p className="text-xs text-muted-foreground">
                Add an optional comment or note for this key.
            </p>
          </div>
        
          <DialogFooter className="pt-4">
               <DialogClose asChild>
                 <Button type="button" variant="outline" disabled={createMutation.isPending}>Cancel</Button>
               </DialogClose>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" /> 
                )}
                Create Key
              </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 