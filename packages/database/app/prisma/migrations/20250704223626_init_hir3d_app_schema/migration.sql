-- CreateTable
CREATE TABLE `Candidate` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `websiteUrl` VARCHAR(191) NULL,
    `linkedinUrl` VARCHAR(191) NULL,
    `originalCvBlobUri` VARCHAR(191) NULL,
    `extractedTextBlobUri` VARCHAR(191) NULL,
    `cvUploadTimestamp` DATETIME(3) NULL,
    `cvSource` ENUM('CANDIDATE_UPLOAD', 'MANUAL_ENTRY', 'LINKEDIN_SCRAPE', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `aiAnalysisStatus` ENUM('PENDING', 'PARSING_CV', 'EXTRACTING_TEXT', 'ANALYZING_DATA', 'INDEXING', 'COMPLETED', 'ERROR_PARSING', 'ERROR_ANALYSIS') NOT NULL DEFAULT 'PENDING',
    `aiLastProcessedAt` DATETIME(3) NULL,
    `aiExtractedSkills` JSON NULL,
    `aiExtractedExperience` JSON NULL,
    `aiExtractedEducation` JSON NULL,
    `aiTags` JSON NULL,
    `aiSummary` TEXT NULL,
    `overallRankingScore` DOUBLE NULL,
    `managingOrganizationId` VARCHAR(191) NULL,

    UNIQUE INDEX `Candidate_email_key`(`email`),
    INDEX `Candidate_aiAnalysisStatus_idx`(`aiAnalysisStatus`),
    INDEX `Candidate_managingOrganizationId_idx`(`managingOrganizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CandidateNote` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `content` TEXT NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,

    INDEX `CandidateNote_candidateId_idx`(`candidateId`),
    INDEX `CandidateNote_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobSearch` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT_CREATED', 'PARSING_PROMPT', 'DRAFT_READY', 'PREVIEWING_MATCHES', 'ACTIVE', 'PAUSED', 'ARCHIVED', 'ERROR_PARSING_PROMPT', 'ERROR_ACTIVATING') NOT NULL DEFAULT 'DRAFT_CREATED',
    `naturalLanguagePrompt` TEXT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `creatorUserId` VARCHAR(191) NOT NULL,
    `activatedAt` DATETIME(3) NULL,
    `pausedAt` DATETIME(3) NULL,
    `archivedAt` DATETIME(3) NULL,
    `lastProcessingStep` VARCHAR(191) NULL,
    `processingProgress` JSON NULL,

    INDEX `JobSearch_organizationId_idx`(`organizationId`),
    INDEX `JobSearch_creatorUserId_idx`(`creatorUserId`),
    INDEX `JobSearch_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobSearchCriteria` (
    `id` VARCHAR(191) NOT NULL,
    `jobSearchId` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `criteriaData` JSON NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `JobSearchCriteria_jobSearchId_key`(`jobSearchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobCandidateMatch` (
    `id` VARCHAR(191) NOT NULL,
    `jobSearchId` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `matchScore` DOUBLE NOT NULL,
    `isShortlisted` BOOLEAN NOT NULL DEFAULT false,
    `shortlistedAt` DATETIME(3) NULL,
    `isHidden` BOOLEAN NOT NULL DEFAULT false,
    `hiddenAt` DATETIME(3) NULL,
    `statusForJob` VARCHAR(191) NULL,
    `recruiterNotes` TEXT NULL,
    `matchDetailsJson` JSON NULL,

    INDEX `JobCandidateMatch_isShortlisted_idx`(`isShortlisted`),
    INDEX `JobCandidateMatch_isHidden_idx`(`isHidden`),
    UNIQUE INDEX `JobCandidateMatch_jobSearchId_candidateId_key`(`jobSearchId`, `candidateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SavedSearchAlert` (
    `id` VARCHAR(191) NOT NULL,
    `jobSearchId` VARCHAR(191) NOT NULL,
    `alertName` VARCHAR(191) NOT NULL,
    `alertFrequency` VARCHAR(191) NOT NULL DEFAULT 'IMMEDIATE',
    `lastAlertSentAt` DATETIME(3) NULL,
    `isNotificationEnabled` BOOLEAN NOT NULL DEFAULT true,
    `userId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SavedSearchAlert_jobSearchId_key`(`jobSearchId`),
    INDEX `SavedSearchAlert_userId_idx`(`userId`),
    INDEX `SavedSearchAlert_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `templateCriteria` JSON NOT NULL,
    `creatorUserId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `JobTemplate_name_key`(`name`),
    INDEX `JobTemplate_organizationId_idx`(`organizationId`),
    INDEX `JobTemplate_creatorUserId_idx`(`creatorUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromotedJob` (
    `id` VARCHAR(191) NOT NULL,
    `jobSearchId` VARCHAR(191) NOT NULL,
    `promotionStart` DATETIME(3) NOT NULL,
    `promotionEnd` DATETIME(3) NOT NULL,
    `budget` DECIMAL(10, 2) NULL,
    `status` VARCHAR(191) NOT NULL,
    `performanceData` JSON NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PromotedJob_jobSearchId_key`(`jobSearchId`),
    INDEX `PromotedJob_organizationId_idx`(`organizationId`),
    INDEX `PromotedJob_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobAnalyticsSnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `jobSearchId` VARCHAR(191) NOT NULL,
    `snapshotDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `totalMatches` INTEGER NOT NULL,
    `newMatchesToday` INTEGER NOT NULL,
    `shortlistedCount` INTEGER NOT NULL,
    `analyticsData` JSON NULL,
    `organizationId` VARCHAR(191) NOT NULL,

    INDEX `job_date_idx`(`jobSearchId`, `snapshotDate`),
    INDEX `JobAnalyticsSnapshot_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CandidateNote` ADD CONSTRAINT `CandidateNote_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobSearchCriteria` ADD CONSTRAINT `JobSearchCriteria_jobSearchId_fkey` FOREIGN KEY (`jobSearchId`) REFERENCES `JobSearch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobCandidateMatch` ADD CONSTRAINT `JobCandidateMatch_jobSearchId_fkey` FOREIGN KEY (`jobSearchId`) REFERENCES `JobSearch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobCandidateMatch` ADD CONSTRAINT `JobCandidateMatch_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedSearchAlert` ADD CONSTRAINT `SavedSearchAlert_jobSearchId_fkey` FOREIGN KEY (`jobSearchId`) REFERENCES `JobSearch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotedJob` ADD CONSTRAINT `PromotedJob_jobSearchId_fkey` FOREIGN KEY (`jobSearchId`) REFERENCES `JobSearch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobAnalyticsSnapshot` ADD CONSTRAINT `JobAnalyticsSnapshot_jobSearchId_fkey` FOREIGN KEY (`jobSearchId`) REFERENCES `JobSearch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
