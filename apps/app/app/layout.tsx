import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Wrapper, WrapperWithQuery } from "@/components/wrapper";
import { createMetadata, organizationJsonLd } from "@/lib/metadata";
import { OpenPanelComponent } from "@openpanel/nextjs";

export const metadata = createMetadata({
	title: "Recruiter Portal",
	description: "AI-assisted recruiting, candidate discovery, and hiring workflows.",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
				/>
			</head>
			<body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
				{process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID ? (
					<OpenPanelComponent
						clientId={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID}
						trackScreenViews
						trackOutgoingLinks
						trackAttributes
					/>
				) : null}
				<ThemeProvider attribute="class" defaultTheme="dark">
					<Wrapper>
						<WrapperWithQuery>{children}</WrapperWithQuery>
					</Wrapper>
					<Toaster richColors closeButton />
				</ThemeProvider>
			</body>
		</html>
	);
}
