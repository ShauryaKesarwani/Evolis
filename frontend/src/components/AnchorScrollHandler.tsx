"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLenis } from "@studio-freight/react-lenis";

export default function AnchorScrollHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lenis = useLenis();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    // Wait for DOM to be ready and Lenis to initialize
    const scrollToHash = () => {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        if (lenis) {
          lenis.scrollTo(targetElement as HTMLElement, {
            offset: -100,
            duration: 1.5,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        } else {
          // Fallback if Lenis isn't ready
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return true;
      }
      return false;
    };

    // Try immediately, then retry with increasing delays
    if (!scrollToHash()) {
      const timeouts = [100, 300, 600, 1000];
      const timers = timeouts.map((delay) =>
        setTimeout(() => {
          scrollToHash();
        }, delay)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [pathname, searchParams, lenis]);

  // Also listen for hashchange events (same-page anchor clicks)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const targetElement = document.querySelector(hash);
      if (targetElement && lenis) {
        lenis.scrollTo(targetElement as HTMLElement, {
          offset: -100,
          duration: 1.5,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [lenis]);

  return null;
}
