// lib/config/plans.ts

export type ApiKeyLimits = {
  maxKeys: number;
  defaultExpiresDays: number | null; // null = never expires by default
  rateLimit?: { requests: number; windowSeconds: number }; // e.g., 10 requests per 60 seconds
  usageLimit?: number | null; // Total requests allowed, null = unlimited
};

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
  apiKeyLimits: ApiKeyLimits; // Add API key limits
};

export const PlusPlan: SubscriptionPlan = {
  id: "plus",
  name: "Plus",
  description: "Get started with the basics.",
  features: [
    "Feature A",
    "Feature B",
    "Limited Feature C",
    "Up to 5 API Keys",
    "Basic Rate Limiting",
  ],
  stripePriceId: "price_1RJXEaCAN5jBx3NiIJd2rtw7", // Add your Stripe Price ID for the free plan (if applicable, often managed differently)
  stripePriceIdAnnual: "price_1RJXMZCAN5jBx3NiuaSeQnam", // Add your Stripe Price ID for the free plan (if applicable, often managed differently)
  price: 1000,
  priceAnnual: 10000,
  apiKeyLimits: { // Example limits for Plus
    maxKeys: 5,
    defaultExpiresDays: 90,
    rateLimit: { requests: 10, windowSeconds: 60 }, // 10 req/min
    usageLimit: 10000, // 10k total requests
  },
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
    "Up to 20 API Keys",
    "Higher Rate Limits",
  ],
  stripePriceId: "price_1RJXElCAN5jBx3Nikjp9KHJn", // <<< Add your Stripe Pro Plan Price ID here
  price: 2000, // Example: $20.00 (2000 cents)
  isFeatured: true,
  stripePriceIdAnnual: "price_1RJXNHCAN5jBx3NiUBHoiTc6", // <<< Add your Stripe Pro Plan Price ID here
  priceAnnual: 20000, // Example: $20.00 (2000 cents)
  apiKeyLimits: { // Example limits for Pro
    maxKeys: 20,
    defaultExpiresDays: 365,
    rateLimit: { requests: 60, windowSeconds: 60 }, // 60 req/min
    usageLimit: 100000, // 100k total requests
  },
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
    "Unlimited API Keys",
    "Custom Rate Limits",
  ],
  stripePriceId: "price_1RJXEzCAN5jBx3NiNsCobtqF", // <<< Add your Stripe Enterprise Plan Price ID here
  price: 5000, // 50.00€
//   stripePriceIdAnnual: "price_your_enterprise_plan_id_annual", // <<< Add your Stripe Enterprise Plan Price ID here
//   priceAnnual: 10000, // Example: $100.00 (10000 cents)
  apiKeyLimits: { // Example limits for Gold
    maxKeys: Infinity, // Representing unlimited
    defaultExpiresDays: null, // Never expire by default
    rateLimit: { requests: 300, windowSeconds: 60 }, // 300 req/min
    usageLimit: null, // Unlimited usage
  },
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
  apiKeyLimits: { // Example limits for Diamond (likely similar/better than Gold)
    maxKeys: Infinity,
    defaultExpiresDays: null,
    rateLimit: { requests: 1000, windowSeconds: 60 }, // 1000 req/min
    usageLimit: null,
  },
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
  apiKeyLimits: { // Example limits for Platinum
    maxKeys: Infinity,
    defaultExpiresDays: null,
    rateLimit: { requests: 5000, windowSeconds: 60 }, // 5000 req/min
    usageLimit: null,
  },
};

export const subscriptionPlans: SubscriptionPlan[] = [
  PlusPlan,
  ProfessionalPlan,
  GoldPlan,
  DiamondPlan,
  PlatinumPlan,
]; 