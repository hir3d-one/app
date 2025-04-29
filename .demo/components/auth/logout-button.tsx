"use client";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully.");
            router.push("/login");
          },
          onRequest: (ctx) => {
            toast.loading("Logging out...");
            setLoading(true);
          },
          onResponse: (ctx) => {
            toast.error("Logged out successfully");
            setLoading(false);
          },
          onError: (error) => {
            toast.error(error?.error?.message || "Sign out failed.");
            setLoading(false);
          }
        }
      });
    } catch (error) {
      toast.error("An unexpected error occurred during sign out.");
      setLoading(false);
    }
  };

  return (
    <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4" />
      {loading ? "Logging out..." : "Log out"}
    </Button>
  );
}
