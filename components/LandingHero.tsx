"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

export function LandingHero() {
  return (
    <section
      id="hero"
      className="min-h-[100vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 pt-20 pb-16 relative"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-[280px] sm:w-[400px] md:w-[500px] h-[280px] sm:h-[400px] md:h-[500px] bg-primary/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] bg-violet-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-10">
      

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[40px] sm:text-[56px] md:text-[72px] lg:text-[88px] xl:text-[99px] font-black text-text-primary tracking-tight"
          style={{ fontFamily: "var(--font-display)", lineHeight: "0.95" }}
        >
          Remember{" "}
          <span className="italic">everything</span>
          <br />
          that matters.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-text-secondary text-[15px] sm:text-[17px] md:text-[19px] max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Capture knowledge from anywhere. Let AI organize, summarize, and connect it.
          Review at the perfect moment to lock it into memory.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
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
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 pt-8 text-text-muted text-[13px] sm:text-[14px] font-medium"
        >
          <div className="flex items-center gap-2">
            <span className="text-text-primary font-bold text-[18px]" style={{ fontFamily: "var(--font-display)" }}>10k+</span>
            Notes Saved
          </div>
          <div className="w-1 h-4 bg-border rounded-full" />
          <div className="flex items-center gap-2">
            <span className="text-text-primary font-bold text-[18px]" style={{ fontFamily: "var(--font-display)" }}>&lt;50ms</span>
            Search Speed
          </div>
          <div className="w-1 h-4 bg-border rounded-full" />
          <div className="flex items-center gap-2">
            <span className="text-text-primary font-bold text-[18px]" style={{ fontFamily: "var(--font-display)" }}>8</span>
            AI Categories
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-text-muted" />
        </motion.div>
      </motion.div>
    </section>
  );
}
