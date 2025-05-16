"use client";

import * as React from 'react';

export interface DashboardFlags {
  showPromoteJobs: boolean;
  showAnalytics: boolean;
}

export const DashboardFlagsContext = React.createContext<DashboardFlags | undefined>(undefined);

export const useDashboardFlags = () => {
  const context = React.useContext(DashboardFlagsContext);
  if (context === undefined) {
    throw new Error('useDashboardFlags must be used within a DashboardFlagsProvider');
  }
  return context;
};

export const DashboardFlagsProvider: React.FC<React.PropsWithChildren<{ flags: DashboardFlags }>> = ({ children, flags }) => {
  return (
    <DashboardFlagsContext.Provider value={flags}>
      {children}
    </DashboardFlagsContext.Provider>
  );
}; 