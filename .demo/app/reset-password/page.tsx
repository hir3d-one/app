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
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { client } from "@/lib/auth-client";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function ResetPasswordPage() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [token, setToken] = useState<string | null>(null);
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const resetToken = searchParams.get("token");
		if (resetToken) {
			setToken(resetToken);
		} else {
			toast.error("Invalid or missing reset token.");
			router.push("/login");
		}
	}, [searchParams, router]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}
		if (password.length < 8) {
			toast.error("Password must be at least 8 characters long.");
			return;
		}
		if (!token) {
			toast.error("Reset token is missing.");
			return;
		}

		setIsLoading(true);
		try {
			const res = await client.resetPassword({ newPassword: password, token });
			if (res.error) {
				toast.error(res.error.message || "Failed to reset password.");
			} else {
				toast.success("Password reset successfully!");
				router.push("/login?message=reset_success");
			}
		} catch (error: any) {
			toast.error(error?.message || "An unexpected error occurred.");
		} finally {
			setIsLoading(false);
		}
	}

	if (!token) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center p-4">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Reset Password</CardTitle>
					<CardDescription>
						Enter and confirm your new password below.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="password">New Password</Label>
							<PasswordInput
								id="password"
								value={password}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
								autoComplete="new-password"
								placeholder="Enter new password (min. 8 characters)"
								required
								className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="confirmPassword">Confirm New Password</Label>
							<PasswordInput
								id="confirmPassword"
								value={confirmPassword}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
								autoComplete="new-password"
								placeholder="Confirm your new password"
								required
								className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
							/>
						</div>
						<Button className="w-full" type="submit" disabled={isLoading}>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Reset Password
						</Button>
					</form>
				</CardContent>
				<CardFooter className="text-center text-sm">
					<Link href="/login">
						<Button variant="link" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
							Back to Sign In
						</Button>
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
