"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { defaultAvatar } from "@/lib/dicebear";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (status === "loading") {
    return <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">Sign in</Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">Sign up</Button>
        </Link>
      </div>
    );
  }

  const { user } = session;
  const avatarUrl = user.image ?? defaultAvatar(user.email ?? user.id);
  const planLabel = (user.plan ?? "free").toUpperCase();
  const planColor =
    user.plan === "gold"
      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
      : user.plan === "silver"
      ? "bg-slate-400/20 text-slate-200 border-slate-400/30"
      : "bg-white/5 text-white/60 border-white/10";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 hover:bg-white/5 transition-colors"
      >
        <Image
          src={avatarUrl}
          alt={user.name ?? "Avatar"}
          width={28}
          height={28}
          className="h-7 w-7 rounded-full border border-white/10"
          unoptimized
        />
        <ChevronDown className="h-3.5 w-3.5 text-white/40" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-sm font-medium text-white truncate">{user.name ?? user.email}</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
              <span
                className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${planColor}`}
              >
                {planLabel} PLAN
              </span>
            </div>

            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
              >
                <User className="h-4 w-4 text-white/40" />
                Profile
              </Link>
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
              >
                <CreditCard className="h-4 w-4 text-white/40" />
                Plans & Billing
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
              >
                <LogOut className="h-4 w-4 text-white/40" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
