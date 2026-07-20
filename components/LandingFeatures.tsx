"use client";

import {
  Search,
  Tags,
  Brain,
  Network,
  StickyNote,
  RefreshCw,
  Zap,
  Bell,
  type LucideIcon,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

/* ── Data ───────────────────────────────────────────────────────────────── */

const FEATURES: Feature[] = [
  { icon: Search,    title: "Semantic Search",    desc: "Find anything by meaning, not just keywords. Our embeddings understand context and relevance." },
  { icon: Tags,      title: "AI Categorization",  desc: "Every item is automatically tagged and organized into meaningful categories and subcategories." },
  { icon: Brain,     title: "AI Summary",          desc: "Get concise, intelligent summaries of any content — videos, articles, or notes — in seconds." },
  { icon: Network,   title: "Knowledge Graph",     desc: "Discover connections between your saved items through semantic similarity and embeddings." },
  { icon: StickyNote,title: "Smart Notes",         desc: "Capture ideas and thoughts with rich context. AI enriches your notes with structure and insights." },
  { icon: RefreshCw, title: "Spaced Repetition",   desc: "Review at scientifically optimal intervals. Lock knowledge into long-term memory effortlessly." },
  { icon: Zap,       title: "Quick Capture",        desc: "Save anything in under 3 seconds. Paste a URL or jot a thought — AI handles the rest." },
  { icon: Bell,      title: "Smart Reminders",     desc: "Get notified when it's time to review. Never let important knowledge slip through the cracks." },
];

/* ── Stagger delay per card (row-aware for 4-col grid) ───────────────── */

const STAGGER_DELAY_S = 0.08;

/* ── LandingFeatures ─────────────────────────────────────────────────────── */

/**
 * Features grid section for the public landing page.
 * Shown to unauthenticated visitors only.
 * Has id="features" for smooth-scroll from the TopNav "Features" button.
 */
export function LandingFeatures() {
  return (
    <section id="features" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-20 space-y-5">
            <span className="inline-block text-[12px] font-semibold text-primary uppercase tracking-[0.2em]">
              Features
            </span>
            <h2
              className="text-[28px] sm:text-[36px] md:text-[48px] font-black text-text-primary tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Built for how your
              <br />
              mind works.
            </h2>
            <p className="text-text-secondary text-[16px] font-medium max-w-lg mx-auto leading-relaxed">
              Every feature designed to help you capture, organize, and remember knowledge effortlessly.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURES.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * STAGGER_DELAY_S}>
              <div className="card-premium p-7 space-y-5 h-full">
                <div className="w-12 h-12 rounded-2xl bg-primary-glow flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3
                  className="text-[17px] font-bold text-text-primary tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {f.title}
                </h3>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
