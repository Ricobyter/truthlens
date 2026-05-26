"use server";

import { z } from "zod";
import { runFactCheckPipeline } from "@/services/factCheckPipeline";
import { connectDB } from "@/lib/mongodb";
import FactCheck from "@/lib/models/FactCheck";
import type { FactCheckRecord } from "@/types";

const InputSchema = z.object({
  input: z.string().min(10).max(5000),
  type: z.enum(["claim", "article", "tweet", "transcript"]).default("claim"),
});

export async function submitFactCheck(
  formData: z.infer<typeof InputSchema>
): Promise<{ success: boolean; data?: FactCheckRecord; error?: string }> {
  const parsed = InputSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const result = await runFactCheckPipeline(parsed.data.input);
    await connectDB();

    const record = await FactCheck.create({
      claim: result.claim,
      verdict: result.verdict,
      confidence: result.confidence,
      summary: result.summary,
      reasoning: result.reasoning,
      sources: result.sources,
    });

    return {
      success: true,
      data: {
        _id: record._id.toString(),
        claim: record.claim,
        verdict: record.verdict,
        confidence: record.confidence,
        summary: record.summary,
        reasoning: record.reasoning,
        sources: record.sources,
        createdAt: record.createdAt,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
