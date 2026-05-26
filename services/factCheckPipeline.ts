import { extractPrimaryClaim } from "./claimExtractor";
import { searchEvidence } from "./tavily";
import { verifyWithAI } from "./groq";
import { isUrl, extractFromUrl } from "./urlExtractor";
import type { FactCheckResult } from "@/types";

type InputType = "claim" | "article" | "tweet" | "transcript";

export async function runFactCheckPipeline(
  input: string,
  type: InputType = "claim"
): Promise<FactCheckResult & { claim: string }> {
  let text = input;

  if (isUrl(input)) {
    if (type === "article" || type === "tweet") {
      text = await extractFromUrl(input);
    } else {
      throw new Error(
        `URLs aren't supported in the ${type} tab — paste the text directly, or switch to the Article or Tweet tab.`
      );
    }
  }

  const claim = await extractPrimaryClaim(text);
  const { sources, isRealTime } = await searchEvidence(claim);
  const result = await verifyWithAI(claim, sources);

  return { ...result, isRealTime, claim };
}
