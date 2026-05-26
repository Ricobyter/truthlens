import { describe, it, expect } from "vitest";
import { getPlan, isUnlimited, PLANS } from "@/lib/plans";

describe("getPlan", () => {
  it("returns the correct plan for each valid id", () => {
    expect(getPlan("free").dailyLimit).toBe(10);
    expect(getPlan("silver").dailyLimit).toBe(50);
    expect(getPlan("gold").dailyLimit).toBe(-1);
  });

  it("falls back to free plan for unknown id", () => {
    // @ts-expect-error — intentionally passing an invalid id
    expect(getPlan("enterprise")).toEqual(PLANS.free);
  });

  it("falls back to free plan for null/undefined", () => {
    expect(getPlan(null)).toEqual(PLANS.free);
    expect(getPlan(undefined)).toEqual(PLANS.free);
  });
});

describe("isUnlimited", () => {
  it("returns true only for the gold plan", () => {
    expect(isUnlimited(PLANS.gold)).toBe(true);
  });

  it("returns false for free and silver plans", () => {
    expect(isUnlimited(PLANS.free)).toBe(false);
    expect(isUnlimited(PLANS.silver)).toBe(false);
  });
});
