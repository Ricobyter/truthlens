import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Sparkles, Infinity as InfinityIcon } from "lucide-react";
import FactCheckForm from "@/components/FactCheckForm";
import { auth } from "@/auth";
import { getQuotaStatus } from "@/lib/quota";
import { connectDB } from "@/lib/mongodb";
import { cn } from "@/utils/cn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TruthLens",
  description: "Submit a claim, article, tweet, or transcript for AI-powered fact checking.",
};

async function QuotaBar() {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    await connectDB();
    const quota = await getQuotaStatus(session.user.id);
    const isUnlimited = quota.limit === -1;
    const pct = isUnlimited ? 0 : Math.min(100, (quota.used / quota.limit) * 100);
    const barColor =
      pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-violet-500";

    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/50">Daily checks used</span>
            {isUnlimited ? (
              <span className="flex items-center gap-1 text-xs font-medium text-violet-300">
                <InfinityIcon className="h-3.5 w-3.5" /> Unlimited
              </span>
            ) : (
              <span
                className={cn(
                  "text-xs font-medium",
                  quota.exceeded ? "text-red-400" : "text-white/70"
                )}
              >
                {quota.used} / {quota.limit}
              </span>
            )}
          </div>
          {!isUnlimited && (
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", barColor)}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
        {quota.exceeded && (
          <Link
            href="/pricing"
            className="shrink-0 text-xs font-medium text-violet-300 hover:text-violet-200 underline underline-offset-2"
          >
            Upgrade
          </Link>
        )}
      </div>
    );
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Truthlens- Get your facts verified
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            What would you like to verify?
          </h1>
          <p className="text-white/50 max-w-md mx-auto">
            Paste any claim, news text, tweet, or transcript and our AI will
            analyze it against live evidence.
          </p>
        </div>

        {/* Quota bar */}
        <QuotaBar />

        {/* Tip */}


        {/* Form */}
        <Suspense fallback={<div className="h-48 rounded-2xl bg-white/5 animate-pulse" />}>
          <FactCheckForm />
        </Suspense>
      </div>
    </div>
  );
}
