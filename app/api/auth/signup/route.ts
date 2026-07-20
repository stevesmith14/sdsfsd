import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import PendingUser from "@/lib/db/models/PendingUser";
import { signupSchema } from "@/lib/utils/validators";
import { generateEmailVerificationToken } from "@/lib/auth/emailVerification";
import { getAppBaseUrl, sendEmail } from "@/lib/email/resend";
import { verificationEmailTemplate } from "@/lib/email/templates";


export async function POST(req: NextRequest) {
  try {
    // Step 1: Read the JSON body sent by the frontend
    const body = await req.json();

    // Step 2: Validate the input using Zod
    // If name/email/password don't match rules, this throws an error
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;

    // Step 3: Connect to MongoDB
    await connectDB();

    // Step 4: Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email Already Exist" },
        { status: 409 },
      );
    }

    // Step 5: Hash the password (NEVER store plain text passwords)
    // 12 = "salt rounds" — higher = more secure but slower. 12 is the sweet spot.
    const passwordHash = await bcrypt.hash(password, 12);

    // Step 6: Create or update pending user
    const { token, tokenHash, expiresAt } = generateEmailVerificationToken();
    
    // Check if there's already a pending signup for this email and remove it
    await PendingUser.deleteOne({ email });

    await PendingUser.create({
      name,
      email,
      passwordHash,
      verificationTokenHash: tokenHash,
      expiresAt: expiresAt,
    });

    // Step 7: Send verification email (account remains inactive until verified)
    const baseUrl = getAppBaseUrl();
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
    const tpl = verificationEmailTemplate({ name, verifyUrl });
    
    await sendEmail({
      to: email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });

    // Step 8: Build the response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            name,
            email,
          },
        },
        message: "Account created. Please verify your email to activate your account.",
      },
      {
        status: 200,
      },
    );
    return response;
  } catch (err) {
    console.error("error in Post route of signup : ", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
