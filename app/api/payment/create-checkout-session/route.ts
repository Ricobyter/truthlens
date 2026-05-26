import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { PLANS, type PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

const Schema = z.object({
  planId: z.enum(["silver", "gold"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 });
    }

    const planId = parsed.data.planId as PlanId;
    const plan = PLANS[planId];
    const stripe = getStripe();

    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            unit_amount: plan.stripePriceAmount,
            product_data: {
              name: `TruthLens ${plan.name} Plan`,
              description: `${plan.dailyLimit === -1 ? "Unlimited" : plan.dailyLimit} fact checks per day — valid for 30 days`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        planId,
      },
      success_url: `${origin}/pricing?success=true&planId=${planId}`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ success: true, url: checkoutSession.url });
  } catch (err) {
    console.error("[/api/payment/create-checkout-session]", err);
    const msg = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
