import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectDB();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // First check if token exists at all (valid vs never existed)
    const userByToken = await User.findOne({
      resetPasswordTokenHash: tokenHash,
    });

    if (!userByToken) {
      return NextResponse.json(
        { success: false, error: "Invalid or already used reset token" },
        { status: 400 }
      );
    }

    // Check if it's expired
    if (!userByToken.resetPasswordExpiresAt || userByToken.resetPasswordExpiresAt < new Date()) {
      // Clear the expired token
      await User.updateOne(
        { _id: userByToken._id },
        { $unset: { resetPasswordTokenHash: "", resetPasswordExpiresAt: "" } }
      );
      return NextResponse.json(
        { success: false, error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password and update
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    await User.updateOne(
      { _id: userByToken._id },
      {
        $set: { passwordHash },
        $unset: { resetPasswordTokenHash: "", resetPasswordExpiresAt: "" },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (err) {
    console.error("Reset password API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
