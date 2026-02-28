"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Ensure scroll is reset on path change, unless there's an anchor hash
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {/* @ts-expect-error - ReactNode version mismatch */}
      {children}
    </ReactLenis>
  );
}
