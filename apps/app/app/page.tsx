import { SignInButton, SignInFallback } from "@/components/sign-in-btn";
import { Button } from "@/components/ui/button";
import {
	ArrowUpRightIcon,
	BarChart3Icon,
	FileSearchIcon,
	SearchCheckIcon,
	ShieldCheckIcon,
	UsersRoundIcon,
	WorkflowIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const features = [
	{
		icon: SearchCheckIcon,
		title: "AI candidate search",
		description: "Move from job requirements to a focused shortlist without the manual sourcing grind.",
	},
	{
		icon: FileSearchIcon,
		title: "Resume intelligence",
		description: "Understand candidate fit with consistent, contextual analysis across every CV.",
	},
	{
		icon: UsersRoundIcon,
		title: "Team workspaces",
		description: "Keep hiring teams aligned around jobs, candidates, and next actions in one place.",
	},
	{
		icon: BarChart3Icon,
		title: "Hiring analytics",
		description: "See how your pipeline is moving and where the recruiting process needs attention.",
	},
	{
		icon: WorkflowIcon,
		title: "Structured workflows",
		description: "Turn repeatable hiring steps into a clear process your whole team can follow.",
	},
	{
		icon: ShieldCheckIcon,
		title: "Secure access",
		description: "Protect candidate data with controlled team access and modern authentication.",
	},
];

export default async function Home() {
	return (
		<div className="divide-y">
			<section className="p-4">
				<div className="rounded-xl border bg-background px-6 py-16 text-center shadow-sm sm:px-12 sm:py-24 lg:py-28">
					<div className="mx-auto flex max-w-5xl flex-col items-center">
						<Link
							href="https://hir3d-web.vercel.app"
							className="flex max-w-full items-center gap-2 rounded-full border bg-foreground/[0.03] px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							<span className="truncate">The recruiter workspace from HIR3D</span>
							<ArrowUpRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
						</Link>
						<h1 className="mt-8 text-[2.125rem] font-semibold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
							Find stronger candidates. Build better teams.
						</h1>
						<p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground sm:text-lg">
							HIR3D brings AI-assisted search, resume analysis, and structured hiring workflows into one focused recruiter portal.
						</p>
						<div className="mt-8 flex w-full max-w-lg flex-col items-center justify-center gap-3 sm:flex-row">
							<div className="[&_a]:w-full sm:[&_a]:w-auto [&_button]:h-11 [&_button]:px-8">
								<Suspense fallback={<SignInFallback />}>
									<SignInButton />
								</Suspense>
							</div>
							<Button variant="outline" size="lg" asChild>
								<Link href="https://hir3d-web.vercel.app">Explore HIR3D</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			<section className="px-4 py-16 sm:py-20">
				<div className="mx-auto max-w-5xl">
					<div className="grid gap-8 md:grid-cols-2 md:items-end">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Recruiting, made focused</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-tighter sm:text-5xl">
								Everything your hiring team needs to move faster
							</h2>
						</div>
						<p className="text-lg text-muted-foreground">
							Spend less time moving information between tools and more time making confident hiring decisions.
						</p>
					</div>

					<div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{features.map(({ icon: Icon, title, description }) => (
							<article key={title} className="rounded-xl border bg-card p-6 shadow-sm">
								<div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg border bg-foreground/[0.03]">
									<Icon className="h-5 w-5" aria-hidden="true" />
								</div>
								<h3 className="font-semibold tracking-tight">{title}</h3>
								<p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="p-4">
				<div className="grid gap-6 rounded-xl border bg-background p-8 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:p-12">
					<div>
						<h2 className="text-3xl font-semibold tracking-tighter sm:text-4xl">Ready to build your next shortlist?</h2>
						<p className="mt-3 max-w-2xl text-muted-foreground">Sign in to open the recruiter workspace and continue where your hiring team left off.</p>
					</div>
					<div className="[&_button]:h-11 [&_button]:px-8">
						<Suspense fallback={<SignInFallback />}>
							<SignInButton />
						</Suspense>
					</div>
				</div>
			</section>
		</div>
	);
}
