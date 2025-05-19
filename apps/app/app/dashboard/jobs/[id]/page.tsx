'use client';

import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useRealtimeRun } from '@trigger.dev/react-hooks';
import type { jobSearchTask as JobSearchTaskType } from '@hir3d/tasks';

// Define fallback types and data since they're missing from the imported package
type JobSearchStatusMetadata = {
  currentStep?: string;
  completedSteps?: string[];
  progressPercentage?: number;
  statusText?: string;
};

// Mock schema validation function to prevent "JobSearchPayloadSchema is not defined" error
const JobSearchPayloadSchema = {
  parse: (data: any) => {
    // This is just a passthrough that returns the data without validation
    // In a real implementation, this would validate the structure
    return data;
  }
};

// Fallback for jobSearchTaskSteps if import fails
const jobSearchTaskSteps = [
  { id: "step1", name: "Validating Search Criteria", duration: 3000, hasProgress: false },
  { id: "step2", name: "Scanning Candidate Database", duration: 8000, hasProgress: true, totalItems: 25000 },
  { id: "step3", name: "Applying Primary Filters", duration: 5000, hasProgress: true, totalItems: 8000 },
  { id: "step4", name: "Scoring Potential Matches", duration: 6000, hasProgress: true, totalItems: 1000 },
  { id: "step5", name: "Ranking Top Candidates", duration: 4000, hasProgress: false },
  { id: "step6", name: "Preparing Results Display", duration: 3000, hasProgress: false }
];
import { toast } from 'sonner';

import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spotlight } from "@/components/ui/spotlight";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Settings,
  ListChecks,
  Archive,
  Play,
  ChevronDown,
  Users,
  Star,
  Eye,
  MoreVertical,
  FileText,
  Zap,
  LayoutGrid, LayoutList,
  ChevronLeft,
  Info as InfoIcon,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// Types
interface Skill {
  name: string;
  mustHave: boolean;
  minExperience?: number;
}
interface Language {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}
interface JobDraftData {
  id: string;
  title: string;
  locations: string[];
  employmentType: 'Full-time' | 'Contract' | 'Part-time' | 'Internship';
  salaryMin: number;
  salaryMax: number;
  keySkills: Skill[];
  totalYearsExperience: [number, number];
  educationLevel?: 'Bachelors' | 'Masters' | 'PhD' | 'Vocational' | 'Self-taught' | 'none';
  industryExperience: string[];
  languageRequirements: Language[];
  keywords: string;
}

interface Candidate {
  id: string;
  anonymizedName: string;
  matchScore: number;
  topSkills: string[];
  experienceSummary: string;
  location: string;
  photoUrl?: string;
  role?: string;
  dateMatched?: string;
}

const demoJobDraft: JobDraftData = {
  id: 'demo-draft-123',
  title: 'Senior React Developer',
  locations: ['Berlin', 'Remote'],
  employmentType: 'Full-time',
  salaryMin: 80000,
  salaryMax: 95000,
  keySkills: [
    { name: 'React', mustHave: true, minExperience: 5 },
    { name: 'TypeScript', mustHave: true, minExperience: 4 },
  ],
  totalYearsExperience: [5, 10],
  educationLevel: 'Bachelors',
  industryExperience: ['SaaS'],
  languageRequirements: [{ name: 'English', proficiency: 'Fluent' }],
  keywords: 'Frontend development, agile',
};

