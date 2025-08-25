"use server";

import { jobSearchTask } from "@hir3d/tasks";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface StartSearchInput {
  jobSearchId: string;
}

export async function startJobSearch(input: StartSearchInput) {
  // Get the authenticated session
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    return { error: "User not authenticated. Please sign in.", runId: null, accessToken: null };
  }

  if (!input.jobSearchId) {
    return { error: "Job Search ID is required.", runId: null, accessToken: null };
  }

  try {
    const runHandle = await jobSearchTask.trigger({
      jobSearchId: input.jobSearchId,
      userId: session.user.id
    });

    if (!runHandle?.id) {
      return { error: "Failed to trigger job search. No run ID returned.", runId: null, accessToken: null };
    }

    const accessToken = runHandle.publicAccessToken;
    
    console.log(`Job search started: runId=${runHandle.id}`);
    
    return { error: null, runId: runHandle.id, accessToken };
  } catch (error: any) {
    console.error("Error triggering job search:", error);
    return { error: `Internal server error: ${error.message || 'Unknown error'}`, runId: null, accessToken: null };
  }
} 