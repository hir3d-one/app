"use server";

// Verify tsconfig.json in 'apps/app' maps '@/packages/*' to '../../packages/*'
import { jobCreationDemoTask } from "@hir3d/tasks";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
// Hypothetical import for creating a temporary public access token
// import { createSession } from "better-auth/next-js"; 

export async function startJobCreation(formData: FormData) {
  // Get the authenticated session
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    return { error: "User not authenticated. Please sign in.", runId: null, accessToken: null };
  }

  const jobDetails = formData.get("jobInput") as string;
  if (!jobDetails || jobDetails.trim() === "") {
    return { error: "Job details are required.", runId: null, accessToken: null };
  }

  try {
    // Trigger the task directly using the imported task object
    const runHandle = await jobCreationDemoTask.trigger({
      userId: session.user.id,
      jobDetails: jobDetails
    });

    if (!runHandle?.id) {
      return { error: "Failed to trigger job. No run ID returned.", runId: null, accessToken: null };
    }

    // Get the public access token for frontend subscription
    const accessToken = runHandle.publicAccessToken;

    return { error: null, runId: runHandle.id, accessToken };
  } catch (error: any) {
    console.error("Error triggering job:", error);
    return { error: `Internal server error: ${error.message || 'Unknown error'}`, runId: null, accessToken: null };
  }
} 