import type { Source } from "@/types";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  results: TavilyResult[];
  answer?: string;
}

// Heuristic detection of time-sensitive claims. If matched, we use Tavily's
// news topic with a 7-day window — the verdict will reflect current reporting.
const TIME_SENSITIVE_REGEX =
  /\b(today|yesterday|tonight|this (?:week|month|morning|afternoon|evening)|recently|just (?:announced|happened|said|posted|tweeted)|breaking|hours? ago|days? ago|moments? ago|earlier this|last (?:week|night)|currently|right now|live|developing|202[5-9])\b/i;

export function isTimeSensitive(query: string): boolean {
  return TIME_SENSITIVE_REGEX.test(query);
}

export interface SearchResult {
  sources: Source[];
  isRealTime: boolean;
}

export async function searchEvidence(query: string): Promise<SearchResult> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is not configured");

  const realTime = isTimeSensitive(query);

  const body: Record<string, unknown> = {
    api_key: apiKey,
    query,
    search_depth: "advanced",
    include_answer: true,
    include_raw_content: false,
    max_results: 6,
  };

  if (realTime) {
    body.topic = "news";
    body.days = 7;
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.statusText}`);
  }

  const data: TavilyResponse = await response.json();

  const sources: Source[] = data.results.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content.slice(0, 300),
    publishedDate: r.published_date,
  }));

  return { sources, isRealTime: realTime };
}
