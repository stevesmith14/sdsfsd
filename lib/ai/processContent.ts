import { connectDB } from "@/lib/db/mongoose";
import ContentItem from "@/lib/db/models/ContentItem";
import RelatedContent from "@/lib/db/models/RelatedContent";
import { getGeminiModel, getEmbeddingModel } from "./gemini";
import { buildProcessingPrompt } from "./prompts";
import { groqGenerateJson } from "./groq";

function cosineSimilarity(a: number[], b: number[]): number {

      if (!a || !b || a.length !== b.length) return 0;
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// ─── Fetch URL Metadata ───────────────────────────────────
// Gets title and description from any URL using Open Graph tags
async function fetchUrlMetadata(
  url: string
): Promise<{ title?: string; description?: string; image?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },  // Pretend to be a browser
      signal: AbortSignal.timeout(5000),          // Give up after 5 seconds
    });
    const html = await res.text();

    // Extract og:title from HTML using regex
    const titleMatch =
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i);

    // Extract og:description from HTML using regex
    const descMatch =
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

    const imageMatch =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);

    return {
      title: titleMatch?.[1]?.trim(),
      description: descMatch?.[1]?.trim(),
      image: imageMatch?.[1]?.trim(),
    };
  } catch {
    return {};  // If fetch fails, just return empty (AI will use rawContent)
  }
}

// ─── Fetch YouTube Metadata ───────────────────────────────
// Uses the official YouTube Data API (if available) or falls back to oEmbed
async function fetchYouTubeMetadata(
  url: string
): Promise<{ title?: string; description?: string; image?: string }> {
  try {
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\/]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) return {};

    // 1. Try YouTube Data API if key exists
    if (process.env.YOUTUBE_API_KEY) {
      const apiRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
      );
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.items && data.items.length > 0) {
          const snippet = data.items[0].snippet;
          return {
            title: snippet.title,
            description: snippet.description,
            image: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
          };
        }
      }
    }

    // 2. Fallback to oEmbed API (no key required, but no description)
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${url}&format=json`);
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      return {
        title: data.title,
        description: data.author_name ? `Video by ${data.author_name}` : undefined,
        image: data.thumbnail_url,
      };
    }

    return {};
  } catch (err) {
    console.error("YouTube metadata fetch failed:", err);
    return {};
  }
}

// ─── Generate Embedding ───────────────────────────────────
// Converts text into a vector of 768 numbers representing its "meaning"
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = getEmbeddingModel();
    const result = await model.embedContent(text);
    return result.embedding?.values || [];
  } catch (err) {
    console.error("Embedding failed:", err);
    return [];
  }
}

function parseJsonFromModel(text: string) {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

async function generateAiJson(prompt: string) {
  // Primary: Gemini
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return parseJsonFromModel(responseText);
  } catch (err) {
    console.warn("Gemini generation failed, trying Groq fallback:", err);
  }

  // Fallback: Groq
  const groqText = await groqGenerateJson(prompt);
  return parseJsonFromModel(groqText);
}

// ─── Main Processing Function ─────────────────────────────
// This is called from the API route after a content item is saved
export async function processContent(contentId: string, userId: string) {
  await connectDB();

  // Step 1: Fetch the content item from DB
  const content = await ContentItem.findById(contentId);
  if (!content) throw new Error("Content not found");

  // Mark as processing so the frontend can show a loading state
  content.processingStatus = "processing";
  await content.save();

  try {
    // Step 2: Fetch URL metadata if it's a link
    let urlTitle: string | undefined;
    let urlDescription: string | undefined;
    let urlImage: string | undefined;

    if (content.sourceUrl) {
      let meta = {};
      const platform = content.sourcePlatform?.toLowerCase() || "";
      
      if (platform.includes("youtube")) {
        meta = await fetchYouTubeMetadata(content.sourceUrl);
      } else {
        meta = await fetchUrlMetadata(content.sourceUrl);
      }
      
      urlTitle = (meta as any).title;
      urlDescription = (meta as any).description;
      urlImage = (meta as any).image;
    }

    // Step 3: Fetch existing taxonomy for consistency
    const [existingCategories, existingSubcategories] = await Promise.all([
      ContentItem.distinct("category", {
        userId,
        processingStatus: "done",
        category: { $ne: "" },
      }) as Promise<string[]>,
      ContentItem.distinct("subcategory", {
        userId,
        processingStatus: "done",
        subcategory: { $ne: "" },
      }) as Promise<string[]>,
    ]);

    // Step 4: Build the AI prompt with all available context + existing taxonomy
    const prompt = buildProcessingPrompt({
      type: content.type,
      title: urlTitle || content.title,
      description: urlDescription,
      rawContent: content.rawContent,
      manualNote: content.manualNote,
      platform: content.sourcePlatform,
      existingCategories,
      existingSubcategories,
    });

    // Step 5: Call AI (Gemini primary, Groq fallback) and parse JSON response
    const aiData: any = await generateAiJson(prompt);
    if (!aiData) throw new Error("Empty AI response");

    // Step 6: Generate embedding for semantic search
    // We embed the summary + tags for best semantic representation
    const textToEmbed = `${aiData.summary} ${aiData.tags?.join(" ")}`;
    const embedding = await generateEmbedding(textToEmbed);

    // Step 7: Update the content item with AI results
    content.title = aiData.title || content.title;
    content.summary = aiData.summary || "";
    content.tags = aiData.tags || [];
    content.category = aiData.category || "General";
    content.subcategory = aiData.subcategory || "";
    content.aiQuestions = aiData.questions || [];
    content.importanceScore = aiData.importanceScore || 5;
    content.embedding = embedding;
    if (!content.thumbnailUrl && urlImage) {
      content.thumbnailUrl = urlImage;
    }
    content.processingStatus = "done";
    await content.save();

    // Step 8: Find related content using cosine similarity
    // Load all other content items from this user that have embeddings
    const allContent = await ContentItem.find({
      userId,
      _id: { $ne: contentId },   // Exclude the current item
      embedding: { $exists: true, $ne: [] },
    }).select("_id embedding").lean();

    // Calculate similarity with each existing item
    const similarities = allContent
      .map((item) => ({
        id: item._id.toString(),
        score: cosineSimilarity(embedding, item.embedding as number[]),
      }))
      .filter((item) => item.score > 0.6)    // Only keep reasonably similar items
      .sort((a, b) => b.score - a.score)     // Sort by most similar first
      .slice(0, 5);                           // Keep top 5 related items

    // Step 9: Save related content links
    if (similarities.length > 0) {
      await RelatedContent.findOneAndUpdate(
        { contentId },
        {
          relatedContentIds: similarities.map((s) => s.id),
          similarityScores: similarities.map((s) => s.score),
          updatedAt: new Date(),
        },
        { upsert: true }  // Create if doesn't exist, update if it does
      );
    }

    return { success: true, data: content };

  } catch (err) {
    // If AI fails, mark as failed but don't delete the content
    content.processingStatus = "failed";
    await content.save();
    console.error("AI processing failed:", err);
    throw err;
  }
}
