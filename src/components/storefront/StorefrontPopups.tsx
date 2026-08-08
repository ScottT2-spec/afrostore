"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

type PopupType = "MODAL" | "BANNER" | "SLIDE_IN" | "FULL_SCREEN" | "COUNTDOWN" | "NOTIFICATION_BAR";
type TriggerType = "exit_intent" | "scroll" | "time_delay" | "click" | "page_load";

interface PopupContent {
  headline?: string;
  body?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  collectEmail?: boolean;
  countdownMinutes?: number;
}

interface PopupTrigger {
  type: TriggerType;
  config?: { delaySeconds?: number; scrollPercent?: number };
}

interface PopupDisplayRules {
  pages?: string[];
  frequency?: "once" | "session" | "always";
  devices?: ("desktop" | "mobile" | "tablet")[];
}

interface PopupItem {
  id: string;
  name: string;
  type: PopupType;
  content: PopupContent | null;
  trigger: PopupTrigger | null;
  displayRules: PopupDisplayRules | null;
}

function getDevice(): "desktop" | "mobile" | "tablet" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function seenKey(popupId: string) {
  return `popup_seen_${popupId}`;
}

function hasBeenSeen(popup: PopupItem): boolean {
  const frequency = popup.displayRules?.frequency || "session";
  if (frequency === "always") return false;
  if (typeof window === "undefined") return false;
  if (frequency === "once") return localStorage.getItem(seenKey(popup.id)) === "1";
  return sessionStorage.getItem(seenKey(popup.id)) === "1";
}

function markSeen(popup: PopupItem) {
  const frequency = popup.displayRules?.frequency || "session";
  if (frequency === "always") return;
  if (typeof window === "undefined") return;
  if (frequency === "once") localStorage.setItem(seenKey(popup.id), "1");
  else sessionStorage.setItem(seenKey(popup.id), "1");
}

