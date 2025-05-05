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
import { ArrowUpFromLine, CreditCard, RefreshCcw } from "lucide-react";
import { useId, useState, useEffect } from "react";
import { toast } from "sonner";

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
	const defaultPlanId = 
		subscriptionPlans.find(p => p.isFeatured)?.id || 
		subscriptionPlans[0]?.id ||
		'';

	const [selectedPlanId, setSelectedPlanId] = useState(props.currentPlan?.toLowerCase() || defaultPlanId);
	const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>(() => 
		subscriptionPlans.find(p => p.id === selectedPlanId)
	);
	const id = useId();

	useEffect(() => {
		setSelectedPlan(subscriptionPlans.find(p => p.id === selectedPlanId));
	}, [selectedPlanId]);

	const displayPlans = subscriptionPlans;

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
						{displayPlans.map((plan, index) => (
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

					<div className="grid gap-2">
						<Button
							type="button"
							className="w-full"
							disabled={
								(selectedPlanId === props.currentPlan?.toLowerCase() && !props.isTrial)
							}
							onClick={async () => {
								if (!selectedPlan) {
									toast.error("Please select a valid plan.");
									return;
								}
								await client.subscription.upgrade(
									{
										plan: selectedPlan.name,
									},
									{
										onError: (ctx) => {
											toast.error(ctx.error.message);
										},
									},
								);
							}}
						>
							{(() => {
								const isCurrent = selectedPlanId === props.currentPlan?.toLowerCase();
								if (isCurrent) return props.isTrial ? "Activate Plan" : "Current Plan";
								
								const currentPlanIndex = subscriptionPlans.findIndex(p => p.id === props.currentPlan?.toLowerCase());
								const selectedPlanIndex = subscriptionPlans.findIndex(p => p.id === selectedPlanId);

								if (props.currentPlan === undefined || selectedPlanIndex > currentPlanIndex) return "Upgrade";
								if (selectedPlanIndex < currentPlanIndex) return "Downgrade";

								return "Change Plan";
							})()}
						</Button>
						{props.currentPlan && (
							<Button
								type="button"
								variant="destructive"
								className="w-full"
								onClick={async () => {
									await client.subscription.cancel(
										{
											returnUrl: "/account",
										},
										{
											onError: (ctx) => {
												toast.error(ctx.error.message);
											},
										},
									);
								}}
							>
								Cancel Plan
							</Button>
						)}
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export { Component };
