import { startOfDay, isBefore } from "date-fns";
import { connectDB } from "./mongodb";
import User from "./models/User";
import { getPlan, isUnlimited } from "./plans";

export interface QuotaStatus {
  used: number;
  limit: number;     // -1 = unlimited
  remaining: number; // Infinity for unlimited
  exceeded: boolean;
}

/**
 * Check (and optionally consume) a user's daily quota.
 * Resets the counter automatically when crossing a day boundary.
 */
export async function checkAndConsumeQuota(userId: string): Promise<QuotaStatus> {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const plan = getPlan(user.plan);

  // Reset if it's a new day
  const today = startOfDay(new Date());
  if (isBefore(user.lastResetDate, today)) {
    user.questionsToday = 0;
    user.lastResetDate = today;
  }

  if (isUnlimited(plan)) {
    user.questionsToday += 1;
    await user.save();
    return { used: user.questionsToday, limit: -1, remaining: Infinity, exceeded: false };
  }

  if (user.questionsToday >= plan.dailyLimit) {
    await user.save(); // persist potential reset
    return {
      used: user.questionsToday,
      limit: plan.dailyLimit,
      remaining: 0,
      exceeded: true,
    };
  }

  user.questionsToday += 1;
  await user.save();

  return {
    used: user.questionsToday,
    limit: plan.dailyLimit,
    remaining: plan.dailyLimit - user.questionsToday,
    exceeded: false,
  };
}

export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const plan = getPlan(user.plan);
  const today = startOfDay(new Date());
  const usedToday = isBefore(user.lastResetDate, today) ? 0 : user.questionsToday;

  if (isUnlimited(plan)) {
    return { used: usedToday, limit: -1, remaining: Infinity, exceeded: false };
  }

  return {
    used: usedToday,
    limit: plan.dailyLimit,
    remaining: Math.max(0, plan.dailyLimit - usedToday),
    exceeded: usedToday >= plan.dailyLimit,
  };
}
