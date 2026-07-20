"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/contexts/LenisContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const followerRef = useRef<HTMLDivElement>(null);
  const { setInstance } = useLenis();

  // Lenis smooth scroll + GSAP ticker sync
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      autoRaf: false,       // GSAP ticker drives Lenis — prevent double-rAF
      autoResize: true,     // Keep ResizeObserver active as a baseline
    });

    // Expose to context so child pages can call resize()
    setInstance(lenis);

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Store the ticker callback so we can properly remove it on cleanup
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      setInstance(null);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, [setInstance]);

  // Cursor follower — does NOT replace the OS cursor
  useEffect(() => {
    const follower = followerRef.current;
    if (!follower) return;

    // Only show on non-touch devices
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    // GSAP quickTo for buttery smooth follow
    const xTo = gsap.quickTo(follower, "x", { duration: 0.35, ease: "power2.out" });
    const yTo = gsap.quickTo(follower, "y", { duration: 0.35, ease: "power2.out" });

    let prevX = 0;
    let prevY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      // Calculate velocity for squash/stretch
      const vx = clientX - prevX;
      const vy = clientY - prevY;
      prevX = clientX;
      prevY = clientY;

      // Move follower
      xTo(clientX);
      yTo(clientY);

      // Elastic squash/stretch based on velocity
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > 6) {
        const angle = Math.atan2(vy, vx);
        const squeeze = Math.min(speed / 80, 0.35);

        gsap.to(follower, {
          scaleX: 1 + squeeze,
          scaleY: 1 - squeeze * 0.4,
          rotation: (angle * 180) / Math.PI,
          duration: 0.12,
          ease: "power2.out",
          overwrite: true,
        });
      } else {
        gsap.to(follower, {
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
          overwrite: true,
        });
      }

      // Detect hoverable elements for grow effect
      const target = e.target as HTMLElement;
      const hoverTarget =
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        target.closest(".clickable");

      if (hoverTarget) {
        follower.classList.add("is-hovering");
      } else {
        follower.classList.remove("is-hovering");
      }
    };

    const onMouseEnter = () => {
      gsap.to(follower, { opacity: 0.7, duration: 0.3 });
    };

    const onMouseLeave = () => {
      gsap.to(follower, { opacity: 0, duration: 0.3 });
      follower.classList.remove("is-hovering");
    };

    // Set initial centering
    gsap.set(follower, { xPercent: -50, yPercent: -50 });

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Single cursor follower — OS cursor remains visible */}
      <div
        ref={followerRef}
        className="cursor-follower hidden md:block"
      />
      {children}
    </>
  );
}
