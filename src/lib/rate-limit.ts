// Simple in-memory rate limiter for auth endpoints
const attempts = new Map<string, { count: number; resetAt: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of attempts) {
    if (now > value.resetAt) attempts.delete(key);
  }
}, 60_000);

export function rateLimit(key: string, maxAttempts: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: record.resetAt - now };
  }

  record.count++;
  return { allowed: true, retryAfterMs: 0 };
}

// Best-effort caller IP for keying rate limits on endpoints with no natural
// per-user key (public storefront forms, uploads, etc). Behind nginx/any
// reverse proxy this depends on x-forwarded-for being set correctly (our
// nginx.conf does this) — falls back to a constant bucket if neither header
// is present, which just means those requests share one global limit
// instead of being IP-scoped (fails safe, not open).
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

// Shared 429 JSON response, matching the shape/status already used by the
// existing rate-limited routes (login/signup/forgot-password), so every
// endpoint fails the same way for clients.
export function rateLimitedResponse(retryAfterMs: number) {
  return Response.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
  );
}
