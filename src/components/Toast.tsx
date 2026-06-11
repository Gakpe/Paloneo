"use client";

import { useEffect } from "react";

/**
 * Lightweight non-blocking confirmation, auto-dismisses.
 * Replaces blocking alert() which freezes mobile browsers mid-session.
 */
export function Toast({
  message,
  onDone,
}: {
  message: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 animate-fade-up">
      <div className="rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-night shadow-lg shadow-black/40">
        {message}
      </div>
    </div>
  );
}
