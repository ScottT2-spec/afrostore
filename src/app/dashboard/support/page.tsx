"use client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { MessageCircle, Book, Video, Mail, ArrowRight, Search, ExternalLink } from "lucide-react";

const resources = [
  { icon: Book, title: "Documentation", desc: "Guides, tutorials, and API reference", href: "#" },
  { icon: Video, title: "Video Tutorials", desc: "Step-by-step video walkthroughs", href: "#" },
  { icon: MessageCircle, title: "Community", desc: "Join other AfroStore merchants", href: "#" },
  { icon: Mail, title: "Email Support", desc: "Get help from our support team", href: "#" },
];

const faqs = [
  { q: "How do I connect my custom domain?", a: "Go to Settings > Domains, enter your domain, and update your DNS records as shown." },
  { q: "How do I set up Monnify payments?", a: "Go to Payments, click Connect on Monnify, enter your API keys from your Monnify dashboard." },
  { q: "Can I import products from Instagram?", a: "Yes! Use the AI Assistant and say 'Import products from my Instagram'. It will guide you through the process." },
  { q: "How do delivery zones work?", a: "Go to Settings > Delivery Zones. You can set different fees for different areas and set free delivery thresholds." },
];

export default function SupportPage() {
  return (
    <>
      <DashboardHeader title="Help & Support" subtitle="Get help with your store" />
      <div className="p-6 max-w-3xl space-y-6">
        <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-3">
          <Search className="h-5 w-5 text-surface-400" />
          <input type="text" placeholder="Search for help..." className="flex-1 bg-transparent text-sm focus:outline-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resources.map((r) => {
            const Icon = r.icon;
            return (
              <a key={r.title} href={r.href} className="rounded-2xl border border-surface-200 bg-white p-5 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600"><Icon className="h-5 w-5" /></div>
                <div className="flex-1"><h4 className="text-sm font-bold text-surface-900">{r.title}</h4><p className="text-xs text-surface-500 mt-0.5">{r.desc}</p></div>
                <ExternalLink className="h-4 w-4 text-surface-400 mt-1" />
              </a>
            );
          })}
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group">
                <summary className="cursor-pointer text-sm font-semibold text-surface-900 hover:text-brand-600 transition-colors">{f.q}</summary>
                <p className="mt-2 text-sm text-surface-500 leading-relaxed pl-0">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
