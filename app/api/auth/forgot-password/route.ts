import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import { getAppBaseUrl, sendEmail } from "@/lib/email/resend";
import { resetPasswordEmailTemplate } from "@/lib/email/templates";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "Email not registered" 
      }, { status: 404 });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordTokenHash: resetTokenHash,
          resetPasswordExpiresAt: expiresAt,
        },
      }
    );

    const baseUrl = getAppBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    const tpl = resetPasswordEmailTemplate({ name: user.name, resetUrl });

    await sendEmail({
      to: user.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });

    return NextResponse.json({ 
      success: true, 
      message: "If an account exists with that email, a password reset link has been sent." 
    });

  } catch (err) {
    console.error("Forgot password API error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
