"use client";

import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, PlusCircle, SearchIcon, FilterIcon, ListFilter, ArrowUpDown, MoreHorizontal, FileText, Edit3, Copy, Play, Archive as ArchiveIcon, Trash2, Megaphone, ListChecks, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDashboardFlags } from "@/contexts/dashboard-flags-context";

interface Job {
  id: string;
  title: string;
  status: "Active" | "Paused" | "Archived" | "Draft";
  createdDate: string;
  lastUpdated: string;
  matches: number;
  shortlisted: number;
  isPromoted?: boolean;
}

interface UtilityBarProps {
  onDetailedSearch: (query: string) => void;
  onFilter: (filterName: "owner" | "department", value: string) => void;
  onSort: (value: string) => void;
  onBulkAction: (action: string, value?: boolean) => void;
  selectedRowCount: number;
  initialSearchQuery?: string;
}

const UtilityBar: React.FC<UtilityBarProps> = ({ onDetailedSearch, onFilter, onSort, onBulkAction, selectedRowCount, initialSearchQuery }) => {
  return (
    <div className="my-4 p-3.5 border border-neutral-800 rounded-lg bg-neutral-900/80 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="relative flex-grow md:flex-grow-0 md:w-1/3 lg:w-2/5">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            type="search"
            placeholder="Search by title or ID..."
            className="pl-10 w-full h-9 bg-neutral-800 border-neutral-700 text-neutral-300 placeholder:text-neutral-500 focus:ring-neutral-600 focus:border-neutral-600"
            onChange={(e) => onDetailedSearch(e.target.value)}
            defaultValue={initialSearchQuery}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          <Select onValueChange={(value) => onFilter("owner", value)}>
            <SelectTrigger className="w-full md:w-auto h-9 bg-neutral-800 border-neutral-700 text-neutral-300 data-[placeholder]:text-neutral-500 focus:ring-neutral-600 focus:border-neutral-600">
              <SlidersHorizontal className="mr-2 h-4 w-4 opacity-70" /> 
              <SelectValue placeholder="Owner: All" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-300">
              <SelectItem value="all" className="hover:bg-neutral-700">All Owners</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => onFilter("department", value)}>
            <SelectTrigger className="w-full md:w-auto h-9 bg-neutral-800 border-neutral-700 text-neutral-300 data-[placeholder]:text-neutral-500 focus:ring-neutral-600 focus:border-neutral-600">
              <SlidersHorizontal className="mr-2 h-4 w-4 opacity-70" />
              <SelectValue placeholder="Department: All" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-300">
              <SelectItem value="all" className="hover:bg-neutral-700">All Departments</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:ml-auto">
          <Select onValueChange={onSort}>
            <SelectTrigger className="w-full md:w-auto h-9 bg-neutral-800 border-neutral-700 text-neutral-300 data-[placeholder]:text-neutral-500 focus:ring-neutral-600 focus:border-neutral-600">
              <ArrowUpDown className="mr-2 h-4 w-4 opacity-70" />
              <SelectValue placeholder="Sort by: Last updated (desc)" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-300">
              <SelectItem value="lastUpdatedDesc" className="hover:bg-neutral-700">Last updated (desc)</SelectItem>
              <SelectItem value="lastUpdatedAsc" className="hover:bg-neutral-700">Last updated (asc)</SelectItem>
              <SelectItem value="createdDesc" className="hover:bg-neutral-700">Created (desc)</SelectItem>
              <SelectItem value="createdAsc" className="hover:bg-neutral-700">Created (asc)</SelectItem>
              <SelectItem value="matchesDesc" className="hover:bg-neutral-700">Matches (desc)</SelectItem>
              <SelectItem value="matchesAsc" className="hover:bg-neutral-700">Matches (asc)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {selectedRowCount > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center gap-2">
          <Checkbox id="bulk-select-all" className="border-neutral-700 data-[state=checked]:bg-neutral-700 data-[state=checked]:text-neutral-300" onCheckedChange={(checked) => onBulkAction("selectAll", checked as boolean)} />
          <label htmlFor="bulk-select-all" className="text-sm font-medium text-neutral-400">
            {selectedRowCount} selected
          </label>
          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300" onClick={() => onBulkAction("pause")}>Pause</Button>
          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300" onClick={() => onBulkAction("archive")}>Archive</Button>
          <Button variant="destructive" size="sm" className="h-7 px-2.5 text-xs border-red-700/50 bg-red-900/50 hover:bg-red-800/60 text-red-300 hover:text-red-200" onClick={() => onBulkAction("delete")}>Delete</Button>
        </div>
      )}
    </div>
  );
};

