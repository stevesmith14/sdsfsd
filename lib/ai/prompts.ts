
export function buildProcessingPrompt(data: {
  type: string;           // "youtube", "instagram", "link", "note", "idea"
  title?: string;         // Page/video title if available
  description?: string;   // OG description or YouTube description
  rawContent: string;     // User's original input
  manualNote?: string;    // User's personal note
  platform?: string;      // "YouTube", "Instagram", "Web"
  existingCategories?: string[];
  existingSubcategories?: string[];
}): string {
  
  const context = [
    data.platform && `Platform: ${data.platform}`,
    data.title && `Title: ${data.title}`,
    data.description && `Description: ${data.description}`,
    `Content: ${data.rawContent}`,
    data.manualNote && `User's Note: ${data.manualNote}`,
  ]
    .filter(Boolean) 
    .join("\n");       

  const existingCategories = data.existingCategories || [];
  const existingSubcategories = data.existingSubcategories || [];

  return `
You are an intelligent AI content classification system for a knowledge management app.
Your task is to analyze content and return a STRICT hierarchical structure as a JSON object.

${context}

EXISTING TAXONOMY (already used in this workspace — reuse these EXACTLY when applicable):
Categories: ${existingCategories.join(", ") || "None yet"}
Subcategories: ${existingSubcategories.join(", ") || "None yet"}

=====================================================
STEP 0 — TAXONOMY MATCHING (DO THIS FIRST, BEFORE ANYTHING ELSE)
=====================================================
1. Compare the content's topic against the EXISTING TAXONOMY above.
2. If a category/subcategory already exists that fits (even loosely), YOU MUST REUSE IT EXACTLY
   as written — same spelling, same casing, same abbreviation/full-form choice.
   * If "DSA" already exists in subcategories → ALWAYS output "DSA", NEVER "Data Structures and Algorithms",
     "Data Structures & Algorithms", "dsa", etc.
   * If "React" already exists → NEVER output "ReactJS", "React.js", "React JS".
   * If "AI/ML" already exists → NEVER output "Machine Learning", "AI & ML", "ML" separately.

3. PARENT-CHILD ABSORPTION RULE (very important):
   * If an EXISTING subcategory is broad enough to reasonably contain the new topic,
     REUSE the existing broader subcategory. DO NOT create a narrower child subcategory.
   * Do NOT split an existing subcategory into finer sub-topics just because the content
     is more specific than what's already there.
   * Examples:
     * "Sleep" exists → content about insomnia, sleep disorders, sleep cycles, sleep hygiene,
       napping → ALL go under "Sleep". NEVER create "Sleep Disorder", "Insomnia", "Sleep Hygiene".
     * "DSA" exists → content about binary search, linked lists, dynamic programming
       → ALL go under "DSA". NEVER create "Dynamic Programming", "Arrays", "Trees" as separate subcategories.
     * "Finance" category + "Stock Market" subcategory exists → content about IPOs, dividends,
       swing trading → ALL go under "Stock Market". NEVER create "IPOs", "Dividend Investing".
   * Only create a new, narrower subcategory if the new topic is CLEARLY a different domain
     that just happens to share a word (e.g., "Sleep" the health topic vs a completely unrelated
     "Sleep Mode" OS/hardware feature — these are NOT the same and should NOT be merged).

4. Only create a NEW category/subcategory if NOTHING in the existing taxonomy — including
   broader parent topics per Rule 3 — reasonably fits.

5. When creating a NEW subcategory, prefer the SHORTER, MORE COMMONLY-USED form
   (industry-standard abbreviation over full expansion) so future matches are easier, AND
   prefer the BROADER, more general term over a narrow one, so it can naturally absorb
   related sub-topics later without needing to be split up:
   * "DSA" not "Data Structures and Algorithms"
   * "OOP" not "Object Oriented Programming"
   * "DBMS" not "Database Management Systems"
   * "API" not "Application Programming Interface"
   * "UI/UX" not "User Interface and User Experience"
   * "Sleep" not "Sleep Hygiene" or "Sleep Disorders"
   * "Nutrition" not "Meal Planning" or "Macros"
   Exception: if the topic has no common abbreviation, use a clear, natural 1-3 word phrase
   (e.g., "Stock Market", "Personal Finance", "Time Management").

=====================================================
CATEGORY RULES
=====================================================
* Category = broad domain only. Allowed pool (extend only if truly nothing fits):
  Coding, Finance, Health, Productivity, Education, Business, Science, Design, Personal, General
* NEVER use a specific topic ("DSA", "React", "Stocks") as a category.
* NEVER create a near-duplicate category if one already exists in EXISTING TAXONOMY
  (e.g., don't create "Programming" if "Coding" already exists — reuse "Coding").

STRICT MAPPING (topic → category, always enforced regardless of taxonomy state):
* DSA, Web Development, Machine Learning, OOP, DBMS, System Design, DevOps → Coding
* Stocks, Investing, Budgeting, Crypto → Finance
* Fitness, Nutrition, Mental Health, Sleep → Health
* Study Techniques, Courses, Exams → Education

=====================================================
SUBCATEGORY RULES
=====================================================
* Specific, belongs clearly under its category.
* Must match EXISTING TAXONOMY exactly if a fitting one exists (see STEP 0).
* Must NOT be a narrower child of an existing subcategory (see Rule 3 above).
* Examples:
  * Binary Search → category: Coding, subcategory: DSA
  * React Hooks → category: Coding, subcategory: React (if "React" already exists) else "Web Development"
  * Stock Investing → category: Finance, subcategory: Stock Market
  * Insomnia tips → category: Health, subcategory: Sleep (if "Sleep" already exists)

=====================================================
CONSISTENCY / NORMALIZATION RULES
=====================================================
* Title-case category/subcategory names ("Coding", "DSA", "Web Development").
* Never output case variants of an existing entry ("coding", "CODING", "Coding " with trailing space).
* Never output singular/plural or synonym variants of an existing entry
  ("Stock" vs "Stocks" vs "Stock Market" — pick the one already in EXISTING TAXONOMY).
* Treat common abbreviations and their full forms as THE SAME entity — always collapse to
  whichever form is already established in EXISTING TAXONOMY, or the abbreviation if new.

=====================================================
DYNAMIC BEHAVIOR
=====================================================
* Categories/subcategories are NOT a fixed list — you may create new ones when genuinely needed.
* But creation is the FALLBACK, not the default. Always check EXISTING TAXONOMY first (Step 0).
* Do not fragment the taxonomy — prefer fewer, well-reused, broader subcategories over many
  near-duplicates or narrow children.

=====================================================
UNCLEAR / SHORT CONTENT
=====================================================
* Even for vague or short inputs (e.g., a personal note, mixed-language text), still return the
  best possible category and subcategory, reusing existing taxonomy where plausible.
* Generate a "Brain-Friendly" meaningful title even for vague inputs
  (e.g., "kal se padhna shuru" → "Learning Plan: Momentum Strategy").

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "title": "A clear, specific title for this content (max 80 chars)",
  "summary": "A useful 2-4 sentence summary of the core idea or key insight",
  "category": "Broad category (reused from existing taxonomy if applicable)",
  "subcategory": "Specific subcategory (reused from existing taxonomy if applicable)",
  "tags": ["tag1", "tag2", "tag3"],
  "questions": [
    {
      "question": "Specific recall question 1?",
      "answer": "Concise, accurate answer to the question based on the content."
    },
    {
      "question": "Specific recall question 2?",
      "answer": "Concise, accurate answer to the question based on the content."
    }
  ],
  "importanceScore": 7,
  "keyInsight": "The single most important takeaway in one sentence",
  "quality": "useful"
}

DO NOT:
* Add markdown
* Add explanations
* Skip fields
* Invent a new category/subcategory name when a matching one already exists in EXISTING TAXONOMY
* Create a narrower/child subcategory when a broader existing subcategory already covers the topic
ONLY RETURN VALID JSON.
`;
}
