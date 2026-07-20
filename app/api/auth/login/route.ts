import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import { signToken } from "@/lib/auth/jwt";
import { loginSchema } from "@/lib/utils/validators";

export async function POST(req: NextRequest) {
    try{
    const body = await req.json();
   

     const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 },
          );
        }

        const {email,password} = parsed.data
        await connectDB();

            const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { success: false, error: "Please verify your email before logging in." },
        { status: 403 }
      );
    }
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          },
        },
        message: "Logged in successfully",
      },
      { status: 200 }
    );
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
    }catch(err){
        console.error("error in login route : ",err)
         return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
    }
}