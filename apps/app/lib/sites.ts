export const sites = {
	web: process.env.NEXT_PUBLIC_WEB_URL ?? "https://hir3d-web.vercel.app",
	app: process.env.NEXT_PUBLIC_APP_URL ?? "https://hir3d-app.vercel.app",
	upload:
		process.env.NEXT_PUBLIC_UPLOAD_URL ?? "https://hir3d-upload.vercel.app",
} as const;
