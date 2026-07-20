import { NextRequest,NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import ContentItem from "@/lib/db/models/ContentItem";
import { requireAuth } from "@/lib/auth/middleware";

import { createContentSchema } from "@/lib/utils/validators";
import { detectContentType, detectPlatform, getThumbnailUrl } from "@/lib/utils/helpers";
import ReviewState from "@/lib/db/models/ReviewState";
import ActivityLog from "@/lib/db/models/ActivityLog";
import { waitUntil } from "@vercel/functions";
import { processContent } from "@/lib/ai/processContent";



export async function GET(req:NextRequest) {
    const authResult = await requireAuth();

    if (authResult instanceof NextResponse) {
        return authResult
    }

   const { user } = authResult;
    try{
        await connectDB();
        const {searchParams} = new URL(req.url);

        let page = parseInt(searchParams.get("page") || "1" );

        let limit = parseInt(searchParams.get("limit") || "20")

        const category = searchParams.get("category")

        const status = searchParams.get("status") || "active";
   const search = searchParams.get("search");
        let sort = searchParams.get("sort") || "-createdAt";

        if (isNaN(page) || page<1) {
            page =1;
        }
        if (isNaN(limit) || limit<1) {
            limit = 20;
        }
        if (limit>50) {
            limit = 50;
        }

          const allowedSort = ["createdAt", "-createdAt", "importanceScore", "-importanceScore"];

          if(!allowedSort.includes(sort)){
            sort = "-createdAt"
          }
          
          const query : any = {
            userId: user.userId,
            status
          }
          if (category) {
            query.category = category
          }

          const type = searchParams.get("type");
          if (type) {
            query.type = type;
          }
          
    
    if (search && search.trim().length > 0) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { subcategory: { $regex: search, $options: "i" } },
        { rawContent: { $regex: search, $options: "i" } }
      ];
    }

    // 📄 Pagination
    const skip = (page - 1) * limit;

    // ⚡ DB queries
    const [items, total] = await Promise.all([
      ContentItem.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      ContentItem.countDocuments(query),
    ]);

return NextResponse.json({
    success: true,
    data:{
        items,
        total,
        page,
        totalPages: Math.ceil(total/limit),
        hasMore: page*limit<total
    }
})


    }catch(err){
  console.error("GET /api/content error:", err);
  return NextResponse.json({success: false,error: "Internal server error"},{status: 500})
        
    }
}


//POST Route

export async function POST(req:NextRequest) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
        return authResult
    }
    const { user } = authResult;
try{
    const body = await  req.json()
    const parsed = createContentSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ success: false,error: parsed.error.issues[0].message},{status: 400})
    }

    const { type, sourceUrl, manualNote, runAI } = parsed.data
    const rawContent = parsed.data.rawContent || sourceUrl || "";

    if (!rawContent || rawContent.trim().length===0) {
        return NextResponse.json({
            success: false,
            error: "Content can not be empty"
        },{status: 400});
    }

    await connectDB();

    if (sourceUrl) {
        const exists = await ContentItem.findOne({userId: user.userId,sourceUrl})

        if (exists) {
            return NextResponse.json({
                success: false,
                error: "Content already saved"
            },{status:400})
        }
    }

    let detectedType = type
    let sourcePlatform = ""
    let thumbnailUrl: string | undefined;
    if (sourceUrl) {
        detectedType = detectContentType(sourceUrl) as any;
        sourcePlatform = detectPlatform(sourceUrl)

        if (sourcePlatform !== "YouTube" && sourcePlatform !== "Instagram") {
            return NextResponse.json({
                success: false,
                error: "Only YouTube and Instagram links are supported at this time"
            }, { status: 400 });
        }

        thumbnailUrl = getThumbnailUrl(sourceUrl, sourcePlatform);
    }

    const safeContent = rawContent || "";
    const title = parsed.data.title ||   safeContent.slice(0, 80) + (safeContent.length > 80 ? "..." : "");

    const contentItem = await ContentItem.create({
        userId: user.userId,
        type: detectedType,
        sourceUrl,
        sourcePlatform,
        thumbnailUrl,
        title,
        rawContent,
        manualNote,
        processingStatus: "pending",
})

await ReviewState.create({
    userId: user.userId,
    contentId: contentItem._id,
})
    await ActivityLog.create({
      userId: user.userId,
      actionType: "save",
      contentId: contentItem._id,
      metadata: { type: detectedType, platform: sourcePlatform },
    });

    if (runAI !== false) {
      await processContent(contentItem._id.toString(), user.userId).catch((err) =>
        console.error("Background AI processing failed:", err)
      );
    }

 return NextResponse.json(
      { success: true, data: contentItem },
      { status: 201 }
    );


}catch(err){
    console.error("POST /api/content error : ", err);
    return NextResponse.json({
        success: false,
        error: "Internal Server error"
    },{status: 500})
}

}