import { describe, it, expect } from "vitest";
import { normalizeClaim, hashClaim } from "@/lib/claimHash";

describe("normalizeClaim", () => {
  it("lowercases and trims whitespace", () => {
    expect(normalizeClaim("  The Earth Is Flat  ")).toBe("the earth is flat");
  });

  it("strips surrounding quotes", () => {
    expect(normalizeClaim('"vaccines cause autism"')).toBe("vaccines cause autism");
    expect(normalizeClaim("“Biden raised taxes”")).toBe("biden raised taxes");
  });

  it("strips trailing punctuation", () => {
    expect(normalizeClaim("the moon landing was faked!")).toBe("the moon landing was faked");
    expect(normalizeClaim("climate change is real.")).toBe("climate change is real");
  });

  it("collapses internal whitespace", () => {
    expect(normalizeClaim("the   earth   is   round")).toBe("the earth is round");
  });
});

describe("hashClaim", () => {
  it("produces a 64-char hex string", () => {
    const hash = hashClaim("the earth is round");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("is deterministic — same claim always hashes the same", () => {
    expect(hashClaim("COVID vaccines are safe")).toBe(hashClaim("COVID vaccines are safe"));
  });

  it("normalizes before hashing — different formatting, same hash", () => {
    expect(hashClaim("  The Earth Is Flat!  ")).toBe(hashClaim("the earth is flat"));
  });
});
