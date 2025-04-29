"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Define the Tab type for AnimatedTabs
export interface AnimatedTab {
	title: string;
	value: string;
	content: React.ReactNode;
}

// Props for the AnimatedTabs component
interface AnimatedTabsProps {
	tabs: AnimatedTab[];
	containerClassName?: string;
	activeTabClassName?: string;
	tabClassName?: string;
	contentClassName?: string;
    initialTabValue?: string; // Allow setting the initial active tab
}

export const AnimatedTabs = ({
	tabs: propTabs,
	containerClassName,
	activeTabClassName,
	tabClassName,
	contentClassName,
    initialTabValue,
}: AnimatedTabsProps) => {
    const initialActive = propTabs.find(tab => tab.value === initialTabValue) || propTabs[0];
	const [active, setActive] = useState<AnimatedTab>(initialActive);

	return (
		<div className="flex flex-col items-center w-full">
			<div
				className={cn(
					"flex flex-row items-center justify-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg mb-4 w-auto",
					containerClassName
				)}
			>
				{propTabs.map((tab) => (
					<button
						key={tab.value}
						onClick={() => setActive(tab)}
						className={cn(
							"relative px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200",
							tabClassName,
                            active.value !== tab.value && "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
						)}
					>
						{active.value === tab.value && (
							<motion.div
                                layoutId="active-animated-auth-tab" // Ensure unique layoutId
								transition={{ type: "spring", stiffness: 300, damping: 30 }}
								className={cn(
									"absolute inset-0 bg-background dark:bg-zinc-800 rounded-md shadow-sm",
									activeTabClassName
								)}
							/>
						)}
						<span className="relative z-10">{tab.title}</span>
					</button>
				))}
			</div>
			<div className={cn("w-full max-w-md", contentClassName)}>
				{/* Keep the active content rendered */} 
                {/* Optional: Add animation wrapper here if needed */}
				{active.content}
			</div>
		</div>
	);
}; 