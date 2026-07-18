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
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export default function ResetPassword() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
			<Card className="w-[350px]">
				<CardHeader>
					<CardTitle>Reset password</CardTitle>
					<CardDescription>
						Enter new password and confirm it to reset your password
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AuthDisabledNotice />
					<fieldset disabled className="min-w-0">
						<form onSubmit={(e) => e.preventDefault()}>
							<div className="grid w-full items-center gap-2">
								<div className="flex flex-col space-y-1.5">
									<Label htmlFor="password">New password</Label>
									<PasswordInput
										id="password"
										value=""
										readOnly
										autoComplete="off"
										placeholder="Password"
									/>
								</div>
								<div className="flex flex-col space-y-1.5">
									<Label htmlFor="confirm-password">Confirm password</Label>
									<PasswordInput
										id="confirm-password"
										value=""
										readOnly
										autoComplete="off"
										placeholder="Password"
									/>
								</div>
							</div>
							<Button className="w-full mt-4" type="submit" disabled>
								Reset password
							</Button>
						</form>
					</fieldset>
				</CardContent>
			</Card>
		</div>
	);
}
