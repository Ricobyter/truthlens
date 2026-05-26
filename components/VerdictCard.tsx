"use client";

import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { formatDate } from "@/utils/format";
import VerdictBadge from "./VerdictBadge";
import ConfidenceMeter from "./ConfidenceMeter";
import EvidencePanel from "./EvidencePanel";
import BiasPanel from "./BiasPanel";
import type { FactCheckRecord } from "@/types";

interface Props {
  record: FactCheckRecord;
}

export default function VerdictCard({ record }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Claim Analyzed</p>
            <p className="text-white font-medium leading-relaxed">{record.claim}</p>
          </div>
          <VerdictBadge verdict={record.verdict} size="md" />
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-white/30">
          {record.createdAt && <span>{formatDate(record.createdAt)}</span>}
          {record.isRealTime && (
            <span className="flex items-center gap-1 text-emerald-400/80 font-medium">
              <Radio className="h-3 w-3 animate-pulse" />
              Real-time news (past 7 days)
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        <div>
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
            Summary
          </p>
          <p className="text-sm text-white/80 leading-relaxed">{record.summary}</p>
        </div>

        <ConfidenceMeter score={record.confidence} />

        {record.bias && <BiasPanel bias={record.bias} />}

        <EvidencePanel sources={record.sources} reasoning={record.reasoning} />
      </div>
    </motion.div>
  );
}
