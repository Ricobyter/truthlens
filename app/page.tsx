"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search,
  ArrowRight,
  FileInput,
  Brain,
  CheckCircle2,
  Eye,
  Link2,
  Newspaper,
  ShieldCheck,
  BarChart3,
  Sparkles,
  Zap,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VerdictBadge from "@/components/VerdictBadge";

const STATS = [
  { value: "99%", label: "Verification Accuracy" },
  { value: "<3s", label: "Analysis Speed" },
  { value: "10M+", label: "Sources Indexed" },
  { value: "Real-time", label: "Source Analysis" },
];

const STEPS = [
  {
    n: "1",
    icon: FileInput,
    title: "Submit Claim",
    body: "Paste any text, URL, or article you wish to verify. Our system accepts multi-format inputs — claims, tweets, news articles, and transcripts.",
  },
  {
    n: "2",
    icon: Brain,
    title: "AI Analyzes Sources",
    body: "TruthLens cross-references with a global database of trusted journals, government records, and verified real-time data via Tavily search.",
  },
  {
    n: "3",
    icon: CheckCircle2,
    title: "Receive Truth Score",
    body: "Get a comprehensive breakdown, confidence intervals, bias analysis, and primary citations within seconds of your request.",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Fact Checking",
    body: "Autonomous verification using Llama 3.3 70B, fine-tuned for fact-checking accuracy and nuanced reasoning.",
  },
  {
    icon: ShieldCheck,
    title: "Source Reliability",
    body: "Dynamic ranking of publishers based on historical accuracy, editorial standards, and peer-reviewed credibility.",
  },
  {
    icon: BarChart3,
    title: "Truth Score System",
    body: "A weighted 0-100 confidence score calculated from multi-point consensus across retrieved evidence.",
  },
  {
    icon: Eye,
    title: "Bias Detection",
    body: "Identify political lean, emotional language, and institutional biases within the source text automatically.",
  },
  {
    icon: Link2,
    title: "Citation Verification",
    body: "Tracing claims back to their original academic, legislative, or journalistic origin points — never opinion.",
  },
  {
    icon: Newspaper,
    title: "Real-time News Validation",
    body: "Live monitoring of breaking news events with auto-detected recency boost — claims from the last 7 days get priority sourcing.",
  },
];

