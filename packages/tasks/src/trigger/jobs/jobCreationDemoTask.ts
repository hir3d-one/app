import { task, logger, wait, metadata } from "@trigger.dev/sdk/v3";
import { z } from "zod";

// Define the steps for our demo task, exported for frontend use
export const demoTaskSteps = [
  { id: "step1", name: "Initiating Job Creation", duration: 2000 },
  { id: "step2", name: "Processing Input Data", duration: 3000 },
  { id: "step3", name: "Setting up Resources", duration: 4000 },
  { id: "step4", name: "Finalizing Job", duration: 2000 },
] as const; // Added 'as const' for stricter typing of names if used as discriminators

// Define the expected payload structure using Zod for validation if needed, or a simple interface.
const JobPayloadSchema = z.object({
  userId: z.string(),
  jobDetails: z.string(), 
});
// Infer the type from the Zod schema for use in the run function signature
type JobPayload = z.infer<typeof JobPayloadSchema>;

export const jobCreationDemoTask = task({
  id: "job-creation-demo",
  // payloadSchema removed; payload type is now defined on the run function's argument.
  run: async (payload: JobPayload, { ctx }) => {
    // Optionally, you can still parse/validate if you want runtime assurance
    // even if TypeScript provides static typing.
    // const validatedPayload = JobPayloadSchema.parse(payload);

    await logger.info("Job creation demo task started", { payload /* or validatedPayload */, ctx });

    for (const [index, step] of demoTaskSteps.entries()) {
      await logger.info(`Starting step: ${step.name}`);
      // Update metadata to reflect current step and overall progress
      await metadata.set("jobStatusUpdate", {
        currentStep: step.name,
        progress: `${index + 1}/${demoTaskSteps.length}`,
      });
      
      // Simulate work being done for this step
      await wait.for({ seconds: step.duration / 1000 });
      await logger.info(`Completed step: ${step.name}`);
    }
    
    // Final metadata update
    await metadata.set("jobStatusUpdate", {
      currentStep: "Completed",
      progress: "Done",
    });
    await logger.info("Job creation demo task completed successfully!");

    // Simulate draft creation and return its ID
    const draftId = `draft_${new Date().getTime()}`;
    return {
      message: "Job created successfully and draft is ready.",
      draftId: draftId,
      stepsCompleted: demoTaskSteps.map(s => s.name),
    };
  },
}); 