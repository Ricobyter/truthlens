import type { Verdict } from "@/types";

export const VERDICT_CONFIG: Record<
  Verdict,
  { label: string; color: string; bg: string; border: string; glow: string }
> = {
  TRUE: {
    label: "True",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
  },
  FALSE: {
    label: "False",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
  },
  MISLEADING: {
    label: "Misleading",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
  },
  "PARTIALLY TRUE": {
    label: "Partially True",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    glow: "shadow-yellow-500/20",
  },
  "NOT ENOUGH EVIDENCE": {
    label: "Not Enough Evidence",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    glow: "shadow-slate-500/20",
  },
};

export function getVerdictConfig(verdict: Verdict) {
  return VERDICT_CONFIG[verdict] ?? VERDICT_CONFIG["NOT ENOUGH EVIDENCE"];
}

export function getConfidenceColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}
