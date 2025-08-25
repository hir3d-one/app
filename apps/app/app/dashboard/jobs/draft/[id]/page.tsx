'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { X, ChevronLeft, ChevronRight, Loader2, Plus, PlusCircle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { startJobSearch } from '@/actions/jobs/startSearch';
import { getJobSearch, updateJobSearchCriteria } from '@/actions/jobs/manage';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Spotlight } from '@/components/ui/spotlight';

// Type definitions
interface Skill {
  name: string;
  mustHave: boolean;
  minExperience?: number;
}

interface Language {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

interface Candidate {
  id: string;
  anonymizedName: string;
  matchScore: number;
  topSkills: string[];
  experienceSummary: string;
  location: string;
}

interface JobSearch {
  id: string;
  title: string;
  status: string;
  naturalLanguagePrompt?: string;
  criteria?: {
    criteriaData: any;
  };
}

// Demo Data for preview candidates (these would come from matching API in real implementation)
const demoCandidates: Candidate[] = [
  { id: 'cand1', anonymizedName: 'Candidate #12A4B', matchScore: 92, topSkills: ['React', 'TypeScript'], experienceSummary: '7 YOE, Senior Frontend', location: 'Berlin' },
  { id: 'cand2', anonymizedName: 'Candidate #XF38E', matchScore: 88, topSkills: ['React', 'Node.js'], experienceSummary: '6 YOE, Full-stack Dev', location: 'Remote' },
  { id: 'cand3', anonymizedName: 'Candidate #Z9K2P', matchScore: 85, topSkills: ['TypeScript', 'GraphQL'], experienceSummary: '5 YOE, Frontend Specialist', location: 'Munich (Remote option)' },
];

function JobsDraftBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <Spotlight
        className="-top-20 left-0 md:top-12 md:left-[24rem]"
        fill="white"
      />
      <div className={cn(
        "absolute inset-0",
        "[background-size:20px_20px]",
        "[background-image:radial-gradient(#e0e0e0_1px,transparent_1px)]",
        "dark:[background-image:radial-gradient(#333333_1px,transparent_1px)]",
        "opacity-30",
      )} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

export default function JobDraftRefinePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [jobSearch, setJobSearch] = useState<JobSearch | null>(null);
  const [criteria, setCriteria] = useState<any>(null);
  
  // UI state for adding new items
  const [newSkill, setNewSkill] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  // Load job search data on mount
  useEffect(() => {
    async function loadJobSearch() {
      setIsLoading(true);
      try {
        const result = await getJobSearch(params.id);
        if (result.error) {
          toast.error(`Failed to load job search: ${result.error}`);
          router.push('/dashboard/jobs');
          return;
        }
        
        setJobSearch(result.data);
        setCriteria(result.data?.criteria?.criteriaData || {});
      } catch (error: any) {
        toast.error(`Failed to load job search: ${error.message}`);
        router.push('/dashboard/jobs');
      } finally {
        setIsLoading(false);
      }
    }

    loadJobSearch();
  }, [params.id, router]);

