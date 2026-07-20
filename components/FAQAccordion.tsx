"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface FAQItem {
  q: string;
  a: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

/* ── FAQAccordion ────────────────────────────────────────────────────────── */

/**
 * Renders a list of FAQ items as an accessible accordion.
 * Only one item can be open at a time.
 * State is fully self-contained — no external state needed.
 */
export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={index} className="border-b border-border last:border-b-0">
            <button
              onClick={() => handleToggle(index)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between py-7 text-left group"
            >
              <span
                className="text-[16px] sm:text-[18px] md:text-[20px] font-semibold text-text-primary pr-8 group-hover:text-primary transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.q}
              </span>
              <span className="shrink-0 w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-text-muted group-hover:border-primary/20 group-hover:text-primary transition-all">
                {isOpen ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-7 text-[15px] text-text-secondary leading-relaxed max-w-2xl">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
