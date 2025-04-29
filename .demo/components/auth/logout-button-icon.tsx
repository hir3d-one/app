"use client";
import React, { useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { signOut } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleLogOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
        onRequest: (ctx) => {
          setLoading(true);
        },
        onResponse: (ctx) => {
          toast.error("Logged out successfully");
          setLoading(false);
        },
      },
    });
  }
  return (
    <Button variant={"outline"} onClick={() => handleLogOut()}>
      {loading ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
    </Button>
  );
}
