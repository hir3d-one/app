"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Laptop, Loader2, Smartphone } from "lucide-react"; // Changed MobileIcon to Smartphone
import { Session } from "better-auth"; // Assuming Session type includes session details like id, token, userAgent
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";
import { useRouter } from "next/navigation";

// Define the structure for a single session based on better-auth Session type
// Adjust this based on the actual structure provided by better-auth listSessions
interface ActiveSession {
  id: string;
  token: string; // Needed for revocation
  userAgent: string | null;
  // Add other relevant fields if needed, e.g., createdAt, lastUsedAt
}

// Define the SessionDetails type (adjust based on actual structure if needed)
interface SessionDetails {
  id: string;
  // Add other fields from session object like createdAt, expiresAt etc.
}

// Define the UserDetails type (adjust based on actual structure)
interface UserDetails {
  id: string;
  // Add other user fields
}

export function SessionsSection({
  currentSessionDetails,
  // user, // User details might not be needed here, remove if unused
  activeSessions,
}: {
  currentSessionDetails: SessionDetails | null; // Expect inner session details
  activeSessions: ActiveSession[];
}) {
  const [isTerminating, setIsTerminating] = useState<string>();
  const router = useRouter();

  const handleRevokeSession = async (session: ActiveSession) => {
    setIsTerminating(session.id);
    const res = await authClient.revokeSession(
      { token: session.token },
      {
        fetchOptions: {
          onSuccess: () => {
            toast.success("Session terminated successfully");
            router.refresh(); // Refresh data to update the list
          },
          onError: (error) => {
            const message = error?.error?.message || "Failed to terminate session";
            toast.error(message);
          },
          onSettled: () => {
             setIsTerminating(undefined);
          }
        }
      }
    );
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-transparent">
      <CardHeader>
        <CardTitle className="text-zinc-900 dark:text-zinc-100">
          Active Sessions
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          Manage devices currently logged into your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeSessions.length > 0 ? (
          activeSessions.map((session) => {
            if (!session.userAgent) return null; // Skip sessions without userAgent for parsing

            const parser = new UAParser(session.userAgent);
            const device = parser.getDevice();
            const os = parser.getOS();
            const browser = parser.getBrowser();
            const isCurrent = session.id === currentSessionDetails?.id; // Check against currentSessionDetails id

            return (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-md"
              >
                <div className="flex items-center gap-3">
                  {device.type === "mobile" || device.type === "tablet" ? (
                    <Smartphone className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                  ) : (
                    <Laptop className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {os.name ? `${os.name}${os.version ? ` ${os.version}` : ""}` : "Unknown OS"}
                      {browser.name ? `, ${browser.name}` : ""}
                      {isCurrent && (
                        <span className="ml-2 text-xs font-semibold text-green-600 dark:text-green-400">
                          (Current)
                        </span>
                      )}
                    </p>
                    {/* Optionally display IP or last active time if available */}
                    {/* <p className="text-xs text-zinc-500 dark:text-zinc-400">Last active: {new Date(session.lastUsedAt).toLocaleString()}</p> */}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`border-zinc-200 dark:border-zinc-800 ${
                    isCurrent ? "text-zinc-700 dark:text-zinc-300" : "text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400"
                  }`}
                  onClick={() => handleRevokeSession(session)}
                  disabled={isTerminating === session.id || isCurrent}
                >
                  {isCurrent ? "Current Session" : isTerminating === session.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Terminate"}
                </Button>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No other active sessions found.
          </p>
        )}
      </CardContent>
    </Card>
  );
} 