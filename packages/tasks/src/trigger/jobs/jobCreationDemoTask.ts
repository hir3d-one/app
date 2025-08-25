import { task, logger, wait, metadata } from "@trigger.dev/sdk";
import { z } from "zod";
import { PrismaClient } from "@hir3d/db-app";

const prisma = new PrismaClient();

// Define the steps for our demo task, exported for frontend use
export const demoTaskSteps = [
  { id: "step1", name: "Initiating Job Creation", duration: 2000 },
  { id: "step2", name: "Processing Input Data", duration: 3000 },
  { id: "step3", name: "Analyzing with AI", duration: 4000 },
  { id: "step4", name: "Creating Job Search Record", duration: 2000 },
] as const;

type DemoStep = typeof demoTaskSteps[number];
type StepName = DemoStep["name"];

// Define the expected payload structure using Zod
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
  jobSearchId: string;
  stepsCompleted: StepName[];
}

// Demo AI parsing function - this would be replaced with actual AI/LLM calls
function parseJobDescriptionDemo(jobDetails: string) {
  // Simple demo parsing - in reality this would be an AI/LLM call
  const title = extractJobTitle(jobDetails);
  const skills = extractSkills(jobDetails);
  const location = extractLocation(jobDetails);
  const experience = extractExperience(jobDetails);
  const salary = extractSalary(jobDetails);
  
  return {
    title,
    skills,
    location,
    experience,
    salary,
    employmentType: "FULL_TIME",
    keywords: jobDetails.toLowerCase().split(" ").filter(word => word.length > 3)
  };
}

function extractJobTitle(jobDetails: string): string {
  // Simple heuristic - look for common job titles
  const jobTitles = [
    "Senior React Developer", "Frontend Developer", "Full Stack Developer", 
    "Backend Developer", "Software Engineer", "UI/UX Designer", "Product Manager"
  ];
  
  for (const title of jobTitles) {
    if (jobDetails.toLowerCase().includes(title.toLowerCase())) {
      return title;
    }
  }
  
  // Default fallback
  return "Software Developer";
}

function extractSkills(jobDetails: string): Array<{name: string, experienceYears?: number, importance: "MUST_HAVE" | "NICE_TO_HAVE"}> {
  const skillsMap: Record<string, {name: string, importance: "MUST_HAVE" | "NICE_TO_HAVE"}> = {
    "react": { name: "React", importance: "MUST_HAVE" },
    "typescript": { name: "TypeScript", importance: "MUST_HAVE" },
    "javascript": { name: "JavaScript", importance: "MUST_HAVE" },
    "nodejs": { name: "Node.js", importance: "NICE_TO_HAVE" },
    "node.js": { name: "Node.js", importance: "NICE_TO_HAVE" },
    "graphql": { name: "GraphQL", importance: "NICE_TO_HAVE" },
    "css": { name: "CSS", importance: "MUST_HAVE" },
    "html": { name: "HTML", importance: "MUST_HAVE" },
    "vue": { name: "Vue.js", importance: "NICE_TO_HAVE" },
    "angular": { name: "Angular", importance: "NICE_TO_HAVE" },
    "python": { name: "Python", importance: "NICE_TO_HAVE" },
    "java": { name: "Java", importance: "NICE_TO_HAVE" },
  };
  
  const foundSkills: Array<{name: string, experienceYears?: number, importance: "MUST_HAVE" | "NICE_TO_HAVE"}> = [];
  const lowerJobDetails = jobDetails.toLowerCase();
  
  for (const [keyword, skill] of Object.entries(skillsMap)) {
    if (lowerJobDetails.includes(keyword)) {
      foundSkills.push(skill);
    }
  }
  
  // Always include some basics if nothing found
  if (foundSkills.length === 0) {
    foundSkills.push({ name: "JavaScript", importance: "MUST_HAVE" });
    foundSkills.push({ name: "HTML", importance: "MUST_HAVE" });
    foundSkills.push({ name: "CSS", importance: "MUST_HAVE" });
  }
  
  return foundSkills;
}

function extractLocation(jobDetails: string): string[] {
  const locations = ["Remote", "Berlin", "London", "New York", "San Francisco", "Toronto", "Munich", "Barcelona"];
  const found = locations.filter(loc => 
    jobDetails.toLowerCase().includes(loc.toLowerCase())
  );
  
  return found.length > 0 ? found : ["Remote"];
}

function extractExperience(jobDetails: string): {min: number, max: number} {
  // Look for experience patterns
  const experiencePatterns = [
    /(\d+)\s*-\s*(\d+)\s*years/i,
    /(\d+)\s*\+\s*years/i,
    /(\d+)\s*years/i
  ];
  
  for (const pattern of experiencePatterns) {
    const match = jobDetails.match(pattern);
    if (match) {
      const num = parseInt(match[1]);
      return { min: num, max: num + 2 };
    }
  }
  
  // Default to mid-level
  return { min: 3, max: 7 };
}

function extractSalary(jobDetails: string): {min: number, max: number, currency: string} | null {
  // Look for salary patterns
  const salaryPatterns = [
    /(\d+)k?\s*-\s*(\d+)k?\s*(eur|usd|gbp)?/i,
    /(\d+)k?\s*(eur|usd|gbp)?/i
  ];
  
  for (const pattern of salaryPatterns) {
    const match = jobDetails.match(pattern);
    if (match) {
      const min = parseInt(match[1]) * (match[1].includes('k') ? 1000 : 1);
      const max = match[2] ? parseInt(match[2]) * (match[2].includes('k') ? 1000 : 1) : min + 20000;
      const currency = match[3]?.toUpperCase() || "EUR";
      return { min, max, currency };
    }
  }
  
  return null;
}

export const jobCreationDemoTask = task({
  id: "job-creation-demo",
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
      
      // Special handling for AI analysis step
      if (step.name === "Analyzing with AI") {
        await logger.info("Parsing job description with AI...");
        // In reality, this would be an actual AI/LLM call
        await wait.for({ seconds: step.duration / 1000 });
        await logger.info("AI analysis completed");
      } else {
        await wait.for({ seconds: step.duration / 1000 });
      }
      
      stepsCompleted.push(step.name);
      await logger.info(`Completed step ${stepNumber}: ${step.name}`);
    }



    // Parse the job description (demo AI parsing)
    const parsedCriteria = parseJobDescriptionDemo(validatedPayload.jobDetails);
    
    // Create the JobSearch record in the database
    const jobSearch = await prisma.jobSearch.create({
      data: {
        title: parsedCriteria.title,
        status: "DRAFT_READY",
        naturalLanguagePrompt: validatedPayload.jobDetails,
        creatorUserId: validatedPayload.userId,
        organizationId: null,
        criteria: {
          create: {
            criteriaData: parsedCriteria
          }
        }
      },
      include: {
        criteria: true
      }
    });

    const finalStatus = JobStatusMetadataSchema.parse({
      currentStep: "Completed",
      progress: "Done",
    });
    await metadata.set("jobStatusUpdate", finalStatus);

    const output: JobOutput = {
      message: "Job created successfully and draft is ready.",
      jobSearchId: jobSearch.id,
      stepsCompleted,
    };

    await logger.info("Job creation completed successfully", { output });
    return output;
  },
}); 