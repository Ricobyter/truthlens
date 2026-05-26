import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { subHours } from "date-fns";
import { auth } from "@/auth";
import { runFactCheckPipeline } from "@/services/factCheckPipeline";
import { connectDB } from "@/lib/mongodb";
import FactCheck from "@/lib/models/FactCheck";
import { checkAndConsumeQuota } from "@/lib/quota";
import { hashClaim } from "@/lib/claimHash";

export const dynamic = "force-dynamic";

const CACHE_WINDOW_HOURS = 24;

const RequestSchema = z
  .object({
    input: z.string().min(1).max(5000),
    type: z.enum(["claim", "article", "tweet", "transcript"]).default("claim"),
  })
  .refine(
    (d) => /^https?:\/\/\S+$/i.test(d.input.trim()) || d.input.trim().length >= 10,
    { message: "Input must be at least 10 characters, or a valid URL", path: ["input"] }
  );

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to fact-check." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const quota = await checkAndConsumeQuota(session.user.id);
    if (quota.exceeded) {
      return NextResponse.json(
        {
          success: false,
          error: `Daily limit reached (${quota.used}/${quota.limit}). Upgrade your plan for more checks.`,
          quota,
        },
        { status: 429 }
      );
    }

    const { input, type } = parsed.data;
    const claimHash = hashClaim(input);

    await connectDB();

    // Cache lookup: any FactCheck with same hash in the last 24h?
    const cached = await FactCheck.findOne({
      claimHash,
      createdAt: { $gte: subHours(new Date(), CACHE_WINDOW_HOURS) },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (cached) {
      // Clone the cached result for this user's personal history.
      // Skips Groq + Tavily calls entirely.
      const record = await FactCheck.create({
        userId: session.user.id,
        claim: cached.claim,
        claimHash: cached.claimHash,
        verdict: cached.verdict,
        confidence: cached.confidence,
        summary: cached.summary,
        reasoning: cached.reasoning,
        sources: cached.sources,
        bias: cached.bias,
        isRealTime: cached.isRealTime,
        fromCache: true,
      });

      return NextResponse.json({
        success: true,
        quota,
        cached: true,
        data: {
          _id: record._id.toString(),
          claim: record.claim,
          verdict: record.verdict,
          confidence: record.confidence,
          summary: record.summary,
          reasoning: record.reasoning,
          sources: record.sources,
          bias: record.bias,
          isRealTime: record.isRealTime,
          fromCache: true,
          createdAt: record.createdAt,
        },
      });
    }

    // Cache miss: run the full pipeline
    const result = await runFactCheckPipeline(input, type);

    const record = await FactCheck.create({
      userId: session.user.id,
      claim: result.claim,
      claimHash,
      verdict: result.verdict,
      confidence: result.confidence,
      summary: result.summary,
      reasoning: result.reasoning,
      sources: result.sources,
      bias: result.bias,
      isRealTime: result.isRealTime,
      fromCache: false,
    });

    return NextResponse.json({
      success: true,
      quota,
      cached: false,
      data: {
        _id: record._id.toString(),
        claim: record.claim,
        verdict: record.verdict,
        confidence: record.confidence,
        summary: record.summary,
        reasoning: record.reasoning,
        sources: record.sources,
        bias: record.bias,
        isRealTime: record.isRealTime,
        fromCache: false,
        createdAt: record.createdAt,
      },
    });
  } catch (err) {
    console.error("[/api/check]", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
