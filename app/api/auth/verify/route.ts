import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import PendingUser from "@/lib/db/models/PendingUser";
import { hashEmailVerificationToken } from "@/lib/auth/emailVerification";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 });
    }

    const tokenHash = hashEmailVerificationToken(token);
    await connectDB();

    const pendingUser = await PendingUser.findOne({
      verificationTokenHash: tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!pendingUser) {
      console.error("No pending user found for token hash or token expired.");
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Create the real user
    const newUser = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      passwordHash: pendingUser.passwordHash,
      emailVerified: true,
    });

    // Delete the pending record
    const deleteResult = await PendingUser.deleteOne({ _id: pendingUser._id });

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (err: any) {
    console.error("GET /api/auth/verify error:", err);
    console.error("Error details:", err.message);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

