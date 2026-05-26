"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, Globe } from "lucide-react";
import type { Source } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  sources: Source[];
  reasoning: string[];
}

export default function EvidencePanel({ sources, reasoning }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-medium text-white/80">
          Evidence & Sources
          <span className="ml-2 text-white/40 text-xs">({sources.length} sources)</span>
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-white/40" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
              {/* Reasoning points */}
              {reasoning.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Analysis Points
                  </p>
                  <ul className="space-y-2">
                    {reasoning.map((point, i) => (
                      <li key={i} className="flex gap-3 text-sm text-white/70">
                        <span className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-medium">
                          {i + 1}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources */}
              {sources.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Sources
                  </p>
                  <div className="space-y-2">
                    {sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/3 hover:bg-white/8 transition-colors group"
                        )}
                      >
                        <Globe className="h-4 w-4 text-white/30 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white/80 group-hover:text-white transition-colors truncate font-medium">
                            {src.title}
                          </p>
                          {src.snippet && (
                            <p className="text-xs text-white/40 mt-0.5 line-clamp-2">
                              {src.snippet}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-violet-400/70 truncate">{src.url}</p>
                            {src.publishedDate && (
                              <span className="text-[10px] text-white/30 whitespace-nowrap">
                                · {new Date(src.publishedDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
