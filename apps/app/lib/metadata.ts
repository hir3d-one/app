import type { Metadata } from "next";

type MetadataGenerator = {
	title: string;
	description: string;
	image?: string;
};

const applicationName = "Hir3d";
const productionUrl =
	process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "hir3d-app.vercel.app";
const protocol = productionUrl.includes("localhost") ? "http" : "https";

export const siteUrl = new URL(`${protocol}://${productionUrl}`);

export const organizationJsonLd = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: applicationName,
	url: siteUrl.toString(),
	logo: new URL("/favicon.ico", siteUrl).toString(),
	sameAs: ["https://github.com/hir3d-one", "https://x.com/dani_duese"],
};

export function createMetadata({
	title,
	description,
	image = "/og.png",
}: MetadataGenerator): Metadata {
	const brandedTitle = `${applicationName} · ${title}`;
	const socialImage = new URL(image, siteUrl).toString();

	return {
		title: brandedTitle,
		description,
		applicationName,
		authors: [{ name: applicationName, url: siteUrl.toString() }],
		creator: applicationName,
		metadataBase: siteUrl,
		icons: {
			icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
		},
		keywords: [
			"AI recruiting",
			"candidate discovery",
			"resume analysis",
			"talent sourcing",
			"hiring software",
		],
		formatDetection: {
			telephone: false,
		},
		appleWebApp: {
			capable: true,
			statusBarStyle: "default",
			title: applicationName,
		},
		openGraph: {
			type: "website",
			siteName: applicationName,
			locale: "en_US",
			url: siteUrl.toString(),
			title: brandedTitle,
			description,
			images: [
				{
					url: socialImage,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		},
		publisher: applicationName,
		twitter: {
			card: "summary_large_image",
			creator: "@dani_duese",
			title: brandedTitle,
			description,
			images: [socialImage],
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	};
}