const localDemoCandidates: Candidate[] = [
  {
    id: 'cand1',
    anonymizedName: 'Candidate Alpha',
    matchScore: 92,
    topSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    experienceSummary: 'Developed cutting-edge UIs for SaaS products.',
    location: 'Berlin, Germany',
    photoUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    dateMatched: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'Senior Frontend Developer',
  },
  {
    id: 'cand2',
    anonymizedName: 'Candidate Bravo',
    matchScore: 88,
    topSkills: ['Python', 'Django', 'AWS', 'PostgreSQL'],
    experienceSummary: 'Built scalable backend systems for e-commerce.',
    location: 'London, UK',
    photoUrl: 'https://randomuser.me/api/portraits/women/75.jpg',
    dateMatched: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'Backend Developer',
  },
  {
    id: 'cand3',
    anonymizedName: 'Candidate Charlie',
    matchScore: 75,
    topSkills: ['Project Management', 'Agile', 'Scrum', 'JIRA'],
    experienceSummary: 'Led multiple cross-functional tech teams.',
    location: 'Remote',
    // photoUrl: undefined, // Intentionally left blank to test AvatarFallback
    dateMatched: new Date().toISOString(),
    role: 'Technical Project Manager',
  },
  {
    id: 'cand4',
    anonymizedName: 'Candidate Delta',
    matchScore: 95,
    topSkills: ['UX Design', 'Figma', 'User Research'],
    experienceSummary: 'Designed intuitive interfaces for mobile apps.',
    location: 'San Francisco, USA',
    photoUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    dateMatched: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'Lead UX Designer',
  },
];

interface UIStep {
  name: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  statusText?: string;
  progressPercentage?: number;
}

type IndividualJobSearchStep = typeof jobSearchTaskSteps[number];

// Background component (similar to JobsCreateBackground)
function JobProcessingBackground({ children, verticalAlign = 'center' }: { children: React.ReactNode; verticalAlign?: 'center' | 'top' }) {
  return (
    <div className="relative flex flex-1 w-full items-center justify-center bg-background overflow-hidden">
      <Spotlight
        className="-top-20 left-0 md:top-12 md:left-[24rem]"
        fill="white"
      />
      <div className={cn(
        "absolute inset-0",
        "[background-size:20px_20px]",
        "[background-image:radial-gradient(#e0e0e0_1px,transparent_1px)]",
        "dark:[background-image:radial-gradient(#333333_1px,transparent_1px)]",
        "opacity-70",
      )} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className={cn(
        "relative z-20 w-full h-full flex flex-col items-center px-4 md:p-4",
        verticalAlign === 'top' ? "justify-start" : "justify-center"
      )}>
        {children}
      </div>
    </div>
  );
}

const getStepStatus = (
  stepName: string,
  runStatus: string | undefined,
  metadata: JobSearchStatusMetadata | undefined,
  isRunCompleted: boolean,
  isRunFailed: boolean
): UIStep["status"] => {
  if (isRunFailed && metadata?.currentStep === stepName) return "failed";
  if (metadata?.completedSteps?.includes(stepName)) return "completed";
  if (metadata?.currentStep === stepName && (runStatus === "EXECUTING" || runStatus === "REATTEMPTING" || runStatus === "DELAYED")) return "in-progress";
  return "pending";
};

