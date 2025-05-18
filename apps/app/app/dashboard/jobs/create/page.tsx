"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { jobCreationDemoTask as JobCreationDemoTaskType } from "@hir3d/tasks";
import { demoTaskSteps as initialStepsConfig } from "@hir3d/tasks";
import { startJobCreation } from "@/actions/jobs/create";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import {
  LucideIcon,
  BookOpenIcon,
  SettingsIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  Loader2Icon,
  XCircleIcon,
  MoreHorizontalIcon,
  SparklesIcon,
  RocketIcon,
  CheckIcon,
  AlertTriangleIcon,
  InfoIcon,
} from "lucide-react";

type DemoStepConfigItem = (typeof initialStepsConfig)[number];

interface UIStep {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  icon: LucideIcon;
}

const stepNameIcons: Record<string, LucideIcon> = {
  "Initiating Job Creation": BookOpenIcon,
  "Processing Input Data": SettingsIcon,
  "Setting up Resources": BriefcaseIcon,
  "Finalizing Job": CheckCircleIcon,
  "default": MoreHorizontalIcon,
};

const stepStatusIcons: Record<UIStep["status"], LucideIcon> = {
  pending: MoreHorizontalIcon,
  "in-progress": Loader2Icon,
  completed: CheckIcon,
  failed: XCircleIcon,
};

interface JobStatusMetadata {
  currentStep?: string;
  progress?: string;
}

function getCalculatedStepStatus(
  runStatus: string | undefined,
  runMetadata: JobStatusMetadata | undefined,
  stepName: string,
  isRunCompleted: boolean,
  isRunFailed: boolean,
  taskConfig: typeof initialStepsConfig
): UIStep["status"] {
  const currentRunStepName = runMetadata?.currentStep;
  const stepIndex = taskConfig.findIndex((s: DemoStepConfigItem) => s.name === stepName);
  const currentRunStepIndex = taskConfig.findIndex((s: DemoStepConfigItem) => s.name === currentRunStepName);

  if (isRunFailed) return "failed";
  if (isRunCompleted) return "completed";
  
  if (!runStatus || ["QUEUED", "WAITING_FOR_DEPLOY"].includes(runStatus)) return "pending";

  if (currentRunStepName === stepName && ["EXECUTING", "REATTEMPTING", "DELAYED"].includes(runStatus)) {
    return "in-progress";
  }

  if (currentRunStepName && typeof currentRunStepIndex === 'number' && currentRunStepIndex > -1 && stepIndex < currentRunStepIndex) {
    return "completed";
  }
  
  if (stepIndex === 0 && runStatus === "EXECUTING" && !currentRunStepName) {
    return "in-progress";
  }
  return "pending";
}

function JobsCreateBackground({ children }: { children: React.ReactNode }) {
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
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-4 md:p-4">
        {children}
      </div>
    </div>
  );
}

