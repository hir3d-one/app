import { task, logger, wait, metadata } from "@trigger.dev/sdk";
import { z } from "zod";
import { prisma } from "@hir3d/db-app";

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
  jobSearchId: z.string().min(1), // Changed from jobDraftId to jobSearchId
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
  jobSearchId: string;
  jobTitle: string;
  matchedCandidates: any[];
  totalMatches: number;
  newMatches: number;
  shortlistedCount: number;
}

// Demo AI matching function - this would be replaced with actual AI/ML matching
function calculateMatchScore(candidate: any, criteria: any): number {
  let score = 0;
  const maxScore = 100;
  
  // Skills matching (40% of total score)
  if (criteria.skills && candidate.aiExtractedSkills) {
    const candidateSkills = candidate.aiExtractedSkills as Array<{skill: string, experience?: number}>;
    const requiredSkills = criteria.skills as Array<{name: string, importance: string, experienceYears?: number}>;
    
    let skillsScore = 0;
    let totalSkillWeight = 0;
    
    for (const requiredSkill of requiredSkills) {
      const weight = requiredSkill.importance === "MUST_HAVE" ? 3 : 1;
      totalSkillWeight += weight;
      
      const candidateSkill = candidateSkills.find(cs => 
        cs.skill.toLowerCase().includes(requiredSkill.name.toLowerCase()) ||
        requiredSkill.name.toLowerCase().includes(cs.skill.toLowerCase())
      );
      
      if (candidateSkill) {
        skillsScore += weight * 10; // Base score for having the skill
        
        // Bonus for experience level
        if (requiredSkill.experienceYears && candidateSkill.experience) {
          if (candidateSkill.experience >= requiredSkill.experienceYears) {
            skillsScore += weight * 5; // Bonus for meeting experience requirement
          }
        }
      }
    }
    
    score += (skillsScore / Math.max(totalSkillWeight * 15, 1)) * 40;
  }
  
  // Experience matching (25% of total score)
  if (criteria.experience && candidate.aiExtractedExperience) {
    const candidateExperience = candidate.aiExtractedExperience as Array<{title: string, duration: string}>;
    const totalYears = candidateExperience.reduce((acc, exp) => {
      const match = exp.duration.match(/(\d+)/);
      return acc + (match ? parseInt(match[1]) : 0);
    }, 0);
    
    if (totalYears >= (criteria.experience.min || 0)) {
      score += 25;
      if (totalYears <= (criteria.experience.max || 20)) {
        score += 5; // Bonus for being in the sweet spot
      }
    }
  }
  
  // Location matching (15% of total score)
  if (criteria.location && candidate.location) {
    const candidateLocation = candidate.location.toLowerCase();
    const requiredLocations = criteria.location as string[];
    
    for (const location of requiredLocations) {
      if (candidateLocation.includes(location.toLowerCase()) || 
          location.toLowerCase() === "remote") {
        score += 15;
        break;
      }
    }
  }
  
  // Overall ranking score bonus (20% of total score)
  if (candidate.overallRankingScore) {
    score += (candidate.overallRankingScore / 100) * 20;
  }
  
  return Math.min(Math.round(score), maxScore);
}

