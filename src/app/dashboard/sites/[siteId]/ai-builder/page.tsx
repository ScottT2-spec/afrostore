"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ExternalLink, Loader2, Paperclip, Send, Sparkles, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { parsePageContent } from "@/lib/page-content";
import { useTypewriterPlaceholder } from "@/lib/use-typewriter-placeholder";
import { SandboxPreview } from "@/components/sandbox/SandboxPreview";
import type { BuilderBlock } from "@/components/storefront/BlockRenderer";

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
  imageUrl?: string;
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

// Example prompts the empty chat box types out, one after another. Each maps
// to something the builder can really do today (its tools: create_page,
// update_section, set_theme, upsert_product, set_social_links,
// set_delivery_zones, set_contact_info, set_navigation, set_seo,
// attach_asset…), so the animation doubles as "here's what I can do".
// Module-level constants: a new array identity would restart the animation.
const BUILD_PROMPTS = [
  "Build me a store for my Ankara fashion brand in Lagos…",
  "I sell phone accessories to students in Accra…",
  "Make a bakery site with a menu and WhatsApp orders…",
  "Create a clean, modern site for my hair salon…",
] as const;

const EDIT_PROMPTS = [
  "Change my homepage headline to something bolder…",
  "Add a product called Ankara maxi dress, priced at 18,000…",
  "Make my brand colours deep green and gold…",
  "Add a delivery policy page…",
  "Put my Instagram and TikTok in the footer…",
  "Set delivery zones: Lagos, Abuja and Port Harcourt…",
  "Update my contact email and office address…",
  "Show only Home, About, Contact and Shop in the menu…",
  "Rewrite my FAQ to answer questions about shipping…",
  "Improve my SEO title and description for Google…",
  "Use my uploaded photo as the hero background…",
  "Remove the product I've stopped selling…",
] as const;

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
  const [uploadedImage, setUploadedImage] = useState<{ url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File | undefined) => {
    if (!file || !siteId) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "/ai-builder-uploads");
    const res = await api.postForm<{ url: string }>(`/api/sites/${siteId}/media/upload`, formData);
    setUploading(false);
    if (res.success && res.data) {
      setUploadedImage({ url: res.data.url, name: file.name });
    } else {
      setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: `Couldn't upload "${file.name}" — ${(res as { error?: string }).error || "please try again"}.` }]);
    }
  };
  const [generating, setGenerating] = useState(false);
  const [previewBlocks, setPreviewBlocks] = useState<BuilderBlock[]>([]);
  const [session, setSession] = useState<SandboxSessionResult | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<{ question: string; options?: string[] } | null>(null);
  const priorMessagesRef = useRef<unknown[] | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  // Empty box + nothing else going on → type out example prompts (see
  // BUILD_PROMPTS / EDIT_PROMPTS). Once the merchant types, attaches an image
  // or the builder is busy, it stops and a static line takes over.
  const typewriterActive = !input && !uploadedImage && !generating && !loadingSite;
  const typewriterPlaceholder = useTypewriterPlaceholder(hasGenerated ? EDIT_PROMPTS : BUILD_PROMPTS, { active: typewriterActive });
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
      const [res, pagesRes] = await Promise.all([
        api.get<SiteRecord>(`/api/sites/${siteId}`),
        api.get<{ pages: PageSummary[] }>(`/api/sites/${siteId}/pages?limit=100`),
      ]);
      if (res.success && res.data) {
        setSite(res.data);
        const existingPages = pagesRes.success ? pagesRes.data?.pages || [] : [];
        const alreadyBuilt = existingPages.length > 0;

        // If AI Business just handed off a prefilled task, skip the
        // empty-state greeting and go straight into building with it —
        // the merchant already told us everything on that form, no need
        // to make them retype it here.
        const raw = sessionStorage.getItem(`ai-builder-prefill:${siteId}`);
        if (raw) {
          sessionStorage.removeItem(`ai-builder-prefill:${siteId}`);
          try {
            const prefill = JSON.parse(raw) as { task: string };
            if (prefill.task) {
              setMessages([]);
              setPendingPrefillTask(prefill.task);
            }
          } catch { /* ignore malformed prefill */ }
        } else if (alreadyBuilt) {
          // Coming back to an already-built, possibly already-live site —
          // greet them as an editor, not a fresh builder, and load the
          // current homepage right away so they see what's actually live
          // instead of a blank "your preview will appear here" pane.
          setMessages([
            {
              id: uid(),
              role: "assistant",
              content: `Hi! I'm ready to help you update ${res.data.name}. Tell me what you'd like to change — wording, images, a new section, a whole new page — and I'll update it on your live site.`,
            },
          ]);
          setHasGenerated(true);
          await loadHomePagePreview(existingPages);
        } else {
          setMessages([
            {
              id: uid(),
              role: "assistant",
              content: `Hi! I'm ready to build ${res.data.name}. Tell me about your business — what you sell, the vibe you're going for, anything that'll help me get it right — and I'll put together your site.`,
            },
          ]);
        }
      }
      setLoadingSite(false);
    })();
  }, [siteId]);

  // Fires once the site + prefill are both loaded, so it runs after
  // `site` state (which handleSend reads) is actually set.
  const [pendingPrefillTask, setPendingPrefillTask] = useState<string | null>(null);
  useEffect(() => {
    if (pendingPrefillTask && site && !generating) {
      const task = pendingPrefillTask;
      setPendingPrefillTask(null);
      handleSend(task);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrefillTask, site]);

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
      setPreviewBlocks(parsePageContent(res.data.content).blocks as unknown as BuilderBlock[]);
    }
  };

  const handlePublish = async () => {
    if (!siteId || !hasGenerated || publishing) return;
    setPublishing(true);
    setPublishError(null);

    if (!session) {
      // Structured/block-based site — pages start as drafts now, so
      // actually publish them first (the real "preview != live until
      // explicit Publish" flip), then show the live URL.
      const publishRes = await api.post<{ published: boolean; pagesPublished: number }>(`/api/sites/${siteId}/publish-pages`, {});
      if (!publishRes.success) {
        setPublishing(false);
        setPublishError(publishRes.error || "Publish failed. Please try again.");
        return;
      }
      const siteRes = await api.get<{ subdomain: string }>(`/api/sites/${siteId}`);
      setPublishing(false);
      if (siteRes.success && siteRes.data) {
        const domain = (process.env.NEXT_PUBLIC_APP_DOMAIN || "prosell.africa").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
        window.open(`https://${siteRes.data.subdomain}.${domain}`, "_blank");
      } else {
        setPublishError("Couldn't load your store's URL. Please try again.");
      }
      return;
    }

    const res = await api.post<{ published: boolean; liveUrl: string }>(`/api/sites/${siteId}/publish-code`, {});
    setPublishing(false);
    if (res.success && res.data?.published) {
      window.open(res.data.liveUrl, "_blank");
    } else {
      setPublishError(res.error || "Publish failed. Please try again.");
    }
  };

  const handleSend = async (overrideMessage?: string) => {
    const description = (overrideMessage ?? input).trim();
    if (!description || !siteId || !site || generating) return;

    // If an image was uploaded this turn, make it unambiguous to the AI
    // exactly which URL to use — this rides in the same message it reads
    // for tool-calling, not a side channel it could miss.
    const pendingImage = overrideMessage ? null : uploadedImage;
    const outgoingDescription = pendingImage
      ? `${description}\n\n[Merchant uploaded an image — use this exact URL when attaching an image to a section, do not substitute a different image: ${pendingImage.url}]`
      : description;

    const userMsg: ChatMessage = { id: uid(), role: "user", content: description, imageUrl: pendingImage?.url };
    const checklist: BuildStep[] = BUILD_STEPS.map((label, i) => ({ label, status: i === 0 ? "active" : "pending" }));
    const assistantMsgId = uid();
    const assistantMsg: ChatMessage = { id: assistantMsgId, role: "assistant", content: "", checklist };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    if (!overrideMessage) { setInput(""); setUploadedImage(null); }
    setGenerating(true);

    // Streams via SSE instead of a single blocking request. This isn't
    // just for nicer real-time progress — it's the actual fix for a real
    // production bug: create_page does a large (~6000 token) content
    // generation per page, and the agent can call it several times in a
    // row for one message (home, about, contact...). A single blocking
    // request sends zero bytes back for that entire multi-minute stretch,
    // which is exactly what trips a reverse-proxy's idle/read timeout —
    // the proxy then serves its own HTML error page, which showed up in
    // the UI as a raw "Unexpected token '<', <!DOCTYPE...'" JSON.parse
    // crash. Streaming keeps real bytes flowing the whole time, so the
    // proxy never sees an idle connection.
    type GenResult = {
      mode: "question" | "structured" | "code";
      question?: string; options?: string[]; priorMessages?: unknown[];
      pages?: PageSummary[]; summary?: string;
      session?: SandboxSessionResult; filesChanged?: string[];
    };
    let res: { success: true; data: GenResult } | { success: false; error: string };
    try {
      const streamRes = await fetch(`/api/sites/${siteId}/ai/generate-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {}),
        },
        body: JSON.stringify({ task: outgoingDescription, priorMessages: priorMessagesRef.current || undefined }),
      });

      if (!streamRes.ok || !streamRes.body) {
        const text = await streamRes.text().catch(() => "");
        throw new Error(text ? `Request failed (${streamRes.status}): ${text.slice(0, 200)}` : `Request failed (${streamRes.status})`);
      }

      const reader = streamRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let doneBody: GenResult | null = null;
      let streamError: string | null = null;
      let seenSteps = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line; each frame is
        // "event: <type>\ndata: <json>".
        let sep;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
          if (!dataLine) continue;
          let evt: { type: string; tool?: string; isError?: boolean; body?: GenResult; message?: string };
          try {
            evt = JSON.parse(dataLine.slice(5).trim());
          } catch {
            continue;
          }

          if (evt.type === "step") {
            seenSteps++;
            // Real progress from the actual agent, not a timer guess -
            // reveal checklist lines as real steps come in, capped to
            // however many lines BUILD_STEPS has.
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, checklist: m.checklist!.map((s, i) => ({ ...s, status: i < seenSteps ? "done" : i === seenSteps ? "active" : "pending" })) }
                  : m
              )
            );
          } else if (evt.type === "done") {
            doneBody = evt.body || null;
          } else if (evt.type === "error") {
            streamError = evt.message || "Generation failed";
          }
        }
      }

      if (streamError) throw new Error(streamError);
      if (!doneBody) throw new Error("Generation ended without a result.");
      res = { success: true, data: doneBody };
    } catch (e) {
      res = { success: false, error: e instanceof Error ? e.message : "Generation failed" };
    }

    if (res.success && res.data?.mode === "question") {
      priorMessagesRef.current = res.data.priorMessages || null;
      setPendingQuestion({ question: res.data.question!, options: res.data.options });
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, checklist: undefined, content: res.data!.question! } : m))
      );
      setGenerating(false);
      return;
    }

    if (res.success && res.data?.mode === "structured") {
      priorMessagesRef.current = null;
      setPendingQuestion(null);
      setSession(null); // structured path has no sandbox — block preview only
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, checklist: m.checklist!.map((s) => ({ ...s, status: "done" as const })), content: res.data!.summary! }
            : m
        )
      );
      await loadHomePagePreview(res.data.pages || []);
      setHasGenerated(true);
      setGenerating(false);
      return;
    }

    if (res.success && res.data?.mode === "code") {
      priorMessagesRef.current = null;
      setPendingQuestion(null);
      setSession(res.data.session || null);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, checklist: m.checklist!.map((s) => ({ ...s, status: "done" as const })), content: res.data!.summary! }
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
            ? { ...m, checklist: undefined, error: true, content: fallbackRes.error || (!res.success ? res.error : undefined) || "Something went wrong generating your site. Please try again." }
            : m
        )
      );
      setGenerating(false);
      return;
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantMsgId
          ? { ...m, checklist: undefined, error: true, content: (!res.success ? res.error : undefined) || "Something went wrong making that change. Please try again." }
          : m
      )
    );
    setGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-surface-50 overflow-hidden">
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
            {uploadedImage && (
              <div className="flex items-center gap-2 mb-2 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs text-brand-700 w-fit">
                <img src={uploadedImage.url} alt="" className="h-6 w-6 rounded object-cover" />
                <span className="max-w-[160px] truncate">{uploadedImage.name}</span>
                <button onClick={() => setUploadedImage(null)} className="text-brand-400 hover:text-brand-600"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
            <div className="flex items-end gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 focus-within:border-brand-400 focus-within:ring-1 focus-within:ring-brand-200">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { handleFileSelect(e.target.files?.[0]); e.target.value = ""; }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || generating || loadingSite}
                title="Upload an image to use in a section"
                className="flex-shrink-0 h-8 w-8 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 flex items-center justify-center disabled:opacity-40 transition-colors"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={uploadedImage ? "Tell me where to use this image (e.g. \"use this as the hero background\")…" : typewriterActive ? typewriterPlaceholder : "Describe what you want…"}
                aria-label="Describe what you want"
                rows={1}
                disabled={generating || loadingSite}
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-surface-600 max-h-32 py-1 disabled:opacity-60"
              />
              <button
                onClick={() => handleSend()}
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
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 text-white px-3.5 py-2 text-sm">
          {msg.imageUrl && (
            <img src={msg.imageUrl} alt="Uploaded" className="rounded-lg mb-2 max-h-40 w-auto object-cover border border-white/20" />
          )}
          {msg.content}
        </div>
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
