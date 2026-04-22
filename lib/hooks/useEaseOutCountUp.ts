"use client";

import { useEffect, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animates from 0 → target over durationMs while `active` is true (ease-out cubic).
 * Resets to 0 when `active` becomes false.
 */
export function useEaseOutCountUp(target: number, durationMs: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    if (target === 0) {
      setValue(0);
      return;
    }

    let start: number | null = null;
    let raf = 0;

    const tick = (ts: number) => {
      if (start == null) start = ts;
      const raw = Math.min((ts - start) / durationMs, 1);
      const eased = easeOutCubic(raw);
      setValue(target * eased);
      if (raw < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, active]);

  return value;
}
