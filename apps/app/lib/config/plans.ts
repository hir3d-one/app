// lib/config/plans.ts

export type SubscriptionPlan = {
  id: string; // Unique identifier for the plan (e.g., 'free', 'pro')
  name: string;
  description: string;
  features: string[];
  stripePriceId: string; // Price ID from Stripe
  stripePriceIdAnnual?: string; // Price ID from Stripe
  price: number; // Price in the smallest currency unit (e.g., cents)
  priceAnnual?: number; // Price in the smallest currency unit (e.g., cents)
  isFeatured?: boolean; // Optional: Highlight a specific plan
};

export const PlusPlan: SubscriptionPlan = {
  id: "plus",
  name: "Plus",
  description: "Get started with the basics.",
  features: [
    "Feature A",
    "Feature B",
    "Limited Feature C",
  ],
  stripePriceId: "price_1RJXEaCAN5jBx3NiIJd2rtw7", // Add your Stripe Price ID for the free plan (if applicable, often managed differently)
  stripePriceIdAnnual: "price_1RJXMZCAN5jBx3NiuaSeQnam", // Add your Stripe Price ID for the free plan (if applicable, often managed differently)
  price: 1000,
  priceAnnual: 10000,
};

export const ProfessionalPlan: SubscriptionPlan = {
  id: "professional",
  name: "Professional",
  description: "Unlock powerful features for growing teams.",
  features: [
    "All Free features",
    "Feature D",
    "Feature E",
    "Priority Support",
  ],
  stripePriceId: "price_1RJXElCAN5jBx3Nikjp9KHJn", // <<< Add your Stripe Pro Plan Price ID here
  price: 2000, // Example: $20.00 (2000 cents)
  isFeatured: true,
  stripePriceIdAnnual: "price_1RJXNHCAN5jBx3NiUBHoiTc6", // <<< Add your Stripe Pro Plan Price ID here
  priceAnnual: 20000, // Example: $20.00 (2000 cents)
};

export const GoldPlan: SubscriptionPlan = {
  id: "gold",
  name: "Gold",
  description: "Tailored solutions for large organizations.",
  features: [
    "All Pro features",
    "Custom Feature F",
    "Dedicated Account Manager",
    "SLA",
  ],
  stripePriceId: "price_1RJXEzCAN5jBx3NiNsCobtqF", // <<< Add your Stripe Enterprise Plan Price ID here
  price: 5000, // 50.00€
//   stripePriceIdAnnual: "price_your_enterprise_plan_id_annual", // <<< Add your Stripe Enterprise Plan Price ID here
//   priceAnnual: 10000, // Example: $100.00 (10000 cents)
};

export const DiamondPlan: SubscriptionPlan = {
  id: "diamond",
  name: "Diamond",
  description: "Tailored solutions for large organizations.",
  features: [
    "All Gold features",
  ],
  stripePriceId: "price_1RJXFDCAN5jBx3Ni1C0VheXI", // <<< Add your Stripe Enterprise Plan Price ID here
  price: 10000, // 100.00€
//   stripePriceIdAnnual: "price_1RJXNHCAN5jBx3NiUBHoiTc6", // <<< Add your Stripe Enterprise Plan Price ID here
//   priceAnnual: 100000, // Example: $100.00 (10000 cents)
};

export const PlatinumPlan: SubscriptionPlan = {
  id: "platinum",
  name: "Platinum",
  description: "Tailored solutions for large organizations.",
  features: [
    "All Diamond features",
  ],
  stripePriceId: "price_1RJXFOCAN5jBx3NisoNZUgtP", // <<< Add your Stripe Enterprise Plan Price ID here
  price: 50000, // 500.00€
//   stripePriceIdAnnual: "price_1RJXNHCAN5jBx3NiUBHoiTc6", // <<< Add your Stripe Enterprise Plan Price ID here
//   priceAnnual: 100000, // Example: $100.00 (10000 cents)
};

export const subscriptionPlans: SubscriptionPlan[] = [
  PlusPlan,
  ProfessionalPlan,
  GoldPlan,
  DiamondPlan,
  PlatinumPlan,
]; 