"use client";

import { motion } from "framer-motion";

const STEPS = [
  "Extracting factual claims…",
  "Searching evidence online…",
  "Analyzing with AI…",
  "Computing confidence score…",
  "Generating verdict…",
];

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      {/* Pulsing rings */}
      <div className="relative flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-violet-500/40"
            initial={{ width: 40, height: 40, opacity: 0.8 }}
            animate={{ width: 40 + i * 30, height: 40 + i * 30, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
          />
        ))}
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/40">
          <motion.div
            className="h-4 w-4 rounded-full bg-white/80"
            animate={{ scale: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Step cycle */}
      <div className="h-6 overflow-hidden">
        <motion.div
          animate={{ y: [0, ...STEPS.map((_, i) => -(i + 1) * 24)] }}
          transition={{
            duration: STEPS.length * 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex flex-col gap-0"
        >
          {[...STEPS, STEPS[0]].map((step, i) => (
            <p key={i} className="h-6 text-center text-sm text-white/60 leading-6">
              {step}
            </p>
          ))}
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
