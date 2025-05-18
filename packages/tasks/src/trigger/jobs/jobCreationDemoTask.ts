import { task, logger, wait, metadata } from "@trigger.dev/sdk/v3";
import { z } from "zod";

// Define the steps for our demo task, exported for frontend use
export const demoTaskSteps = [
  { id: "step1", name: "Initiating Job Creation", duration: 2000 },
  { id: "step2", name: "Processing Input Data", duration: 3000 },
  { id: "step3", name: "Setting up Resources", duration: 4000 },
  { id: "step4", name: "Finalizing Job", duration: 2000 },
] as const; // Added 'as const' for stricter typing of names if used as discriminators

type DemoStep = typeof demoTaskSteps[number];
type StepName = DemoStep["name"];

// Define the expected payload structure using Zod for validation if needed, or a simple interface.
const JobPayloadSchema = z.object({
  userId: z.string().min(1),
  jobDetails: z.string().min(1),
});
// Infer the type from the Zod schema for use in the run function signature
type JobPayload = z.infer<typeof JobPayloadSchema>;

const JobStatusMetadataSchema = z.object({
  currentStep: z.string(),
  progress: z.string(),
});

interface JobOutput {
  message: string;
  draftId: string;
  stepsCompleted: StepName[];
}

export const jobCreationDemoTask = task({
  id: "job-creation-demo",
  // payloadSchema removed; payload type is now defined on the run function's argument.
  run: async (payload: JobPayload, { ctx }) => {
    const validatedPayload = JobPayloadSchema.parse(payload);
    await logger.info("Starting job creation demo task", { payload: validatedPayload });

    const stepsCompleted: StepName[] = [];

    for (const [index, step] of demoTaskSteps.entries()) {
      const stepNumber = index + 1;
      const progress = `${stepNumber}/${demoTaskSteps.length}`;
      
      const statusUpdate = JobStatusMetadataSchema.parse({
        currentStep: step.name,
        progress,
      });

      await metadata.set("jobStatusUpdate", statusUpdate);
      await logger.info(`Processing step ${stepNumber}: ${step.name}`);
      
      await wait.for({ seconds: step.duration / 1000 });
      stepsCompleted.push(step.name);
      
      await logger.info(`Completed step ${stepNumber}: ${step.name}`);
    }

    const finalStatus = JobStatusMetadataSchema.parse({
      currentStep: "Completed",
      progress: "Done",
    });
    await metadata.set("jobStatusUpdate", finalStatus);

    const output: JobOutput = {
      message: "Job created successfully and draft is ready.",
      draftId: generateDraftId(validatedPayload.userId),
      stepsCompleted,
    };

    await logger.info("Job creation completed successfully", { output });
    return output;
  },
});

function generateDraftId(userId: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${timestamp}${random}`;
} 