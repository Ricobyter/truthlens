import { describe, it, expect, vi, beforeEach } from "vitest";
import { subDays } from "date-fns";

// Mock connectDB so tests never touch a real database
vi.mock("@/lib/mongodb", () => ({ connectDB: vi.fn() }));

// Mock the User model — we control what findById returns per test
vi.mock("@/lib/models/User", () => ({
  default: { findById: vi.fn() },
}));

import { checkAndConsumeQuota } from "@/lib/quota";
import User from "@/lib/models/User";

const mockFindById = vi.mocked(User.findById);

function makeUser(overrides: Record<string, unknown> = {}) {
  const base = {
    plan: "free",
    questionsToday: 0,
    lastResetDate: new Date(), // today — no reset needed
    save: vi.fn(),
    ...overrides,
  };
  mockFindById.mockResolvedValue(base as never);
  return base;
}

beforeEach(() => vi.clearAllMocks());

describe("checkAndConsumeQuota", () => {
  it("increments questionsToday and returns remaining count", async () => {
    makeUser({ questionsToday: 3 });

    const result = await checkAndConsumeQuota("user123");

    expect(result.used).toBe(4);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBe(6);
    expect(result.exceeded).toBe(false);
  });

  it("returns exceeded:true when daily limit is reached", async () => {
    makeUser({ questionsToday: 10 }); // already at free plan limit

    const result = await checkAndConsumeQuota("user123");

    expect(result.exceeded).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("resets counter when lastResetDate is from a previous day", async () => {
    makeUser({
      questionsToday: 9,
      lastResetDate: subDays(new Date(), 1), // yesterday
    });

    const result = await checkAndConsumeQuota("user123");

    // Counter resets to 0 then increments to 1
    expect(result.used).toBe(1);
    expect(result.exceeded).toBe(false);
  });

  it("returns unlimited status for gold plan users", async () => {
    makeUser({ plan: "gold", questionsToday: 999 });

    const result = await checkAndConsumeQuota("user123");

    expect(result.limit).toBe(-1);
    expect(result.remaining).toBe(Infinity);
    expect(result.exceeded).toBe(false);
  });

  it("throws when user is not found", async () => {
    mockFindById.mockResolvedValue(null);

    await expect(checkAndConsumeQuota("nonexistent")).rejects.toThrow("User not found");
  });
});
