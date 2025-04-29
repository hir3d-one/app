"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { client } from "@/lib/auth-client";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const message = searchParams.get('message');
        if (message === 'signup_success') {
            toast.success("Account created! Please sign in.");
            router.replace('/login', { scroll: false });
        }
        if (message === 'reset_success') {
            toast.success("Password reset successfully! Please sign in.");
            router.replace('/login', { scroll: false });
        }

        // Attempt One-Tap Passkey sign-in
        client.oneTap({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Successfully signed in with passkey");
                    router.push("/dashboard");
                },
                // Optional: onError for specific handling
                // onError: ({ error }) => { toast.error(error.message || "One-Tap failed"); },
            },
        });
    }, [router, searchParams]);

    const tabs = [
        {
            title: "Sign In",
            value: "signin",
            content: <SignInForm />,
        },
        {
            title: "Sign Up",
            value: "signup",
            content: <SignUpForm />,
        },
    ];

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
             <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Welcome Back</h1>
                <p className="text-zinc-600 dark:text-zinc-400">Sign in or create an account to continue</p>
            </div>
            <AnimatedTabs tabs={tabs} initialTabValue="signin" />
             <p className="mt-6 text-center text-xs text-muted-foreground">
                Powered by{" "}
                <Link
                    href="https://better-auth.com"
                    className="underline hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    better-auth
                </Link>
            </p>
        </div>
    );
}