const mockJobs: Job[] = [
  { id: "job1", title: "Senior Frontend Developer", status: "Active", createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: "2 hours ago", matches: 150, shortlisted: 25, isPromoted: true },
  { id: "job2", title: "UX Designer Pro", status: "Paused", createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: "1 day ago", matches: 75, shortlisted: 10 },
  { id: "job3", title: "Backend Engineer (Node.js)", status: "Archived", createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: "2 weeks ago", matches: 200, shortlisted: 5 },
  { id: "job4", title: "Product Manager - Mobile", status: "Draft", createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: "yesterday", matches: 0, shortlisted: 0 },
];

const JobActions: React.FC<{ job: Job }> = ({ job }) => {
  const actions = [
    { label: "View Matches", icon: FileText, onClick: () => console.log("View", job.id) },
    { label: "Edit", icon: Edit3, onClick: () => console.log("Edit", job.id) },
    { label: "Duplicate", icon: Copy, onClick: () => console.log("Duplicate", job.id) },
    { label: "Pause", icon: Play, onClick: () => console.log("Pause", job.id), hidden: job.status !== "Active" },
    { label: "Resume", icon: Play, onClick: () => console.log("Resume", job.id), hidden: job.status !== "Paused" },
    { label: "Archive", icon: ArchiveIcon, onClick: () => console.log("Archive", job.id), hidden: job.status === "Archived" },
    { label: "Promote", icon: Megaphone, onClick: () => console.log("Promote", job.id) },
    { label: "Delete", icon: Trash2, onClick: () => console.log("Delete", job.id), isDestructive: true },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-200">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-neutral-800 border-neutral-700 text-neutral-300">
        {actions.filter(action => !action.hidden).map((action) => (
          <DropdownMenuItem key={action.label} onClick={action.onClick} className={cn("hover:bg-neutral-700 focus:bg-neutral-700", action.isDestructive ? "text-red-500 hover:!text-red-400 focus:!text-red-400" : "")}>
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const StatusBadge: React.FC<{ status: Job["status"] }> = ({ status }) => {
  const statusStyles: Record<Job["status"], string> = {
    Active: "bg-green-700/30 text-green-300 border border-green-600/50",
    Paused: "bg-yellow-700/30 text-yellow-300 border border-yellow-600/50",
    Archived: "bg-neutral-700/30 text-neutral-400 border border-neutral-600/50",
    Draft: "bg-sky-700/30 text-sky-300 border border-sky-600/50",
  };
  return (
    <Badge variant="outline" className={cn("px-2.5 py-0.5 text-xs font-medium rounded-full capitalize", statusStyles[status])}>
      {status}
    </Badge>
  );
};

interface JobResultsTableProps {
  jobs: Job[];
  selectedRows: Set<string>;
  onRowSelect: (item: string | Set<string>) => void;
  showPromotedSection?: boolean;
}

const JobResultsTable: React.FC<JobResultsTableProps> = ({ jobs, selectedRows, onRowSelect, showPromotedSection }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  return (
    <Table className="text-neutral-300">
      <TableHeader className="border-b border-neutral-800">
        <TableRow className="hover:bg-neutral-900/0">
          <TableHead className="w-[50px] px-3">
            <Checkbox
              checked={selectedRows.size === jobs.length && jobs.length > 0}
              onCheckedChange={(checked: boolean | 'indeterminate') => onRowSelect(checked === true ? new Set(jobs.map(job => job.id)) : new Set())}
              aria-label="Select all rows"
              className="border-neutral-700 data-[state=checked]:bg-neutral-700 data-[state=checked]:text-neutral-300"
            />
          </TableHead>
          <TableHead className="text-neutral-400 font-medium">Title</TableHead>
          <TableHead className="text-neutral-400 font-medium">Status</TableHead>
          <TableHead className="text-neutral-400 font-medium">Created</TableHead>
          <TableHead className="text-neutral-400 font-medium">Last Updated</TableHead>
          <TableHead className="text-right text-neutral-400 font-medium">Matches</TableHead>
          <TableHead className="text-right text-neutral-400 font-medium">Shortlisted</TableHead>
          {showPromotedSection && <TableHead className="text-neutral-400 font-medium">Promoted</TableHead>}
          <TableHead className="text-right text-neutral-400 font-medium pr-3">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="border-neutral-800">
        {jobs.map((job: Job) => (
          <TableRow key={job.id} data-state={selectedRows.has(job.id) && "selected"} className="border-b border-neutral-800 hover:bg-neutral-900/50 data-[state=selected]:bg-neutral-800/70">
            <TableCell className="px-3">
              <Checkbox
                checked={selectedRows.has(job.id)}
                onCheckedChange={() => onRowSelect(job.id)}
                aria-label={`Select row ${job.id}`}
                className="border-neutral-700 data-[state=checked]:bg-neutral-700 data-[state=checked]:text-neutral-300"
              />
            </TableCell>
            <TableCell className="font-medium text-neutral-200">
              <Link href={`/dashboard/jobs/${job.id}/matches`} className="hover:underline flex items-center group">
                <Briefcase className="mr-2 h-4 w-4 text-neutral-500 group-hover:text-neutral-300 transition-colors" /> 
                {job.title}
              </Link>
            </TableCell>
            <TableCell><StatusBadge status={job.status} /></TableCell>
            <TableCell>{formatDate(job.createdDate)}</TableCell>
            <TableCell>{job.lastUpdated}</TableCell>
            <TableCell className="text-right">{job.matches}</TableCell>
            <TableCell className="text-right">{job.shortlisted}</TableCell>
            {showPromotedSection && (
              <TableCell>
                {job.isPromoted && (
                  <Badge variant="outline" className="flex items-center w-fit px-2 py-0.5 text-xs bg-purple-700/30 text-purple-300 border border-purple-600/50">
                    <Megaphone className="mr-1 h-3.5 w-3.5" /> Promoted
                  </Badge>
                )}
              </TableCell>
            )}
            <TableCell className="text-right pr-3"><JobActions job={job} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

interface JobResultsCardsProps {
  jobs: Job[];
  selectedRows: Set<string>;
  onRowSelect: (item: string | Set<string>) => void;
  showPromotedSection?: boolean;
}

const JobResultsCards: React.FC<JobResultsCardsProps> = ({ jobs, selectedRows, onRowSelect, showPromotedSection }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {jobs.map((job: Job) => (
        <Card key={job.id} className={cn("bg-neutral-900 border-neutral-800 text-neutral-300", selectedRows.has(job.id) && "ring-2 ring-neutral-500")}>
          <CardHeader className="flex flex-row items-start justify-between pb-2 gap-2">
            <div className="flex items-start space-x-3 flex-grow">
              <Checkbox
                  className="mt-1 border-neutral-700 data-[state=checked]:bg-neutral-700 data-[state=checked]:text-neutral-300"
                  checked={selectedRows.has(job.id)}
                  onCheckedChange={() => onRowSelect(job.id)}
              />
              <Link href={`/dashboard/jobs/${job.id}/matches`} className="hover:underline">
                <CardTitle className="text-base font-semibold text-neutral-200 leading-tight">{job.title}</CardTitle>
              </Link>
            </div>
            <JobActions job={job} />
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm pt-2 pl-10 pr-4 pb-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Status</span>
              <StatusBadge status={job.status} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Matches</span>
              <span>{job.matches}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Shortlisted</span>
              <span>{job.shortlisted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Last Updated</span>
              <span>{job.lastUpdated}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Created</span>
              <span>{formatDate(job.createdDate)}</span>
            </div>
            {showPromotedSection && job.isPromoted && (
              <div className="flex justify-start items-center pt-1">
                <Badge variant="outline" className="flex items-center px-2 py-0.5 text-xs bg-purple-700/30 text-purple-300 border border-purple-600/50">
                  <Megaphone className="mr-1 h-3.5 w-3.5" /> Promoted
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function JobsIndexPage() {
  const { showPromoteJobs: showPromotedSection } = useDashboardFlags();
  const [activeTab, setActiveTab] = React.useState("active");
  const [quickSearchQuery, setQuickSearchQuery] = React.useState("");
  const [detailedSearchQuery, setDetailedSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<{ status?: string; owner?: string; department?: string; }>({ status: "all" });
  const [sortOrder, setSortOrder] = React.useState("lastUpdatedDesc");
  const [selectedRows, setSelectedRows] = React.useState(new Set<string>());

  const handleQuickSearch = (query: string) => setQuickSearchQuery(query);
  const handleDetailedSearch = (query: string) => setDetailedSearchQuery(query);
  const handleFilter = (filterName: "status" | "owner" | "department", value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  const handleSort = (value: string) => setSortOrder(value);
  const handleBulkAction = (action: string, value?: boolean) => {
    console.log("Bulk action:", action, "Value:", value, "Selected:", Array.from(selectedRows));
    if (action === "selectAll") {
      const currentViewJobIds = displayedJobs.map(job => job.id);
      setSelectedRows(value ? new Set(currentViewJobIds) : new Set());
    }
  };

  const toggleRowSelection = (jobId: string) => {
    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(jobId)) newSelection.delete(jobId);
      else newSelection.add(jobId);
      return newSelection;
    });
  };

  const displayedJobs = React.useMemo(() => {
    let tempJobs = mockJobs;
    if (activeTab === "active") {
      tempJobs = tempJobs.filter(job => job.status === "Active" || job.status === "Paused" || job.status === "Draft");
    } else if (activeTab === "archived") {
      tempJobs = tempJobs.filter(job => job.status === "Archived");
    }
    if (typeof filters.status === 'string' && filters.status !== 'all') {
      const statusFilter = filters.status;
      tempJobs = tempJobs.filter(job => job.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (quickSearchQuery) {
      tempJobs = tempJobs.filter(job => 
        job.title.toLowerCase().includes(quickSearchQuery.toLowerCase())
      );
    }
    if (detailedSearchQuery) {
      tempJobs = tempJobs.filter(job => 
        job.title.toLowerCase().includes(detailedSearchQuery.toLowerCase()) ||
        job.id.toLowerCase().includes(detailedSearchQuery.toLowerCase())
      );
    }
    if (filters.owner && filters.owner !== 'all') { /* Placeholder */ }
    if (filters.department && filters.department !== 'all') { /* Placeholder */ }
    // TODO: Implement sorting based on sortOrder
    return tempJobs;
  }, [activeTab, filters, quickSearchQuery, detailedSearchQuery, sortOrder]);

  const handleRowSelect = (item: string | Set<string>) => {
    if (item instanceof Set) setSelectedRows(item);
    else toggleRowSelection(item);
  };

  return (
    <>
      <SiteHeader title="Job Searches" />
      <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4 bg-neutral-950 text-neutral-300 min-h-screen">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <Tabs defaultValue="active" className="w-auto" onValueChange={(value) => { setActiveTab(value); setSelectedRows(new Set()); }}>
            <TabsList className="bg-neutral-900 p-0.5 rounded-md border border-neutral-800">
              <TabsTrigger
                value="active"
                className="px-3 py-1 text-sm text-neutral-400 data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm rounded-[0.2rem] transition-all duration-150"
              >
                <ListChecks size={16} className="-ms-0.5 me-1.5" /> Active
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="px-3 py-1 text-sm text-neutral-400 data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm rounded-[0.2rem] transition-all duration-150"
              >
                <ArchiveIcon size={16} className="-ms-0.5 me-1.5" /> Archived
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2 flex-grow md:flex-grow-0 md:justify-end">
            <div className="relative flex-grow md:flex-grow-0 md:w-48 lg:w-56">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input 
                type="search" 
                placeholder="Search..."
                className="h-9 pl-9 w-full bg-neutral-800 border-neutral-700 text-neutral-300 placeholder:text-neutral-500 focus:ring-neutral-600 focus:border-neutral-600 rounded-md"
                onChange={(e) => handleQuickSearch(e.target.value)}
              />
            </div>
            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilter("status", value)}>
              <SelectTrigger className="h-9 w-auto md:w-[150px] bg-neutral-800 border-neutral-700 text-neutral-300 data-[placeholder]:text-neutral-500 focus:ring-neutral-600 focus:border-neutral-600 rounded-md">
                <ListFilter className="mr-2 h-4 w-4 opacity-70" /> 
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-300">
                <SelectItem value="all" className="hover:bg-neutral-700">All Statuses</SelectItem>
                <SelectItem value="Active" className="hover:bg-neutral-700">Active</SelectItem>
                <SelectItem value="Paused" className="hover:bg-neutral-700">Paused</SelectItem>
                <SelectItem value="Draft" className="hover:bg-neutral-700">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild className="h-9 bg-neutral-50 hover:bg-neutral-200 text-neutral-900 rounded-md shadow-sm">
              <Link href="/dashboard/jobs/create">
                <PlusCircle className="mr-1.5 h-4.5 w-4.5" /> New Job
              </Link>
            </Button>
          </div>
        </div>
        <UtilityBar 
          onDetailedSearch={handleDetailedSearch}
          initialSearchQuery={detailedSearchQuery} 
          onFilter={handleFilter} 
          onSort={handleSort} 
          onBulkAction={handleBulkAction} 
          selectedRowCount={selectedRows.size}
        />
        {displayedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <EmptyState
              title={activeTab === "active" ? "No Active Job Searches" : "No Archived Job Searches"}
              description={`Adjust your search or filter criteria, or create a new job search to get started.`}
              icons={[Briefcase]}
              className="bg-transparent border-neutral-800"
              action={activeTab === "active" ? {
                label: "Create New Job Search",
                onClick: () => window.location.href = "/dashboard/jobs/create",
              } : undefined}
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block border border-neutral-800 rounded-lg shadow-md overflow-hidden">
              <JobResultsTable jobs={displayedJobs} selectedRows={selectedRows} onRowSelect={handleRowSelect} showPromotedSection={showPromotedSection} />
            </div>
            <div className="block md:hidden">
              <JobResultsCards jobs={displayedJobs} selectedRows={selectedRows} onRowSelect={handleRowSelect} showPromotedSection={showPromotedSection} />
            </div>
          </>
        )}
      </div>
    </>
  );
} 