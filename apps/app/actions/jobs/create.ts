"use server";

import { betterAuth } from "better-auth";
import { headers } from "next/headers";

// Verify tsconfig.json in 'apps/app' maps '@/packages/*' to '../../packages/*'
import { jobCreationDemoTask } from "@hir3d/tasks";
// Hypothetical import for creating a temporary public access token
// import { createSession } from "better-auth/next-js"; 

export const auth = betterAuth({
  //...
})



export async function startJobCreation(formData: FormData) {

// calling get session on the server
  const session = await auth.api.getSession(
    {
      headers: await headers() // some endpoint might require headers
    }
  )

  
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
      jobDetails: jobDetails,
    });

    if (!runHandle?.id) {
      return { error: "Failed to trigger job. No run ID returned.", runId: null, accessToken: null };
    }

    // TODO: Generate a short-lived public access token for the frontend to subscribe to the run.
    // This depends on how Trigger.dev expects authentication for frontend subscriptions.
    // For now, returning a placeholder. Replace with actual token generation.
    const accessToken = runHandle.publicAccessToken;

    return { error: null, runId: runHandle.id, accessToken };
  } catch (error: any) {
    console.error("Error triggering job:", error);
    return { error: `Internal server error: ${error.message || 'Unknown error'}`, runId: null, accessToken: null };
  }
} 