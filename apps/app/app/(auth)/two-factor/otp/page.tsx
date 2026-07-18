"use client";

import { AuthDisabledNotice } from "@/components/auth-disabled-notice";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

export default function Component() {
	return (
		<main className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
			<Card className="w-[350px]">
				<CardHeader>
					<CardTitle>Two-Factor Authentication</CardTitle>
					<CardDescription>
						Verify your identity with a one-time password
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AuthDisabledNotice />
					<fieldset disabled className="min-w-0">
						<div className="grid w-full items-center gap-4">
							<Button className="w-full" disabled>
								<Mail className="mr-2 h-4 w-4" /> Send OTP to Email
							</Button>
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="otp">One-Time Password</Label>
								<Input
									id="otp"
									placeholder="Enter 6-digit OTP"
									value=""
									readOnly
									maxLength={6}
								/>
							</div>
							<Button disabled>Validate OTP</Button>
						</div>
					</fieldset>
				</CardContent>
			</Card>
		</main>
	);
}
