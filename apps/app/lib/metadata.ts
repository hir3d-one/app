import type { Metadata } from "next/types";

export function createMetadata(override: Metadata): Metadata {
	return {
		...override,
		openGraph: {
			title: override.title ?? undefined,
			description: override.description ?? undefined,
			url: "https://hir3d-app.vercel.app",
			images: "https://hir3d-app.vercel.app/og.png",
			siteName: "Hir3d",
			...override.openGraph,
		},
		twitter: {
			card: "summary_large_image",
			creator: "@dani_duese",
			title: override.title ?? undefined,
			description: override.description ?? undefined,
			images: "https://hir3d-app.vercel.app/og.png",
			...override.twitter,
		},
	};
}

export const baseUrl =
	process.env.NODE_ENV === "development"
		? new URL("http://localhost:3000")
		: new URL(`https://${process.env.VERCEL_URL!}`);
