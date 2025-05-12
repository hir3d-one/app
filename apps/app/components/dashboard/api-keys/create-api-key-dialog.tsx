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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, KeyRound, PlusCircle, CalendarIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreateApiKeyDialogProps {
  onKeyCreated: (key: string) => void;
  children: React.ReactNode;
}

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

// Helper to calculate expiresIn seconds from a future date
const calculateExpiresInSeconds = (date: Date | undefined): number | undefined => {
  if (!date) return undefined;
  const now = Date.now();
  const futureTime = date.getTime();
  if (futureTime <= now) return undefined; // Don't allow past dates
  return Math.floor((futureTime - now) / 1000);
};

export function CreateApiKeyDialog({ onKeyCreated, children }: CreateApiKeyDialogProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [expiresAtDate, setExpiresAtDate] = useState<Date | undefined>(undefined);
  const [comment, setComment] = useState("");
  const datePickerId = useId();

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
    onError: (error: any) => {
      toast.error(error?.message || "An unexpected error occurred.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const simpleMetadata = comment.trim() ? { comment: comment.trim() } : undefined;

    const expiresIn = calculateExpiresInSeconds(expiresAtDate);
    
    if (expiresAtDate && expiresIn === undefined) {
        toast.error("Expiration date must be in the future.");
        return;
    }

    const apiKeyData: Parameters<typeof authClient.apiKey.create>[0] = {
      name: name || undefined,
      expiresIn: expiresIn,
      metadata: simpleMetadata,
    };
    
    createMutation.mutate(apiKeyData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogDescription>
            Provide a name and optional details for your new key. The key will be shown once upon creation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., My Production Key"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={datePickerId} className="text-right">
              Expires At
            </Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={datePickerId}
                  variant={"outline"}
                  className={cn(
                    "col-span-3 group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                    !expiresAtDate && "text-muted-foreground"
                  )}
                >
                  <span className={cn("truncate", !expiresAtDate && "text-muted-foreground")}>
                    {expiresAtDate ? format(expiresAtDate, "PPP") : <span>Pick a date</span>}
                  </span>
                  <CalendarIcon 
                    size={16} 
                    className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
                    aria-hidden="true" 
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <Calendar
                  mode="single"
                  selected={expiresAtDate}
                  onSelect={setExpiresAtDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comment" className="text-right">
              Comment
            </Label>
            <Input
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="col-span-3"
              placeholder={'Optional description (e.g., For reporting script)'}
            />
          </div>
        </form>
        <DialogFooter>
           <DialogClose asChild>
             <Button variant="outline" disabled={createMutation.isLoading}>Cancel</Button>
           </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={createMutation.isLoading}>
            {createMutation.isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="mr-2 h-4 w-4" />
            )}
            Create Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 