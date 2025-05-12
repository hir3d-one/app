"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, Loader2, Plus, Trash } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

// Define Passkey type based on better-auth authClient.useListPasskeys() response
interface Passkey {
  id: string;
  name: string | null;
  // Add other fields if needed, e.g., createdAt
}

export function PasskeysSection() {
  const { data: passkeys, isLoading: isLoadingList } = authClient.useListPasskeys();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store ID of passkey being deleted

  const handleAddPasskey = async () => {
    if (!newPasskeyName) {
      toast.error("Passkey name is required");
      return;
    }
    setIsAdding(true);
    const res = await authClient.passkey.addPasskey(
      {
        name: newPasskeyName,
      },
      {
        fetchOptions: {
           onSuccess: () => {
            toast.success("Passkey added successfully. You can now use it to log in.");
            setNewPasskeyName(""); // Clear input
            setIsAddDialogOpen(false); // Close dialog
            // No need to manually refresh, useListPasskeys should update automatically
          },
          onError: (error) => {
             const message = error?.error?.message || "Failed to add passkey";
            toast.error(message);
          },
          onSettled: () => {
             setIsAdding(false);
          }
        }
      }
    );
  };

  const handleDeletePasskey = async (passkeyId: string) => {
    setIsDeleting(passkeyId);
    await authClient.passkey.deletePasskey(
        { id: passkeyId },
        {
           fetchOptions: {
              onSuccess: () => {
                toast.success("Passkey deleted successfully");
              },
              onError: (error) => {
                 const message = error?.error?.message || "Failed to delete passkey";
                 toast.error(message);
              },
              onSettled: () => {
                 setIsDeleting(null);
              }
           }
        }
    );
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-zinc-900 dark:text-zinc-100">
            Passkeys
            </CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Manage your passwordless sign-in methods.
            </CardDescription>
        </div>
        {/* Add Passkey Dialog Trigger */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Passkey
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-11/12">
                <DialogHeader>
                <DialogTitle>Add New Passkey</DialogTitle>
                <DialogDescription>
                    Create a new passkey to securely access your account without a password.
                    Your device will prompt you to create one.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="passkey-name" className="text-right">
                    Name
                    </Label>
                    <Input
                    id="passkey-name"
                    value={newPasskeyName}
                    onChange={(e) => setNewPasskeyName(e.target.value)}
                    placeholder="e.g., Work Laptop"
                    className="col-span-3"
                    />
                </div>
                </div>
                <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddPasskey} disabled={isAdding}>
                    {isAdding ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Fingerprint className="mr-2 h-4 w-4" />
                    )}
                    Create Passkey
                </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoadingList ? (
           <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
        ) : passkeys && passkeys.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {/* <TableHead>Created At</TableHead> */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passkeys.map((passkey) => (
                <TableRow key={passkey.id}>
                  <TableCell className="font-medium">
                    {passkey.name || "Unnamed Passkey"}
                  </TableCell>
                  {/* <TableCell>{new Date(passkey.createdAt).toLocaleDateString()}</TableCell> */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePasskey(passkey.id)}
                      disabled={isDeleting === passkey.id}
                      className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                    >
                      {isDeleting === passkey.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
            No passkeys found. Add one to enable passwordless sign-in.
          </p>
        )}
      </CardContent>
    </Card>
  );
} 