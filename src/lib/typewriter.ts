/**
 * Typewriter animation as a pure state machine (no React, no timers) so the
 * timing/sequence logic is unit-testable. `useTypewriterPlaceholder`
 * (lib/use-typewriter-placeholder.ts) just drives `stepTypewriter` with
 * setTimeout and renders the text it returns.
 *
 * Sequence per phrase: type → hold (so it can be read) → erase → short gap,
 * then the next phrase, looping forever.
 */
export type TypewriterPhase = "typing" | "holding" | "erasing" | "gap";

export interface TypewriterState {
  index: number;
  length: number;
  phase: TypewriterPhase;
}

export interface TypewriterTiming {
  typeMs: number;
  eraseMs: number;
  holdMs: number;
  gapMs: number;
}

export const DEFAULT_TIMING: TypewriterTiming = { typeMs: 42, eraseMs: 18, holdMs: 2000, gapMs: 380 };

export const initialTypewriterState = (startIndex = 0): TypewriterState => ({ index: startIndex, length: 0, phase: "typing" });

/**
 * Advance one frame. Returns the next state, the text to show now, and how
 * long to wait before the following frame.
 */
export function stepTypewriter(
  state: TypewriterState,
  phrases: readonly string[],
  timing: TypewriterTiming = DEFAULT_TIMING,
): { state: TypewriterState; text: string; delay: number } {
  if (phrases.length === 0) return { state, text: "", delay: timing.holdMs };
  const index = state.index % phrases.length;
  const phrase = phrases[index];

  switch (state.phase) {
    case "typing": {
      const length = Math.min(state.length + 1, phrase.length);
      const done = length >= phrase.length;
      return {
        state: { index, length, phase: done ? "holding" : "typing" },
        text: phrase.slice(0, length),
        // Slightly slower after punctuation/spaces so it reads like typing, not a ticker.
        delay: done ? timing.holdMs : timing.typeMs + (/[\s,.…]/.test(phrase[length - 1] ?? "") ? 38 : 0),
      };
    }
    case "holding":
      return { state: { index, length: phrase.length, phase: "erasing" }, text: phrase, delay: timing.eraseMs };
    case "erasing": {
      const length = Math.max(state.length - 1, 0);
      const done = length === 0;
      return {
        state: { index, length, phase: done ? "gap" : "erasing" },
        text: phrase.slice(0, length),
        delay: done ? timing.gapMs : timing.eraseMs,
      };
    }
    case "gap":
      return { state: { index: (index + 1) % phrases.length, length: 0, phase: "typing" }, text: "", delay: timing.typeMs };
  }
}
