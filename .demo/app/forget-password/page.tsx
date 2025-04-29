"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { client } from "@/lib/auth-client";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgetPasswordPage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			await client.forgetPassword({ email, redirectTo: "/reset-password" });
			setIsSubmitted(true);
		} catch (error: any) {
			const message = error?.error?.message || error?.message || "Failed to send reset link.";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	};

	if (isSubmitted) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2"/>
						<CardTitle>Check Your Email</CardTitle>
						<CardDescription>
							We've sent a password reset link to {email}. If you don't see it, check your spam folder.
						</CardDescription>
					</CardHeader>
					<CardFooter>
						<Link href="/login" className="w-full">
                            <Button variant="outline" className="w-full">
							    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
                            </Button>
						</Link>
					</CardFooter>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Forgot Password</CardTitle>
					<CardDescription>
						Enter your email address below and we'll send you a link to reset your password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
                            />
						</div>
						<Button className="w-full" type="submit" disabled={isLoading}>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Send Reset Link
						</Button>
					</form>
				</CardContent>
				<CardFooter className="text-center text-sm">
					<Link href="/login">
						<Button variant="link" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
							Remembered your password? Sign In
						</Button>
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
