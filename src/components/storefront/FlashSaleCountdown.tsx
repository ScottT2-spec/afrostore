"use client";
import { useEffect, useState } from "react";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Ending soon";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

/** Ticks every 30s — fine-grained enough to feel live without re-rendering constantly. */
export default function FlashSaleCountdown({ endsAt, className = "" }: { endsAt: string; className?: string }) {
  const [label, setLabel] = useState(() => formatRemaining(new Date(endsAt).getTime() - Date.now()));

  useEffect(() => {
    const tick = () => setLabel(formatRemaining(new Date(endsAt).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [endsAt]);

  return <span className={className}>{label}</span>;
}
