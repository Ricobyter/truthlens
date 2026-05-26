import Groq from "groq-sdk";

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// llama-3.1-8b-instant supports a 128k context window — we can pass full articles.
const MODEL = "llama-3.1-8b-instant";

const SYSTEM_PROMPT = `You are an expert claim extractor. Given input text (tweet, article, news story, transcript), identify the single most factually verifiable and significant claim to fact-check.

Rules:
- Pick a SPECIFIC, CHECKABLE factual assertion — not an opinion, prediction, or vague statement.
- Prefer claims with named entities (people, places, organizations, numbers, dates).
- Rewrite the claim as a complete, self-contained sentence that includes necessary context (who, what, when).
- If the text contains multiple claims, pick the most newsworthy and verifiable one.

Return ONLY the extracted claim as a plain string — no JSON, no quotes, no preamble, no explanation.`;

export async function extractPrimaryClaim(input: string): Promise<string> {
  const trimmed = input.trim();

  // Short inputs are likely already direct claims — skip extraction
  if (trimmed.split(/\s+/).length < 30) return trimmed;

  // Pass up to ~30k chars (~7.5k tokens) — well within the 128k context window
  const content = trimmed.slice(0, 30000);

  const completion = await getClient().chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Extract the primary factual claim from this text:\n\n${content}`,
      },
    ],
    temperature: 0,
    max_tokens: 256,
  });

  return completion.choices[0]?.message?.content?.trim() ?? trimmed.slice(0, 500);
}
