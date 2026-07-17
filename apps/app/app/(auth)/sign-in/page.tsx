"use client";

import SignIn from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { Tabs } from "@/components/ui/tabs2";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2Icon } from "lucide-react";

export default function Page() {
	const router = useRouter();
	useEffect(() => {
		authClient.oneTap({
			fetchOptions: {
				onError: ({ error }) => {
					toast.error(error.message || "An error occurred");
				},
				onSuccess: () => {
					toast.success("Successfully signed in");
					router.push("/dashboard/account");
				},
			},
		});
	}, [router]);

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
					<Tabs
						containerClassName="mb-2 max-w-none justify-center border-0"
						activeTabClassName="rounded-full border bg-background shadow-sm"
						tabClassName="min-w-28"
						tabs={[
							{
								title: "Sign In",
								value: "sign-in",
								content: <SignIn />,
							},
							{
								title: "Sign Up",
								value: "sign-up",
								content: <SignUp />,
							},
						]}
					/>
				</div>
			</div>
			</div>
		</section>
	);
}
