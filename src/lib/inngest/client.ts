/**
 * Inngest Client
 * Only active when INNGEST_EVENT_KEY is set. Safe to import without it.
 */
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "prokip",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
