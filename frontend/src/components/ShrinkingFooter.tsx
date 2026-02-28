"use client"

import { useEffect, useRef, useState } from "react"

export default function ShrinkingFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      // Calculate how far down the page the user has scrolled
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollableHeight = documentHeight - windowHeight

      // Get scroll position
      const scrollPosition = window.scrollY

      // Use a fixed trigger distance from the bottom for consistent behavior across all pages
      const triggerDistance = 500 // Start effect 500px before reaching the end
      const triggerPoint = Math.max(0, scrollableHeight - triggerDistance)
      
      if (scrollPosition > triggerPoint) {
        const progressDistance = scrollPosition - triggerPoint
        const progress = Math.min(progressDistance / triggerDistance, 1)
        setScrollProgress(progress)
      } else {
        setScrollProgress(0)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const element = contentRef.current
    if (!element) return

    const measure = () => {
      setContentHeight(element.getBoundingClientRect().height)
    }

    measure()

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => measure())
      observer.observe(element)
      return () => observer.disconnect()
    }

    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  const MAX_SCALE_SHRINK = 0.08
  const MAX_NET_LIFT_PX = 80

  const scale = 1 - scrollProgress * MAX_SCALE_SHRINK

  // With transformOrigin: center, scaling changes the element's top/bottom position in px.
  // Longer pages => larger visual shift for the same scale.
  // Compensate using measured height so the net "lift" stays consistent across pages.
  const scaleLiftPx = ((1 - scale) * contentHeight) / 2
  const desiredNetLiftPx = scrollProgress * MAX_NET_LIFT_PX
  let translateY = scaleLiftPx - desiredNetLiftPx
  translateY = Math.max(-160, Math.min(translateY, 320))

  const borderRadius = Math.min(scrollProgress * 32, 32)

return (
    <div
      ref={contentRef}
      className="relative z-10 will-change-transform transition-transform duration-75 overflow-hidden bg-theme-base"
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        borderRadius: `${borderRadius}px`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
};