// components/ui/FlashOverlay.tsx

"use client";

import { useEffect, useState } from "react";

type FlashType = "success" | "error" | null;

interface FlashEvent {
  type: FlashType;
}

// Global event bus for triggering flashes from anywhere
export function triggerFlash(type: "success" | "error") {
  window.dispatchEvent(
    new CustomEvent<FlashEvent>("assettrack:flash", { detail: { type } }),
  );
}

export function FlashOverlay() {
  const [flash, setFlash] = useState<FlashType>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const { type } = (e as CustomEvent<FlashEvent>).detail;
      setFlash(type);
      setTimeout(() => setFlash(null), 600);
    };

    window.addEventListener("assettrack:flash", handler);
    return () => window.removeEventListener("assettrack:flash", handler);
  }, []);

  if (!flash) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-100"
      style={{
        backgroundColor: flash === "success" ? "#44ff88" : "#ff4444",
        opacity: 0.18,
        animation: "flash-fade 600ms ease-out forwards",
      }}
    />
  );
}
