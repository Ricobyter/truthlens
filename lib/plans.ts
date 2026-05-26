export type PlanId = "free" | "silver" | "gold";

export interface Plan {
  id: PlanId;
  name: string;
  dailyLimit: number;           // -1 = unlimited
  priceInr: number;             // display price in INR
  stripePriceAmount: number;    // Stripe amount in smallest unit (paise for INR)
  features: string[];
  highlight?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    dailyLimit: 10,
    priceInr: 0,
    stripePriceAmount: 0,
    features: [
      "10 fact checks per day",
      "Verdict + confidence",
      "Bias analysis",
      "Real-time news detection",
      "Personal history",
    ],
  },
  silver: {
    id: "silver",
    name: "Silver",
    dailyLimit: 50,
    priceInr: 199,
    stripePriceAmount: 19900,
    features: [
      "50 fact checks per day",
      "Everything in Free",
      "Priority verdict processing",
      "Article + tweet URL extraction",
      "Email support",
    ],
    highlight: true,
  },
  gold: {
    id: "gold",
    name: "Gold",
    dailyLimit: -1,
    priceInr: 499,
    stripePriceAmount: 49900,
    features: [
      "Unlimited fact checks",
      "Everything in Silver",
      "Priority support",
      "Early access to new features",
      "Export history (CSV)",
    ],
  },
};

export function getPlan(id: PlanId | undefined | null): Plan {
  return PLANS[id ?? "free"] ?? PLANS.free;
}

export function isUnlimited(plan: Plan): boolean {
  return plan.dailyLimit === -1;
}
