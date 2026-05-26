"use client";

import { motion } from "framer-motion";
import { Scale, Flame, Shield, AlertTriangle } from "lucide-react";
import type { BiasAnalysis, PoliticalLean } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  bias: BiasAnalysis;
}

const LEAN_POSITION: Record<PoliticalLean, number> = {
  LEFT: 0,
  "CENTER-LEFT": 25,
  CENTER: 50,
  "CENTER-RIGHT": 75,
  RIGHT: 100,
  MIXED: 50,
  "NON-POLITICAL": 50,
};

const LEAN_COLOR: Record<PoliticalLean, string> = {
  LEFT: "bg-blue-500",
  "CENTER-LEFT": "bg-sky-400",
  CENTER: "bg-violet-400",
  "CENTER-RIGHT": "bg-orange-400",
  RIGHT: "bg-red-500",
  MIXED: "bg-amber-400",
  "NON-POLITICAL": "bg-white/40",
};

const LEAN_LABEL: Record<PoliticalLean, string> = {
  LEFT: "Left-leaning",
  "CENTER-LEFT": "Center-Left",
  CENTER: "Center",
  "CENTER-RIGHT": "Center-Right",
  RIGHT: "Right-leaning",
  MIXED: "Mixed perspectives",
  "NON-POLITICAL": "Non-political",
};

function MeterRow({
  icon,
  label,
  value,
  tone,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "good" | "warn" | "bad";
  hint: string;
}) {
  const colorClass =
    tone === "good"
      ? "from-emerald-500/80 to-emerald-400/80"
      : tone === "warn"
      ? "from-amber-500/80 to-amber-400/80"
      : "from-red-500/80 to-red-400/80";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-white/60">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-medium text-white/80">{value}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("h-full bg-gradient-to-r", colorClass)}
        />
      </div>
      <p className="text-[10px] text-white/30">{hint}</p>
    </div>
  );
}

export default function BiasPanel({ bias }: Props) {
  const lean = bias.politicalLean;
  const position = LEAN_POSITION[lean];

  const emotionalTone: "good" | "warn" | "bad" =
    bias.emotionalLanguage < 30 ? "good" : bias.emotionalLanguage < 65 ? "warn" : "bad";
  const credibilityTone: "good" | "warn" | "bad" =
    bias.sourceCredibility > 70 ? "good" : bias.sourceCredibility > 40 ? "warn" : "bad";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4 text-violet-400" />
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Bias Analysis
        </p>
      </div>

      {/* Political spectrum */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60">Political Lean</span>
          <span className="font-medium text-white/80">{LEAN_LABEL[lean]}</span>
        </div>
        <div className="relative h-2 rounded-full bg-gradient-to-r from-blue-500/30 via-violet-400/30 to-red-500/30 overflow-visible">
          <motion.div
            initial={{ left: "50%" }}
            animate={{ left: `${position}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          >
            <div className={cn("h-4 w-4 rounded-full ring-2 ring-white/30 shadow-lg", LEAN_COLOR[lean])} />
          </motion.div>
        </div>
        <div className="flex justify-between text-[10px] text-white/30">
          <span>Left</span>
          <span>Center</span>
          <span>Right</span>
        </div>
      </div>

      {/* Meters */}
      <div className="space-y-3.5">
        <MeterRow
          icon={<Flame className="h-3 w-3" />}
          label="Emotional Language"
          value={bias.emotionalLanguage}
          tone={emotionalTone}
          hint={
            bias.emotionalLanguage < 30
              ? "Neutral, factual phrasing"
              : bias.emotionalLanguage < 65
              ? "Some loaded language"
              : "Highly emotive / inflammatory"
          }
        />
        <MeterRow
          icon={<Shield className="h-3 w-3" />}
          label="Source Credibility"
          value={bias.sourceCredibility}
          tone={credibilityTone}
          hint={
            bias.sourceCredibility > 70
              ? "Reliable, well-established sources"
              : bias.sourceCredibility > 40
              ? "Mixed source quality"
              : "Low-credibility sources detected"
          }
        />
      </div>

      {/* Bias indicators */}
      {bias.biasIndicators && bias.biasIndicators.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
              Bias Signals
            </p>
          </div>
          <ul className="space-y-1.5">
            {bias.biasIndicators.map((flag, i) => (
              <li key={i} className="text-xs text-white/70 flex gap-2">
                <span className="text-amber-400/70">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
