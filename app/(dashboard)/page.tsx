"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  BookOpen,
  Clock,
  TrendingUp,
  PlusCircle,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollPinHowItWorks from "@/components/ScrollPinHowItWorks";
import { FAQAccordion, type FAQItem } from "@/components/FAQAccordion";
import { LandingHero } from "@/components/LandingHero";
import { LandingFeatures } from "@/components/LandingFeatures";
import RecallifyLogo from "@/components/RecallifyLogo";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ════════════════════════════════════════════════════════════
   FAQ Data
   ════════════════════════════════════════════════════════════ */
const FAQ_DATA: FAQItem[] = [
  {
    q: "What types of content can I save?",
    a: "You can save YouTube videos, Instagram posts, web articles, plain text notes, code snippets, and ideas. Recallify processes all of them with AI to extract key insights.",
  },
  {
    q: "How does the AI summarization work?",
    a: "When you save content, our AI reads it, extracts the core ideas, generates a concise summary, assigns relevant tags, and categorizes it automatically — all within seconds.",
  },
  {
    q: "What is spaced repetition?",
    a: "Spaced repetition is a scientifically proven learning technique. Recallify schedules reviews at optimal intervals so you retain knowledge long-term without cramming.",
  },
  {
    q: "Is my data private and secure?",
    a: "Absolutely. Your data is encrypted, stored securely, and never shared with third parties. You have full control over your knowledge base.",
  },
  {
    q: "Can I search across all my saved content?",
    a: "Yes. Our semantic search understands meaning, not just keywords. Search across videos, notes, articles, and snippets all at once from the Library.",
  },
  {
    q: "Is Recallify free to use?",
    a: "Recallify offers a generous free tier. You can save unlimited items and use all core features including AI summaries and spaced repetition.",
  },
];

