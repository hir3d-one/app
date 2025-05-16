"use client";

import { SiteHeader } from "@/components/site-header";
// import { AppSidebar } from "@/components/app-sidebar";
// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PlaceholdersAndVanishInputDemo } from "@/components/ui/placeholders-and-vanish-input";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import React from "react";

// Modified DotBackground to be a flexible container
function JobsCreateBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 w-full items-center justify-center bg-white dark:bg-black">
      <Spotlight
        className="-top-20 left-0 md:top-12 md:left-[24rem]"
        fill="white"
      />
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      <div className="relative z-20 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <>
      <SiteHeader title="Create New Job" />
      <div className="flex flex-1 flex-col">
        <JobsCreateBackground>
          <PlaceholdersAndVanishInputDemo />
        </JobsCreateBackground>
      </div>
    </>
  );
} 