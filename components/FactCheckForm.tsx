"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, FileText, Twitter, Mic } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LoadingAnimation from "./LoadingAnimation";
import VerdictCard from "./VerdictCard";
import type { FactCheckRecord } from "@/types";

const INPUT_PLACEHOLDERS: Record<string, string> = {
  claim: "Enter a factual claim to verify… e.g. \"The Great Wall of China is visible from space.\"",
  article: "Paste article text — or drop in an article URL (https://…)",
  tweet: "Paste tweet text — or drop in an x.com / twitter.com link",
  transcript: "Paste a YouTube transcript or speech text here…",
};

export default function FactCheckForm() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("claim");
  const [result, setResult] = useState<FactCheckRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  // Prefill input from ?claim=... (used by /trending "Check this yourself" links)
  useEffect(() => {
    const preset = searchParams.get("claim");
    if (preset) setInput(preset);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    const looksLikeUrl = /^https?:\/\/\S+$/i.test(trimmed);

    if (!trimmed || (!looksLikeUrl && trimmed.length < 10)) {
      toast.error("Please enter at least 10 characters — or paste a URL.");
      return;
    }

    startTransition(async () => {
      setResult(null);
      try {
        const res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: input.trim(), type: activeTab }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          if (res.status === 401) {
            toast.error("Please sign in to fact-check.");
            window.location.href = "/login?callbackUrl=/dashboard";
            return;
          }
          if (res.status === 429) {
            toast.error(json.error ?? "Daily limit reached.", {
              action: {
                label: "Upgrade",
                onClick: () => (window.location.href = "/pricing"),
              },
            });
            return;
          }
          toast.error(json.error ?? "Something went wrong.");
          return;
        }

        setResult(json.data as FactCheckRecord);
        toast.success("Fact check complete!");
      } catch {
        toast.error("Network error — please try again.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="claim" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Claim
          </TabsTrigger>
          <TabsTrigger value="article" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Article
          </TabsTrigger>
          <TabsTrigger value="tweet" className="gap-1.5">
            <Twitter className="h-3.5 w-3.5" /> Tweet
          </TabsTrigger>
          <TabsTrigger value="transcript" className="gap-1.5">
            <Mic className="h-3.5 w-3.5" /> Transcript
          </TabsTrigger>
        </TabsList>

        {(["claim", "article", "tweet", "transcript"] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                value={activeTab === tab ? input : ""}
                onChange={(e) => setInput(e.target.value)}
                placeholder={INPUT_PLACEHOLDERS[tab]}
                className="min-h-[140px] text-base"
                disabled={isPending}
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-white/30">
                  {input.length} / 5000 characters
                </p>
                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    (!/^https?:\/\/\S+$/i.test(input.trim()) && input.trim().length < 10)
                  }
                  size="lg"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Analyzing…
                    </span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Fact Check
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        ))}
      </Tabs>

      {/* Loading state */}
      {isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
        >
          <LoadingAnimation />
        </motion.div>
      )}

      {/* Result */}
      {!isPending && result && <VerdictCard record={result} />}
    </div>
  );
}
