import { NextRequest, NextResponse } from "next/server";
import { addDays } from "date-fns";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

// Stripe sends raw body — must NOT parse as JSON before signature verification.
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
    }

    const stripe = getStripe();
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object;
    const { userId, planId } = session.metadata ?? {};

    if (!userId || (planId !== "silver" && planId !== "gold")) {
      return NextResponse.json({ received: true });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    await connectDB();
    await User.findByIdAndUpdate(userId, {
      plan: planId,
      planExpiresAt: addDays(new Date(), 30),
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[/api/payment/webhook]", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
