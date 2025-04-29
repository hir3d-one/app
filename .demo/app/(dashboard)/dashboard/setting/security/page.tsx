import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Session } from "@/lib/auth-types"; // Import Session type

// Import the new section components
import { SessionsSection } from "@/components/account/sessions-section";
import { PasskeysSection } from "@/components/account/passkeys-section";
import { TwoFactorSection } from "@/components/account/two-factor-section";

// Define ActiveSession type matching SessionsSection or import if exported
interface ActiveSession {
    id: string;
    token: string;
    userAgent: string | null;
}

export default async function SecurityPage() {
  // Fetch session and active sessions data on the server
  // Explicitly type the expected results from Promise.all
  const [sessionResult, sessionsListResult] = await Promise.all([
    auth.api.getSession({ headers: await headers() }) as Promise<Session | null>,
    auth.api.listSessions({ headers: await headers() }) as Promise<ActiveSession[] | null>,
  ]).catch((e) => {
    console.error("Failed to fetch security data:", e);
    throw redirect("/login"); // Redirect to login on error
  });

  // Use the explicitly typed results
  const session = sessionResult;
  const sessionsList = Array.isArray(sessionsListResult) ? sessionsListResult : [];

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="px-4 space-y-8">
      {/* Render the new sections, passing the fetched data */}
      {/* Passkeys section doesn't require props as it uses the hook internally */}
      <PasskeysSection />

      {/* 2FA section needs the session object */}
      <TwoFactorSection sessionDetails={session.session} user={session.user} />

      {/* Sessions section needs current session and the list of active sessions */}
      <SessionsSection currentSessionDetails={session.session} activeSessions={sessionsList} />
    </div>
  );
}