export const jobSearchTask = task({
  id: "job-search-simulation",
  run: async (payload: JobSearchPayload, { ctx }) => {
    const validatedPayload = JobSearchPayloadSchema.parse(payload);
    await logger.info("Starting job search task", { payload: validatedPayload });

    let completedSteps: JobSearchStepName[] = [];

    // Update job search status to ACTIVE
    await (prisma as any).jobSearch.update({
      where: { id: validatedPayload.jobSearchId },
      data: { status: "ACTIVE", activatedAt: new Date() }
    });

    // Get the job search criteria
    const jobSearch = await (prisma as any).jobSearch.findUnique({
      where: { id: validatedPayload.jobSearchId },
      include: { criteria: true }
    });

    if (!jobSearch) {
      throw new Error(`JobSearch with id ${validatedPayload.jobSearchId} not found`);
    }

    const criteria = jobSearch.criteria?.criteriaData;
    await logger.info("Retrieved job search criteria", { criteria });

    for (const [index, step] of jobSearchTaskSteps.entries()) {
      let statusText = `Processing step ${index + 1} of ${jobSearchTaskSteps.length}: ${step.name}`;
      let progressPercentage: number | undefined = undefined;

      if (step.hasProgress && step.totalItems) {
        const totalSubSteps = 10; // Simulate sub-steps for progress
        for (let i = 0; i < totalSubSteps; i++) {
          await wait.for({ seconds: step.duration / (1000 * totalSubSteps) });
          const currentProgress = Math.floor(((i + 1) / totalSubSteps) * step.totalItems);
          progressPercentage = Math.floor(((i + 1) / totalSubSteps) * 100);
          
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

    // Get all candidates from the database
    const allCandidates = await (prisma as any).candidate.findMany({
      where: {
        aiAnalysisStatus: "COMPLETED"
      }
    });

    await logger.info(`Found ${allCandidates.length} candidates to process`);

    // Calculate match scores for each candidate
    const candidateMatches: Array<{
      candidateId: string;
      matchScore: number;
      matchDetailsJson: any;
    }> = [];
    for (const candidate of allCandidates) {
      const matchScore = calculateMatchScore(candidate, criteria);
      
      if (matchScore > 60) { // Only include candidates with decent match scores
        candidateMatches.push({
          candidateId: candidate.id,
          matchScore,
          matchDetailsJson: {
            skillMatches: candidate.aiExtractedSkills,
            overallScore: matchScore
          }
        });
      }
    }

    // Sort by match score (highest first)
    candidateMatches.sort((a, b) => b.matchScore - a.matchScore);

    await logger.info(`Generated ${candidateMatches.length} candidate matches`);

    // Create JobCandidateMatch records
    for (const match of candidateMatches) {
      await (prisma as any).jobCandidateMatch.create({
        data: {
          jobSearchId: validatedPayload.jobSearchId,
          candidateId: match.candidateId,
          matchScore: match.matchScore,
          matchDetailsJson: match.matchDetailsJson
        }
      });
    }

    // Get the matched candidates with their details for the response
    const matchedCandidatesWithDetails = await (prisma as any).candidate.findMany({
      where: {
        id: { in: candidateMatches.slice(0, 10).map((m: any) => m.candidateId) }
      }
    });

    const finalStatusUpdate = JobSearchStatusMetadataSchema.parse({
      currentStep: "Completed",
      statusText: "Job search completed. Results are ready.",
      progressPercentage: 100,
      completedSteps,
    });
    await metadata.set("jobSearchStatusUpdate", finalStatusUpdate);

    // Transform candidates for frontend display
    const transformedCandidates = matchedCandidatesWithDetails.map((candidate: any) => {
      const match = candidateMatches.find(m => m.candidateId === candidate.id);
      return {
        id: candidate.id,
        anonymizedName: `${candidate.firstName} ${candidate.lastName?.charAt(0)}.`,
        matchScore: match?.matchScore || 0,
        topSkills: candidate.aiExtractedSkills?.slice(0, 3).map((s: any) => s.skill) || [],
        experienceSummary: candidate.aiSummary?.substring(0, 50) + "..." || "No summary available",
        location: candidate.location || "Location not specified",
        dateMatched: new Date().toISOString(),
        photoUrl: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99) + 1}.jpg`
      };
    });

    const output: JobSearchOutput = {
      message: "Job search completed successfully.",
      jobSearchId: validatedPayload.jobSearchId,
      jobTitle: jobSearch.title,
      matchedCandidates: transformedCandidates,
      totalMatches: candidateMatches.length,
      newMatches: candidateMatches.length, // For now, all matches are new
      shortlistedCount: 0 // No candidates shortlisted yet
    };

    await logger.info("Job search completed successfully", { output });
    return output;
  },
});

// Helper to get step names for frontend if needed
// ... existing code ...
