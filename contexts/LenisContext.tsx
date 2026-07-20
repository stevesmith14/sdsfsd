"use client";

import { createContext, useContext, useCallback, useRef, useMemo } from "react";
import Lenis from "lenis";

interface LenisContextValue {
  /** Store the Lenis instance (called by ClientLayout) */
  setInstance: (lenis: Lenis | null) => void;
  /** Force Lenis to recalculate page dimensions — call after dynamic content loads */
  resize: () => void;
  /** Scroll to top (useful on route change) */
  scrollToTop: () => void;
}

const LenisContext = createContext<LenisContextValue | null>(null);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  const setInstance = useCallback((lenis: Lenis | null) => {
    lenisRef.current = lenis;
  }, []);

  const resize = useCallback(() => {
    // Double-RAF: first frame lets the DOM paint, second frame lets layout settle
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lenisRef.current?.resize();
      });
    });
  }, []);

  const scrollToTop = useCallback(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, []);

  const value = useMemo(
    () => ({ setInstance, resize, scrollToTop }),
    [setInstance, resize, scrollToTop]
  );

  return (
    <LenisContext.Provider value={value}>
      {children}
    </LenisContext.Provider>
  );
}

const fallback: LenisContextValue = {
  setInstance: () => {},
  resize: () => {},
  scrollToTop: () => {},
};

export function useLenis() {
  const ctx = useContext(LenisContext);
  return ctx ?? fallback;
}