export default function JobMatchesPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const jobId = params.id as string;
  const initialRunId = searchParams.get('runId');
  const initialAccessToken = searchParams.get('accessToken');

  const [currentRunId, setCurrentRunId] = useState<string | null>(initialRunId);
  const [accessToken, setAccessToken] = useState<string | null>(initialAccessToken);
  const [jobDraftData, setJobDraftData] = useState<JobDraftData | null>(null);
  const [matchedCandidates, setMatchedCandidates] = useState<Candidate[]>(localDemoCandidates);
  const [jobStats, setJobStats] = useState<{totalMatches: number, newMatches: number, shortlistedCount: number} | null>(null);

  const { run, error: runSubscriptionError } = useRealtimeRun<typeof JobSearchTaskType>(
    currentRunId ?? undefined,
    {
      accessToken: accessToken ?? undefined,
      baseURL: 'https://workers.hir3d.one', 
      enabled: !!(currentRunId && accessToken),
    }
  );

  useEffect(() => {
    if (jobId === demoJobDraft.id) {
      setJobDraftData(demoJobDraft);
    } else {
      setJobDraftData({ ...demoJobDraft, id: jobId, title: `Job Search: ${jobId}` });
    }
  }, [jobId]);

  const isJobProcessing = useMemo(() => {
    if (!currentRunId) return false; 
    if (currentRunId && !run && !runSubscriptionError) return true; 
    if (!run) return false; 
    return !["COMPLETED", "FAILED", "CRASHED", "CANCELED", "TIMED_OUT", "SYSTEM_FAILURE"].includes(run.status);
  }, [run, currentRunId, runSubscriptionError]);

  const runMetadata = run?.metadata?.jobSearchStatusUpdate as JobSearchStatusMetadata | undefined;

  const uiSteps: UIStep[] = useMemo(() => {
    const isRunCompleted = run?.status === "COMPLETED";
    const isRunFailed = ["FAILED", "CRASHED", "CANCELED", "TIMED_OUT", "SYSTEM_FAILURE"].includes(run?.status ?? "");

    return jobSearchTaskSteps.map((step: IndividualJobSearchStep) => ({
      name: step.name,
      status: getStepStatus(step.name, run?.status, runMetadata, isRunCompleted, isRunFailed),
      statusText: runMetadata?.currentStep === step.name ? runMetadata.statusText : (runMetadata?.completedSteps?.includes(step.name) ? "Completed" : (step.name === runMetadata?.currentStep ? "Processing..." : "Pending")),
      progressPercentage: runMetadata?.currentStep === step.name ? runMetadata.progressPercentage : (runMetadata?.completedSteps?.includes(step.name) ? 100 : 0),
    }));
  }, [run?.status, runMetadata]);

  useEffect(() => {
    if (runSubscriptionError) {
      toast.error(`Subscription error: ${runSubscriptionError.message}`);
    }

    if (run?.status === "COMPLETED" && run.output) {
      const output = run.output as any; 
      setMatchedCandidates(output.matchedCandidates || []);
      if(jobDraftData?.title !== output.jobTitle) {
        setJobDraftData(prev => prev ? {...prev, title: output.jobTitle} : {id: jobId, title: output.jobTitle, locations: [], employmentType: 'Full-time', salaryMin:0, salaryMax:0, keySkills:[], totalYearsExperience:[0,0], industryExperience:[], languageRequirements:[], keywords:''});
      }
      setJobStats({
        totalMatches: output.totalMatches || (output.matchedCandidates?.length ?? 0),
        newMatches: output.newMatches || 0,
        shortlistedCount: output.shortlistedCount || 0
      })
      toast.success("Job search completed! Results are ready.");
    } else if (["FAILED", "CRASHED", "CANCELED"].includes(run?.status ?? "")) {
      toast.error(`Job search ${run?.status.toLowerCase()}. ${run?.error?.message || 'Please try again.'}`);
    }
  }, [run, runSubscriptionError, jobId, jobDraftData?.title]);
  
  const pageTitle = jobDraftData?.title ? `${jobDraftData.title} - Matches` : "Job Matches";

  // Initialize jobStats based on localDemoCandidates if no run has completed yet.
  useEffect(() => {
    if (!run && matchedCandidates.length > 0 && !jobStats) {
      setJobStats({
        totalMatches: matchedCandidates.length,
        newMatches: matchedCandidates.filter(c => {
          if (!c.dateMatched) return false;
          const matchedDate = new Date(c.dateMatched);
          const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
          return matchedDate > threeDaysAgo;
        }).length, // Example: count as "new" if matched in last 3 days
        shortlistedCount: 0 // Default
      });
    }
  }, [matchedCandidates, run, jobStats]);

  if (!jobDraftData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader title="Loading Job Details..." />
        <JobProcessingBackground>
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </JobProcessingBackground>
      </div>
    );
  }

  if (isJobProcessing) {
    const totalDuration = jobSearchTaskSteps.reduce((acc: number, s: any) => acc + s.duration, 0);
    const completedDuration = uiSteps.reduce((acc, step, index) => {
      if (step.status === 'completed') return acc + jobSearchTaskSteps[index].duration;
      if (step.status === 'in-progress' && step.progressPercentage) {
        return acc + (jobSearchTaskSteps[index].duration * (step.progressPercentage / 100));
      }
      return acc;
    }, 0);
    const estimatedSecondsRemaining = Math.max(0, (totalDuration - completedDuration) / 1000);

    return (
      <div className="min-h-screen flex flex-col bg-background overflow-hidden">
        <SiteHeader title={`Processing: ${jobDraftData.title}`} />
        <JobProcessingBackground>
          <div className="container mx-auto max-w-3xl w-full flex flex-col transition-all duration-500 ease-in-out justify-start items-center pt-0">
            <div className="flex flex-col items-center w-full max-w-2xl">
              {/* Enhanced Header Section */}
              <div className="text-center transition-all duration-500 w-full mb-2 scale-90 transform origin-top space-y-1">
                <div className="inline-flex items-center justify-center p-1.5 mb-1 bg-primary/10 rounded-full">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
                <h1 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 text-2xl md:text-3xl">
                  Finding Your Ideal Candidates
                </h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {runMetadata?.statusText || "Initializing job search, please wait..."}
                </p>
              </div>
              
              <div className="w-full max-w-2xl mt-3 bg-card border shadow-lg rounded-xl overflow-hidden">
                <div className="bg-muted/50 border-b px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <h2 className="text-lg font-semibold">Search Progress</h2>
                  </div>
                  {true && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  )}
                </div>
              
              <div className="p-3 pt-4 bg-black text-white">
                <div className="space-y-3">
                  {uiSteps.map((step, index) => {
                    const isCompleted = step.status === 'completed';
                    const isActive = step.status === 'in-progress';
                    const isFailed = step.status === 'failed';
                    const isPending = step.status === 'pending';
                    
                    // Determine step number display
                    let stepNumberDisplay = `${index + 1}/${uiSteps.length}`;
                    if (index === uiSteps.length - 1) {
                      stepNumberDisplay = `${index + 1}`;
                    }
                    
                    return (
                      <div key={step.name} className="relative pl-8">
                        {/* Timeline connector line */}
                        {index < uiSteps.length - 1 && (
                          <div className="absolute left-2.5 top-5 w-0.5 h-[calc(100%+1px)] bg-gray-700" />
                        )}
                        
                        {/* Status indicator */}
                        <div className="absolute left-0 top-0">
                          <div className={cn(
                            "flex items-center justify-center w-5 h-5 rounded-full",
                            isCompleted ? "bg-green-500 text-white" : 
                            isActive ? "bg-white text-black" : 
                            isFailed ? "bg-red-500 text-white" :
                            "bg-gray-700 text-white"
                          )}>
                            {isCompleted ? (
                              <CheckCircle2 size={12} />
                            ) : isActive ? (
                              <span className="text-[9px] font-medium">{stepNumberDisplay}</span>
                            ) : isPending ? (
                              <span className="text-[9px] font-medium">{index + 1}</span>
                            ) : (
                              <XCircle size={12} />
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-0">
                          {/* Status text */}
                          <span className={cn(
                            "text-xs font-medium",
                            isCompleted ? "text-green-500" : 
                            isActive ? "text-white" : 
                            isFailed ? "text-red-500" :
                            "text-gray-400"
                          )}>
                            {isCompleted ? "Completed" : 
                             isActive ? "Processing..." : 
                             isFailed ? "Failed" : 
                             "Pending"}
                          </span>
                          
                          {/* Step title */}
                          <h3 className={cn(
                            "text-sm font-medium mb-0",
                            isCompleted ? "text-green-500" : 
                            isActive ? "text-white" : 
                            isFailed ? "text-red-500" :
                            "text-white"
                          )}>
                            {step.name}
                          </h3>
                          
                          {/* Step description */}
                          <p className="text-gray-400 text-xs mt-0.5">
                            {isCompleted ? "This step completed successfully." :
                             isActive ? step.statusText || "Currently executing this step..." :
                             isFailed ? "This step encountered an error." :
                             "Waiting to start this step..."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Status footer */}
              <div className="bg-[#111] px-5 py-2 border-t border-gray-800">
                <div className="flex items-start gap-2">
                  <InfoIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">
                      {isJobProcessing ? 
                        "Processing your job search request. This may take a moment..." :
                        run?.status === "COMPLETED" ?
                        "Job search completed! Results are ready." :
                        run?.status && ["FAILED", "CRASHED", "CANCELED", "TIMED_OUT", "SYSTEM_FAILURE"].includes(run.status) ?
                        "Job search failed. Please try again with different parameters." :
                        "Waiting for job search to start..."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

                          {estimatedSecondsRemaining > 1 && (
                <p className="text-sm text-muted-foreground mt-8">
                    Estimated time remaining: ~{Math.ceil(estimatedSecondsRemaining / 60)} minute(s)
                </p>
              )}
              <div className="mt-8 flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')} className="bg-background/70 backdrop-blur-sm hover:bg-background/90">
                      <ChevronLeft className="mr-1.5 h-4 w-4"/> Go to Dashboard
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => router.push(`/dashboard/jobs/draft/${jobId}`)} className="bg-background/70 backdrop-blur-sm hover:bg-background/90">
                      View/Edit Criteria <Settings className="ml-1.5 h-4 w-4"/>
                  </Button>
              </div>
            </div>
          </div>
        </JobProcessingBackground>
      </div>
    );
  }

  // Results Ready State
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <SiteHeader title={pageTitle} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <JobProcessingBackground verticalAlign="top">
          <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10 w-full max-w-screen-xl">
            <div className="bg-card border rounded-xl shadow-md mb-6 md:mb-8 p-4 md:p-5 text-foreground dark:bg-neutral-900 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {jobDraftData.title}
                  </h1>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1.5 items-center">
                    <span className="inline-flex items-center"><Users className="h-4 w-4 mr-1.5 text-gray-400" />{jobStats?.totalMatches ?? 0} Total Matches</span>
                    {typeof jobStats?.newMatches === 'number' && jobStats.newMatches > 0 && 
                      <span className="inline-flex items-center"><Zap className="h-4 w-4 mr-1.5 text-green-500" />{jobStats.newMatches} New</span>}
                    <span className="inline-flex items-center"><Star className="h-4 w-4 mr-1.5 text-amber-400" />{jobStats?.shortlistedCount ?? 0} Shortlisted</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/jobs/draft/${jobId}`)}>
                    <Settings className="mr-1.5 h-4 w-4" />Edit Criteria
                  </Button>
                  <Button variant="outline" size="sm">
                    <ListChecks className="mr-1.5 h-4 w-4" />Shortlisted ({jobStats?.shortlistedCount ?? 0})
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Play className="mr-2 h-4 w-4" /> Resume Search</DropdownMenuItem>
                      <DropdownMenuItem><Archive className="mr-2 h-4 w-4" /> Archive Search</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="w-full bg-card border shadow-lg rounded-xl overflow-hidden">
              <div className="bg-neutral-900 border-b border-neutral-700 px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-grow sm:flex-grow-0 sm:w-auto md:w-72 lg:w-96">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search candidates by name or skill..."
                      className="w-full rounded-md bg-neutral-800 border-neutral-700 pl-8 h-9 text-sm focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9 bg-neutral-800 border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600">
                            Sort By: Match Score <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-70" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem>Match Score</DropdownMenuItem>
                          <DropdownMenuItem>Newest</DropdownMenuItem>
                          <DropdownMenuItem>Experience Level</DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="hidden md:flex items-center gap-1">
                    <Button variant="outline" size="icon" title="Card View" className="h-9 w-9 bg-neutral-800 border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600">
                        <LayoutGrid className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="icon" title="List View" className="h-9 w-9 text-muted-foreground hover:text-primary data-[active=true]:text-primary data-[active=true]:bg-primary/10" data-active="true">
                        <LayoutList className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-b border-neutral-800">
                <h2 className="text-xl font-semibold flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Matched Candidates ({matchedCandidates.length})
                </h2>
              </div>

              <div className="p-0">
                {matchedCandidates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-1">No Candidates Found Matching Your Criteria</h3>
                        <p className="text-muted-foreground max-w-md mb-6">
                          Your current search criteria didn't yield any results. Try broadening your search by adjusting skills, experience, or location.
                        </p>
                        <Button size="sm" onClick={() => router.push(`/dashboard/jobs/draft/${jobId}`)}>
                            <Settings className="mr-2 h-4 w-4" /> Adjust Criteria
                        </Button>
                    </div>
                ) : (
                <Table className="[&_tr:last-child]:border-0">
                  <TableHeader>
                    <TableRow className="bg-neutral-800 hover:bg-neutral-700/80 border-b border-neutral-700">
                      <TableHead className="w-[50px] px-4">
                        <Checkbox id="select-all-candidates" aria-label="Select all candidates" className="border-neutral-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                      </TableHead>
                      <TableHead className="w-[60px] px-4"></TableHead>
                      <TableHead className="text-white py-3">Candidate</TableHead>
                      <TableHead className="text-center text-white py-3">Match</TableHead>
                      <TableHead className="text-white py-3">Location</TableHead>
                      <TableHead className="text-white py-3">Key Skills</TableHead>
                      <TableHead className="text-white py-3">Matched On</TableHead>
                      <TableHead className="text-right px-4 text-white py-3">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-neutral-800">
                    {matchedCandidates.map((candidate) => (
                      <TableRow key={candidate.id} className="hover:bg-neutral-800/50">
                        <TableCell className="px-4 py-3">
                          <Checkbox aria-label={`Select candidate ${candidate.anonymizedName}`} className="border-neutral-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                        </TableCell>
                        <TableCell className="px-4 py-3 w-[60px]">
                            <Avatar className="h-10 w-10 border border-neutral-700">
                              <AvatarImage src={candidate.photoUrl} alt={candidate.anonymizedName} />
                              <AvatarFallback>{candidate.anonymizedName.substring(0,1)}</AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="font-medium text-base text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => toast.info('Navigate to candidate profile')}>{candidate.anonymizedName}</div>
                          <div className="text-xs text-muted-foreground">{candidate.role || candidate.experienceSummary}</div>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          <Badge
                            variant={candidate.matchScore > 90 ? "default" : candidate.matchScore > 80 ? "secondary" : "outline"}
                            className={cn(
                              "font-semibold text-sm",
                              candidate.matchScore > 90 && "bg-green-500 border-green-500 hover:bg-green-600 text-white",
                              candidate.matchScore <= 80 && candidate.matchScore > 70 && "border-yellow-400 text-yellow-500",
                              candidate.matchScore <=70 && "border-gray-300 dark:border-gray-600"
                            )}>
                            {candidate.matchScore}%
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground">{candidate.location}</TableCell>
                        <TableCell className="py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.topSkills.slice(0,3).map(skill => <Badge key={skill} variant="outline" className="text-xs font-normal py-0.5 px-1.5 bg-background hover:bg-muted/50 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700">{skill}</Badge>)}
                            {candidate.topSkills.length > 3 && <Badge variant="outline" className="text-xs font-normal py-0.5 px-1.5 bg-background hover:bg-muted/50 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700">+{candidate.topSkills.length - 3}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-muted-foreground tabular-nums">{candidate.dateMatched ? new Date(candidate.dateMatched).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell className="text-right px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 data-[state=open]:bg-muted">
                                  <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                              <DropdownMenuItem><Star className="mr-2 h-4 w-4 text-yellow-500" /> Shortlist Candidate</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info('Navigate to candidate profile (not implemented)')}><Eye className="mr-2 h-4 w-4" /> View Full Profile</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500 hover:!text-red-500 focus:!text-red-500">
                                  <XCircle className="mr-2 h-4 w-4" /> Hide this Match
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </div>
            </div>

            {matchedCandidates.length > 0 && (
              <div className="flex justify-between items-center mt-6 md:mt-8 text-sm text-muted-foreground">
                <p>Showing {Math.min(10, matchedCandidates.length)} of {matchedCandidates.length} job(s)</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 bg-neutral-800 border-neutral-700 hover:bg-neutral-700" disabled>Previous</Button>
                  <Button variant="outline" size="sm" className="h-8 bg-neutral-800 border-neutral-700 hover:bg-neutral-700">Next</Button>
                </div>
              </div>
            )}
          </div>
        </JobProcessingBackground>
      </div>
    </div>
  );
} 