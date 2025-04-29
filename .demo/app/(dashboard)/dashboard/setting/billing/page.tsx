import { SubscriptionSection } from "@/components/account/subscription-section";

export default function BillingPage() {
  // SubscriptionSection fetches its own data client-side using useQuery
  return (
    <div className="px-4">
      <SubscriptionSection />
    </div>
  );
}
