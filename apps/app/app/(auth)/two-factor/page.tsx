"use client";

import { AuthDisabledNotice } from "@/components/auth-disabled-notice";
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
import Link from "next/link";

export default function Component() {
	return (
		<main className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
			<Card className="w-[350px]">
				<CardHeader>
					<CardTitle>TOTP Verification</CardTitle>
					<CardDescription>
						Enter your 6-digit TOTP code to authenticate
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AuthDisabledNotice />
					<fieldset disabled className="min-w-0">
						<form onSubmit={(e) => e.preventDefault()}>
							<div className="space-y-2">
								<Label htmlFor="totp">TOTP Code</Label>
								<Input
									id="totp"
									type="text"
									inputMode="numeric"
									pattern="\d{6}"
									maxLength={6}
									value=""
									readOnly
									placeholder="Enter 6-digit code"
								/>
							</div>
							<Button type="submit" className="w-full mt-4" disabled>
								Verify
							</Button>
						</form>
					</fieldset>
				</CardContent>
				<CardFooter className="text-sm text-muted-foreground gap-2">
					<Link href="/sign-in">
						<Button variant="outline" size="sm">
							Back to Sign In
						</Button>
					</Link>
				</CardFooter>
			</Card>
		</main>
	);
}
