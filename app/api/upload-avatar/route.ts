import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCloudinary } from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "File must be an image" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "File too large (max 4MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const cloudinary = getCloudinary();
    const result = await cloudinary.uploader.upload(base64, {
      folder: "truthlens/avatars",
      public_id: `user_${session.user.id}`,
      overwrite: true,
      transformation: [
        { width: 256, height: 256, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    // Persist new avatar URL on the user
    await connectDB();
    await User.findByIdAndUpdate(session.user.id, { image: result.secure_url });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error("[/api/upload-avatar]", err);
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
