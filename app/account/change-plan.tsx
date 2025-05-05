import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { client } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { subscriptionPlans, SubscriptionPlan } from "@/lib/config/plans";
import { ArrowUpFromLine, CreditCard, RefreshCcw, Loader2 } from "lucide-react";
import { useId, useState, useEffect } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const formatCurrency = (amount: number, currency = 'eur') => {
	try {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency.toUpperCase(),
			minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
		}).format(amount / 100);
	} catch (error) {
		console.error("Currency formatting error:", error);
		return `$${(amount / 100).toFixed(2)}`;
	}
};

function Component(props: {
	currentPlan?: string;
	isTrial?: boolean;
}) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const displayPlans = subscriptionPlans.filter(
		(plan) => plan.id !== props.currentPlan?.toLowerCase()
	);
	const defaultPlanId =
		displayPlans.find((p) => p.isFeatured)?.id ||
		displayPlans[0]?.id ||
		subscriptionPlans[0]?.id ||
		"";

	const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);
	const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>(() => 
		subscriptionPlans.find((p) => p.id === selectedPlanId)
	);
	const id = useId();

	useEffect(() => {
		setSelectedPlan(subscriptionPlans.find((p) => p.id === selectedPlanId));
	}, [selectedPlanId]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant={!props.currentPlan ? "default" : "outline"}
					size="sm"
					className={cn(
						"gap-2",
						!props.currentPlan &&
							" bg-gradient-to-br from-purple-100 to-stone-300",
					)}
				>
					{props.currentPlan ? (
						<RefreshCcw className="opacity-80" size={14} strokeWidth={2} />
					) : (
						<ArrowUpFromLine className="opacity-80" size={14} strokeWidth={2} />
					)}
					{props.currentPlan ? "Change Plan" : "Upgrade Plan"}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<div className="mb-2 flex flex-col gap-2">
					<div
						className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
						aria-hidden="true"
					>
						{props.currentPlan ? (
							<RefreshCcw className="opacity-80" size={16} strokeWidth={2} />
						) : (
							<CreditCard className="opacity-80" size={16} strokeWidth={2} />
						)}
					</div>
					<DialogHeader>
						<DialogTitle className="text-left">
							{!props.currentPlan ? "Upgrade" : "Change"} your plan
						</DialogTitle>
						<DialogDescription className="text-left">
							Choose the plan that best fits your needs.
						</DialogDescription>
					</DialogHeader>
				</div>

				<form className="space-y-5">
					<RadioGroup
						className="gap-3"
						value={selectedPlanId}
						onValueChange={setSelectedPlanId}
					>
						{displayPlans.map((plan: SubscriptionPlan, index: number) => (
							<div
								key={plan.id}
								className={cn(
									"relative flex w-full items-center gap-3 rounded-lg border border-input p-4 shadow-sm shadow-black/5",
									"has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent",
								)}
							>
								<RadioGroupItem
									value={plan.id}
									id={`${id}-${plan.id}`}
									aria-describedby={`${id}-${plan.id}-description`}
									className="order-1 shrink-0 after:absolute after:inset-0"
								/>
								<div className="grid grow gap-1">
									<Label htmlFor={`${id}-${plan.id}`} className="font-medium capitalize">
										{plan.name}
									</Label>
									<p
										id={`${id}-${plan.id}-description`}
										className="text-sm text-muted-foreground"
									>
										{plan.price > 0 ? `${formatCurrency(plan.price)}/month` : 'Contact Sales'}
									</p>
								</div>
							</div>
						))}
					</RadioGroup>

					<div className="space-y-3">
						<p className="text-xs text-muted-foreground text-center">
							Upgrades take effect immediately. You'll be charged prorated amount or credited on your next billing cycle.
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<Button
							type="button"
							className="w-full"
							disabled={isSubmitting}
							onClick={async () => {
								if (!selectedPlan) {
									toast.error("Please select a valid plan.");
									return;
								}
								setIsSubmitting(true);
								try {
									// Update the existing subscription plan
									await client.subscription.update(
										{ plan: selectedPlan.name },
										{ onError: (ctx) => { toast.error(ctx.error.message); } }
									);
									toast.success(`Plan changed to ${selectedPlan.name}`);
								} catch (error) {
									console.error("Error updating subscription:", error);
								} finally {
									setIsSubmitting(false);
								}
							}}
						>
							{isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
							{selectedPlan
								? (() => {
									const currentPlanIndex = subscriptionPlans.findIndex(
										(p) => p.id === props.currentPlan?.toLowerCase()
									);
									const selectedPlanIndex = subscriptionPlans.findIndex(
										(p) => p.id === selectedPlanId
									);
									if (!props.currentPlan) return "Subscribe";
									if (selectedPlanIndex > currentPlanIndex) return "Upgrade";
									return "Downgrade";
								})()
								: "Select Plan"}
						</Button>
						{props.currentPlan && (
							<>
								<Separator className="my-2" />
								<p className="text-sm text-center text-zinc-500 dark:text-zinc-400">
									or cancel your current plan
								</p>
								<Button
									type="button"
									variant="destructive"
									className="w-full"
									onClick={async () => {
										await client.subscription.cancel(
											{ returnUrl: "/account" },
											{ onError: (ctx) => { toast.error(ctx.error.message); } }
										);
									}}
								>
									Cancel Plan
								</Button>
							</>
						)}
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export { Component };
