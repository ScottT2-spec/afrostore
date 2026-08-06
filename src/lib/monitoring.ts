/**
 * Performance Monitoring
 *
 * Tracks Web Vitals (LCP, FID, CLS, TTFB, INP) and API response times.
 * Reports to console in dev, and to any configured endpoint in production.
 * Safe to import anywhere — no-ops gracefully if nothing is configured.
 *
 * Usage:
 *   - Web Vitals: automatically reported via Next.js instrumentation
 *   - API timing: import { trackApiTiming } from "@/lib/monitoring";
 */

type MetricName = "LCP" | "FID" | "CLS" | "TTFB" | "INP" | "FCP";

interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

/**
 * Report Web Vitals — called by Next.js automatically if exported from layout.
 * Sends to configured analytics endpoint or logs in dev.
 */
export function reportWebVitals(metric: WebVitalMetric): void {
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;

  if (process.env.NODE_ENV === "development") {
    const color =
      metric.rating === "good"
        ? "\x1b[32m"
        : metric.rating === "needs-improvement"
          ? "\x1b[33m"
          : "\x1b[31m";
    console.log(
      `${color}[WebVital] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})\x1b[0m`
    );
  }

  if (endpoint) {
    // Fire-and-forget — don't block rendering
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        endpoint,
        JSON.stringify({
          type: "web-vital",
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          url: typeof window !== "undefined" ? window.location.pathname : "",
          timestamp: Date.now(),
        })
      );
    }
  }
}

/**
 * Track API response time (server-side).
 * Use in API routes to measure and log slow endpoints.
 *
 * Usage:
 *   const end = trackApiTiming("GET /api/products");
 *   // ... do work ...
 *   end(); // logs if > 1000ms
 */
export function trackApiTiming(
  label: string,
  warnThresholdMs = 1000
): () => void {
  const start = Date.now();
  return () => {
    const duration = Date.now() - start;
    if (duration > warnThresholdMs) {
      console.warn(
        `[SLOW API] ${label} took ${duration}ms (threshold: ${warnThresholdMs}ms)`
      );
    }
  };
}

/**
 * Simple uptime check endpoint data.
 * Add a route at /api/health that returns this.
 */
export function getHealthStatus(): {
  status: "ok";
  timestamp: string;
  uptime: number;
} {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
