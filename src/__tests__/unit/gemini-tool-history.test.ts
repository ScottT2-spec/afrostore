import { describe, it, expect } from "vitest";
import { toGeminiContents } from "@/lib/failover/ai-failover";
import type { AIMessage } from "@/lib/failover/types";

describe("Gemini tool-call replay", () => {
  const history = (sig?: string): AIMessage[] => [
    { role: "system", content: "sys" },
    { role: "user", content: "change X to Y" },
    { role: "assistant", content: "", toolCalls: [{ id: "0-0", type: "function", function: { name: "get_section", arguments: "{}" }, ...(sig ? { thoughtSignature: sig } : {}) }] },
    { role: "tool", toolCallId: "0-0", content: "ok" },
  ];
  it("echoes the real thoughtSignature on the functionCall part", () => {
    const parts = toGeminiContents(history("SIG123"))[1].parts as any[];
    expect(parts[0].functionCall.name).toBe("get_section");
    expect(parts[0].thoughtSignature).toBe("SIG123");
  });
  it("uses the documented bypass when the call came from another provider", () => {
    const parts = toGeminiContents(history())[1].parts as any[];
    expect(parts[0].thoughtSignature).toBe("skip_thought_signature_validator");
  });
});