export default function CreateJobPage() {
  const router = useRouter();
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentActiveNumericalStep, setCurrentActiveNumericalStep] = useState(0);
  const [uiSteps, setUiSteps] = useState<UIStep[]>(
    initialStepsConfig.map((step: DemoStepConfigItem) => ({
      id: step.id,
      name: step.name,
      status: "pending",
      icon: stepNameIcons[step.name] || stepNameIcons["default"],
    }))
  );

  const { run, error: runSubscriptionError } = useRealtimeRun<typeof JobCreationDemoTaskType>(
    currentRunId ?? undefined,
    {
      accessToken: accessToken ?? undefined,
      baseURL: 'https://workers.hir3d.one',
      enabled: !!(currentRunId && accessToken),
    }
  );

  const isLoadingRun = !!currentRunId && !!accessToken && !run && !runSubscriptionError;

  const processJobSubmission = async (jobInput: string) => {
    if (!jobInput.trim()) {
      toast.error("Please describe the job.");
      return;
    }

    setFormSubmitting(true);
    setCurrentRunId(null);
    setAccessToken(null);
    setCurrentActiveNumericalStep(0);
    setUiSteps(initialStepsConfig.map((step: DemoStepConfigItem) => ({
      id: step.id,
      name: step.name,
      status: "pending",
      icon: stepNameIcons[step.name] || stepNameIcons["default"],
    })));

    const formData = new FormData();
    formData.append("jobInput", jobInput);
    const result = await startJobCreation(formData); 
    setFormSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.runId && result.accessToken) {
      setCurrentRunId(result.runId);
      setAccessToken(result.accessToken);
    } else if (result.runId && !result.accessToken) {
      toast.warning("Job started, but access token for real-time updates is missing.");
      setCurrentRunId(result.runId);
    } else {
      toast.error("Failed to start job or received an invalid response from server action.");
    }
  };

  const handleInputSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.querySelector('input') as HTMLInputElement;
    await processJobSubmission(input.value);
  };

  useEffect(() => {
    if (runSubscriptionError) {
      toast.error(`Job subscription error: ${runSubscriptionError.message}`);
    }

    let activeNumericalStep = currentActiveNumericalStep;
    if (run) {
      const isRunCompleted = run.status === "COMPLETED";
      const isRunFailed = ["FAILED", "CRASHED", "CANCELED", "TIMED_OUT", "SYSTEM_FAILURE"].includes(run.status);
      const jobStatusMeta = run.metadata?.jobStatusUpdate as JobStatusMetadata | undefined; 

      setUiSteps(prevSteps => prevSteps.map(uiStep => ({
        ...uiStep,
        status: getCalculatedStepStatus(run.status, jobStatusMeta, uiStep.name, isRunCompleted, isRunFailed, initialStepsConfig),
      })));
      
      if (isRunCompleted) {
        activeNumericalStep = initialStepsConfig.length;
        const draftId = run.output?.draftId; 
        if (draftId) {
          setTimeout(() => router.push(`/dashboard/jobs/draft/${draftId}`), 1000);
        } else {
          toast.error("Job completed, but draft ID missing for redirection.");
        }
      } else if (isRunFailed) {
        const stepIndex = initialStepsConfig.findIndex((s: DemoStepConfigItem) => s.name === jobStatusMeta?.currentStep);
        activeNumericalStep = stepIndex !== -1 ? stepIndex + 1 : currentActiveNumericalStep; 
        toast.error(`Job status: ${run.status}. ${run.error?.message || 'Check Trigger.dev dashboard for details.'}`);
      } else if (jobStatusMeta?.currentStep) {
        const stepIndex = initialStepsConfig.findIndex((s: DemoStepConfigItem) => s.name === jobStatusMeta.currentStep);
        if (stepIndex !== -1) {
          activeNumericalStep = stepIndex + 1;
        } else if (run.status === "EXECUTING" && initialStepsConfig.length > 0 && activeNumericalStep === 0) {
          activeNumericalStep = 1; 
        }
      } else if (run.status === "EXECUTING" && initialStepsConfig.length > 0 && activeNumericalStep === 0) {
        activeNumericalStep = 1;
      }
    } else if (!currentRunId) {
      activeNumericalStep = 0; 
    }
    
    if(activeNumericalStep !== currentActiveNumericalStep) {
      setCurrentActiveNumericalStep(activeNumericalStep);
    }
  }, [run, runSubscriptionError, router, currentRunId, currentActiveNumericalStep]);

  const isJobProcessing = !!(formSubmitting || isLoadingRun || 
                         (currentRunId && run && !["COMPLETED", "FAILED", "CRASHED", "CANCELED", "TIMED_OUT", "SYSTEM_FAILURE"].includes(run.status)));
  
  const placeholders = [
    "What job should I kick off for you?",
    "e.g., Process Q4 sales data",
    "Generate report for client X",
    "Analyze user engagement metrics for last month",
    "Update all customer records with new GDPR status",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <SiteHeader title="Create New Job" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <JobsCreateBackground>
          <div className={cn(
            "container mx-auto max-w-3xl w-full flex flex-col transition-all duration-500 ease-in-out",
            currentRunId 
              ? "justify-start items-center pt-0" 
              : "justify-center items-center h-[calc(100vh-64px)]"
          )}>  
            <div className="flex flex-col items-center w-full max-w-2xl">
              {/* Enhanced Header Section */}
              <div className={cn(
                "text-center transition-all duration-500 w-full",
                currentRunId ? "mb-2 scale-90 transform origin-top space-y-1" : "mb-6 space-y-2" 
              )}>
                <div className={cn(
                  "inline-flex items-center justify-center bg-primary/10 rounded-full transition-all duration-500",
                  currentRunId ? "p-1.5 mb-1" : "p-2 mb-3"
                )}>
                  <SparklesIcon className={cn(
                    "text-primary transition-all duration-500",
                    currentRunId ? "h-5 w-5" : "h-6 w-6"
                  )} />
                </div>
                <h1 className={cn(
                  "font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 transition-all duration-500",
                  currentRunId ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
                )}>
                  Create New Job Search
                </h1>
                <p className={cn(
                  "text-muted-foreground max-w-md mx-auto transition-all duration-500",
                  currentRunId ? "text-sm" : ""
                )}>
                  Describe your job in natural language, and we'll create a draft for you to refine.
                </p>
              </div>
              
              {/* Input Component - No card wrapper */}
              <div className="w-full mx-auto">
                <PlaceholdersAndVanishInput 
                  placeholders={placeholders}
                  onSubmit={handleInputSubmit}
                  isLoading={isJobProcessing}
                />
              </div>
            </div>

            {/* Progress Timeline Card */}
            <div className={cn(
              "w-full max-w-2xl mt-3 bg-card border shadow-lg rounded-xl overflow-hidden transition-all duration-500 ease-in-out",
              currentRunId ? "opacity-100 max-h-[1000px]" : "opacity-0 max-h-0"
            )}>
              {currentRunId && (
                <>
                  <div className="bg-muted/50 border-b px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RocketIcon className="h-4 w-4 text-primary" />
                      <h2 className="text-lg font-semibold">Job Progress</h2>
                    </div>
                    {isJobProcessing && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
                        <Loader2Icon className="h-3 w-3 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 pt-4 bg-black text-white">
                    <div className="space-y-3">
                      {uiSteps.map((step, index) => {
                        const IconForStepName = step.icon;
                        const IconForStatus = stepStatusIcons[step.status];
                        const jobStatusMeta = run?.metadata?.jobStatusUpdate as JobStatusMetadata | undefined;
                        const currentProgressText = jobStatusMeta?.currentStep === step.name && jobStatusMeta?.progress && step.status === 'in-progress' 
                          ? jobStatusMeta.progress
                          : '';
                        
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
                          <div key={step.id} className="relative pl-8">
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
                                  <CheckIcon size={12} />
                                ) : isActive ? (
                                  <span className="text-[9px] font-medium">{stepNumberDisplay}</span>
                                ) : isPending ? (
                                  <span className="text-[9px] font-medium">{index + 1}</span>
                                ) : (
                                  <XCircleIcon size={12} />
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
                                 isActive ? "Currently executing this step..." :
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
                            "Processing your job request. This may take a moment..." :
                            run?.status === "COMPLETED" ?
                            "Job completed! Redirecting to draft page..." :
                            run?.status && ["FAILED", "CRASHED", "CANCELED", "TIMED_OUT", "SYSTEM_FAILURE"].includes(run.status) ?
                            "Job failed. Please try again with different parameters." :
                            "Waiting for job to start..."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </JobsCreateBackground>
      </div>
    </div>
  );
} 