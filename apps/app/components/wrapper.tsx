"use client";

import { useSession } from "@/lib/auth-client";
import { sites } from "@/lib/sites";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	ArrowRightIcon,
	Building2Icon,
	CreditCardIcon,
	MessageSquareIcon,
	UploadCloudIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DeprecationBanner } from "./deprecation-banner";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

const navLinks = [
	{ href: sites.web, label: "Company", icon: Building2Icon, external: true },
	{
		href: `${sites.upload}/upload?ref=nav`,
		label: "Upload",
		icon: UploadCloudIcon,
		external: true,
	},
	{
		href: `${sites.web}/pricing`,
		label: "Pricing",
		icon: CreditCardIcon,
		external: true,
	},
	{
		href: `${sites.web}/contact`,
		label: "Contact",
		icon: MessageSquareIcon,
		external: true,
	},
];

const footerProductLinks = [
	{ name: "Company", href: sites.web },
	{ name: "Upload", href: `${sites.upload}/upload?ref=nav` },
	{ name: "Pricing", href: `${sites.web}/pricing` },
	{ name: "Contact", href: `${sites.web}/contact` },
];

const footerLegalLinks = [
	{ name: "Privacy policy", href: `${sites.web}/legal/privacy` },
];

const headerNavButtonClassName =
	"h-9 w-9 shrink-0 gap-0 px-0 md:w-auto md:px-3";
const headerActionButtonClassName =
	"h-9 w-9 shrink-0 gap-2 px-0 sm:w-auto sm:min-w-[8.5rem] sm:px-4";

function BrandedShell({ children }: { children: React.ReactNode }) {
	const { data: session } = useSession();
	const accountHref = session?.session ? "/dashboard/account" : "/sign-in";
	const accountLabel = session?.session ? "Dashboard" : "Sign in";

	return (
		<div className="flex min-h-screen flex-col bg-backdrop">
			<div className="sticky top-0 z-50">
				<DeprecationBanner />
				<header className="public-navbar border-b bg-backdrop/90 backdrop-blur-sm">
				<div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-x px-4 py-3">
					<Link href="/" aria-label="Hir3d recruiter portal home">
						<Logo showName className="[&_span]:hidden sm:[&_span]:inline" />
					</Link>

					<nav
						aria-label="Main"
						className="flex items-center justify-center gap-0.5 md:gap-1"
					>
						{navLinks.map(({ href, label, icon: Icon, external }) => (
							<Button
								key={label}
								variant="ghost"
								className={headerNavButtonClassName}
								asChild
							>
								{external ? (
									<a href={href} aria-label={label}>
										<Icon className="size-4 md:hidden" aria-hidden="true" />
										<span className="hidden md:inline">{label}</span>
									</a>
								) : (
									<Link href={href} aria-label={label}>
										<Icon className="size-4 md:hidden" aria-hidden="true" />
										<span className="hidden md:inline">{label}</span>
									</Link>
								)}
							</Button>
						))}
					</nav>

					<div className="flex items-center justify-end gap-1">
						<Button className={headerActionButtonClassName} asChild>
							<Link href={accountHref} aria-label={accountLabel}>
								<span className="hidden sm:inline">{accountLabel}</span>
								<ArrowRightIcon className="size-4" aria-hidden="true" />
							</Link>
						</Button>
						<ThemeToggle />
					</div>
				</div>
				</header>
			</div>

			<main className="mx-auto w-full max-w-7xl flex-1 border-x bg-background">
				{children}
			</main>

			<footer className="border-t bg-backdrop">
				<div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-10 border-x px-4 py-10 sm:grid-cols-4">
					<div className="col-span-2 flex flex-col items-start gap-4">
						<Link href="/" className="inline-flex">
							<Logo showName />
						</Link>
						<p className="max-w-xs text-sm text-muted-foreground">
							AI-assisted recruiting and candidate discovery.
						</p>
						<p className="text-sm text-muted-foreground">
							&copy; Hir3d {new Date().getFullYear()}. All rights reserved.
						</p>
					</div>
					<div className="flex flex-col gap-3 text-sm">
						<p className="font-medium">Product</p>
						{footerProductLinks.map((link) => (
							<a
								key={link.name}
								href={link.href}
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								{link.name}
							</a>
						))}
					</div>
					<div className="flex flex-col gap-3 text-sm">
						<p className="font-medium">Legal</p>
						{footerLegalLinks.map((link) => (
							<a
								key={link.name}
								href={link.href}
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								{link.name}
							</a>
						))}
					</div>
				</div>
			</footer>
		</div>
	);
}

export function Wrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
		return (
			<>
				<div className="sticky top-0 z-[60]">
					<DeprecationBanner />
				</div>
				{children}
			</>
		);
	}

	return <BrandedShell>{children}</BrandedShell>;
}

const queryClient = new QueryClient();

export function WrapperWithQuery({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
