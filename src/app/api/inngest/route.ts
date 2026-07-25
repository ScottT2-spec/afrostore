/**
 * Inngest API Route
 * Serves the Inngest handler for background job processing.
 * Only functional when INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY are set.
 */
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { allFunctions } from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: allFunctions,
});
