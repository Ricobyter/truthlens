// Extracts plain text content from article URLs and tweet URLs.
// Articles → Tavily /extract.
// Tweets → fxtwitter API (most reliable) → Twitter oEmbed → Tavily.
// Throws a user-friendly Error on failure.

const URL_REGEX = /^https?:\/\/\S+$/i;
const TWITTER_HOST_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com|mobile\.twitter\.com)\//i;
const TWEET_ID_REGEX = /(?:twitter\.com|x\.com|mobile\.twitter\.com)\/(?:#!\/)?(?:\w+)?\/?(?:status(?:es)?|i)\/(\d+)/i;

export function isUrl(input: string): boolean {
  return URL_REGEX.test(input.trim());
}

export function isTweetUrl(input: string): boolean {
  return TWITTER_HOST_REGEX.test(input.trim());
}

function extractTweetId(url: string): string | null {
  const match = url.match(TWEET_ID_REGEX);
  return match ? match[1] : null;
}

async function extractWithTavily(url: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is not configured");

  const response = await fetch("https://api.tavily.com/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, urls: [url] }),
  });

  if (!response.ok) throw new Error(`Tavily extract failed: ${response.statusText}`);

  const data = (await response.json()) as {
    results?: Array<{ url: string; raw_content?: string }>;
  };

  const content = data.results?.[0]?.raw_content?.trim();
  if (!content) throw new Error("No content extracted from URL");

  // Allow up to ~40k chars (~10k tokens) — Groq models support 128k context
  return content.slice(0, 40000);
}

// FxTwitter is a public, no-auth API that mirrors Twitter content reliably.
// Used by Discord for tweet previews. Handles x.com, t.co redirects, and
// returns clean JSON without scraping.
async function extractTweetViaFxTwitter(tweetId: string): Promise<string> {
  const response = await fetch(`https://api.fxtwitter.com/i/status/${tweetId}`, {
    headers: { "User-Agent": "Mozilla/5.0 TruthLens/1.0" },
  });

  if (!response.ok) throw new Error(`fxtwitter failed: ${response.status}`);

  const data = (await response.json()) as {
    code?: number;
    tweet?: {
      text?: string;
      author?: { name?: string; screen_name?: string };
    };
  };

  if (data.code !== 200 || !data.tweet?.text) {
    throw new Error("fxtwitter returned no tweet text");
  }

  const author = data.tweet.author?.name ?? data.tweet.author?.screen_name ?? "Twitter user";
  return `${author} posted on Twitter/X: "${data.tweet.text}"`;
}

async function extractTweetViaOEmbed(url: string): Promise<string> {
  // Twitter oEmbed prefers twitter.com host
  const normalized = url.replace(/^https?:\/\/(?:www\.)?(?:mobile\.)?x\.com\//i, "https://twitter.com/");
  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(normalized)}&omit_script=true`;

  const response = await fetch(oembedUrl, {
    headers: { "User-Agent": "Mozilla/5.0 TruthLens/1.0" },
  });

  if (!response.ok) throw new Error(`oEmbed failed: ${response.status}`);

  const data = (await response.json()) as { html?: string; author_name?: string };
  if (!data.html) throw new Error("oEmbed returned no HTML");

  const text = data.html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/&mdash;[\s\S]*$/, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length < 5) throw new Error("Tweet text was empty after parsing");
  return data.author_name ? `${data.author_name} posted on Twitter/X: "${text}"` : text;
}

export async function extractFromUrl(url: string): Promise<string> {
  const trimmed = url.trim();

  if (isTweetUrl(trimmed)) {
    const tweetId = extractTweetId(trimmed);

    // Strategy 1: fxtwitter (most reliable, no auth, no scraping)
    if (tweetId) {
      try {
        return await extractTweetViaFxTwitter(tweetId);
      } catch (e) {
        console.warn("[urlExtractor] fxtwitter failed:", e);
      }
    }

    // Strategy 2: Twitter's own oEmbed
    try {
      return await extractTweetViaOEmbed(trimmed);
    } catch (e) {
      console.warn("[urlExtractor] oEmbed failed:", e);
    }

    // Strategy 3: Tavily extract
    try {
      return await extractWithTavily(trimmed);
    } catch (e) {
      console.warn("[urlExtractor] Tavily failed:", e);
    }

    throw new Error(
      "Couldn't fetch this tweet — it may be private, deleted, or geo-restricted. Please paste the tweet text instead."
    );
  }

  // Article URL
  try {
    return await extractWithTavily(trimmed);
  } catch (e) {
    console.warn("[urlExtractor] Tavily article extract failed:", e);
    throw new Error(
      "Couldn't fetch this article — the site may be blocking scrapers. Please paste the article text instead."
    );
  }
}
