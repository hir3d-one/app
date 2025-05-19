"use server";

import { jobSearchTask } from "@hir3d/tasks";
// import { auth } from "@hir3d/auth"; // Assuming auth might be needed later

interface StartSearchInput {
  jobDraftId: string;
  jobTitle?: string;
  // In a real scenario, you might pass the full criteria or fetch it here based on jobDraftId
}

export async function startJobSearch(input: StartSearchInput) {
  // const session = await auth.api.getSession(); // Example: Get session
  // if (!session?.user?.id) {
  //   return { error: "User not authenticated. Please sign in.", runId: null, accessToken: null };
  // }

  if (!input.jobDraftId) {
    return { error: "Job Draft ID is required.", runId: null, accessToken: null };
  }

  try {
    const runHandle = await jobSearchTask.trigger({
      jobDraftId: input.jobDraftId,
      userId: "user-placeholder-123", // Replace with actual userId from session
      jobTitle: input.jobTitle || `Job Search for ${input.jobDraftId}`,
      searchCriteria: {}, // Empty object for now, can be expanded with real criteria later
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