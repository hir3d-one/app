"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { signIn } from "@/lib/auth-client";
import { Key, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const redirectUrl = "/dashboard/account";

export default function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	return (
		<Card className="z-50 max-w-md rounded-lg">
			<CardHeader>
				<CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
				<CardDescription className="text-xs md:text-sm">
					Enter your email below to login to your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						await signIn.email({
							email,
							password,
							callbackURL: redirectUrl,
							fetchOptions: {
								onResponse: () => {
									setLoading(false);
								},
								onRequest: () => {
									setLoading(true);
								},
								onError: (ctx) => {
									toast.error(ctx.error.message);
									setLoading(false);
								},
								onSuccess: async () => {
									router.push(redirectUrl);
								},
							},
						});
					}}
				>
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
								onChange={(e) => {
									setEmail(e.target.value);
								}}
								value={email}
							/>
						</div>
						<div className="grid gap-2">
							<div className="flex items-center">
								<Label htmlFor="password">Password</Label>
								<Link
									href="/forget-password"
									className="ml-auto inline-block text-sm underline"
									tabIndex={-1}
								>
									Forgot your password?
								</Link>
							</div>
							<PasswordInput
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="password"
								placeholder="Password"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Checkbox
								id="remember"
								onClick={() => {
									setRememberMe(!rememberMe);
								}}
							/>
							<Label htmlFor="remember">Remember me</Label>
						</div>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? <Loader2 size={16} className="animate-spin" /> : "Login"}
						</Button>

						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								className="w-full gap-2"
								onClick={async () => {
									await signIn.social({
										provider: "google",
										callbackURL: redirectUrl,
									});
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1.2em"
									height="1.2em"
									viewBox="0 0 24 24"
								>
									<path
										fill="currentColor"
										d="M12.545 12.151h7.346c.096.486.145.983.145 1.487c0 2.602-.946 4.804-2.601 6.361c-1.655 1.557-3.857 2.344-6.152 2.344c-2.411 0-4.605-.945-6.233-2.573c-1.628-1.628-2.573-3.822-2.573-6.233s.945-4.605 2.573-6.233c1.628-1.628 3.822-2.573 6.233-2.573c2.394 0 4.402.838 5.982 2.472l-2.521 2.521c-.925-.95-2.197-1.441-3.461-1.441c-1.466 0-2.714.52-3.745 1.552c-1.031 1.031-1.552 2.279-1.552 3.745s.521 2.714 1.552 3.745c1.031 1.031 2.279 1.552 3.745 1.552c1.143 0 2.106-.299 2.875-.89c.77-.591 1.302-1.413 1.567-2.469h-4.442z"
									/>
								</svg>
							</Button>
							<Button
								type="button"
								variant="outline"
								className="w-full gap-2"
								onClick={async () => {
									await signIn.social({
										provider: "github",
										callbackURL: redirectUrl,
									});
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1.2em"
									height="1.2em"
									viewBox="0 0 24 24"
								>
									<path
										fill="currentColor"
										d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
									/>
								</svg>
							</Button>
							<Button
								type="button"
								variant="outline"
								className="w-full gap-2"
								onClick={async () => {
									await signIn.social({
										provider: "microsoft",
										callbackURL: redirectUrl,
									});
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1.2em"
									height="1.2em"
									viewBox="0 0 24 24"
								>
									<path
										fill="currentColor"
										d="M2 3h9v9H2zm9 19H2v-9h9zM21 3v9h-9V3zm0 19h-9v-9h9z"
									/>
								</svg>
							</Button>
						</div>

						<Button
							type="button"
							variant="outline"
							className="gap-2"
							onClick={async () => {
								await signIn.passkey({
									fetchOptions: {
										onSuccess() {
											router.push(redirectUrl);
										},
										onError(ctx) {
											toast.error(ctx.error.message);
										},
									},
								});
							}}
						>
							<Key size={16} />
							Sign-in with Passkey
						</Button>
					</div>
				</form>
			</CardContent>
			<CardFooter className="flex flex-col gap-4">
				<div className="text-center text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link href="/sign-in?view=sign-up" className="text-primary hover:underline">
						Sign up
					</Link>
				</div>
			</CardFooter>
		</Card>
	);
}
