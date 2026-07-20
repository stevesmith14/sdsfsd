import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ContentItem from "@/lib/db/models/ContentItem";
import { requireAuth } from "@/lib/auth/middleware";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    await connectDB();

    // Use MongoDB aggregation to get categories with item counts
    const categoriesWithCounts = await ContentItem.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(user.userId),
          status: "active",
          category: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          lastUsed: { $max: "$createdAt" },
        },
      },
      {
        $sort: { count: -1 }, // Sort by most used first
      },
    ]);

    // Backward-compatible flat list
    const uniqueCategories = categoriesWithCounts
      .map((c) => c._id)
      .filter((c) => typeof c === "string" && c.trim().length > 0);

    // Enriched list with counts
    const enrichedCategories = categoriesWithCounts
      .filter((c) => typeof c._id === "string" && c._id.trim().length > 0)
      .map((c) => ({
        name: c._id,
        count: c.count,
        lastUsed: c.lastUsed,
      }));

    return NextResponse.json({
      success: true,
      data: uniqueCategories, // backward compatible
      categories: enrichedCategories, // new enriched data
    });
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
