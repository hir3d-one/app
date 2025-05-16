import { flag } from 'flags/next';

// Feature flag for Promote Jobs section
export const showPromoteJobsFeature = flag({
  key: 'promote-jobs-feature',
  decide() {
    // Default to false, integrate with your flag provider later
    return false;
  },
});

// Feature flag for Analytics section
export const showAnalyticsFeature = flag({
  key: 'analytics-feature',
  decide() {
    // Default to false, integrate with your flag provider later
    return false;
  },
}); 