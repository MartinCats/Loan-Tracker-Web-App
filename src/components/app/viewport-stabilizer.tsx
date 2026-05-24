"use client";

import { useEffect } from "react";

export function ViewportStabilizer() {
  useEffect(() => {
    let frame = 0;

    const updateViewportHeight = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--app-viewport-height",
          `${window.innerHeight}px`,
        );
      });
    };

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    window.addEventListener("orientationchange", updateViewportHeight);
    window.visualViewport?.addEventListener("resize", updateViewportHeight);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
      window.visualViewport?.removeEventListener("resize", updateViewportHeight);
    };
  }, []);

  return null;
}
