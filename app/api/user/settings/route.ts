import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import { userSettingsSchema } from "@/lib/utils/validators";

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    await connectDB();
    const u = await User.findById(user.userId).select("email preferences reminderSettings").lean();
    if (!u) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        email: u.email,
        preferences: {
          defaultCategory: u.preferences?.defaultCategory || "General",
          reminderTime: u.preferences?.reminderTime || "09:00",
          timezone: u.preferences?.timezone || "Asia/Kolkata",
          emailReminders: u.preferences?.emailReminders ?? false,
        },
        reminderSettings: {
          enabled: u.reminderSettings?.enabled ?? true,
          frequency: u.reminderSettings?.frequency || "daily",
          lastReminderSentAt: u.reminderSettings?.lastReminderSentAt || null,
        },
      },
    });
  } catch (err) {
    console.error("GET /api/user/settings error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const parsed = userSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();
    const update: any = {};

    if (parsed.data.preferences) {
      for (const [k, v] of Object.entries(parsed.data.preferences)) {
        update[`preferences.${k}`] = v;
      }
    }

    if (parsed.data.reminderSettings) {
      for (const [k, v] of Object.entries(parsed.data.reminderSettings)) {
        update[`reminderSettings.${k}`] = v;
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: true, message: "No changes" });
    }

    const u = await User.findOneAndUpdate(
      { _id: user.userId },
      { $set: update },
      { returnDocument: "after" }
    )
      .select("email preferences reminderSettings")
      .lean();

    return NextResponse.json({ success: true, data: u, message: "Settings updated" });
  } catch (err) {
    console.error("PUT /api/user/settings error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

