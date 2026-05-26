"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Camera, Save, Sparkles, Crown, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";
import { cn } from "@/utils/cn";

interface Profile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  plan: "free" | "silver" | "gold";
  planName: string;
  planExpiresAt?: string;
  quota: { used: number; limit: number; remaining: number; exceeded: boolean };
}

const PLAN_ICONS = { free: Sparkles, silver: Zap, gold: Crown };

export default function ProfilePage() {
  const { update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadProfile() {
    const res = await fetch("/api/profile");
    const data = await res.json();
    if (data.success) {
      setProfile(data.data);
      setName(data.data.name ?? "");
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSaveName() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      toast.success("Name updated.");
      await update();
      loadProfile();
    } else {
      toast.error(data.error ?? "Update failed.");
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-avatar", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error ?? "Upload failed.");
        return;
      }

      toast.success("Profile picture updated!");
      await update();
      loadProfile();
    } catch {
      toast.error("Network error.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="h-72 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  const PlanIcon = PLAN_ICONS[profile.plan];
  const plan = PLANS[profile.plan];
  const percent =
    plan.dailyLimit === -1
      ? 0
      : Math.min(100, Math.round((profile.quota.used / plan.dailyLimit) * 100));

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6"
      >
        <h1 className="text-2xl font-bold text-white mb-6">Your profile</h1>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <Image
              src={profile.image ?? ""}
              alt={profile.name ?? "Avatar"}
              width={88}
              height={88}
              className="h-22 w-22 rounded-full border-2 border-white/10 object-cover"
              unoptimized
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-violet-500 text-white flex items-center justify-center shadow-lg hover:bg-violet-400 transition-colors disabled:opacity-50"
              aria-label="Change avatar"
            >
              {uploading ? (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1">
            <p className="text-sm text-white/40">{profile.email}</p>
            <p className="text-xs text-white/30 mt-1">Click camera to upload a new picture (max 4MB)</p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5 mb-2">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            Display name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              maxLength={80}
            />
            <Button
              onClick={handleSaveName}
              disabled={saving || name === (profile.name ?? "")}
              size="sm"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Plan + Quota */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Current plan</h2>
          <Link href="/pricing">
            <Button variant="ghost" size="sm">
              {profile.plan === "gold" ? "Manage" : "Upgrade"}
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center",
              profile.plan === "gold"
                ? "bg-amber-500/20 text-amber-400"
                : profile.plan === "silver"
                ? "bg-violet-500/20 text-violet-400"
                : "bg-white/5 text-white/60"
            )}
          >
            <PlanIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-white">{profile.planName} Plan</p>
            {profile.planExpiresAt && (
              <p className="text-xs text-white/40">
                Renews {new Date(profile.planExpiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Quota meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">Today&apos;s usage</span>
            <span className="font-medium text-white/80">
              {plan.dailyLimit === -1
                ? `${profile.quota.used} checks (unlimited)`
                : `${profile.quota.used} / ${plan.dailyLimit}`}
            </span>
          </div>
          {plan.dailyLimit !== -1 && (
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.6 }}
                className={cn(
                  "h-full bg-gradient-to-r",
                  percent > 80
                    ? "from-red-500 to-orange-500"
                    : percent > 50
                    ? "from-amber-500 to-yellow-500"
                    : "from-violet-500 to-indigo-500"
                )}
              />
            </div>
          )}
          {profile.quota.exceeded && (
            <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-300 font-medium">Daily limit reached</p>
                <p className="text-xs text-red-300/70">
                  Resets at midnight, or{" "}
                  <Link href="/pricing" className="underline">
                    upgrade your plan
                  </Link>{" "}
                  for more checks.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
