"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import VerdictBadge from "./VerdictBadge";
import ConfidenceMeter from "./ConfidenceMeter";
import EvidencePanel from "./EvidencePanel";
import SkeletonCard from "./SkeletonCard";
import { timeAgo, truncate } from "@/utils/format";
import type { FactCheckRecord } from "@/types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function HistoryTable() {
  const [records, setRecords] = useState<FactCheckRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/history?page=${p}&limit=10`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data);
        setPagination(json.pagination);
      }
    } catch {
      toast.error("Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(page); }, [fetchHistory, page]);

  async function deleteRecord(id: string) {
    try {
      await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((r) => r._id !== id));
      toast.success("Deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  }

  async function clearAll() {
    if (!confirm("Clear all history?")) return;
    try {
      await fetch("/api/history", { method: "DELETE" });
      setRecords([]);
      setPagination(null);
      toast.success("History cleared.");
    } catch {
      toast.error("Failed to clear history.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="text-center py-20 text-white/30">
        <p className="text-lg">No fact checks yet.</p>
        <p className="text-sm mt-1">Submit a claim on the dashboard to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">
          {pagination?.total ?? 0} checks total
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => fetchHistory(page)} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 text-red-400 hover:text-red-300">
            <Trash2 className="h-3.5 w-3.5" /> Clear All
          </Button>
        </div>
      </div>

      {/* Records */}
      <AnimatePresence>
        {records.map((record, i) => (
          <motion.div
            key={record._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden"
          >
            {/* Row */}
            <div
              className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setExpanded(expanded === record._id ? null : record._id ?? null)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 font-medium leading-snug">
                  {truncate(record.claim, 120)}
                </p>
                <p className="text-xs text-white/30 mt-1">{timeAgo(record.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <VerdictBadge verdict={record.verdict} size="sm" animated={false} />
                <span className="text-xs text-white/40 hidden sm:block">{record.confidence}%</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteRecord(record._id!); }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
              {expanded === record._id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/5"
                >
                  <div className="px-5 pb-5 pt-4 space-y-4">
                    <p className="text-sm text-white/70 leading-relaxed">{record.summary}</p>
                    <ConfidenceMeter score={record.confidence} animated={false} />
                    <EvidencePanel sources={record.sources} reasoning={record.reasoning} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-white/50">
            {page} / {pagination.pages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page === pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
