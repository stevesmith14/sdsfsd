import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import PendingUser from "@/lib/db/models/PendingUser";
import { generateEmailVerificationToken } from "@/lib/auth/emailVerification";
import { getAppBaseUrl, sendEmail } from "@/lib/email/resend";
import { verificationEmailTemplate } from "@/lib/email/templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body?.email || "").toString().toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: true, message: "Email already verified." });
    }

    const pendingUser = await PendingUser.findOne({ email });
    // Do not leak whether email exists
    if (!pendingUser) {
      return NextResponse.json({ success: true, message: "If the email exists, a verification link was sent." });
    }

    // Basic anti-spam: only allow resend every 45 seconds
    const now = new Date();
    const ageMs = 1000 * 60 * 60 - (pendingUser.expiresAt.getTime() - now.getTime());
    if (ageMs < 1000 * 45) {
      return NextResponse.json(
        { success: false, error: "Please wait 45 seconds before requesting another email." },
        { status: 429 }
      );
    }

    const { token, tokenHash, expiresAt } = generateEmailVerificationToken();
    pendingUser.verificationTokenHash = tokenHash;
    pendingUser.expiresAt = expiresAt;
    await pendingUser.save();

    const baseUrl = getAppBaseUrl();
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
    const tpl = verificationEmailTemplate({ name: pendingUser.name, verifyUrl });
    
    try {
      await sendEmail({
        to: pendingUser.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
      });
      console.log("Email sent successfully!");
    } catch (emailResult: any) {
      console.error("Email Error details:", emailResult);
    }

    return NextResponse.json({ success: true, message: "If the email exists, a verification link was sent." });
  } catch (err) {
    console.error("POST /api/auth/resend-verification error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

