import { NextResponse } from "next/server";
import { subDays } from "date-fns";
import { connectDB } from "@/lib/mongodb";
import FactCheck from "@/lib/models/FactCheck";

export const dynamic = "force-dynamic";

// Cache the response for 10 minutes to reduce DB load
export const revalidate = 600;

interface TrendingItem {
  claimHash: string;
  claim: string;
  verdict: string;
  confidence: number;
  summary: string;
  count: number;
  uniqueUsers: number;
  lastChecked: Date;
}

async function aggregate(since: Date | null, limit: number): Promise<TrendingItem[]> {
  await connectDB();

  const match = since ? { createdAt: { $gte: since } } : {};

  const results = await FactCheck.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$claimHash",
        claim: { $last: "$claim" },
        verdict: { $last: "$verdict" },
        confidence: { $avg: "$confidence" },
        summary: { $last: "$summary" },
        count: { $sum: 1 },
        uniqueUserSet: { $addToSet: "$userId" },
        lastChecked: { $max: "$createdAt" },
      },
    },
    {
      $project: {
        _id: 0,
        claimHash: "$_id",
        claim: 1,
        verdict: 1,
        confidence: { $round: ["$confidence", 0] },
        summary: 1,
        count: 1,
        uniqueUsers: { $size: "$uniqueUserSet" },
        lastChecked: 1,
      },
    },
    // Filter out one-off claims (only one check by one user) to reduce noise
    { $match: { count: { $gte: 1 } } },
    { $sort: { count: -1, lastChecked: -1 } },
    { $limit: limit },
  ]);

  return results as TrendingItem[];
}

export async function GET() {
  try {
    const weekAgo = subDays(new Date(), 7);

    const [trendingWeek, mostAskedAllTime] = await Promise.all([
      aggregate(weekAgo, 50),
      aggregate(null, 20),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        trendingWeek,
        mostAskedAllTime,
      },
    });
  } catch (err) {
    console.error("[/api/trending]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trending" },
      { status: 500 }
    );
  }
}
