/**
 * Sentry Server-Side Configuration
 * Only active when SENTRY_DSN is set. Safe to deploy without it.
 */
import * as Sentry from "@sentry/nextjs";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
    environment: process.env.NODE_ENV,
  });
}
