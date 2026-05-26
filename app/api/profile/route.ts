import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getQuotaStatus } from "@/lib/quota";
import { getPlan } from "@/lib/plans";
import { defaultAvatar } from "@/lib/dicebear";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const quota = await getQuotaStatus(session.user.id);
    const plan = getPlan(user.plan);

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image ?? defaultAvatar(user.email),
        plan: user.plan,
        planName: plan.name,
        planExpiresAt: user.planExpiresAt,
        quota,
      },
    });
  } catch (err) {
    console.error("[/api/profile]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { name?: string; image?: string };
    const update: Record<string, string> = {};
    if (typeof body.name === "string" && body.name.trim().length > 0) {
      update.name = body.name.trim().slice(0, 80);
    }
    if (typeof body.image === "string" && body.image.startsWith("https://")) {
      update.image = body.image;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });
    }

    await connectDB();
    await User.findByIdAndUpdate(session.user.id, update);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/profile PATCH]", err);
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}
