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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { subscriptionPlans, SubscriptionPlan } from "@/lib/config/plans";
import { ArrowUpFromLine, CreditCard, RefreshCcw, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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
	currentPlanIsAnnual?: boolean;
}) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
		props.currentPlanIsAnnual ? "yearly" : "monthly"
	);

	const displayPlans = subscriptionPlans;
	const defaultPlanId =
		displayPlans.find((p) => p.isFeatured)?.id ||
		displayPlans[0]?.id ||
		subscriptionPlans[0]?.id ||
		"";

	const [selectedPlanId, setSelectedPlanId] = useState(
		props.currentPlan || defaultPlanId
	);
	const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>(() => 
		subscriptionPlans.find((p) => p.id === selectedPlanId)
	);
	const id = useId();

	useEffect(() => {
		setSelectedPlan(subscriptionPlans.find((p) => p.id === selectedPlanId));
	}, [selectedPlanId]);

	const getPlanPriceDetails = (plan: SubscriptionPlan, period: "monthly" | "yearly") => {
		if (period === "yearly" && plan.priceAnnual && plan.stripePriceIdAnnual) {
			return { price: plan.priceAnnual, priceId: plan.stripePriceIdAnnual, periodLabel: "/year" };
		}
		return { price: plan.price, priceId: plan.stripePriceId, periodLabel: "/month" };
	};

	const isCurrentPlan = (plan: SubscriptionPlan, period: "monthly" | "yearly") => {
		const isCurrentTier = plan.id === props.currentPlan?.toLowerCase();
		const isCurrentPeriod = (period === "yearly") === props.currentPlanIsAnnual;
		return isCurrentTier && isCurrentPeriod;
	}

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
					{/* @ts-ignore - Suppress persistent ref error */}
					<Tabs
						value={billingPeriod}
						onValueChange={(value) => setBillingPeriod(value as "monthly" | "yearly")}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="monthly">Monthly</TabsTrigger>
							{subscriptionPlans.some(plan => plan.priceAnnual) && (
								<TabsTrigger value="yearly">Yearly</TabsTrigger>
							)}
						</TabsList>
					</Tabs>

					<RadioGroup
						value={selectedPlanId}
						onValueChange={setSelectedPlanId}
						className="grid grid-cols-1 sm:grid-cols-2 gap-4"
					>
						{displayPlans.map((plan) => {
							const isDisabledByPeriod = billingPeriod === "yearly" && !plan.stripePriceIdAnnual;
							const isDisabledCurrent = isCurrentPlan(plan, billingPeriod);
							const isDisabled = isDisabledByPeriod || isDisabledCurrent;

							return (
								<div
									key={`${plan.id}-${billingPeriod}`}
									className={cn(
										"relative flex items-start space-x-3 rounded-lg border bg-background p-4 shadow-sm transition hover:border-primary",
										selectedPlanId === plan.id && "border-primary ring-2 ring-primary",
										isDisabled && "cursor-not-allowed opacity-50"
									)}
								>
									{/* @ts-ignore - Suppress persistent ref error */}
									<RadioGroupItem
										value={plan.id}
										id={`${id}-${plan.id}`}
										aria-describedby={`${id}-${plan.id}-description`}
										className="order-1 shrink-0 after:absolute after:inset-0"
										disabled={isDisabled}
									/>
									<div className="grid grow gap-1">
										<Label htmlFor={`${id}-${plan.id}`} className={cn("font-medium capitalize", isDisabled && "cursor-not-allowed")}>
											{plan.name}
										</Label>
										<p
											id={`${id}-${plan.id}-description`}
											className="text-sm text-muted-foreground"
										>
											{(() => {
												const details = getPlanPriceDetails(plan, billingPeriod);
												return details.price > 0 ? `${formatCurrency(details.price)}${details.periodLabel}` : 'Contact Sales';
											})()}
										</p>
									</div>
								</div>
							);
						})}
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
							disabled={isSubmitting || (selectedPlan ? isCurrentPlan(selectedPlan, billingPeriod) : false)}
							onClick={async () => {
								if (!selectedPlan) {
									toast.error("Please select a valid plan.");
									return;
								}
								setIsSubmitting(true);
								try {
									const selectedPlanDetails = subscriptionPlans.find(p => p.id === selectedPlanId);
									if (!selectedPlanDetails) {
										toast.error("Selected plan not found.");
										setIsSubmitting(false);
										return;
									}

									await authClient.subscription.upgrade(
										{
											plan: selectedPlanDetails.name,
											annual: billingPeriod === "yearly",
											successUrl: "/dashboard/account",
											cancelUrl: "/dashboard/account",
										},
										{ 
											onError: (ctx: { error: Error }) => {
												toast.error(ctx.error.message);
											}
										}
									);
								} catch (error: any) {
									console.error("Error initiating subscription change:", error);
									toast.error(error.message || "Failed to initiate plan change.");
								} finally {
									setIsSubmitting(false);
								}
							}}
						>
							{isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
							{selectedPlan ? (() => {
								const currentPlanDetails = subscriptionPlans.find(
									(p) => p.id === props.currentPlan?.toLowerCase()
								);
								const selectedPlanDetails = subscriptionPlans.find(
									(p) => p.id === selectedPlanId
								);

								// Get indices for plan level comparison
								const currentPlanIndex = currentPlanDetails
									? subscriptionPlans.findIndex(p => p.id === currentPlanDetails.id)
									: -1;
								const selectedPlanIndex = selectedPlanDetails
									? subscriptionPlans.findIndex(p => p.id === selectedPlanDetails.id)
									: -1;

								// Determine button text based on plan index comparison
								if (!props.currentPlan || currentPlanIndex === -1) return `Subscribe`; // New or unknown current plan
								if (selectedPlanIndex === -1) return `Select Plan`; // Should not happen if button is enabled

								if (selectedPlanIndex > currentPlanIndex) return `Upgrade Plan`; // Higher index = upgrade
								if (selectedPlanIndex < currentPlanIndex) return `Downgrade Plan`; // Lower index = downgrade
								
								// If indices are same, it must be a billing cycle change (button is disabled if cycle is also same)
								return `Change Billing Cycle`;
							})() : "Select Plan"}
						</Button>
						{props.currentPlan && (
							<>
								<Separator className="my-2" />
								<Button
									type="button"
									variant="destructive"
									className="w-full"
									onClick={async () => {
										await authClient.subscription.cancel(
											{ returnUrl: "/dashboard/account" },
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
