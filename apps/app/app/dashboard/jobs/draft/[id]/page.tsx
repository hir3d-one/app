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
import { cn } from '@/lib/utils';  // Assuming this utility exists for conditional classes

// Demo Data Structures
interface JobDraft {
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

// Demo Data
const initialJobDraft: JobDraft = {
  id: 'demo-draft-123',
  title: 'Senior React Developer',
  locations: ['Berlin', 'Remote'],
  employmentType: 'Full-time',
  salaryMin: 80000,
  salaryMax: 95000,
  keySkills: [
    { name: 'React', mustHave: true, minExperience: 5 },
    { name: 'TypeScript', mustHave: true, minExperience: 4 },
    { name: 'Node.js', mustHave: false, minExperience: 3 },
    { name: 'GraphQL', mustHave: false },
  ],
  totalYearsExperience: [5, 10],
  educationLevel: 'Bachelors',
  industryExperience: ['SaaS', 'FinTech'],
  languageRequirements: [
    { name: 'English', proficiency: 'Fluent' },
    { name: 'German', proficiency: 'Conversational' },
  ],
  keywords: 'Frontend development, agile methodologies, REST APIs, UI/UX principles',
};

const demoCandidates: Candidate[] = [
  { id: 'cand1', anonymizedName: 'Candidate #12A4B', matchScore: 92, topSkills: ['React', 'TypeScript'], experienceSummary: '7 YOE, Senior Frontend', location: 'Berlin' },
  { id: 'cand2', anonymizedName: 'Candidate #XF38E', matchScore: 88, topSkills: ['React', 'Node.js'], experienceSummary: '6 YOE, Full-stack Dev', location: 'Remote' },
  { id: 'cand3', anonymizedName: 'Candidate #Z9K2P', matchScore: 85, topSkills: ['TypeScript', 'GraphQL'], experienceSummary: '5 YOE, Frontend Specialist', location: 'Munich (Remote option)' },
];

export default function JobDraftRefinePage({ params }: { params: { id: string } }) {
  const [jobDraft, setJobDraft] = useState<JobDraft>(initialJobDraft);
  const [newSkill, setNewSkill] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [isPreviewRefreshing, setIsPreviewRefreshing] = useState(false);

  // Auto-refresh preview (simulating server-side update on criteria change)
  useEffect(() => {
    // Skip first render
    const timer = setTimeout(() => {
      setIsPreviewRefreshing(true);
      // Simulate API call delay
      setTimeout(() => {
        setIsPreviewRefreshing(false);
      }, 800);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [jobDraft]);

  // In a real app, you'd fetch jobDraft based on params.id
  // For now, we use initialJobDraft and ignore params.id

  const handleSkillAdd = () => {
    if (newSkill && !jobDraft.keySkills.find(s => s.name === newSkill)) {
      setJobDraft(prev => ({
        ...prev,
        keySkills: [...prev.keySkills, { name: newSkill, mustHave: false }]
      }));
      setNewSkill('');
    }
  };

  const handleLocationAdd = () => {
    if (newLocation && !jobDraft.locations.includes(newLocation)) {
      setJobDraft(prev => ({ ...prev, locations: [...prev.locations, newLocation] }));
      setNewLocation('');
    }
  };
  
  const handleIndustryAdd = () => {
    if (newIndustry && !jobDraft.industryExperience.includes(newIndustry)) {
      setJobDraft(prev => ({ ...prev, industryExperience: [...prev.industryExperience, newIndustry] }));
      setNewIndustry('');
    }
  };

  const handleLanguageAdd = () => {
    if (newLanguage && !jobDraft.languageRequirements.find(l => l.name === newLanguage)) {
      setJobDraft(prev => ({
        ...prev,
        languageRequirements: [...prev.languageRequirements, { name: newLanguage, proficiency: 'Conversational' }]
      }));
      setNewLanguage('');
    }
  };
  
  const removeSkill = (skillName: string) => {
    setJobDraft(prev => ({
      ...prev,
      keySkills: prev.keySkills.filter(skill => skill.name !== skillName)
    }));
  };

  const removeLocation = (locationName: string) => {
    setJobDraft(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc !== locationName)
    }));
  };

  const removeIndustry = (industryName: string) => {
    setJobDraft(prev => ({
      ...prev,
      industryExperience: prev.industryExperience.filter(ind => ind !== industryName)
    }));
  };

  const removeLanguage = (languageName: string) => {
    setJobDraft(prev => ({
      ...prev,
      languageRequirements: prev.languageRequirements.filter(lang => lang.name !== languageName)
    }));
  };

  // Count of must-have skills
  const mustHaveCount = jobDraft.keySkills.filter(s => s.mustHave).length;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader title="Refine Job Search" />
      
      {/* Enhanced Page Header with AI-generated job title */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container px-4 py-8 mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1 text-foreground/90">
            Refine Your Job Search
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
            <div className="flex-1">
              <p className="text-lg sm:text-xl font-medium text-foreground/70">
                {jobDraft.title}
              </p>
              <p className="text-sm text-muted-foreground">
                AI-generated search criteria | <span className="inline-flex items-center"><Clock className="h-3 w-3 mr-1" /> Last updated just now</span>
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Button variant="outline" size="sm" className="h-8">
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Back to Prompt
              </Button>
              <Button size="sm" className="h-8">
                Save Changes
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {jobDraft.locations.map(loc => (
              <Badge key={loc} variant="outline" className="bg-background/80">
                {loc}
              </Badge>
            ))}
            <Badge variant="outline" className="bg-background/80">
              {jobDraft.employmentType}
            </Badge>
            <Badge variant="outline" className="bg-background/80">
              €{jobDraft.salaryMin.toLocaleString()} - €{jobDraft.salaryMax.toLocaleString()}
            </Badge>
            {mustHaveCount > 0 && (
              <Badge variant="outline" className="bg-background/80 text-primary">
                {mustHaveCount} must-have skill{mustHaveCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-6 lg:p-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="lg:w-2/3 space-y-6">
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-card border-b px-6">
                <CardTitle className="flex items-center text-xl">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                    1
                  </div>
                  Core Job Details
                </CardTitle>
                <CardDescription>
                  Define the fundamental aspects of your ideal candidate search
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-base font-medium">Job Title</Label>
                  <Input 
                    id="jobTitle" 
                    value={jobDraft.title} 
                    onChange={(e) => setJobDraft(prev => ({ ...prev, title: e.target.value }))} 
                    className="text-lg font-medium h-12"
                    placeholder="Enter job title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="locations" className="text-base font-medium">Location(s)</Label>
                  <div className="flex flex-wrap gap-2 mb-3 min-h-6">
                    {jobDraft.locations.map(loc => (
                      <Badge 
                        key={loc} 
                        variant="secondary" 
                        className="text-sm py-1.5 pl-3 pr-2 bg-secondary/50 hover:bg-secondary/70 transition-colors group"
                      >
                        {loc}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 ml-1 rounded-full opacity-60 group-hover:opacity-100" 
                          onClick={() => removeLocation(loc)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    {jobDraft.locations.length === 0 && (
                      <p className="text-sm text-muted-foreground">No locations added yet</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      id="newLocation"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Add location (e.g., Berlin, Remote)"
                      className="flex-1"
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
                      className="gap-1"
                      disabled={!newLocation}
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employmentType" className="text-base font-medium">Employment Type</Label>
                  <Select 
                    value={jobDraft.employmentType} 
                    onValueChange={(value) => setJobDraft(prev => ({ ...prev, employmentType: value as JobDraft['employmentType'] }))}
                  >
                    <SelectTrigger id="employmentType" className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base font-medium">Salary/Compensation Range (€)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="salaryMin" className="text-sm text-muted-foreground">Minimum</Label>
                      <Input 
                        id="salaryMin"
                        type="number" 
                        placeholder="Min" 
                        value={jobDraft.salaryMin}
                        onChange={(e) => setJobDraft(prev => ({ ...prev, salaryMin: parseInt(e.target.value) || 0 }))}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="salaryMax" className="text-sm text-muted-foreground">Maximum</Label>
                      <Input 
                        id="salaryMax"
                        type="number" 
                        placeholder="Max" 
                        value={jobDraft.salaryMax}
                        onChange={(e) => setJobDraft(prev => ({ ...prev, salaryMax: parseInt(e.target.value) || 0 }))}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Suggested range: €{(jobDraft.salaryMin * 0.9).toLocaleString(undefined, {maximumFractionDigits: 0})} - €{(jobDraft.salaryMax * 1.1).toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-card border-b px-6">
                <CardTitle className="flex items-center text-xl">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                    2
                  </div>
                  Skills & Experience
                </CardTitle>
                <CardDescription>
                  Define the technical skills and experience level required for this role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <Label htmlFor="keySkills" className="text-base font-medium">Key Skills/Technologies</Label>
                    <span className="text-sm text-muted-foreground">
                      {jobDraft.keySkills.filter(s => s.mustHave).length} must-have, {jobDraft.keySkills.length - jobDraft.keySkills.filter(s => s.mustHave).length} nice-to-have
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {jobDraft.keySkills.map((skill, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "flex items-center gap-3 p-3 border rounded-lg transition-all",
                          skill.mustHave ? "border-primary/30 bg-primary/5" : "border-border"
                        )}
                      >
                        <div className="flex-grow">
                          <Input 
                            value={skill.name}
                            onChange={(e) => {
                              const updatedSkills = [...jobDraft.keySkills];
                              updatedSkills[index].name = e.target.value;
                              setJobDraft(prev => ({ ...prev, keySkills: updatedSkills }));
                            }}
                            className={cn(
                              "border-none bg-transparent px-0 h-auto text-base focus-visible:ring-0",
                              skill.mustHave ? "font-medium" : ""
                            )}
                            placeholder="Skill or technology name"
                          />
                        </div>
                        
                        <div className="flex items-center min-w-[120px]">
                          <div className={cn(
                            "flex h-9 items-center rounded-md border border-input px-3 mr-2",
                            skill.mustHave ? "border-primary/40" : ""
                          )}>
                            <Input 
                              type="number" 
                              placeholder="YoE" 
                              className="w-12 border-none h-auto p-0 focus-visible:ring-0"
                              value={skill.minExperience || ''}
                              onChange={(e) => {
                                const updatedSkills = [...jobDraft.keySkills];
                                updatedSkills[index].minExperience = parseInt(e.target.value) || undefined;
                                setJobDraft(prev => ({ ...prev, keySkills: updatedSkills }));
                              }}
                            />
                            <span className="text-xs text-muted-foreground ml-1">years</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 min-w-[110px]">
                            <Checkbox 
                              id={`mustHave-${index}`}
                              checked={skill.mustHave}
                              onCheckedChange={(checked) => {
                                const updatedSkills = [...jobDraft.keySkills];
                                updatedSkills[index].mustHave = !!checked;
                                setJobDraft(prev => ({ ...prev, keySkills: updatedSkills }));
                              }}
                              className={cn(
                                skill.mustHave ? "border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" : ""
                              )}
                            />
                            <Label htmlFor={`mustHave-${index}`} className="text-sm cursor-pointer">
                              Must-have
                            </Label>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                          onClick={() => removeSkill(skill.name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <Input 
                      id="newSkill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add new skill (e.g., Python, AWS, UI/UX)"
                      className="flex-1"
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
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Skill
                    </Button>
                  </div>
                  
                  {jobDraft.keySkills.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 border border-dashed rounded-lg bg-muted/20">
                      <PlusCircle className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Add skills that are relevant for this position
                      </p>
                      <p className="text-xs text-muted-foreground max-w-md text-center mt-1">
                        Mark key skills as "Must-have" to ensure candidates have the essential qualifications
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 pt-2">
                  <Label className="text-base font-medium">
                    Total Years of Professional Experience: {jobDraft.totalYearsExperience[0]} - {jobDraft.totalYearsExperience[1]} years
                  </Label>
                  <Slider
                    defaultValue={[5, 10]}
                    min={0}
                    max={30}
                    step={1}
                    value={jobDraft.totalYearsExperience}
                    onValueChange={(value) => setJobDraft(prev => ({ ...prev, totalYearsExperience: value as [number, number] }))}
                    className="my-5"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground px-2">
                    <span>Entry Level</span>
                    <span>Mid-Level</span>
                    <span>Senior</span>
                    <span>Expert</span>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <Label htmlFor="educationLevel" className="text-base font-medium">Education Level (Optional)</Label>
                    <Select
                      value={jobDraft.educationLevel}
                      onValueChange={(value) => setJobDraft(prev => ({ ...prev, educationLevel: value as JobDraft['educationLevel']}))}
                    >
                      <SelectTrigger id="educationLevel" className="h-11">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bachelors">Bachelor's</SelectItem>
                        <SelectItem value="Masters">Master's</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Vocational">Vocational</SelectItem>
                        <SelectItem value="Self-taught">Self-taught</SelectItem>
                        <SelectItem value="none">None Specified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="industryExperience" className="text-base font-medium">Industry Experience (Optional)</Label>
                    <div className="flex flex-wrap gap-2 mb-3 min-h-7">
                      {jobDraft.industryExperience.map(industry => (
                        <Badge key={industry} variant="outline" className="text-sm py-1.5 pl-3 pr-2 hover:bg-muted transition-colors group">
                          {industry}
                          <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 rounded-full opacity-60 group-hover:opacity-100" onClick={() => removeIndustry(industry)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      {jobDraft.industryExperience.length === 0 && (
                        <p className="text-sm text-muted-foreground">No industries specified</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        id="newIndustry"
                        value={newIndustry}
                        onChange={(e) => setNewIndustry(e.target.value)}
                        placeholder="Add industry (e.g., FinTech, Healthcare)"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newIndustry) {
                            e.preventDefault();
                            handleIndustryAdd();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleIndustryAdd} 
                        variant="outline"
                        disabled={!newIndustry}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-card border-b px-6">
                <CardTitle className="flex items-center text-xl">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                    3
                  </div>
                  Other Criteria
                </CardTitle>
                <CardDescription>
                  Add additional requirements and preferences for the ideal candidate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-3">
                  <Label htmlFor="languageRequirements" className="text-base font-medium">Language Requirements</Label>
                  <div className="space-y-3">
                    {jobDraft.languageRequirements.map((lang, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-grow">
                          <Input 
                            value={lang.name}
                            onChange={(e) => {
                              const updatedLangs = [...jobDraft.languageRequirements];
                              updatedLangs[index].name = e.target.value;
                              setJobDraft(prev => ({ ...prev, languageRequirements: updatedLangs }));
                            }}
                            className="border-none bg-transparent px-0 h-auto text-base focus-visible:ring-0"
                            placeholder="Language name"
                          />
                        </div>
                        
                        <Select
                          value={lang.proficiency}
                          onValueChange={(value) => {
                            const updatedLangs = [...jobDraft.languageRequirements];
                            updatedLangs[index].proficiency = value as Language['proficiency'];
                            setJobDraft(prev => ({ ...prev, languageRequirements: updatedLangs }));
                          }}
                        >
                          <SelectTrigger className="min-w-[160px] h-9 border-input">
                            <SelectValue placeholder="Proficiency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Basic">Basic</SelectItem>
                            <SelectItem value="Conversational">Conversational</SelectItem>
                            <SelectItem value="Fluent">Fluent</SelectItem>
                            <SelectItem value="Native">Native</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                          onClick={() => removeLanguage(lang.name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <Input 
                      id="newLanguage"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add language (e.g., Spanish, Japanese)"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newLanguage) {
                          e.preventDefault();
                          handleLanguageAdd();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleLanguageAdd} 
                      variant="outline"
                      disabled={!newLanguage}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Language
                    </Button>
                  </div>
                  
                  {jobDraft.languageRequirements.length === 0 && (
                    <div className="flex items-center justify-center py-6 border border-dashed rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground">
                        No language requirements specified
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 pt-1">
                  <Label htmlFor="keywords" className="text-base font-medium">Keywords/Responsibilities (Advanced)</Label>
                  <Textarea 
                    id="keywords" 
                    value={jobDraft.keywords}
                    onChange={(e) => setJobDraft(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="Enter specific keywords or phrases that should appear in candidate profiles..."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add specific responsibilities, tools, methodologies, or other keywords relevant to this position
                  </p>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-3 mt-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-md">Must-Have Criteria Summary</CardTitle>
                  </div>
                  <div className="pl-11">
                    <div className="space-y-2">
                      {jobDraft.keySkills.filter(s => s.mustHave).length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Skills and Experience:</p>
                          <div className="flex flex-wrap gap-2">
                            {jobDraft.keySkills.filter(s => s.mustHave).map(s => (
                              <Badge key={s.name} variant="default" className="bg-primary/80 hover:bg-primary px-3 py-1">
                                {s.name}{s.minExperience ? ` (${s.minExperience}+ yrs)` : ''}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Candidates must have all of these skills to be considered
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 py-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No "must-have" skills specified yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="sticky bottom-8 mt-8 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <Button variant="outline" className="w-full sm:w-auto order-2 sm:order-1">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Prompt
                </Button>
                <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
                  <Button variant="secondary" className="flex-1 sm:flex-none">
                    Save Draft
                  </Button>
                  <Button className="flex-1 sm:flex-none gap-1">
                    Preview Full List & Activate
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            <Card className="sticky top-24 border-none shadow-md overflow-hidden">
              <CardHeader className="bg-card border-b px-6">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Live Candidate Preview</CardTitle>
                    <CardDescription>Top Matching Candidates</CardDescription>
                  </div>
                  {isPreviewRefreshing && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Updating</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 max-h-[calc(100vh-220px)] overflow-y-auto">
                <div className="p-2">
                  {demoCandidates.length > 0 ? (
                    <div className="divide-y">
                      {demoCandidates.map(candidate => (
                        <div key={candidate.id} className="p-4 transition-colors hover:bg-muted/30">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{candidate.anonymizedName}</h3>
                              <p className="text-xs text-muted-foreground leading-tight">
                                {candidate.experienceSummary}
                              </p>
                            </div>
                            <Badge 
                              variant={getMatchScoreBadgeVariant(candidate.matchScore)} 
                              className="ml-2 font-medium"
                              title="Match score based on your criteria"
                            >
                              {candidate.matchScore}%
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                              <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                            </svg>
                            <span>{candidate.location}</span>
                          </div>
                          
                          <div>
                            <div className="flex gap-1 flex-wrap mb-1.5">
                              {candidate.topSkills.map(skill => {
                                const isRequired = jobDraft.keySkills.find(s => 
                                  s.name.toLowerCase() === skill.toLowerCase() && s.mustHave
                                );
                                return (
                                  <Badge 
                                    key={skill} 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs py-0 px-1.5 border",
                                      isRequired ? "border-primary/30 bg-primary/5 text-primary" : "border-muted"
                                    )}
                                  >
                                    {skill}
                                    {isRequired && <span className="inline-block w-1 h-1 rounded-full bg-primary ml-1"></span>}
                                  </Badge>
                                );
                              })}
                            </div>
                            
                            <div className="text-xs flex items-center text-muted-foreground mt-2">
                              <span className="text-xs text-primary flex items-center mr-3">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Meets all must-have criteria
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-10">
                      <p className="text-sm text-muted-foreground">No candidates match the current criteria.</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-muted/30 p-5 border-t">
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">Candidate Pool Insights</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm items-center">
                        <span>Total Matches</span>
                        <span className="font-medium">{demoCandidates.length}</span>
                      </div>
                      
                      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-primary transition-all" 
                          style={{ 
                            width: `${Math.min(100, (demoCandidates.length / 10) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                        <span>Limited pool</span>
                        <span>Optimal</span>
                        <span>Very large</span>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4 bg-card">
                      <h4 className="font-medium text-sm mb-2">Feedback & Guidance:</h4>
                      <div className="text-sm space-y-3">
                        {demoCandidates.length === 0 && (
                          <p className="text-sm">Your criteria might be too specific. Try broadening some skills or reducing experience requirements.</p>
                        )}
                        {demoCandidates.length > 5 && (
                          <p className="text-sm">Many candidates match! Consider adding more "Must-have" skills or refining experience levels for a more targeted search.</p>
                        )}
                        {demoCandidates.length > 0 && demoCandidates.length <= 5 && (
                          <p className="text-sm">You have a good number of matches. Adjust criteria to fine-tune your candidate pool.</p>
                        )}
                        
                        {jobDraft.keySkills.filter(s => s.mustHave).length === 0 && (
                          <div className="flex items-start gap-2 pt-2 text-amber-600 dark:text-amber-500">
                            <AlertCircle className="h-4 w-4 mt-0.5" />
                            <p>Consider marking essential skills as "Must-have" to ensure candidates meet core requirements.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to determine badge variant based on match score
function getMatchScoreBadgeVariant(score: number) {
  if (score >= 90) return "default";
  if (score >= 80) return "secondary";
  return "outline";
} 