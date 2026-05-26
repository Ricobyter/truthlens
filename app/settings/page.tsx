"use client";

import { useState } from "react";
import { Settings, Eye, EyeOff, Save, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ApiField {
  key: string;
  label: string;
  placeholder: string;
  docsUrl: string;
  description: string;
  envKey: string;
}

const API_FIELDS: ApiField[] = [
  {
    key: "groq",
    label: "Groq API Key",
    placeholder: "gsk_...",
    docsUrl: "https://console.groq.com/keys",
    description: "FREE tier — 14,400 req/day. Powers Llama 3.3 70B claim analysis and extraction.",
    envKey: "GROQ_API_KEY",
  },
  {
    key: "tavily",
    label: "Tavily Search API Key",
    placeholder: "tvly-...",
    docsUrl: "https://tavily.com",
    description: "FREE tier — 1,000 req/month. Required for real-time evidence retrieval.",
    envKey: "TAVILY_API_KEY",
  },
  {
    key: "mongodb",
    label: "MongoDB Connection URI",
    placeholder: "mongodb+srv://...",
    docsUrl: "https://www.mongodb.com/cloud/atlas",
    description: "Required to store fact check history.",
    envKey: "MONGODB_URI",
  },
];

export default function SettingsPage() {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>({});

  const toggle = (key: string) =>
    setVisible((v) => ({ ...v, [key]: !v[key] }));

  const handleSave = () => {
    toast.success("Settings are managed via .env.local — see README for setup.", {
      duration: 4000,
    });
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
            <Settings className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-white/40">Manage your API keys and configuration</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-200/70 leading-relaxed">
              API keys are stored securely in your <code className="text-indigo-300">.env.local</code> file
              and never sent to the browser. This page shows you what keys are needed and where to obtain them.
            </p>
          </div>
        </div>

        {/* API Key Cards */}
        <div className="space-y-4">
          {API_FIELDS.map((field, i) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{field.label}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{field.description}</p>
                </div>
                <a
                  href={field.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors flex-shrink-0"
                >
                  Get key
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={visible[field.key] ? "text" : "password"}
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => toggle(field.key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {visible[field.key] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="text-xs text-white/25">
                Add to <code className="text-white/40">.env.local</code>:{" "}
                <code className="text-violet-400/70">{field.envKey}=your_key_here</code>
              </p>
            </motion.div>
          ))}
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>

        {/* Setup instructions */}
        <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-3">
          <h3 className="font-semibold text-white text-sm">Quick Setup</h3>
          <ol className="space-y-2 text-sm text-white/50">
            {[
              "Copy .env.example to .env.local",
              "Add your OpenAI API key (from platform.openai.com)",
              "Add your Tavily API key (from tavily.com)",
              "Add your MongoDB connection URI (from MongoDB Atlas)",
              "Restart the dev server: npm run dev",
            ].map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-violet-400 font-medium flex-shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
