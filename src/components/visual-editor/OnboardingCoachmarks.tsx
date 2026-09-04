"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

// Bumping this key retires any previously-dismissed state and shows the
// coachmarks again — use if the steps below change meaningfully.
const STORAGE_KEY = "prokip_editor_onboarding_seen_v1";

const STEPS = [
  {
    title: "Start from a real section",
    body: "Your page opens with ready-made sections, not a blank canvas. Pick one from the left to add it, already filled in — just swap the text and images for yours.",
  },
  {
    title: "Click any text to edit it",
    body: "No need to hunt through a side panel for simple changes — click directly on a heading, paragraph, or button on the page and start typing.",
  },
  {
    title: "Your cart is protected",
    body: "Feel free to move things around and restyle freely — your cart can't be accidentally deleted, so there's nothing to break while you explore.",
  },
];

// Self-contained, dismissible-forever overlay for a merchant's first visit
// to the editor. Deliberately NOT anchored to the pixel position of other
// components (no arrows pointing at specific sidebar coordinates) — that
// kind of positioning breaks the moment any surrounding layout shifts.
// This is just a small floating card that can't visually interfere with
// anything else on the page.
export default function OnboardingCoachmarks() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage can throw in some privacy modes — degrade to just not
      // showing the coachmarks rather than breaking the editor over it.
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Best-effort only — if this fails, worst case it shows again next visit.
    }
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl p-5">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1.5 mb-3">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-6 bg-blue-600" : "w-1.5 bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>

      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">{current.title}</h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{current.body}</p>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={dismiss}
          className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 transition-colors"
        >
          {isLast ? "Got it" : "Next"}
        </button>
      </div>
    </div>
  );
}
