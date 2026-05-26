"use client";

import { motion } from "framer-motion";
import { getConfidenceColor } from "@/utils/verdict";

interface Props {
  score: number;
  animated?: boolean;
}

export default function ConfidenceMeter({ score, animated = true }: Props) {
  const colorClass = getConfidenceColor(score);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
          Confidence
        </span>
        <span className="text-sm font-bold text-white">{score}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={animated ? { width: 0 } : { width: `${score}%` }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-white/25">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}