  // Auto-save criteria changes with debouncing
  useEffect(() => {
    if (!criteria || isLoading) return;

    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateJobSearchCriteria(params.id, criteria);
      } catch (error) {
        console.error('Failed to auto-save criteria:', error);
      } finally {
        setIsSaving(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [criteria, params.id, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteHeader title="Loading Job Search..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading job search data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!jobSearch || !criteria) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteHeader title="Job Search Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Job Search Not Found</h2>
            <p className="text-muted-foreground mb-4">The job search you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => router.push('/dashboard/jobs')}>
              Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSkillAdd = () => {
    if (newSkill && !criteria.skills?.find((s: any) => s.name === newSkill)) {
      setCriteria((prev: any) => ({
        ...prev,
        skills: [...(prev.skills || []), { name: newSkill, importance: 'NICE_TO_HAVE' }]
      }));
      setNewSkill('');
    }
  };

  const handleLocationAdd = () => {
    if (newLocation && !criteria.location?.includes(newLocation)) {
      setCriteria((prev: any) => ({
        ...prev,
        location: [...(prev.location || []), newLocation]
      }));
      setNewLocation('');
    }
  };

  const handleIndustryAdd = () => {
    if (newIndustry && !criteria.industryExperience?.includes(newIndustry)) {
      setCriteria((prev: any) => ({
        ...prev,
        industryExperience: [...(prev.industryExperience || []), newIndustry]
      }));
      setNewIndustry('');
    }
  };

  const handleLanguageAdd = () => {
    if (newLanguage && !criteria.languageRequirements?.find((l: any) => l.language === newLanguage)) {
      setCriteria((prev: any) => ({
        ...prev,
        languageRequirements: [...(prev.languageRequirements || []), { language: newLanguage, proficiency: 'Conversational' }]
      }));
      setNewLanguage('');
    }
  };
  
  const removeSkill = (skillName: string) => {
    setCriteria((prev: any) => ({
      ...prev,
      skills: prev.skills?.filter((skill: any) => skill.name !== skillName)
    }));
  };

  const removeLocation = (locationName: string) => {
    setCriteria((prev: any) => ({
      ...prev,
      location: prev.location?.filter((loc: any) => loc !== locationName)
    }));
  };

  const removeIndustry = (industryName: string) => {
    setCriteria((prev: any) => ({
      ...prev,
      industryExperience: prev.industryExperience?.filter((ind: any) => ind !== industryName)
    }));
  };

  const removeLanguage = (languageName: string) => {
    setCriteria((prev: any) => ({
      ...prev,
      languageRequirements: prev.languageRequirements?.filter((lang: any) => lang.language !== languageName)
    }));
  };

  // Count of must-have skills
  const mustHaveCount = criteria.skills?.filter((s: any) => s.importance === 'MUST_HAVE').length || 0;

  const handleActivateSearch = async () => {
    setIsActivating(true);
    try {
      const result = await startJobSearch({ 
        jobSearchId: params.id
      });

      if (result.error) {
        toast.error(`Failed to activate search: ${result.error}`);
      } else if (result.runId && result.accessToken) {
        toast.success("Job search activated! Redirecting...");
        router.push(`/dashboard/jobs/${params.id}?runId=${result.runId}&accessToken=${result.accessToken}`);
      } else {
        toast.error("Failed to activate search. Invalid response from server.");
      }
    } catch (error: any) {
      toast.error(`An unexpected error occurred: ${error.message}`);
    }
    setIsActivating(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader title="Refine Job Search" />
      <JobsDraftBackground>
        <div className="container mx-auto w-full max-w-screen-xl py-6 md:py-8">
          {/* Enhanced Page Header */}
          <Card className="mb-6 md:mb-8 bg-card/70 border shadow-lg rounded-xl overflow-hidden backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Refine Your Job Search
                </h1>
                {isSaving && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-lg sm:text-xl font-medium text-primary">
                    {jobSearch.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    AI-generated search criteria | Status: {jobSearch.status}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => router.push('/dashboard/jobs')}>
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    Back to Jobs
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(criteria.location || []).map((loc: string) => (
                  <Badge key={loc} variant="outline" className="bg-background/80 border-border text-foreground">
                    {loc}
                  </Badge>
                ))}
                <Badge variant="outline" className="bg-background/80 border-border text-foreground">
                  {criteria.employmentType || 'Full-time'}
                </Badge>
                {criteria.salary && (
                  <Badge variant="outline" className="bg-background/80 border-border text-foreground">
                    €{criteria.salary.min?.toLocaleString()} - €{criteria.salary.max?.toLocaleString()}
                  </Badge>
                )}
                {mustHaveCount > 0 && (
                  <Badge variant="default" className="bg-primary/80 text-primary-foreground">
                    {mustHaveCount} must-have skill{mustHaveCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Area */}
            <div className="lg:w-2/3 space-y-6">
              {/* Core Job Details Card */}
              <Card className="bg-card border shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/50 border-b px-6 py-4">
                  <CardTitle className="flex items-center text-xl text-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary mr-3 font-semibold">
                      1
                    </div>
                    Core Job Details
                  </CardTitle>
                  <CardDescription className="pl-11 text-muted-foreground">
                    Define the fundamental aspects of your ideal candidate search
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="text-base font-medium text-foreground">Job Title</Label>
                    <Input 
                      id="jobTitle" 
                      value={criteria.title || jobSearch.title} 
                      onChange={(e) => setCriteria((prev: any) => ({ ...prev, title: e.target.value }))} 
                      className="text-lg font-medium h-12 bg-background/50 border-border focus:bg-background focus:border-primary"
                      placeholder="Enter job title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Location(s)</Label>
                    <div className="flex flex-wrap gap-2 mb-3 min-h-6">
                      {(criteria.location || []).map((loc: string) => (
                        <Badge 
                          key={loc} 
                          variant="secondary" 
                          className="text-sm py-1.5 pl-3 pr-2 bg-muted hover:bg-muted/80 transition-colors group text-foreground"
                        >
                          {loc}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 ml-1 rounded-full opacity-60 group-hover:opacity-100 text-muted-foreground hover:text-foreground" 
                            onClick={() => removeLocation(loc)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      {(!criteria.location || criteria.location.length === 0) && (
                        <p className="text-sm text-muted-foreground">No locations added yet</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="Add location (e.g., Berlin, Remote)"
                        className="flex-1 bg-background/50 border-border focus:bg-background focus:border-primary"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newLocation) {
                            e.preventDefault();
                            handleLocationAdd();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleLocationAdd} 
                        variant="secondary"
                        disabled={!newLocation}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Skills & Technologies</Label>
                    <div className="space-y-3">
                      {(criteria.skills || []).map((skill: any, index: number) => (
                        <div key={skill.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1">
                              <div className="font-medium text-foreground">{skill.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {skill.importance === 'MUST_HAVE' ? 'Must-have skill' : 'Nice-to-have skill'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                checked={skill.importance === 'MUST_HAVE'}
                                onCheckedChange={(checked) => {
                                  setCriteria((prev: any) => ({
                                    ...prev,
                                    skills: prev.skills.map((s: any, i: number) => 
                                      i === index ? { ...s, importance: checked ? 'MUST_HAVE' : 'NICE_TO_HAVE' } : s
                                    )
                                  }));
                                }}
                              />
                              <Label className="text-sm text-muted-foreground">Must-have</Label>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                            onClick={() => removeSkill(skill.name)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 pt-1">
                      <Input 
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add new skill (e.g., Python, AWS, UI/UX)"
                        className="flex-1 bg-background/50 border-border focus:bg-background focus:border-primary"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newSkill) {
                            e.preventDefault();
                            handleSkillAdd();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleSkillAdd} 
                        variant="secondary"
                        disabled={!newSkill}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Skill
                      </Button>
                    </div>
                    
                    {(!criteria.skills || criteria.skills.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-6 border border-dashed border-border rounded-lg bg-muted/30">
                        <PlusCircle className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Add skills that are relevant for this position
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={handleActivateSearch}
                  disabled={isActivating}
                  className="flex-1 sm:flex-none"
                  size="lg"
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Activating Search...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Activate Job Search
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/jobs')}
                  size="lg"
                >
                  Save Draft & Continue Later
                </Button>
              </div>
            </div>

            {/* Right Sidebar - Live Preview */}
            <div className="lg:w-1/3">
              <Card className="bg-card border shadow-lg rounded-xl overflow-hidden sticky top-6">
                <CardHeader className="bg-muted/50 border-b px-4 py-3">
                  <CardTitle className="text-lg text-foreground flex items-center">
                    Live Candidate Preview
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Top matching candidates based on your current criteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {demoCandidates.map((candidate) => (
                    <div key={candidate.id} className="p-3 bg-muted/30 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-foreground text-sm">{candidate.anonymizedName}</div>
                        <Badge variant="default" className="text-xs">
                          {candidate.matchScore}% Match
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {candidate.experienceSummary}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        📍 {candidate.location}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {candidate.topSkills.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.topSkills.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.topSkills.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </JobsDraftBackground>
    </div>
  );
} 