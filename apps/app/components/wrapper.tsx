"use client";

import { useSession } from "@/lib/auth-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ArrowRightIcon, Building2Icon, CreditCardIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

const navLinks = [
	{ href: "https://hir3d-web.vercel.app", label: "Company", icon: Building2Icon },
	{ href: "/pricing", label: "Pricing", icon: CreditCardIcon },
];

const headerNavButtonClassName = "w-10 px-0 md:w-24 md:px-4";
const headerActionButtonClassName = "w-9 px-0 sm:w-28 sm:px-4";

function BrandedShell({ children }: { children: React.ReactNode }) {
	const { data: session } = useSession();
	const accountHref = session?.session ? "/dashboard/account" : "/sign-in";

	return (
		<div className="flex min-h-screen flex-col bg-backdrop">
			<header className="public-navbar sticky top-0 z-50 border-b bg-backdrop/90 backdrop-blur-sm">
				<div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-x px-4 py-3">
					<Link href="/" aria-label="Hir3d recruiter portal home">
						<Logo showName className="[&_span]:hidden sm:[&_span]:inline" />
					</Link>

					<nav aria-label="Main" className="flex items-center justify-center">
						{navLinks.map(({ href, label, icon: Icon }) => (
							<Button
								key={href}
								variant="ghost"
								className={headerNavButtonClassName}
								asChild
							>
								<Link href={href}>
									<Icon className="h-4 w-4 md:hidden" aria-hidden="true" />
									<span className="hidden md:inline">{label}</span>
									<span className="sr-only md:hidden">{label}</span>
								</Link>
							</Button>
						))}
					</nav>

					<div className="flex items-center justify-end gap-1">
						<Button className={headerActionButtonClassName} asChild>
							<Link href={accountHref}>
								<span className="hidden sm:inline">{session?.session ? "Dashboard" : "Sign in"}</span>
								<ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
								<span className="sr-only sm:hidden">{session?.session ? "Dashboard" : "Sign in"}</span>
							</Link>
						</Button>
						<ThemeToggle />
					</div>
				</div>
			</header>

			<main className="mx-auto w-full max-w-7xl flex-1 border-x bg-background">
				{children}
			</main>

			<footer className="border-t bg-backdrop">
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-5 border-x px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Link href="/" className="inline-flex">
							<Logo showName />
						</Link>
						<p className="mt-2 text-sm text-muted-foreground">AI-assisted recruiting and candidate discovery.</p>
					</div>
					<p className="text-sm text-muted-foreground">&copy; Hir3d {new Date().getFullYear()}. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}

function LegacyShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative flex min-h-screen w-full justify-center bg-white bg-grid-small-black/[0.2] dark:bg-black dark:bg-grid-small-white/[0.2]">
			<div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] md:flex dark:bg-black" />
			<div className="absolute z-50 flex w-full items-center justify-between border-b border-border bg-white px-4 py-2 lg:w-8/12 md:px-1 dark:bg-black">
				<Link href="/">
					<Logo showName />
				</Link>
				<ThemeToggle />
			</div>
			<div className="mt-20 w-full lg:w-7/12">{children}</div>
		</div>
	);
}

export function Wrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
		return children;
	}

	if (pathname === "/" || pathname === "/sign-in") {
		return <BrandedShell>{children}</BrandedShell>;
	}

	return <LegacyShell>{children}</LegacyShell>;
}

const queryClient = new QueryClient();

export function WrapperWithQuery({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
