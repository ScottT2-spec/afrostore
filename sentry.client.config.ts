/**
 * Sentry Client-Side Configuration
 * Only active when SENTRY_DSN is set. Safe to deploy without it.
 */
import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    // Session Replay disabled: its DOM masking/overlay on inputs conflicts
    // with React's own reconciliation when a batch of inputs mounts at
    // once (e.g. toggling into an edit form) — throws
    // "NotFoundError: The object can not be found here" from React trying
    // to remove/update a node Replay has already wrapped. Error capture
    // (Sentry.captureException) is unaffected by this — only the replay
    // recording is off.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    debug: false,
    environment: process.env.NODE_ENV,
  });
}
