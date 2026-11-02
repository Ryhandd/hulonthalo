"use client";
import { useEffect } from "react";

// Mencegah zoom (pinch, double-tap, Ctrl+scroll, Ctrl +/-) agar tampilan tidak kacau.
export default function ZoomLock() {
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "_", "0"].includes(e.key)) e.preventDefault();
    };
    document.addEventListener("gesturestart", stop);
    document.addEventListener("gesturechange", stop);
    document.addEventListener("gestureend", stop);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("gesturestart", stop);
      document.removeEventListener("gesturechange", stop);
      document.removeEventListener("gestureend", stop);
      document.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}
