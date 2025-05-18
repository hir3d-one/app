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
import { Timeline, TimelineContent, TimelineItem } from "@/components/ui/timeline";
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
  pending: Loader2Icon,
  "in-progress": Loader2Icon,
  completed: CheckCircleIcon,
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
    <div className="relative flex flex-1 w-full items-center justify-center bg-white dark:bg-black">
      <Spotlight
        className="-top-20 left-0 md:top-12 md:left-[24rem]"
        fill="white"
      />
      <div className={cn(
        "absolute inset-0",
        "[background-size:20px_20px]",
        "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
        "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
      )} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center p-4 md:p-6 space-y-8">
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
    <>
      <SiteHeader title="Create New Job" />
      <div className="flex flex-1 flex-col">
        <JobsCreateBackground>
          <div className="container mx-auto max-w-2xl w-full flex flex-col items-center space-y-8"> 
            <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">Create New Background Job</h1>
            
            <PlaceholdersAndVanishInput 
              placeholders={placeholders}
              onSubmit={handleInputSubmit}
              isLoading={isJobProcessing}
            />

            {currentRunId && (
              <div className="mt-10 p-6 sm:p-8 bg-white dark:bg-neutral-900 shadow-xl rounded-xl w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700 dark:text-gray-300">Job Progress</h2>
                <Timeline value={currentActiveNumericalStep} orientation="vertical" className="space-y-1">
                  {uiSteps.map((step, index) => {
                    const IconForStepName = step.icon;
                    const IconForStatus = stepStatusIcons[step.status];
                    const jobStatusMeta = run?.metadata?.jobStatusUpdate as JobStatusMetadata | undefined;
                    const currentProgressText = jobStatusMeta?.currentStep === step.name && jobStatusMeta?.progress && step.status === 'in-progress' 
                      ? ` (${jobStatusMeta.progress})` 
                      : '';
                    return (
                      <TimelineItem 
                        key={step.id} 
                        step={index + 1} 
                        className="m-0! flex-row items-center gap-x-4 py-3.5 border-b border-gray-200 dark:border-neutral-700 last:border-b-0"
                      >
                        <div className={`flex items-center justify-center w-10 h-10 min-w-[2.5rem] rounded-full 
                          ${step.status === 'completed' ? 'bg-green-100 dark:bg-green-900/50' : 
                            step.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/50' : 
                            step.status === 'failed' ? 'bg-red-100 dark:bg-red-900/50' : 'bg-gray-100 dark:bg-neutral-800'}`}
                        >
                          {step.status === "in-progress" ? (
                            <IconForStatus className="text-blue-500 dark:text-blue-400 animate-spin" size={20} />
                          ) : step.status === "completed" ? (
                            <IconForStatus className="text-green-600 dark:text-green-400" size={20} />
                          ) : step.status === "failed" ? (
                            <IconForStatus className="text-red-600 dark:text-red-400" size={20} />
                          ) : ( 
                            <IconForStepName className="text-gray-500 dark:text-gray-400" size={20} />
                          )}
                        </div>
                        <TimelineContent className="text-gray-700 dark:text-gray-300 flex-1 min-w-0">
                          <p className={`font-medium truncate ${ 
                            step.status === "completed" ? "line-through text-gray-400 dark:text-gray-500" : 
                            step.status === "failed" ? "text-red-700 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}
                          >
                            {step.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {step.status}{currentProgressText}
                          </p>
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
                </Timeline>
              </div>
            )}
          </div>
        </JobsCreateBackground>
      </div>
    </>
  );
} 