import { describe, it, expect } from "vitest";
import { initialTypewriterState, stepTypewriter, type TypewriterState } from "@/lib/typewriter";

const PHRASES = ["Hi", "Yo!"] as const;

function run(frames: number, phrases: readonly string[] = PHRASES) {
  let state: TypewriterState = initialTypewriterState();
  const texts: string[] = [];
  for (let i = 0; i < frames; i++) {
    const s = stepTypewriter(state, phrases);
    state = s.state;
    texts.push(s.text);
  }
  return texts;
}

describe("stepTypewriter", () => {
  it("types a phrase one character at a time, holds it, erases it, then moves to the next", () => {
    // Hi: H, Hi, (hold Hi), H, "" , gap "" ; then Yo!: Y, Yo, Yo!, ...
    expect(run(9)).toEqual(["H", "Hi", "Hi", "H", "", "", "Y", "Yo", "Yo!"]);
  });

  it("loops back to the first phrase after the last", () => {
    const texts = run(30);
    expect(texts.filter((t) => t === "Hi").length).toBeGreaterThan(2);
    expect(texts).toContain("Yo!");
  });

  it("holds a fully typed phrase for the longest delay so it can be read", () => {
    let state = initialTypewriterState();
    let s = stepTypewriter(state, ["ab"]);
    state = s.state;
    s = stepTypewriter(state, ["ab"]);
    expect(s.text).toBe("ab");
    expect(s.delay).toBe(2000);
  });

  it("erases faster than it types", () => {
    let state: TypewriterState = { index: 0, length: 5, phase: "erasing" };
    const erase = stepTypewriter(state, ["hello world"]);
    const type = stepTypewriter(initialTypewriterState(), ["hello world"]);
    expect(erase.delay).toBeLessThan(type.delay);
  });

  it("never throws on an empty phrase list", () => {
    expect(stepTypewriter(initialTypewriterState(), []).text).toBe("");
  });
});
