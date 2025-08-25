"use server";

import { prisma } from "@hir3d/db-app";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Helper function to get active organization ID
async function getActiveOrganizationId() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    return null;
  }

  const organization = await auth.api.getFullOrganization({
    headers: await headers()
  });

  // For personal jobs, organizationId can be null
  return organization?.id || null;
}

// Get a single job search with its criteria and matches
export async function getJobSearch(jobSearchId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    return { error: "User not authenticated.", data: null };
  }

  const activeOrganizationId = await getActiveOrganizationId();

  try {
    // Build where clause based on whether we have an organization or not
    const whereClause: any = { id: jobSearchId };

    if (activeOrganizationId) {
      // User has an organization, ensure they can only access their org's job searches
      whereClause.organizationId = activeOrganizationId;
    } else {
      // Personal jobs - user can only access their own jobs
      whereClause.organizationId = null;
      whereClause.creatorUserId = session.user.id;
    }

    const jobSearch = await (prisma as any).jobSearch.findUnique({
      where: whereClause,
      include: {
        criteria: true,
        jobCandidateMatches: {
          include: {
            candidate: true
          },
          orderBy: {
            matchScore: 'desc'
          }
        }
      }
    });

    if (!jobSearch) {
      return { error: "Job search not found or access denied.", data: null };
    }

    return { error: null, data: jobSearch };
  } catch (error: any) {
    console.error("Error fetching job search:", error);
    return { error: "Failed to fetch job search.", data: null };
  }
}

// List all job searches for the user's organization
export async function listJobSearches(status?: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    return { error: "User not authenticated.", data: [] };
  }

  const activeOrganizationId = await getActiveOrganizationId();

  try {
    // Build where clause based on whether we have an organization or not
    const whereClause: any = {};

    if (activeOrganizationId) {
      whereClause.organizationId = activeOrganizationId;
    } else {
      // Personal jobs - user can only see their own jobs
      whereClause.organizationId = null;
      whereClause.creatorUserId = session.user.id;
    }

    if (status) {
      whereClause.status = status;
    }

    const jobSearches = await (prisma as any).jobSearch.findMany({
      where: whereClause,
      include: {
        criteria: true,
        _count: {
          select: {
            jobCandidateMatches: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { error: null, data: jobSearches };
  } catch (error: any) {
    console.error("Error listing job searches:", error);
    return { error: "Failed to fetch job searches.", data: [] };
  }
}

// Update job search criteria
export async function updateJobSearchCriteria(jobSearchId: string, criteriaData: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    return { error: "User not authenticated.", data: null };
  }

  const activeOrganizationId = await getActiveOrganizationId();

  try {
    // Build where clause based on whether we have an organization or not
    const whereClause: any = { id: jobSearchId };

    if (activeOrganizationId) {
      whereClause.organizationId = activeOrganizationId;
    } else {
      whereClause.organizationId = null;
      whereClause.creatorUserId = session.user.id;
    }

    // First verify the user can access this job search
    const jobSearch = await (prisma as any).jobSearch.findUnique({
      where: whereClause,
      include: { criteria: true }
    });

    if (!jobSearch) {
      return { error: "Job search not found or access denied.", data: null };
    }

    // Update the criteria
    const updatedCriteria = await (prisma as any).jobSearchCriteria.upsert({
      where: { jobSearchId },
      update: {
        criteriaData,
        version: { increment: 1 }
      },
      create: {
        jobSearchId,
        criteriaData,
        version: 1
      }
    });

    return { error: null, data: updatedCriteria };
  } catch (error: any) {
    console.error("Error updating job search criteria:", error);
    return { error: "Failed to update criteria.", data: null };
  }
}

// Update job search status
export async function updateJobSearchStatus(jobSearchId: string, status: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    return { error: "User not authenticated.", data: null };
  }

  const activeOrganizationId = await getActiveOrganizationId();

  try {
    // Build where clause based on whether we have an organization or not
    const whereClause: any = { id: jobSearchId };

    if (activeOrganizationId) {
      whereClause.organizationId = activeOrganizationId;
    } else {
      whereClause.organizationId = null;
      whereClause.creatorUserId = session.user.id;
    }

    const updateData: any = { status };

    // Add appropriate timestamp based on status
    switch (status) {
      case "ACTIVE":
        updateData.activatedAt = new Date();
        break;
      case "PAUSED":
        updateData.pausedAt = new Date();
        break;
      case "ARCHIVED":
        updateData.archivedAt = new Date();
        break;
    }

    const updatedJobSearch = await (prisma as any).jobSearch.update({
      where: whereClause,
      data: updateData
    });

    return { error: null, data: updatedJobSearch };
  } catch (error: any) {
    console.error("Error updating job search status:", error);
    return { error: "Failed to update job search status.", data: null };
  }
}

// Get job search matches with pagination
export async function getJobSearchMatches(jobSearchId: string, page: number = 1, limit: number = 20) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    return { error: "User not authenticated.", data: null };
  }

  const activeOrganizationId = await getActiveOrganizationId();

  try {
    // Build where clause based on whether we have an organization or not
    const whereClause: any = { id: jobSearchId };

    if (activeOrganizationId) {
      whereClause.organizationId = activeOrganizationId;
    } else {
      whereClause.organizationId = null;
      whereClause.creatorUserId = session.user.id;
    }

    // Verify access to job search
    const jobSearch = await (prisma as any).jobSearch.findUnique({
      where: whereClause
    });

    if (!jobSearch) {
      return { error: "Job search not found or access denied.", data: null };
    }

    const offset = (page - 1) * limit;

    const matches = await (prisma as any).jobCandidateMatch.findMany({
      where: { 
        jobSearchId,
        isHidden: false // Don't include hidden candidates
      },
      include: {
        candidate: true
      },
      orderBy: {
        matchScore: 'desc'
      },
      skip: offset,
      take: limit
    });

    const totalMatches = await (prisma as any).jobCandidateMatch.count({
      where: { 
        jobSearchId,
        isHidden: false
      }
    });

    return { 
      error: null, 
      data: {
        matches,
        totalMatches,
        page,
        limit,
        totalPages: Math.ceil(totalMatches / limit)
      }
    };
  } catch (error: any) {
    console.error("Error fetching job search matches:", error);
    return { error: "Failed to fetch matches.", data: null };
  }
}

