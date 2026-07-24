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
