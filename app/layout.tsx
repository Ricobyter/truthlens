import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TruthLens AI — Real-Time Fact Checker",
  description:
    "AI-powered fact checking for claims, news articles, tweets, and transcripts. Get verdicts with confidence scores and evidence in seconds.",
  keywords: ["fact check", "AI", "misinformation", "truth", "news verification"],
  openGraph: {
    title: "TruthLens AI",
    description: "Real-Time AI Fact Checking",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${sora.variable} font-sans`}>
        {/* Ambient background glow */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/8 blur-[100px]" />
        </div>

        <SessionProvider>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
        </SessionProvider>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(15,15,20,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </body>
    </html>
  );
}
