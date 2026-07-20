"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Brain, RefreshCw, PlusCircle } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  {
    num: "01",
    title: "Capture",
    desc: "Paste a YouTube link, drop an article URL, or jot down a quick note. It takes less than 3 seconds.",
    icon: PlusCircle,
  },
  {
    num: "02",
    title: "Process",
    desc: "AI reads your content, generates a summary, extracts tags, assigns categories, and builds connections.",
    icon: Brain,
  },
  {
    num: "03",
    title: "Remember",
    desc: "Review flashcards at scientifically optimal intervals. Your knowledge compounds over time.",
    icon: RefreshCw,
  },
];

export default function ScrollPinHowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const cards = cardsRef.current;

    if (!container || !cards) return;

    const ctx = gsap.context(() => {
      const getScrollDistance = () =>
        Math.max(
          0,
          cards.scrollWidth - (container.clientWidth - cards.offsetLeft),
        );

      gsap.to(cards, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: 0.3,
          anticipatePin: 1,
          start: "top top",
          end: () => `+=${Math.max(getScrollDistance(), 1)}`,
          invalidateOnRefresh: true,
        },
      });
    }, container);

    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="h-screen w-full bg-bg-elevated/40 overflow-hidden flex flex-col justify-center relative"
    >
      <div className="absolute top-20 sm:top-24 left-4 sm:left-8 md:left-16 z-10">
        <span className="inline-block text-[12px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">
          How It Works
        </span>

        <h2
          className="text-[28px] sm:text-[36px] md:text-[56px] font-black text-text-primary tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Three steps to a
          <br />
        </h2>
        <h2
          className="text-[28px] sm:text-[36px] text-[#E8632A] md:text-[56px] font-black  tracking-tight leading-tight "
          style={{ fontFamily: "var(--font-display)" }}
        > sharper mind.</h2>

      </div>

      <div className="flex items-center h-full pt-40 sm:pt-48 px-4 sm:px-8 md:px-16">
        <div
          ref={cardsRef}
          className="flex min-w-full w-max gap-6 sm:gap-12 md:gap-24 pr-4 sm:pr-8 md:pr-16 items-center"
        >
          {steps.map((step) => (
            <div
              key={step.num}
              className="w-[80vw] sm:w-[60vw] md:w-[45vw] lg:w-[35vw] flex-shrink-0 card-premium p-6 sm:p-10 md:p-14 relative"
            >
              <div
                className="absolute -top-10 -right-4 text-[120px] font-black text-primary/5 select-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.num}
              </div>

              <div className="w-16 h-16 rounded-2xl bg-primary-glow flex items-center justify-center mb-8 relative z-10">
                <step.icon className="w-8 h-8 text-primary" />
              </div>

              <h3
                className="text-[22px] sm:text-[28px] md:text-[36px] font-bold text-text-primary tracking-tight mb-4 relative z-10"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.title}
              </h3>

              <p className="text-[16px] md:text-[18px] text-text-secondary leading-relaxed font-medium relative z-10">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}