function track(slug: string, popupId: string, event: "view" | "conversion") {
  fetch(`/api/storefront/${slug}/popups/${popupId}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
    keepalive: true,
  }).catch(() => {});
}

interface Props {
  slug: string;
}

export default function StorefrontPopups({ slug }: Props) {
  const pathname = usePathname();
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [activePopup, setActivePopup] = useState<PopupItem | null>(null);
  const shownRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/storefront/${slug}/popups`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json?.success) return;
        setPopups(json.data.popups || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const eligiblePopups = useCallback(() => {
    const device = getDevice();
    return popups.filter((p) => {
      if (shownRef.current.has(p.id)) return false;
      if (hasBeenSeen(p)) return false;
      const rules = p.displayRules;
      if (rules?.devices && rules.devices.length > 0 && !rules.devices.includes(device)) return false;
      if (rules?.pages && rules.pages.length > 0) {
        const matches = rules.pages.some((pg) => pg === "*" || pg === pathname || pathname?.startsWith(pg));
        if (!matches) return false;
      }
      return true;
    });
  }, [popups, pathname]);

  const show = useCallback(
    (popup: PopupItem) => {
      shownRef.current.add(popup.id);
      markSeen(popup);
      setActivePopup(popup);
      track(slug, popup.id, "view");
    },
    [slug]
  );

  // Reset per-navigation eligibility (page-scoped triggers can re-fire on route change)
  useEffect(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];

    if (popups.length === 0) return;

    const candidates = eligiblePopups();
    if (candidates.length === 0) return;

    // page_load popups (optionally delayed)
    candidates
      .filter((p) => (p.trigger?.type || "page_load") === "page_load")
      .forEach((p) => {
        const delay = (p.trigger?.config?.delaySeconds ?? 0) * 1000;
        const t = window.setTimeout(() => show(p), delay);
        timersRef.current.push(t);
      });

    // time_delay popups
    candidates
      .filter((p) => p.trigger?.type === "time_delay")
      .forEach((p) => {
        const delay = (p.trigger?.config?.delaySeconds ?? 5) * 1000;
        const t = window.setTimeout(() => show(p), delay);
        timersRef.current.push(t);
      });

    const scrollCandidates = candidates.filter((p) => p.trigger?.type === "scroll");
    const exitCandidates = candidates.filter((p) => p.trigger?.type === "exit_intent");
    const clickCandidates = candidates.filter((p) => p.trigger?.type === "click");

    const onScroll = () => {
      const scrolled =
        (window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)) * 100;
      scrollCandidates.forEach((p) => {
        const threshold = p.trigger?.config?.scrollPercent ?? 50;
        if (scrolled >= threshold && !shownRef.current.has(p.id)) show(p);
      });
    };

    const onExitIntent = (e: MouseEvent) => {
      if (e.clientY > 0) return;
      exitCandidates.forEach((p) => {
        if (!shownRef.current.has(p.id)) show(p);
      });
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target?.closest?.("[data-popup-trigger]")) return;
      clickCandidates.forEach((p) => {
        if (!shownRef.current.has(p.id)) show(p);
      });
    };

    if (scrollCandidates.length > 0) window.addEventListener("scroll", onScroll, { passive: true });
    if (exitCandidates.length > 0) document.addEventListener("mouseleave", onExitIntent);
    if (clickCandidates.length > 0) document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onExitIntent);
      document.removeEventListener("click", onClick);
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popups, pathname, eligiblePopups, show]);

  const close = () => setActivePopup(null);

  const handleCta = () => {
    if (!activePopup) return;
    track(slug, activePopup.id, "conversion");
    const link = activePopup.content?.buttonLink;
    if (link) window.location.href = link;
    close();
  };

  if (!activePopup) return null;

  const c = activePopup.content || {};
  const bg = c.backgroundColor || "#ffffff";
  const text = c.textColor || "#111111";
  const btn = c.buttonColor || "#111111";

  if (activePopup.type === "BANNER" || activePopup.type === "NOTIFICATION_BAR") {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-4 px-4 py-3 text-sm shadow-md"
        style={{ background: bg, color: text }}
      >
        <span className="font-medium">{c.headline}</span>
        {c.body && <span className="hidden sm:inline opacity-80">{c.body}</span>}
        {c.buttonText && (
          <button
            onClick={handleCta}
            className="rounded-md px-3 py-1.5 text-xs font-semibold text-white"
            style={{ background: btn }}
          >
            {c.buttonText}
          </button>
        )}
        <button onClick={close} aria-label="Dismiss" className="ml-2 opacity-60 hover:opacity-100">
          ✕
        </button>
      </div>
    );
  }

  if (activePopup.type === "SLIDE_IN") {
    return (
      <div
        className="fixed bottom-4 right-4 z-[100] w-80 max-w-[calc(100vw-2rem)] rounded-xl shadow-2xl p-5 animate-fade-in"
        style={{ background: bg, color: text }}
      >
        <button onClick={close} aria-label="Dismiss" className="absolute top-2 right-2 opacity-60 hover:opacity-100">
          ✕
        </button>
        {c.imageUrl && <img src={c.imageUrl} alt="" className="w-full h-28 object-cover rounded-lg mb-3" />}
        {c.headline && <h3 className="font-bold text-base mb-1">{c.headline}</h3>}
        {c.body && <p className="text-sm opacity-80 mb-3">{c.body}</p>}
        {c.buttonText && (
          <button
            onClick={handleCta}
            className="w-full rounded-lg py-2 text-sm font-semibold text-white"
            style={{ background: btn }}
          >
            {c.buttonText}
          </button>
        )}
      </div>
    );
  }

  // MODAL, FULL_SCREEN, COUNTDOWN share an overlay+card layout
  const isFullScreen = activePopup.type === "FULL_SCREEN";
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        className={`relative rounded-2xl shadow-2xl p-6 sm:p-8 text-center ${
          isFullScreen ? "w-full h-full max-w-none flex flex-col items-center justify-center" : "w-full max-w-md"
        }`}
        style={{ background: bg, color: text }}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 text-xl opacity-60 hover:opacity-100"
        >
          ✕
        </button>
        {c.imageUrl && (
          <img src={c.imageUrl} alt="" className="w-full max-w-xs mx-auto h-40 object-cover rounded-xl mb-4" />
        )}
        {c.headline && <h2 className="text-2xl font-bold mb-2">{c.headline}</h2>}
        {c.body && <p className="text-sm opacity-80 mb-4">{c.body}</p>}
        {activePopup.type === "COUNTDOWN" && (
          <CountdownTimer minutes={c.countdownMinutes ?? 15} color={text} />
        )}
        {c.buttonText && (
          <button
            onClick={handleCta}
            className="mt-4 rounded-lg px-6 py-2.5 text-sm font-semibold text-white"
            style={{ background: btn }}
          >
            {c.buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

function CountdownTimer({ minutes, color }: { minutes: number; color: string }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  useEffect(() => {
    const id = window.setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-2 font-mono text-2xl font-bold my-2" style={{ color }}>
      {h > 0 && <span>{pad(h)}:</span>}
      <span>{pad(m)}</span>:<span>{pad(s)}</span>
    </div>
  );
}
