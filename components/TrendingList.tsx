"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, TrendingUp, ArrowRight, Users, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";
import VerdictBadge from "./VerdictBadge";
import { cn } from "@/utils/cn";
import type { Verdict } from "@/types";

export interface TrendingItem {
  claimHash: string;
  claim: string;
  verdict: Verdict;
  confidence: number;
  summary: string;
  count: number;
  uniqueUsers: number;
  lastChecked: string;
}

interface Props {
  items: TrendingItem[];
  emptyMessage?: string;
}

export default function TrendingList({ items, emptyMessage }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
        <TrendingUp className="h-8 w-8 text-white/20 mx-auto mb-3" />
        <p className="text-white/50">{emptyMessage ?? "No trending claims yet. Be the first!"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <TrendingRow key={item.claimHash} item={item} rank={idx + 1} />
      ))}
    </div>
  );
}

function TrendingRow({ item, rank }: { item: TrendingItem; rank: number }) {
  const [open, setOpen] = useState(false);

  // Pass claim to dashboard via query string for re-check
  const checkLink = `/dashboard?claim=${encodeURIComponent(item.claim)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx_delay(rank), 0.3) }}
      className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <div
          className={cn(
            "flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold",
            rank <= 3
              ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg"
              : "bg-white/5 text-white/50"
          )}
        >
          {rank}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/90 font-medium line-clamp-2">{item.claim}</p>
          <div className="flex items-center gap-3 text-[11px] text-white/40 mt-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {item.count} {item.count === 1 ? "check" : "checks"}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {item.uniqueUsers} {item.uniqueUsers === 1 ? "user" : "users"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(item.lastChecked), { addSuffix: true })}
            </span>
          </div>
        </div>

        <VerdictBadge verdict={item.verdict} size="sm" />

        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-white/40 flex-shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">
                  Summary
                </p>
                <p className="text-sm text-white/70">{item.summary}</p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-xs text-white/40">
                  Confidence:{" "}
                  <span className="text-white/70 font-medium">{item.confidence}%</span>
                </p>
                <Link href={checkLink}>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    Check this yourself
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function idx_delay(rank: number): number {
  return rank * 0.03;
}