// Update candidate status for a specific job (shortlist, hide, etc.)
export async function updateCandidateStatus(
  jobSearchId: string, 
  candidateId: string, 
  updates: {
    isShortlisted?: boolean;
    isHidden?: boolean;
    recruiterNotes?: string;
    statusForJob?: string;
  }
) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    return { error: "User not authenticated.", data: null };
  }

  const activeOrganizationId = await getActiveOrganizationId();

  try {
    // Build where clause based on whether we have an organization or not
    const whereClause: any = { id: jobSearchId };

    if (activeOrganizationId) {
      whereClause.organizationId = activeOrganizationId;
    } else {
      whereClause.organizationId = null;
      whereClause.creatorUserId = session.user.id;
    }

    // Verify access to job search
    const jobSearch = await (prisma as any).jobSearch.findUnique({
      where: whereClause
    });

    if (!jobSearch) {
      return { error: "Job search not found or access denied.", data: null };
    }

    const updateData: any = { ...updates };
    
    // Add timestamps
    if (updates.isShortlisted !== undefined) {
      updateData.shortlistedAt = updates.isShortlisted ? new Date() : null;
    }
    if (updates.isHidden !== undefined) {
      updateData.hiddenAt = updates.isHidden ? new Date() : null;
    }

    const updatedMatch = await (prisma as any).jobCandidateMatch.update({
      where: {
        jobSearchId_candidateId: {
          jobSearchId,
          candidateId
        }
      },
      data: updateData,
      include: {
        candidate: true
      }
    });

    return { error: null, data: updatedMatch };
  } catch (error: any) {
    console.error("Error updating candidate status:", error);
    return { error: "Failed to update candidate status.", data: null };
  }
} 