/* ════════════════════════════════════════════════════════════
   ScrollReveal (inline, improved)
   ════════════════════════════════════════════════════════════ */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [delay]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [totalInsights, setTotalInsights] = useState(0);
  const [dueReviews, setDueReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome back");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  // openFaq state moved into FAQAccordion component

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const loadDashboardData = async () => {
      try {
        const [contentRes, reviewRes] = await Promise.all([
          fetch("/api/content?limit=1"),
          fetch("/api/review/due"),
        ]);

        if (contentRes.status === 401) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);

        const contentData = await contentRes.json();
        const reviewData = await reviewRes.json();

        if (contentData.success) setTotalInsights(contentData.data.total || 0);
        if (reviewData.success) setDueReviews(reviewData.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  /* ── Loading State ── */
  if (loading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-root space-y-4">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Authenticated Dashboard ── */
  if (isAuthenticated === true) {
    return (
      <div className="pt-28 pb-20 page-transition">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 space-y-10 sm:space-y-16">
          {/* Hero Greeting */}
          <section className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-[32px] sm:text-[48px] md:text-[64px] font-black text-text-primary leading-[1.05] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {greeting}.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-text-secondary text-[15px] sm:text-[17px] font-medium max-w-lg"
            >
              Your second brain has{" "}
              <strong className="text-primary font-bold">{loading ? "..." : totalInsights}</strong> insights
              and{" "}
              <strong className="text-primary font-bold">{loading ? "..." : dueReviews.length}</strong> items
              ready for review.
            </motion.p>
          </section>

          {/* Stats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {[
              { label: "Items Saved", value: loading ? "..." : totalInsights.toString(), icon: Brain, color: "text-text-secondary", trend: "+4 this week" },
              { label: "Reviews Due", value: loading ? "..." : dueReviews.length.toString(), icon: Clock, color: "text-primary", trend: "Keep learning" },
              { label: "Knowledge Score", value: loading ? "..." : "92%", icon: TrendingUp, color: "text-emerald-500", trend: "Excellent retention" },
            ].map((stat) => (
              <div key={stat.label} className="card-premium p-6 sm:p-7 flex items-center gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-bg-root flex items-center justify-center shrink-0">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">{stat.label}</div>
                  <div className="text-[28px] sm:text-[36px] font-black text-text-primary leading-none mt-1" style={{ fontFamily: "var(--font-display)" }}>
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-text-muted font-medium mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-success" /> {stat.trend}
                  </div>
                </div>
              </div>
            ))}
          </motion.section>

          {/* Reviews Due */}
          {!loading && dueReviews.length > 0 && (
            <Reveal>
              <section className="card-premium p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-[18px] font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                        Ready for Review
                      </h2>
                      <p className="text-[12px] text-text-muted">Strengthen your memory today</p>
                    </div>
                  </div>
                  <span className="text-[32px] font-black text-primary" style={{ fontFamily: "var(--font-display)" }}>
                    {dueReviews.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {dueReviews.slice(0, 4).map(({ item }) => (
                    <Link href={`/content/${item._id}`} key={item._id} className="group block">
                      <div className="flex items-center justify-between p-4 rounded-xl hover:bg-bg-root transition-colors">
                        <div className="min-w-0">
                          <h4 className="text-[14px] font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-text-muted block mt-0.5">{item.category || "General"}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {/* Quick Actions */}
          <Reveal>
            <section className="flex flex-wrap gap-4">
              <Link href="/capture" className="btn-primary h-14 px-8 flex items-center gap-2.5 text-[14px]">
                <PlusCircle className="w-4.5 h-4.5" /> Quick Capture
              </Link>
              <Link href="/library" className="btn-outline h-14 px-8 flex items-center gap-2.5 text-[14px]">
                <BookOpen className="w-4.5 h-4.5" /> Browse Library
              </Link>
            </section>
          </Reveal>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     LANDING PAGE (Unauthenticated)
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="page-transition">
      <LandingHero />

      <LandingFeatures />


      {/* ── HOW IT WORKS (GSAP Pinned Horizontal Scroll) ── */}
      <div id="how-it-works">
        <ScrollPinHowItWorks />
      </div>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-16 space-y-5">
              <span className="inline-block text-[12px] font-semibold text-primary uppercase tracking-[0.2em]">
                FAQ
              </span>
              <h2
                className="text-[28px] sm:text-[36px] md:text-[48px] font-black text-text-primary tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Questions &amp; Answers
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card-premium px-4 sm:px-8 md:px-12">
              <FAQAccordion items={FAQ_DATA} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8">
        <Reveal>
          <div className="max-w-4xl mx-auto text-center space-y-8 relative">
            {/* Glow */}
            <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.06] rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 space-y-8">
              <h2
                className="text-[28px] sm:text-[36px] md:text-[56px] font-black text-text-primary tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Start building your
                <br />
                second brain.
              </h2>
              <p className="text-text-secondary text-[17px] font-medium max-w-lg mx-auto leading-relaxed">
                Every article, video, and idea you save becomes part of your permanent knowledge base.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link href="/signup" className="btn-primary h-12 sm:h-14 px-7 sm:px-10 flex items-center gap-2.5 text-[14px] sm:text-[15px]">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="btn-outline h-12 sm:h-14 px-7 sm:px-10 flex items-center gap-2.5 text-[14px] sm:text-[15px] border-border-strong"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6 md:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          {/* Link Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <RecallifyLogo size={28} />
                <span
                  className="text-[16px] font-bold text-text-primary"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Recallify
                </span>
              </div>
              <p className="text-[13px] text-text-muted leading-relaxed max-w-[220px]">
                Your AI-powered second brain. Capture, organize, and remember everything.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-4">
                Product
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Features", action: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
                  { label: "How It Works", action: () => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" }) },
                  { label: "FAQ", action: () => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }) },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={item.action}
                      className="text-[14px] text-text-secondary hover:text-primary transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/privacy" className="text-[14px] text-text-secondary hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-[14px] text-text-secondary hover:text-primary transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-4">
                Connect
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://github.com/shoaibkhan1s"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-text-secondary hover:text-primary transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <Link href="/contact" className="text-[14px] text-text-secondary hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-text-muted">
              &copy; {new Date().getFullYear()} Recallify. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-[12px] text-text-muted hover:text-text-secondary transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-[12px] text-text-muted hover:text-text-secondary transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
