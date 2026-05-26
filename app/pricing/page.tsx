"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/lib/plans";
import { cn } from "@/utils/cn";
import { Suspense } from "react";

const PLAN_ICONS = {
  free: Sparkles,
  silver: Zap,
  gold: Crown,
};

function PricingContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<PlanId | null>(null);

  const currentPlan = (session?.user?.plan ?? "free") as PlanId;

  // Handle Stripe redirect back (success / canceled)
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const planId = searchParams.get("planId") as PlanId | null;

    if (success === "true" && planId) {
      toast.success(`Payment successful! Your ${PLANS[planId]?.name ?? planId} plan is now active.`);
      update(); // refresh session so new plan shows immediately
      router.replace("/pricing");
    } else if (canceled === "true") {
      toast.info("Payment canceled. Your plan was not changed.");
      router.replace("/pricing");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubscribe(planId: PlanId) {
    if (planId === "free") return;

    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/pricing`);
      return;
    }

    setLoading(planId);

    try {
      const res = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.url) {
        toast.error(data.error ?? "Failed to start checkout.");
        setLoading(null);
        return;
      }

      // Redirect to Stripe-hosted checkout page
      window.location.href = data.url;
    } catch {
      toast.error("Couldn't start checkout. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3">
          Choose your plan
        </h1>
        <p className="text-white/50 max-w-xl mx-auto">
          Start free. Upgrade when you need more fact checks per day.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(PLANS) as PlanId[]).map((planId, idx) => {
          const plan = PLANS[planId];
          const Icon = PLAN_ICONS[planId];
          const isCurrent = currentPlan === planId;
          const isHighlight = plan.highlight;

          return (
            <motion.div
              key={planId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col",
                isHighlight
                  ? "border-violet-500/40 bg-gradient-to-b from-violet-500/10 to-white/5 shadow-2xl shadow-violet-500/10"
                  : "border-white/10 bg-white/5"
              )}
            >
              {isHighlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full bg-violet-500 text-white">
                  Most popular
                </span>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl",
                    planId === "gold"
                      ? "bg-amber-500/20 text-amber-400"
                      : planId === "silver"
                      ? "bg-violet-500/20 text-violet-400"
                      : "bg-white/5 text-white/60"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              </div>

              <div className="mb-5">
                <p className="text-4xl font-bold text-white">
                  ₹{plan.priceInr}
                  <span className="text-base font-normal text-white/40">/mo</span>
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {plan.dailyLimit === -1 ? "Unlimited checks" : `${plan.dailyLimit} checks per day`}
                </p>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex gap-2 text-sm text-white/70">
                    <Check className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>

              {planId === "free" ? (
                <Button variant="outline" disabled className="w-full">
                  {isCurrent ? "Current plan" : "Free forever"}
                </Button>
              ) : isCurrent ? (
                <Button variant="outline" disabled className="w-full">
                  Current plan
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubscribe(planId)}
                  disabled={loading !== null}
                  className="w-full"
                  size="lg"
                >
                  {loading === planId ? "Redirecting…" : `Upgrade to ${plan.name}`}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-xs text-white/30 mt-8 max-w-md mx-auto">
        Payments processed securely via Stripe. Plans are valid for 30 days.
        Cards, UPI, and net banking supported.
      </p>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PricingContent />
    </Suspense>
  );
}
