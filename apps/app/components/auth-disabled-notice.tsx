import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BanIcon } from "lucide-react";

export function AuthDisabledNotice() {
	return (
		<Alert className="mb-4 border-amber-800/25 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
			<BanIcon className="h-4 w-4 !text-amber-800 dark:!text-amber-200" />
			<AlertTitle>Login disabled</AlertTitle>
			<AlertDescription>
				Sign-in and account creation are no longer available — the auth backend
				is offline for this showcase.
			</AlertDescription>
		</Alert>
	);
}
