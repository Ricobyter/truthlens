import Groq from "groq-sdk";
import type { BiasAnalysis, FactCheckResult, Source } from "@/types";

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are an expert fact-checker, research analyst, and media bias specialist. Your job is to analyze factual claims against provided evidence AND assess bias signals, then return a structured JSON verdict.

Always respond with valid JSON only — no markdown, no extra text.

VERDICT options:
- "TRUE" — claim is well-supported by evidence
- "FALSE" — claim is contradicted by evidence
- "MISLEADING" — claim contains selective truths that create a false impression
- "PARTIALLY TRUE" — claim is partly correct but omits key context
- "NOT ENOUGH EVIDENCE" — insufficient evidence to make a determination

CONFIDENCE: 0-100 — how confident you are in the verdict.

BIAS ANALYSIS:
- politicalLean: classify the *claim's framing* (not the topic) on the political spectrum:
  "LEFT", "CENTER-LEFT", "CENTER", "CENTER-RIGHT", "RIGHT", "MIXED", or "NON-POLITICAL"
- emotionalLanguage: 0-100 — how loaded, sensational, or emotionally-charged the claim's language is (0 = neutral/factual, 100 = highly inflammatory)
- sourceCredibility: 0-100 — average reliability of the retrieved sources (consider domain reputation, fact-checking history, editorial standards)
- biasIndicators: 1-4 short flags noting specific bias signals you detected (e.g. "Uses loaded term 'radical'", "Omits opposing perspective", "Relies on partisan sources only", "Cherry-picks statistics")`;

function buildUserPrompt(claim: string, sources: Source[]): string {
  const evidenceText = sources
    .map((s, i) => {
      const date = s.publishedDate ? ` (published ${s.publishedDate})` : "";
      return `[${i + 1}] ${s.title}${date}\n${s.snippet ?? "No snippet available."}\nURL: ${s.url}`;
    })
    .join("\n\n");

  return `Analyze the following claim using the retrieved evidence below.

CLAIM:
"${claim}"

RETRIEVED EVIDENCE:
${evidenceText || "No evidence retrieved."}

Return a JSON object with this exact structure:
{
  "verdict": "<TRUE|FALSE|MISLEADING|PARTIALLY TRUE|NOT ENOUGH EVIDENCE>",
  "confidence": <0-100>,
  "summary": "<1-2 sentence summary of your finding>",
  "reasoning": ["<point 1>", "<point 2>", "<point 3>"],
  "sources": [{ "title": "<title>", "url": "<url>" }],
  "bias": {
    "politicalLean": "<LEFT|CENTER-LEFT|CENTER|CENTER-RIGHT|RIGHT|MIXED|NON-POLITICAL>",
    "emotionalLanguage": <0-100>,
    "sourceCredibility": <0-100>,
    "biasIndicators": ["<flag 1>", "<flag 2>"]
  }
}`;
}

const FALLBACK_BIAS: BiasAnalysis = {
  politicalLean: "NON-POLITICAL",
  emotionalLanguage: 0,
  sourceCredibility: 50,
  biasIndicators: [],
};

export async function verifyWithAI(
  claim: string,
  sources: Source[]
): Promise<FactCheckResult> {
  const completion = await getClient().chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(claim, sources) },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
    max_tokens: 1500,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<FactCheckResult>;

  // Always include retrieved sources, preserving publishedDate from Tavily
  const finalSources: Source[] =
    parsed.sources && parsed.sources.length > 0
      ? parsed.sources.map((s, i) => ({
          title: s.title,
          url: s.url,
          publishedDate: sources[i]?.publishedDate,
        }))
      : sources.map((s) => ({
          title: s.title,
          url: s.url,
          publishedDate: s.publishedDate,
        }));

  return {
    verdict: parsed.verdict ?? "NOT ENOUGH EVIDENCE",
    confidence: parsed.confidence ?? 0,
    summary: parsed.summary ?? "",
    reasoning: parsed.reasoning ?? [],
    sources: finalSources,
    bias: parsed.bias ?? FALLBACK_BIAS,
    isRealTime: false, // set by the pipeline
  };
}
