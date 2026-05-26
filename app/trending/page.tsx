"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Star } from "lucide-react";
import TrendingList, { type TrendingItem } from "@/components/TrendingList";

interface TrendingData {
  trendingWeek: TrendingItem[];
  mostAskedAllTime: TrendingItem[];
}

export default function TrendingPage() {
  const [data, setData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trending")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Trending claims</h1>
        <p className="text-white/50">
          See what the community is fact-checking. Click any claim to run it on your account.
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Trending this week */}
          <section>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20">
                <Flame className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Trending this week</h2>
                <p className="text-xs text-white/40">Top 50 claims from the past 7 days</p>
              </div>
            </motion.div>
            <TrendingList
              items={data?.trendingWeek ?? []}
              emptyMessage="No trending claims this week — yet."
            />
          </section>

          {/* Most asked of all time */}
          <section>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20">
                <Star className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Most asked of all time</h2>
                <p className="text-xs text-white/40">Top 20 most-checked claims ever</p>
              </div>
            </motion.div>
            <TrendingList
              items={data?.mostAskedAllTime ?? []}
              emptyMessage="No checks recorded yet."
            />
          </section>
        </div>
      )}
    </div>
  );
}
