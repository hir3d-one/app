import { AlertTriangleIcon } from "lucide-react";

export function DeprecationBanner() {
	return (
		<div
			role="status"
			aria-live="polite"
			className="border-b border-amber-800/25 bg-amber-500 text-amber-950"
		>
			<div className="mx-auto flex max-w-7xl items-start gap-2.5 px-4 py-2.5 text-left text-sm leading-snug sm:items-center sm:justify-center sm:text-center">
				<AlertTriangleIcon
					className="mt-0.5 size-4 shrink-0 sm:mt-0"
					aria-hidden="true"
				/>
				<p>
					<span className="font-semibold">Deprecated showcase.</span> Hir3d is
					no longer an active product — this site is kept online only to show
					what it once was. Most features no longer work (databases, auth,
					uploads, and more).
				</p>
			</div>
		</div>
	);
}
