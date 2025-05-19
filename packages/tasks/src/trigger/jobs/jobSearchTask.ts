import { task, logger, wait, metadata } from "@trigger.dev/sdk/v3";
import { z } from "zod";

// Define step structure
export const jobSearchTaskSteps = [
  { id: "step1", name: "Validating Search Criteria", duration: 3000, hasProgress: false },
  { id: "step2", name: "Scanning Candidate Database", duration: 8000, hasProgress: true, totalItems: 25000 },
  { id: "step3", name: "Applying Primary Filters", duration: 5000, hasProgress: true, totalItems: 8000 },
  { id: "step4", name: "Scoring Potential Matches", duration: 6000, hasProgress: true, totalItems: 1000 },
  { id: "step5", name: "Ranking Top Candidates", duration: 4000, hasProgress: false },
  { id: "step6", name: "Preparing Results Display", duration: 3000, hasProgress: false }
] as const;

type JobSearchStep = typeof jobSearchTaskSteps[number];
type JobSearchStepName = JobSearchStep["name"];

// Define schemas using Zod
const JobSearchPayloadSchema = z.object({
  userId: z.string().min(1),
  jobDraftId: z.string().min(1),
  jobTitle: z.string().optional(),
  searchCriteria: z.record(z.any()).optional(),
});

type JobSearchPayload = z.infer<typeof JobSearchPayloadSchema>;

const JobSearchStatusMetadataSchema = z.object({
  currentStep: z.string(),
  statusText: z.string().optional(),
  progressPercentage: z.number().optional(),
  completedSteps: z.array(z.string()),
});

export type JobSearchStatusMetadata = z.infer<typeof JobSearchStatusMetadataSchema>;

interface JobSearchOutput {
  message: string;
  jobDraftId: string;
  jobTitle: string;
  matchedCandidates: any[];
  totalMatches: number;
  newMatches: number;
  shortlistedCount: number;
}

// Demo candidates data
const demoCandidates = [
  {
    id: "c1",
    anonymizedName: "Senior React Developer",
    matchScore: 95,
    topSkills: ["React", "TypeScript", "NextJS"],
    experienceSummary: "8 years frontend development",
    location: "Berlin, DE",
    dateMatched: new Date().toISOString(),
    photoUrl: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    id: "c2",
    anonymizedName: "Frontend Specialist",
    matchScore: 92,
    topSkills: ["React", "JavaScript", "CSS"],
    experienceSummary: "6 years frontend, 2 years UX",
    location: "Remote (GMT+1)",
    dateMatched: new Date().toISOString(),
    photoUrl: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    id: "c3",
    anonymizedName: "Full Stack Developer",
    matchScore: 88,
    topSkills: ["React", "Node.js", "MongoDB"],
    experienceSummary: "5 years fullstack experience",
    location: "London, UK",
    dateMatched: new Date().toISOString(),
    photoUrl: "https://randomuser.me/api/portraits/men/3.jpg"
  },
  {
    id: "c4",
    anonymizedName: "UI Engineer",
    matchScore: 85,
    topSkills: ["React", "Redux", "Sass"],
    experienceSummary: "4 years UI development",
    location: "Paris, FR",
    dateMatched: new Date().toISOString(),
    photoUrl: "https://randomuser.me/api/portraits/women/4.jpg"
  },
  {
    id: "c5",
    anonymizedName: "React Native Developer",
    matchScore: 83,
    topSkills: ["React Native", "TypeScript", "Redux"],
    experienceSummary: "3 years mobile, 2 years web",
    location: "Barcelona, ES",
    dateMatched: new Date().toISOString(),
    photoUrl: "https://randomuser.me/api/portraits/men/5.jpg"
  }
];

export const jobSearchTask = task({
  id: "job-search-simulation",
  run: async (payload: JobSearchPayload, { ctx }) => {
    const validatedPayload = JobSearchPayloadSchema.parse(payload);
    await logger.info("Starting job search simulation task", { payload: validatedPayload });

    let completedSteps: JobSearchStepName[] = [];

    for (const [index, step] of jobSearchTaskSteps.entries()) {
      let statusText = `Processing step ${index + 1} of ${jobSearchTaskSteps.length}: ${step.name}`;
      let progressPercentage: number | undefined = undefined;

      if (step.hasProgress && step.totalItems) {
        const totalSubSteps = 10; // Simulate sub-steps for progress
        for (let i = 0; i < totalSubSteps; i++) {
          await wait.for({ seconds: step.duration / (1000 * totalSubSteps) });
          const currentProgress = Math.floor(((i + 1) / totalSubSteps) * step.totalItems);
          progressPercentage = Math.floor(((i + 1) / totalSubSteps) * 100);
          statusText = `${step.name}: ${currentProgress.toLocaleString()} / ${step.totalItems.toLocaleString()} processed`;
          if (step.name === "Scanning Candidate Database") {
            statusText = `Scanning Candidate Database (${currentProgress.toLocaleString()} candidates scanned / ${step.totalItems.toLocaleString()} total estimated)`;
          } else if (step.name === "Applying Primary Filters") {
             statusText = `Applying Primary Filters (${currentProgress.toLocaleString()} candidates remaining)`;
          } else if (step.name === "Scoring Potential Matches") {
             statusText = `Scoring ${currentProgress.toLocaleString()} potential matches`;
          }

          const currentStatusUpdate = JobSearchStatusMetadataSchema.parse({
            currentStep: step.name,
            statusText,
            progressPercentage,
            completedSteps,
          });
          await metadata.set("jobSearchStatusUpdate", currentStatusUpdate);
          await logger.info(statusText, { currentStep: step.name, progress: progressPercentage });
        }
      } else {
        await wait.for({ seconds: step.duration / 1000 });
         if (step.name === "Validating Search Criteria") statusText = "Search criteria validated successfully.";
         if (step.name === "Ranking Top Candidates") statusText = "Ranking top candidates based on scores.";
         if (step.name === "Preparing Results Display") statusText = "Finalizing and preparing results display.";

        const currentStatusUpdate = JobSearchStatusMetadataSchema.parse({
            currentStep: step.name,
            statusText,
            progressPercentage: 100, // Non-progress steps are 100% for that step itself
            completedSteps,
          });
        await metadata.set("jobSearchStatusUpdate", currentStatusUpdate);
      }
      
      completedSteps.push(step.name);
      await logger.info(`Completed step: ${step.name}`);
    }

    const finalStatusUpdate = JobSearchStatusMetadataSchema.parse({
      currentStep: "Completed",
      statusText: "Job search completed. Results are ready.",
      progressPercentage: 100,
      completedSteps,
    });
    await metadata.set("jobSearchStatusUpdate", finalStatusUpdate);

    // Simulate output
    const output: JobSearchOutput = {
      message: "Job created successfully and draft is ready.",
      jobDraftId: validatedPayload.jobDraftId,
      jobTitle: validatedPayload.jobTitle || "Search Results",
      matchedCandidates: demoCandidates, // Using demo data
      totalMatches: demoCandidates.length,
      newMatches: Math.floor(Math.random() * 5), // dummy data
      shortlistedCount: Math.floor(Math.random() * demoCandidates.length) // dummy data
    };

    await logger.info("Job search simulation completed successfully", { output });
    return output;
  },
});

// Helper to get step names for frontend if needed
// ... existing code ...
