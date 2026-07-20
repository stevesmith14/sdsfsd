/**
 * Auto-assign emoji icons to categories based on keyword matching.
 * Falls back to a deterministic hash-based icon for unknown categories.
 */

const CATEGORY_ICON_MAP: Record<string, string> = {
  // Technology & Development
  coding: "💻",
  programming: "💻",
  development: "💻",
  code: "💻",
  software: "💻",
  "web development": "🌐",
  "mobile development": "📱",
  frontend: "🎨",
  backend: "⚙️",
  devops: "🔧",
  ai: "🤖",
  "artificial intelligence": "🤖",
  "machine learning": "🤖",
  "ai/ml": "🤖",
  ml: "🤖",
  "data science": "📊",
  blockchain: "⛓️",
  crypto: "₿",
  cybersecurity: "🔒",
  security: "🔒",
  cloud: "☁️",
  database: "🗄️",

  // Creative & Design
  design: "🎨",
  "ui/ux": "🎨",
  "graphic design": "🖌️",
  photography: "📸",
  video: "🎬",
  animation: "🎞️",
  music: "🎵",
  art: "🎭",
  creative: "✨",
  writing: "✍️",

  // Business & Finance
  business: "💼",
  startup: "🚀",
  entrepreneurship: "🚀",
  marketing: "📣",
  sales: "💰",
  finance: "📈",
  investing: "📈",
  "stock market": "📈",
  stocks: "📈",
  economics: "📊",
  "real estate": "🏠",
  accounting: "🧮",

  // Education & Learning
  education: "📚",
  learning: "📚",
  study: "📖",
  tutorial: "📝",
  course: "🎓",
  research: "🔬",
  science: "🔬",
  physics: "⚛️",
  chemistry: "🧪",
  biology: "🧬",
  mathematics: "➗",
  math: "➗",
  history: "📜",

  // Health & Wellness
  health: "🏥",
  fitness: "💪",
  nutrition: "🥗",
  "mental health": "🧠",
  meditation: "🧘",
  yoga: "🧘",
  sleep: "😴",
  wellness: "🌿",
  medicine: "💊",

  // Lifestyle
  personal: "👤",
  lifestyle: "🌟",
  travel: "✈️",
  food: "🍕",
  cooking: "👨‍🍳",
  fashion: "👗",
  sports: "⚽",
  gaming: "🎮",
  movies: "🎬",
  books: "📖",
  reading: "📖",
  entertainment: "🎭",
  hobbies: "🎯",

  // Productivity & Self-improvement
  productivity: "⚡",
  "time management": "⏰",
  "self improvement": "📈",
  "self-improvement": "📈",
  motivation: "🔥",
  habits: "🔄",
  goals: "🎯",
  career: "💼",
  leadership: "👑",
  communication: "💬",

  // Other
  general: "📌",
  misc: "📌",
  miscellaneous: "📌",
  other: "📌",
  technology: "🖥️",
  nature: "🌿",
  environment: "🌍",
  politics: "🏛️",
  philosophy: "💭",
  psychology: "🧠",
  relationships: "❤️",
  parenting: "👶",
  pets: "🐾",
  diy: "🔨",
  home: "🏠",
  garden: "🌱",
  automotive: "🚗",
  space: "🚀",
  astronomy: "🔭",
  language: "🗣️",
  languages: "🗣️",
};

// Fallback icons for categories that don't match any keyword
const FALLBACK_ICONS = [
  "📂",
  "📁",
  "🏷️",
  "📋",
  "🗂️",
  "📑",
  "🔖",
  "📎",
];

/**
 * Returns an emoji icon for the given category name.
 * Uses keyword matching first, then falls back to a deterministic selection.
 */
export function getCategoryIcon(categoryName: string): string {
  if (!categoryName) return "📂";

  const normalized = categoryName.toLowerCase().trim();

  // Direct match
  if (CATEGORY_ICON_MAP[normalized]) {
    return CATEGORY_ICON_MAP[normalized];
  }

  // Partial match: check if the category name contains any known keyword
  for (const [keyword, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (normalized.includes(keyword) || keyword.includes(normalized)) {
      return icon;
    }
  }

  // Deterministic fallback based on string hash
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACK_ICONS[Math.abs(hash) % FALLBACK_ICONS.length];
}