const FOOTER_LINKS: Record<string, Array<{ label: string; href: string }>> = {
  Product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Trending", href: "/trending" },
    { label: "Pricing", href: "/pricing" },
    { label: "Settings", href: "/settings" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <HowItWorks />
      <FeaturesGrid />
      <LiveDemo />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ───────────────── HERO ───────────────── */
function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleVerify(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) {
      router.push("/dashboard");
      return;
    }
    router.push(`/dashboard?claim=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="relative pt-20 pb-28 px-4">
      {/* Layered radial backdrop */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[600px] w-[1100px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto text-center">
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300"
        >
          <Sparkles className="h-3 w-3" />
          AI-powered fact verification
        </motion.div>

        {/* Massive headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-display mt-6 text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]"
        >
          <span className="text-white/95">Verify Information.</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            Discover the Truth.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 mx-auto max-w-xl text-base sm:text-lg text-white/55 leading-relaxed"
        >
          AI-powered real-time fact checking designed for a digital world overflowing with
          misinformation. Instant analysis of any claim across millions of sources.
        </motion.p>

        {/* Search input */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleVerify}
          className="mt-9 mx-auto max-w-2xl"
        >
          <div className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-2 shadow-2xl shadow-black/40 focus-within:border-violet-500/40 transition-colors">
            <div className="pl-3 pr-1">
              <Search className="h-4 w-4 text-white/40" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste a claim, article, tweet, or news headline…"
              className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder:text-white/30 focus:outline-none py-2"
            />
            <Button type="submit" size="lg" className="rounded-xl px-5">
              Verify Now
            </Button>
          </div>
        </motion.form>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto group">
              Check Facts
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/trending">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Trending
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-20 mx-auto max-w-6xl"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/5">
          {STATS.map((s) => (
            <div key={s.label} className="py-8 px-4 text-center">
              <p className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-br from-white to-violet-300 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] tracking-[0.18em] uppercase text-white/45 font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ───────────────── HOW IT WORKS ───────────────── */
function HowItWorks() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Precision Analysis{" "}
            <span className="relative inline-block">
              in Seconds
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md p-7 hover:bg-white/[0.04] hover:border-white/15 transition-all"
            >
              <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-violet-500/15 border border-violet-500/20 text-violet-300 mb-4">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">
                <span className="text-violet-400 mr-1">{step.n}.</span>
                {step.title}
              </h3>
              <p className="text-sm text-white/55 leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── FEATURES GRID ───────────────── */
function FeaturesGrid() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <p className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
              Unparalleled Intelligence
            </p>
            <p className="text-sm text-white/55 leading-relaxed">
              Equipped with the world&apos;s most advanced linguistic models for detecting
              subtle nuances in misinformation.
            </p>
          </div>
          <Link href="/settings">
            <Button variant="outline" size="lg" className="w-full md:w-auto">
              Explore Documentation
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md p-6 hover:bg-white/[0.04] hover:border-violet-500/30 transition-all group"
            >
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-white/5 border border-white/10 text-violet-300 group-hover:bg-violet-500/15 group-hover:border-violet-500/30 transition-colors mb-4">
                <f.icon className="h-[18px] w-[18px]" />
              </div>
              <h3 className="font-display text-base font-semibold text-white mb-1.5">
                {f.title}
              </h3>
              <p className="text-sm text-white/55 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── LIVE DEMO ───────────────── */
function LiveDemo() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 sm:p-12">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-violet-300">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              Live Demo
            </span>

            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-4 leading-tight">
              See TruthLens in Action
            </h2>
            <p className="text-sm text-white/55 mt-3 leading-relaxed max-w-md">
              Our interface provides clarity at a glance. No more digging through search
              results — just clear, verified data presented logically.
            </p>

            <ul className="space-y-3 mt-6">
              {[
                "Instant Confidence Ratings",
                "Primary Source Highlighting",
                "Contradictory Evidence Alerts",
                "Bias & Source Credibility Analysis",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/75">
                  <CheckCircle className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <MockVerdictCard />
        </div>
      </div>
    </section>
  );
}

function MockVerdictCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/60 to-violet-950/30 backdrop-blur-md shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-black/30">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-violet-400/80" />
        </div>
        <p className="text-[10px] tracking-wider text-white/40 font-mono">REPORT #TL-8829</p>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-[10px] tracking-[0.18em] uppercase text-white/40 mb-2 font-semibold">
            Subject Claim
          </p>
          <p className="text-sm text-white/85 leading-relaxed">
            &ldquo;The recent atmospheric shifts are directly caused by synthetic orbital
            reflection testing.&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
            <p className="font-display text-2xl font-bold text-white">87%</p>
            <p className="text-[10px] tracking-wider uppercase text-violet-300/80 mt-0.5">
              Truth Score
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 flex flex-col justify-center">
            <VerdictBadge verdict="MISLEADING" size="sm" />
            <p className="text-[10px] tracking-wider uppercase text-amber-300/80 mt-1.5">
              High Confidence
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] tracking-[0.18em] uppercase text-white/40 mb-2 font-semibold">
            Top Evidence Sources
          </p>
          <div className="space-y-1.5">
            {[
              { name: "Atmospheric Research Council", tag: "VERIFIED" },
              { name: "Global Weather Institute", tag: "VERIFIED" },
            ].map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2"
              >
                <p className="text-xs text-white/75 truncate">{s.name}</p>
                <span className="text-[9px] tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-semibold">
                  {s.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 space-y-1.5">
          <div className="h-0.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "87%" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-400"
            />
          </div>
          <p className="text-[10px] tracking-wider uppercase text-white/30 text-center font-medium">
            Analysis Complete (0.42s)
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────── FINAL CTA ───────────────── */
function FinalCTA() {
  return (
    <section className="py-28 px-4">
      <div className="max-w-4xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/10 via-white/[0.02] to-indigo-600/10 backdrop-blur-md p-12 sm:p-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-[600px] rounded-full bg-violet-500/20 blur-[100px] -z-10" />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05]"
        >
          Stop Guessing.
          <br />
          <span className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
            Start Verifying.
          </span>
        </motion.h2>

        <p className="mt-5 mx-auto max-w-xl text-white/55">
          Join thousands of researchers, journalists, and truth-seekers who rely on TruthLens
          to navigate the digital frontier.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto group">
              Start Fact Checking
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              See Pricing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── FOOTER ───────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-14 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Image src="/logo.png" alt="TruthLens" width={28} height={28} className="rounded-lg" />
            <span className="font-display text-lg font-bold text-white tracking-tight">
              Truth<span className="text-violet-400">Lens</span>
            </span>
          </div>
          <p className="text-sm text-white/45 leading-relaxed max-w-xs">
            Verifying the digital frontier with AI-powered analytical precision. Built for
            transparency in the age of noise.
          </p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <p className="text-[11px] tracking-[0.18em] uppercase text-white/40 font-semibold mb-4">
              {heading}
            </p>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/65 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
        <p>© {new Date().getFullYear()} TruthLens AI. All rights reserved.</p>
        <p>Built with Next.js · Groq · Tavily · MongoDB</p>
      </div>
    </footer>
  );
}
