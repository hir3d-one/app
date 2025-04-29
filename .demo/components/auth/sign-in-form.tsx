"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client"; // Adjusted import path
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/ui/password-input"; // Added PasswordInput
import { toast } from "sonner"; // Added toast
import { useRouter } from "next/navigation"; // Added router

export function SignInForm() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    const handleSignIn = async (provider: 'email' | 'google' | 'github' | 'microsoft' | 'passkey') => {
        setLoading(provider === 'email');
        setLoadingProvider(provider !== 'email' ? provider : null);

        try {
            let res; // Use result variable to check for errors
            if (provider === 'email') {
                res = await signIn.email({ email, password });
                if (res?.error) {
                    toast.error(res.error.message || "Sign in failed.");
                } else {
                    router.push("/dashboard");
                    toast.success("Signed in successfully!");
                }
            } else if (provider === 'passkey') {
                 res = await signIn.passkey({ email });
                 if (res?.error) {
                    toast.error(res.error.message || "Passkey sign in failed.");
                 } else {
                    router.push("/dashboard");
                    toast.success("Signed in with passkey!");
                 }
            } else {
                // Social providers - redirect happens automatically, check for initial error
                res = await signIn.social({ provider, callbackURL: "/dashboard" });
                 if (res?.error) {
                    // Error might occur before redirect (e.g., config issue)
                     toast.error(res.error.message || `Sign in with ${provider} failed.`);
                 }
                 // No else needed, success implies redirect initiated
            }
        } catch (error: any) {
            // Catch any unexpected errors (e.g., network issues)
            console.error("Sign in error:", error);
            toast.error(error?.message || "An unexpected error occurred during sign in.");
        } finally {
             setLoading(false);
             setLoadingProvider(null);
        }
    };

	return (
		<Card className="w-full max-w-md rounded-lg border shadow-sm dark:border-zinc-800">
			{/* Removed CardHeader, Title integrated below */}
			<CardContent className="pt-6">
				<div className="grid gap-4">
                    {/* Email/Password Fields */}
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="m@example.com"
							required
							onChange={(e) => setEmail(e.target.value)}
							value={email}
                            autoComplete="email"
                            className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
						/>
					</div>
					<div className="grid gap-2">
						<div className="flex items-center">
							<Label htmlFor="password">Password</Label>
							<Link href="/forget-password" className="ml-auto inline-block text-sm underline text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
								Forgot your password?
							</Link>
						</div>
						<PasswordInput
							id="password"
							placeholder="••••••••"
							autoComplete="current-password"
							value={password}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                             className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
						/>
					</div>

                    {/* Email Sign In Button */}
					<Button
						type="submit"
						className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
						disabled={loading || !!loadingProvider}
						onClick={() => handleSignIn('email')}
					>
						{loading ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
					</Button>

                    {/* Divider */}
                     <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200 dark:border-zinc-700"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    {/* Passkey Button */}
                    <Button
                        variant="outline"
                        className="w-full border-zinc-200 dark:border-zinc-800"
                        disabled={loading || !!loadingProvider}
                        onClick={() => handleSignIn('passkey')}
                    >
                        {loadingProvider === 'passkey' ? (
                            <Loader2 size={16} className="animate-spin mr-2" />
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14 9a2 2 0 0 1-2-2V3a2 2 0 0 1 4 0v4"/><path d="M18 11a2 2 0 0 1-2-2V3a6 6 0 1 0-12 0v6"/><path d="M13 15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z"/><path d="M4 16.8V21a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4.2"/></svg>
                        )}
                        Sign In with Passkey
                    </Button>

                    {/* Social Logins - Assuming they are configured */}
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<Button
							variant="outline"
                            className="w-full border-zinc-200 dark:border-zinc-800"
                            disabled={loading || !!loadingProvider}
							onClick={() => handleSignIn('google')}
						>
                            {loadingProvider === 'google' ? <Loader2 size={16} className="animate-spin mr-2"/> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 262" className="mr-2"><path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"/><path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"/><path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"/><path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"/></svg>}
							Google
						</Button>
						<Button
							variant="outline"
                            className="w-full border-zinc-200 dark:border-zinc-800"
                            disabled={loading || !!loadingProvider}
							onClick={() => handleSignIn('github')}
						>
						    {loadingProvider === 'github' ? <Loader2 size={16} className="animate-spin mr-2"/> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="mr-2"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/></svg>}
							GitHub
						</Button>
						{/* Add Microsoft button if needed */}
					</div>
				</div>
			</CardContent>
			{/* Removed Footer with link */}
		</Card>
	);
} 