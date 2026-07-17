import type { NextConfig } from "next";

const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "https://hir3d-web.vercel.app";

const nextConfig: NextConfig = {
	serverExternalPackages: ["@libsql/client"],
	redirects: async () => [
		{
			source: "/pricing",
			destination: `${webUrl}/pricing`,
			permanent: true,
		},
	],
};

export default nextConfig;
