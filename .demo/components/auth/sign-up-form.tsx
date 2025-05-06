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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { signUp } from "@/lib/auth-client"; // Adjust import path
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/password-input"; // Added

// Added helper function from demo
async function convertImageToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

export function SignUpForm() {
	const [name, setName] = useState(""); // Combined name field
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	const [image, setImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

    const handleSignUp = async () => {
        if (password !== passwordConfirmation) {
            toast.error("Passwords do not match.");
            return;
        }
        if (password.length < 8) { // Basic password length check
             toast.error("Password must be at least 8 characters long.");
            return;
        }
        setLoading(true);
        try {
            const res = await signUp.email({
                email,
                password,
                name,
                image: image ? await convertImageToBase64(image) : undefined,
                callbackURL: "/dashboard/account",
            });

            if (res.error) {
                 toast.error(res.error.message || "Sign up failed.");
            } else {
                // Often, email verification is required. Success here might just mean the request was sent.
                // Redirecting might happen after email verification flow is complete.
                toast.success("Account created! Check your email for verification.");
                router.push("/login?message=signup_success"); // Redirect to login with a success message
            }
        } catch (error: any) {
            toast.error(error?.message || "An unexpected error occurred during sign up.");
        } finally {
             setLoading(false);
        }
    };

	return (
		<Card className="w-full max-w-md rounded-lg border shadow-sm dark:border-zinc-800">
            {/* Removed Header */}
			<CardContent className="pt-6">
				<div className="grid gap-4">
					<div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="Your Name"
                            required
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
                        />
                    </div>
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
						<Label htmlFor="password">Password</Label>
						<PasswordInput
							id="password"
							value={password}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
							autoComplete="new-password"
							placeholder="Create a password (min. 8 characters)"
                            className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="password_confirmation">Confirm Password</Label>
						<PasswordInput
							id="password_confirmation"
							value={passwordConfirmation}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordConfirmation(e.target.value)}
							autoComplete="new-password"
							placeholder="Confirm your password"
                            className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="image">Profile Image (optional)</Label>
						<div className="flex items-end gap-4">
							{imagePreview && (
								<div className="relative w-16 h-16 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
									<Image
										src={imagePreview}
										alt="Profile preview"
										fill // Use fill instead of layout
										objectFit="cover"
									/>
								</div>
							)}
							<div className="flex items-center gap-2 w-full">
								<Input
									id="image"
									type="file"
									accept="image/*"
									onChange={handleImageChange}
									className="w-full text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
								/>
								{imagePreview && (
                                     <Button variant="ghost" size="icon" onClick={() => { setImage(null); setImagePreview(null); const input = document.getElementById('image') as HTMLInputElement; if(input) input.value = ''; }}>
                                        <X className="h-4 w-4" />
                                    </Button>
								)}
							</div>
						</div>
					</div>
					<Button
						type="submit"
						className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 mt-2"
						disabled={loading}
						onClick={handleSignUp}
					>
						{loading ? (
							<Loader2 size={16} className="animate-spin" />
						) : (
							"Create Account"
						)}
					</Button>
				</div>
			</CardContent>
            {/* Removed Footer */}
		</Card>
	);
} 