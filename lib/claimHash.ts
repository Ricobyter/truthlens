import crypto from "node:crypto";

/**
 * Normalize a claim for deduplication: lowercase, collapse whitespace,
 * strip surrounding quotes and trailing punctuation. The same claim phrased
 * with slightly different formatting will hash to the same value.
 */
export function normalizeClaim(claim: string): string {
  return claim
    .trim()
    .toLowerCase()
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/[.!?;,\s]+$/g, "")
    .replace(/\s+/g, " ");
}

export function hashClaim(claim: string): string {
  const normalized = normalizeClaim(claim);
  return crypto.createHash("sha256").update(normalized).digest("hex");
}
