import { Metadata } from "next";
import { History } from "lucide-react";
import HistoryTable from "@/components/HistoryTable";

export const metadata: Metadata = {
  title: "History — TruthLens AI",
  description: "View all your previous AI fact checks.",
};

export default function HistoryPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
            <History className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Fact Check History</h1>
            <p className="text-sm text-white/40">All your previous verifications</p>
          </div>
        </div>

        <HistoryTable />
      </div>
    </div>
  );
}
