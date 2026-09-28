"use client";

import { useEffect, useState } from "react";
import { initialTypewriterState, stepTypewriter, type TypewriterTiming } from "@/lib/typewriter";

/**
 * A placeholder string that types out each phrase, erases it, and moves on
 * to the next — with a blinking caret. Pass a STABLE `phrases` array
 * (module constant or memoized): a new array identity restarts the animation.
 *
 * - Stops (and stops using timers) while `active` is false, e.g. once the
 *   user has typed something and the placeholder isn't visible anyway.
 * - Honours prefers-reduced-motion: shows the first phrase, no animation.
 */
export function useTypewriterPlaceholder(
  phrases: readonly string[],
  { active = true, timing }: { active?: boolean; timing?: TypewriterTiming } = {},
): string {
  const [text, setText] = useState("");
  const [caretOn, setCaretOn] = useState(true);

  useEffect(() => {
    if (!active || phrases.length === 0) return;

    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setText(phrases[0]);
      return;
    }

    let state = initialTypewriterState(0);
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const next = stepTypewriter(state, phrases, timing);
      state = next.state;
      setText(next.text);
      timer = setTimeout(tick, next.delay);
    };
    timer = setTimeout(tick, 350);
    return () => clearTimeout(timer);
  }, [active, phrases, timing]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setCaretOn((v) => !v), 530);
    return () => clearInterval(id);
  }, [active]);

  return `${text}${caretOn ? "▏" : "\u00A0"}`;
}
