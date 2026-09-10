"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ExternalLink, Loader2, Send, Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";
import { parsePageContent } from "@/lib/page-content";
import { SandboxPreview } from "@/components/sandbox/SandboxPreview";
import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

interface SiteRecord {
  id: string;
  name: string;
  slug: string;
  businessType?: string | null;
  description?: string | null;
}

interface PageSummary {
  id: string;
  title: string;
  slug: string;
  type: string;
}

interface SandboxSessionResult {
  id: string;
  status: "creating" | "ready" | "error" | "stopped";
  previewUrl: string | null;
  errorMessage: string | null;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  checklist?: BuildStep[];
  error?: boolean;
}

interface BuildStep {
  label: string;
  status: "pending" | "active" | "done";
}

const BUILD_STEPS: string[] = [
  "Understanding your business",
  "Setting up your project",
  "Writing your homepage",
  "Checking everything builds correctly",
  "Finalizing your preview",
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AIBuilderPage({ params }: { params: Promise<{ siteId: string }> }) {
  const router = useRouter();
  const [siteId, setSiteId] = useState<string | null>(null);
  const [site, setSite] = useState<SiteRecord | null>(null);
  const [loadingSite, setLoadingSite] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [previewBlocks, setPreviewBlocks] = useState<TemplateBlock[]>([]);
  const [session, setSession] = useState<SandboxSessionResult | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    params.then((p) => setSiteId(p.siteId));
  }, [params]);

  useEffect(() => {
    if (!siteId) return;
    (async () => {
      setLoadingSite(true);
      const res = await api.get<SiteRecord>(`/api/sites/${siteId}`);
      if (res.success && res.data) {
        setSite(res.data);
        setMessages([
          {
            id: uid(),
            role: "assistant",
            content: `Hi! I'm ready to build ${res.data.name}. Tell me about your business — what you sell, the vibe you're going for, anything that'll help me get it right — and I'll put together your site.`,
          },
        ]);
      }
      setLoadingSite(false);
    })();
  }, [siteId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generating]);

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  const loadHomePagePreview = async (pages: PageSummary[]) => {
    if (!siteId) return;
    const home = pages.find((p) => p.type === "HOME") || pages[0];
    if (!home) return;
    const res = await api.get<{ content: unknown }>(`/api/sites/${siteId}/pages/${home.id}`);
    if (res.success && res.data) {
      setPreviewBlocks(parsePageContent(res.data.content).blocks as unknown as TemplateBlock[]);
    }
  };

  const handlePublish = async () => {
    if (!siteId || !hasGenerated || publishing) return;
    setPublishing(true);
    setPublishError(null);
    const res = await api.post<{ published: boolean; liveUrl: string }>(`/api/sites/${siteId}/publish-code`, {});
    setPublishing(false);
    if (res.success && res.data?.published) {
      window.open(res.data.liveUrl, "_blank");
    } else {
      setPublishError(res.error || "Publish failed. Please try again.");
    }
  };

  const handleSend = async () => {
    const description = input.trim();
    if (!description || !siteId || !site || generating) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", content: description };
    const checklist: BuildStep[] = BUILD_STEPS.map((label, i) => ({ label, status: i === 0 ? "active" : "pending" }));
    const assistantMsgId = uid();
    const assistantMsg: ChatMessage = { id: assistantMsgId, role: "assistant", content: "", checklist };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setGenerating(true);

    // Advances the checklist through its stages while the one real
    // network call is in flight — this is a perceived-progress animation
    // (there's no streaming/step-by-step API here to reflect exactly),
    // but it never lies about completion: the LAST step only flips to
    // "done" once the actual API call resolves successfully below, not
    // on a timer. If the call finishes before the animation catches up,
    // the interval is cleared and every remaining step is marked done
    // immediately rather than left stuck mid-way.
    let stepIndex = 0;
    stepTimerRef.current = setInterval(() => {
      stepIndex++;
      if (stepIndex >= BUILD_STEPS.length - 1) {
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
        return;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, checklist: m.checklist!.map((s, i) => ({ ...s, status: i < stepIndex ? "done" : i === stepIndex ? "active" : "pending" })) }
            : m
        )
      );
    }, 1800);

    const res = await api.post<{ session: SandboxSessionResult; summary: string; filesChanged: string[] }>(
      `/api/sites/${siteId}/ai/generate-code`,
      { task: description }
    );

    if (stepTimerRef.current) clearInterval(stepTimerRef.current);

    if (res.success && res.data) {
      setSession(res.data.session);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                checklist: m.checklist!.map((s) => ({ ...s, status: "done" as const })),
                content: res.data!.summary,
              }
            : m
        )
      );
      setHasGenerated(true);
      setGenerating(false);
      return;
    }

    // The coding agent is the real, primary path — this fallback exists
    // only for when it can't run at all (Daytona unconfigured, sandbox
    // creation failed) on the FIRST message, where there's no existing
    // generated site to lose. It deliberately does NOT fire for a later
    // edit request (session already exists): falling back there would
    // silently abandon the merchant's actual generated site and restart
    // them on the unrelated block-based pipeline instead of just telling
    // them the edit failed.
    if (!session) {
      const fallbackRes = await api.post<{ pages: PageSummary[]; productsCreated: number }>(
        `/api/sites/${siteId}/ai/generate-store`,
        { description, storeName: site.name, businessType: site.businessType || undefined }
      );

      if (fallbackRes.success && fallbackRes.data) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  checklist: m.checklist!.map((s) => ({ ...s, status: "done" as const })),
                  content: `Done! I've built your homepage, About, FAQ, Contact, and Policies pages${fallbackRes.data!.productsCreated ? `, plus ${fallbackRes.data!.productsCreated} starter products` : ""}. Check the preview — tell me what you'd like to change.`,
                }
              : m
          )
        );
        await loadHomePagePreview(fallbackRes.data.pages);
        setHasGenerated(true);
        setGenerating(false);
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, checklist: undefined, error: true, content: fallbackRes.error || res.error || "Something went wrong generating your site. Please try again." }
            : m
        )
      );
      setGenerating(false);
      return;
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantMsgId
          ? { ...m, checklist: undefined, error: true, content: res.error || "Something went wrong making that change. Please try again." }
          : m
      )
    );
    setGenerating(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-surface-50 overflow-hidden">
      {/* Top bar */}
      <header className="h-14 flex-shrink-0 border-b border-surface-200 bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/workspaces")} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500" title="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-surface-900">
            <Sparkles className="h-4 w-4 text-brand-600" />
            {site?.name || "AI Site Builder"}
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard/workspaces")}
          className="text-sm font-medium text-surface-500 hover:text-surface-800"
        >
          My Projects
        </button>
        <div className="flex items-center gap-2">
          {publishError && <span className="text-xs text-red-600 max-w-xs truncate">{publishError}</span>}
          <button
            onClick={handlePublish}
            disabled={!hasGenerated || publishing}
            className={`flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1.5 rounded-lg transition-colors ${
              hasGenerated && !publishing ? "bg-brand-600 text-white hover:bg-brand-700" : "bg-surface-100 text-surface-400"
            }`}
          >
            {publishing ? "Publishing..." : "Publish"} <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Chat + Preview split */}
      <div className="flex-1 flex min-h-0">
        {/* Chat pane */}
        <div className="w-full max-w-md flex-shrink-0 flex flex-col border-r border-surface-200 bg-white">
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
            {loadingSite ? (
              <div className="flex items-center justify-center h-full text-surface-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex-shrink-0 border-t border-surface-200 p-3">
            <div className="flex items-end gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 focus-within:border-brand-400 focus-within:ring-1 focus-within:ring-brand-200">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe what you want…"
                rows={1}
                disabled={generating || loadingSite}
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-surface-400 max-h-32 py-1 disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || generating || loadingSite}
                className="flex-shrink-0 h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-40 disabled:hover:bg-brand-600 transition-colors"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live preview pane */}
        <div className="flex-1 min-w-0 bg-surface-100 overflow-y-auto">
          {siteId && (previewBlocks.length > 0 || session || generating) ? (
            <SandboxPreview siteId={siteId} blocks={previewBlocks} session={session} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-surface-400">
              <Sparkles className="h-8 w-8" />
              <p className="text-sm">Your live preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 text-white px-3.5 py-2 text-sm">{msg.content}</div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[90%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm ${
          msg.error ? "bg-red-50 text-red-700 border border-red-100" : "bg-surface-100 text-surface-800"
        }`}
      >
        {msg.checklist && (
          <div className="space-y-1.5 mb-1">
            {msg.checklist.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {step.status === "done" ? (
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                ) : step.status === "active" ? (
                  <Loader2 className="h-3.5 w-3.5 text-brand-600 animate-spin flex-shrink-0" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-surface-300 flex-shrink-0" />
                )}
                <span className={step.status === "pending" ? "text-surface-400" : "text-surface-700"}>{step.label}</span>
              </div>
            ))}
          </div>
        )}
        {msg.content && <p className={msg.checklist ? "mt-2" : ""}>{msg.content}</p>}
      </div>
    </div>
  );
}
