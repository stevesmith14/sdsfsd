import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import ReviewState from "@/lib/db/models/ReviewState";
import ContentItem from "@/lib/db/models/ContentItem";
import { getAppBaseUrl, sendEmail } from "@/lib/email/resend";
import { reminderDigestTemplate } from "@/lib/email/reminderTemplate";

function isAllowed(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("x-cron-secret") === secret;
}

function isWithin24h(d: Date | null | undefined) {
  if (!d) return false;
  return Date.now() - d.getTime() < 24 * 60 * 60 * 1000;
}

export async function GET(req: NextRequest) {
  if (!isAllowed(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    await connectDB();
    const now = new Date();

    const users = await User.find({
      emailVerified: true,
      "preferences.emailReminders": true,
      "reminderSettings.enabled": true,
    })
      .select("name email reminderSettings preferences")
      .lean();

    const baseUrl = getAppBaseUrl();

    let sent = 0;
    let skipped = 0;
    const skipReasons: any = {};

    for (const u of users as any[]) {
      if (!force && isWithin24h(u?.reminderSettings?.lastReminderSentAt)) {
        skipped++;
        skipReasons[u.email] = "Sent within 24h";
        continue;
      }

      const dueStates = await ReviewState.find({
        userId: u._id,
        isCompleted: false,
        nextReviewDate: { $lte: now },
      })
        .sort({ nextReviewDate: 1 })
        .limit(5)
        .lean();

      if (dueStates.length === 0) {
        skipped++;
        skipReasons[u.email] = "No due items";
        continue;
      }

      const ids = dueStates.map((s: any) => s.contentId);
      const items = await ContentItem.find({
        _id: { $in: ids },
        userId: u._id,
        status: { $ne: "deleted" },
      })
        .select("_id title")
        .lean();

      const itemById = new Map(items.map((it: any) => [it._id.toString(), it]));
      const emailItems = dueStates
        .map((s: any) => {
          const it = itemById.get(s.contentId.toString());
          if (!it) return null;
          return {
            title: it.title,
            url: `${baseUrl}/content/${it._id}?review=1`,
          };
        })
        .filter(Boolean) as Array<{ title: string; url: string }>;

      if (emailItems.length === 0) {
        skipped++;
        skipReasons[u.email] = "No valid items found";
        continue;
      }

      const tpl = reminderDigestTemplate({ name: u.name, items: emailItems });

      await sendEmail({
        to: u.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
      });

      await User.updateOne(
        { _id: u._id },
        { $set: { "reminderSettings.lastReminderSentAt": new Date() } }
      );

      sent++;
    }

    return NextResponse.json({ success: true, data: { sent, skipped, skipReasons } });
  } catch (err) {
    console.error("GET /api/cron/reminders error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

