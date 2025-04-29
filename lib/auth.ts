import { betterAuth } from "better-auth";
import {
	bearer,
	admin,
	multiSession,
	organization,
	twoFactor,
	oneTap,
	oAuthProxy,
	openAPI,
	oidcProvider,
	customSession,
} from "better-auth/plugins";
import { reactInvitationEmail } from "./email/invitation";
import { reactResetPasswordEmail } from "./email/reset-password";
import { resend } from "./email/resend";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "better-auth/plugins/passkey";
import { stripe } from "@better-auth/stripe";
import { Stripe } from "stripe";

const from = process.env.BETTER_AUTH_EMAIL || "delivered@resend.dev";
const to = process.env.TEST_EMAIL || "";

const postgresUrl = process.env.POSTGRES_URL;

if (!postgresUrl) {
	throw new Error("POSTGRES_URL environment variable is not set.");
}

const pool = new Pool({
	connectionString: postgresUrl,
});

const dialect = new PostgresDialect({
	pool,
});

const PROFESSION_PRICE_ID = {
	default: "price_1QxWZ5LUjnrYIrml5Dnwnl0X",
	annual: "price_1QxWZTLUjnrYIrmlyJYpwyhz",
};
const STARTER_PRICE_ID = {
	default: "price_1QxWWtLUjnrYIrmleljPKszG",
	annual: "price_1QxWYqLUjnrYIrmlonqPThVF",
};

export const auth = betterAuth({
	appName: "Better Auth Demo",
	database: {
		dialect,
		type: "postgres",
	},
	emailVerification: {
		async sendVerificationEmail({ user, url }: { user: { email: string }, url: string }) {
			const res = await resend.emails.send({
				from,
				to: to || user.email,
				subject: "Verify your email address",
				html: `<a href="${url}">Verify your email address</a>`,
			});
			console.log(res, user.email);
		},
	},
	account: {
		accountLinking: {
			trustedProviders: ["google", "github", "demo-app"],
		},
	},
	emailAndPassword: {
		enabled: true,
		async sendResetPassword({ user, url }: { user: { email: string }, url: string }) {
			await resend.emails.send({
				from,
				to: user.email,
				subject: "Reset your password",
				react: reactResetPasswordEmail({
					username: user.email,
					resetLink: url,
				}),
			});
		},
	},
	socialProviders: {
		// facebook: {
		// 	clientId: process.env.FACEBOOK_CLIENT_ID || "",
		// 	clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
		// },
		// github: {
		// 	clientId: process.env.GITHUB_CLIENT_ID || "",
		// 	clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
		// },
		// google: {
		// 	clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
		// 	clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		// },
		// discord: {
		// 	clientId: process.env.DISCORD_CLIENT_ID || "",
		// 	clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
		// },
		// microsoft: {
		// 	clientId: process.env.MICROSOFT_CLIENT_ID || "",
		// 	clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
		// },
		// twitch: {
		// 	clientId: process.env.TWITCH_CLIENT_ID || "",
		// 	clientSecret: process.env.TWITCH_CLIENT_SECRET || "",
		// },
		// twitter: {
		// 	clientId: process.env.TWITTER_CLIENT_ID || "",
		// 	clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
		// },
	},
	plugins: [
		organization({
			async sendInvitationEmail(data: {
				email: string;
				id: string;
				inviter: { user: { name?: string | null; email: string } };
				organization: { name: string };
			}) {
				await resend.emails.send({
					from,
					to: data.email,
					subject: "You've been invited to join an organization",
					react: reactInvitationEmail({
						username: data.email,
						invitedByUsername: data.inviter.user.name ?? undefined,
						invitedByEmail: data.inviter.user.email,
						teamName: data.organization.name,
						inviteLink:
							process.env.NODE_ENV === "development"
								? `http://localhost:3000/accept-invitation/${data.id}`
								: `${
										process.env.BETTER_AUTH_URL ||
										"https://demo.better-auth.com"
									}/accept-invitation/${data.id}`,
					}),
				});
			},
		}),
		twoFactor({
			otpOptions: {
				async sendOTP({ user, otp }: { user: { email: string }, otp: string }) {
					await resend.emails.send({
						from,
						to: user.email,
						subject: "Your OTP",
						html: `Your OTP is ${otp}`,
					});
				},
			},
		}),
		passkey(),
		openAPI(),
		bearer(),
		admin({
			adminUserIds: ["EXD5zjob2SD6CBWcEQ6OpLRHcyoUbnaB"],
		}),
		multiSession(),
		oAuthProxy(),
		nextCookies(),
		oidcProvider({
			loginPage: "/sign-in",
		}),
		oneTap(),
		customSession(async (session: any) => {
			return {
				...session,
				user: {
					...session.user,
					dd: "test",
				},
			};
		}),
		stripe({
			stripeClient: new Stripe(process.env.STRIPE_KEY || "sk_test_"),
			stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
			subscription: {
				enabled: true,
				plans: [
					{
						name: "Starter",
						priceId: STARTER_PRICE_ID.default,
						annualDiscountPriceId: STARTER_PRICE_ID.annual,
						freeTrial: {
							days: 7,
						},
					},
					{
						name: "Professional",
						priceId: PROFESSION_PRICE_ID.default,
						annualDiscountPriceId: PROFESSION_PRICE_ID.annual,
					},
					{
						name: "Enterprise",
					},
				],
			},
		}),
	],
	trustedOrigins: ["exp://"],
});
