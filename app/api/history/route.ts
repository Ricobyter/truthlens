import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import FactCheck from "@/lib/models/FactCheck";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));
    const skip = (page - 1) * limit;

    await connectDB();

    const filter = { userId: session.user.id };
    const [records, total] = await Promise.all([
      FactCheck.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      FactCheck.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: records.map((r) => ({ ...r, _id: r._id.toString(), userId: r.userId?.toString() })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[/api/history]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await connectDB();

    if (id) {
      // Only allow deleting your own records
      await FactCheck.findOneAndDelete({ _id: id, userId: session.user.id });
    } else {
      await FactCheck.deleteMany({ userId: session.user.id });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/history DELETE]", err);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
