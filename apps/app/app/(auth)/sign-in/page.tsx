"use client";

import SignIn from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2Icon, LogIn, UserPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInPageContent() {
	const searchParams = useSearchParams();
	const view = searchParams.get("view");

	return (
		<section className="p-4">
			<div className="grid overflow-hidden rounded-xl border bg-background shadow-sm lg:grid-cols-[1fr_440px]">
				<div className="flex flex-col justify-between border-b p-8 sm:p-12 lg:border-b-0 lg:border-r lg:p-16">
					<div>
						<p className="text-sm font-medium text-muted-foreground">HIR3D recruiter portal</p>
						<h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tighter sm:text-5xl">
							Welcome back to better hiring.
						</h1>
						<p className="mt-5 max-w-lg text-muted-foreground sm:text-lg">
							Sign in to search candidates, analyze resumes, and keep your hiring team moving in one focused workspace.
						</p>
					</div>
					<div className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-1">
						{["AI-assisted candidate search", "Shared hiring workflows", "Secure recruiter access"].map((item) => (
							<div key={item} className="flex items-center gap-3">
								<CheckCircle2Icon className="h-4 w-4" aria-hidden="true" />
								<span>{item}</span>
							</div>
						))}
					</div>
				</div>

				<div className="flex items-center justify-center bg-foreground/[0.015] p-5 sm:p-8">
					<div className="w-full max-w-[400px]">
						<Tabs defaultValue={view === "sign-up" ? "sign-up" : "sign-in"}>
							<ScrollArea>
								<TabsList className="mb-2 gap-1 bg-transparent">
									<TabsTrigger
										value="sign-in"
										className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
									>
										<LogIn
											className="-ms-0.5 me-1.5 opacity-60"
											size={16}
											strokeWidth={2}
											aria-hidden="true"
										/>
										Sign In
									</TabsTrigger>
									<TabsTrigger
										value="sign-up"
										className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
									>
										<UserPlus
											className="-ms-0.5 me-1.5 opacity-60"
											size={16}
											strokeWidth={2}
											aria-hidden="true"
										/>
										Sign Up
									</TabsTrigger>
								</TabsList>
								<ScrollBar orientation="horizontal" />
							</ScrollArea>
							<TabsContent value="sign-in">
								<SignIn />
							</TabsContent>
							<TabsContent value="sign-up">
								<SignUp />
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</div>
		</section>
	);
}

export default function Page() {
	return (
		<Suspense fallback={null}>
			<SignInPageContent />
		</Suspense>
	);
}
