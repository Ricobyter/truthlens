"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CircleHelp,
  SplitSquareVertical,
} from "lucide-react";
import { getVerdictConfig } from "@/utils/verdict";
import type { Verdict } from "@/types";
import { cn } from "@/utils/cn";

const VERDICT_ICONS: Record<Verdict, React.ElementType> = {
  TRUE: CheckCircle2,
  FALSE: XCircle,
  MISLEADING: AlertTriangle,
  "PARTIALLY TRUE": SplitSquareVertical,
  "NOT ENOUGH EVIDENCE": CircleHelp,
};

interface Props {
  verdict: Verdict;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export default function VerdictBadge({ verdict, size = "md", animated = true }: Props) {
  const config = getVerdictConfig(verdict);
  const Icon = VERDICT_ICONS[verdict];

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1 gap-1.5",
    md: "text-sm px-3.5 py-1.5 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
  };

  const iconSizes = { sm: 12, md: 15, lg: 18 };

  const Wrapper = animated ? motion.div : "div";
  const wrapperProps = animated
    ? {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "inline-flex items-center rounded-full border font-semibold tracking-wide",
        config.bg,
        config.border,
        config.color,
        `shadow-lg ${config.glow}`,
        sizeClasses[size]
      )}
    >
      <Icon size={iconSizes[size]} />
      {config.label}
    </Wrapper>
  );
}
