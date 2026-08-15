"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { InlineEditableText } from "@/components/storefront/InlineEditableText";
import { useTemplateBlockEditContext } from "@/components/storefront/TemplateBlockRenderer";

/* ─── Context ─── */
interface ProkipBookingCtxValue { storeSlug: string }
const ProkipBookingCtx = createContext<ProkipBookingCtxValue>({ storeSlug: "" });
export { ProkipBookingCtx as ProkipBookingLandingContext };

function EditableCopy({
  field,
  fieldPath,
  value,
  as = "div",
  className,
  style,
  multiline = false,
}: {
  field?: string;
  fieldPath?: string;
  value: string;
  as?: "div" | "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}) {
  const { blockId, isEditor } = useTemplateBlockEditContext();
  const Tag = as;
  if (!isEditor) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }
  return <InlineEditableText nodeId={blockId} field={field} fieldPath={fieldPath} value={value} isEditor={isEditor} as={as} className={className} style={style} multiline={multiline} />;
}

/* ─── Font Loader ─── */
export function ProkipBookingFontLoader() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
      <style>{`
        .prokip-booking * { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        @keyframes prokipFadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        .prokip-fade-in { animation: prokipFadeIn 0.4s ease-out forwards; }
        .prokip-booking select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
      `}</style>
    </>
  );
}

/* ─── Shared Button ─── */
function ProkipBtn({ children, variant = "primary", size = "lg", className = "", onClick, disabled, type = "button" }: {
  children: React.ReactNode; variant?: "primary"|"outline"|"ghost"; size?: "sm"|"md"|"lg"; className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; disabled?: boolean; type?: "button"|"submit";
}) {
  const base = "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = { primary: "bg-[#FFB800] hover:bg-[#E5A600] text-[#021127] shadow-lg shadow-[#FFB800]/20 focus:ring-[#FFB800]", outline: "border-2 border-[#FFB800] text-[#FFB800] hover:bg-[#021127] focus:ring-[#FFB800]", ghost: "text-[#FFB800] hover:bg-slate-800 focus:ring-slate-700" };
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg font-semibold" };
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>{children}</button>;
}

/* ─── SVG Icons (inline, no lucide dependency) ─── */
const IconArrowRight = () => <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconArrowLeft = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IconCheck = () => <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconCheckSmall = ({ className = "w-4 h-4 stroke-[3]" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>;
const IconCheckCircle2 = ({ className = "w-10 h-10 text-green-600 relative z-10" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconCalendar = ({ className = "w-5 h-5" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IconClock = ({ className = "w-5 h-5" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IconChevronDown = ({ className = "w-4 h-4" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>;
const IconFileQuestion = () => <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><path d="M10 10.5a2 2 0 114 0c0 1-1.5 1.5-2 2.5M12 17h.01"/></svg>;
const IconTrendingDown = () => <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>;
const IconAlertCircle = () => <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconUsers = () => <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IconEyeOff = () => <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IconHelpCircle = () => <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>;

/* ════════════════════════════════════════════════════════════
   BLOCK 1 — Hero
   ════════════════════════════════════════════════════════════ */
export interface ProkipBookingHeroProps {
  badge?: string;
  titleLine1?: string;
  titleHighlight?: string;
  titleLine3?: string;
  subtitle?: string;
  ctaText?: string;
  videoId?: string;
  videoTitle?: string;
}

export function ProkipBookingHero({
  badge = "Africa's #1 Business software",
  titleLine1 = "Trust Is Good.",
  titleHighlight = "Clear Records",
  titleLine3 = "Are Better.",
  subtitle = "See how Prokip helps African businesses track sales, stock, staff activities, expenses, and profit from one place — so you can reduce losses, improve control, and grow with confidence.",
  ctaText = "Book your Demo",
  videoId = "npOn8HIb0Yo",
  videoTitle = "How Prokip helped us track sales, stock, and prevent employees theft",
}: ProkipBookingHeroProps) {
  const scrollToForm = () => {
    const el = document.getElementById("prokip-booking-form");
    if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
    console.warn("[ProkipBooking] Demo form section not found on this page — the \"Book a Demo Form\" block needs to be added to this page for this button to work.");
  };

  return (
    <section className="bg-[#021127] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FFB800]/10 rounded-full blur-[100px] opacity-50" />
      </div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-block px-3 py-1 bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30 text-xs font-bold tracking-widest uppercase rounded-full mb-6"><EditableCopy field="badge" value={badge} as="span" /></div>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-[0.95] text-white">
          <EditableCopy field="titleLine1" value={titleLine1} as="span" /> <br className="hidden sm:block" />
          <span className="text-[#FFB800]"><EditableCopy field="titleHighlight" value={titleHighlight} as="span" className="text-[#FFB800]" /></span> <br className="hidden sm:block" /> <EditableCopy field="titleLine3" value={titleLine3} as="span" />
        </h1>
        <EditableCopy field="subtitle" value={subtitle} as="p" multiline className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed" />
        <div className="relative bg-slate-800 rounded-2xl p-2 sm:p-4 overflow-hidden shadow-2xl mx-auto max-w-4xl aspect-video group cursor-pointer border border-slate-700 mb-12">
          <iframe className="w-full h-full relative z-10 rounded-xl" src={`https://www.youtube.com/embed/${videoId}?si=VaQ3U0g7XoRO7fUn&autoplay=0&rel=0`} title={videoTitle} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <ProkipBtn size="lg" onClick={scrollToForm} className="w-full sm:w-auto font-bold uppercase tracking-wide"><EditableCopy field="ctaText" value={ctaText} as="span" /> <IconArrowRight /></ProkipBtn>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   BLOCK 2 — Problem Section
   ════════════════════════════════════════════════════════════ */
export interface ProkipBookingProblem { icon: string; title: string; }
export interface ProkipBookingProblemSectionProps {
  title?: string;
  titleHighlight?: string;
  intro?: string;
  quotes?: string[];
  problems?: ProkipBookingProblem[];
  outro?: string;
  ctaText?: string;
}

const PROBLEM_ICONS: Record<string, React.ReactNode> = {
  fileQuestion: <IconFileQuestion />,
  trendingDown: <IconTrendingDown />,
  alertCircle: <IconAlertCircle />,
  users: <IconUsers />,
  eyeOff: <IconEyeOff />,
  helpCircle: <IconHelpCircle />,
};

export function ProkipBookingProblemSection({
  title = "The Problem Is Not Always Low Sales.",
  titleHighlight = "It Is Poor Visibility.",
  intro = "Many business owners cannot leave their business for long because they are not fully sure what will happen when they are not there. Staff may be working. Sales may be happening. Customers may be buying",
  quotes = [
    "\"Can I trust what my staff are telling me?\"",
    "\"Is my stock complete?\"",
    "\"Are we making profit or just making sales?\"",
    "\"Where is the money going?\"",
  ],
  problems = [
    { icon: "fileQuestion", title: "Stock records do not match reality" },
    { icon: "trendingDown", title: "Cash does not always match sales" },
    { icon: "alertCircle", title: "Expenses increase without clear explanation" },
    { icon: "users", title: "Customers owe money, but records are scattered" },
    { icon: "eyeOff", title: "Reports come late — or not at all" },
    { icon: "helpCircle", title: "When something goes wrong, everyone has an explanation" },
  ],
  outro = "Without clear records, it becomes difficult to know who is responsible, where money is going, and whether the business is truly growing. That uncertainty is stressful. It can also be expensive.",
  ctaText = "Book your free demo",
}: ProkipBookingProblemSectionProps) {
  const scrollToForm = () => {
    const el = document.getElementById("prokip-booking-form");
    if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
    console.warn("[ProkipBooking] Demo form section not found on this page — the \"Book a Demo Form\" block needs to be added to this page for this button to work.");
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1]">
            <EditableCopy field="title" value={title} as="span" /> <br />
            <EditableCopy field="titleHighlight" value={titleHighlight} as="span" className="text-red-500" />
          </h2>
          <EditableCopy field="intro" value={intro} as="p" multiline className="text-lg text-slate-600 leading-relaxed mb-8" />
          <div className="bg-white p-6 rounded-2xl shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 text-slate-700 font-bold text-lg">
            {quotes.map((q, i) => <React.Fragment key={i}><EditableCopy fieldPath={`quotes.${i}`} value={q} as="span" />{i < quotes.length - 1 && <br />}</React.Fragment>)}
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-red-50 rounded-lg shrink-0">{PROBLEM_ICONS[p.icon] || <IconAlertCircle />}</div>
              <EditableCopy fieldPath={`problems.${i}.title`} value={p.title} as="p" className="font-medium text-slate-800 self-center" />
            </div>
          ))}
        </div>
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <EditableCopy field="outro" value={outro} as="p" multiline className="text-lg text-slate-600 mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ProkipBtn size="lg" onClick={scrollToForm} className="w-full sm:w-auto font-bold uppercase tracking-wide"><EditableCopy field="ctaText" value={ctaText} as="span" /> <IconArrowRight /></ProkipBtn>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   BLOCK 3 — Solution Section
   ════════════════════════════════════════════════════════════ */
export interface ProkipBookingSolutionProps {
  title?: string;
  titleHighlight?: string;
  description?: string;
  featuresLabel?: string;
  features?: string[];
  callout?: string;
  dashboardUrl?: string;
  dashboardStats?: { totalSales: string; itemsSold: string };
}

export function ProkipBookingSolution({
  title = "Prokip Helps You See",
  titleHighlight = "What Is Really Happening",
  description = "Prokip is an all-in-one business management system that helps you bring sales, inventory, expenses, accounting, staff activities, customers, suppliers, and reports into one connected system.",
  featuresLabel = "With Prokip, you can instantly see:",
  features = [
    "What was sold", "Who sold it", "What is in stock", "Who moved stock",
    "Who gave discounts", "Who handled returns", "Who owes you money",
    "Which expenses are reducing your profit", "Which products, services, or branches are performing best",
    "Whether your business is truly profitable",
  ],
  callout = "When you can see clearly, you can manage better — and grow with less stress.",
  dashboardUrl = "app.prokip.africa/dashboard",
  dashboardStats = { totalSales: "₦245,000", itemsSold: "124" },
}: ProkipBookingSolutionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="lg:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            <EditableCopy field="title" value={title} as="span" /> <br />
            <EditableCopy field="titleHighlight" value={titleHighlight} as="span" className="text-[#021127]" />
          </h2>
          <EditableCopy field="description" value={description} as="p" multiline className="text-lg text-slate-600 mb-8 leading-relaxed" />
          <div className="space-y-4">
            <EditableCopy field="featuresLabel" value={featuresLabel} as="p" className="font-semibold text-slate-900 text-lg" />
            <ul className="grid sm:grid-cols-2 gap-3">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3"><IconCheck /><span className="text-slate-700"><EditableCopy fieldPath={`features.${i}`} value={f} as="span" /></span></li>
              ))}
            </ul>
          </div>
          <div className="mt-10 p-6 bg-[#021127] border border-slate-800 rounded-xl text-white shadow-sm">
            <EditableCopy field="callout" value={callout} as="p" className="text-lg font-bold" />
          </div>
        </div>
        <div className="lg:w-1/2 w-full">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <EditableCopy field="dashboardUrl" value={dashboardUrl} as="div" className="mx-auto bg-white text-xs text-slate-400 px-3 py-1 rounded-md border border-slate-200 w-1/2 text-center truncate" />
            </div>
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                <div><EditableCopy field="dashboardTitle" value="Sales Overview" as="h3" className="font-semibold text-lg text-slate-800" /><EditableCopy field="dashboardSubtitle" value="Today's activities" as="p" className="text-sm text-slate-500" /></div>
                <div className="h-8 w-24 bg-[#FFB800] rounded-md opacity-20" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm"><EditableCopy field="dashboardTotalSalesLabel" value="Total Sales" as="p" className="text-sm text-slate-500 mb-1" /><EditableCopy fieldPath="dashboardStats.totalSales" value={dashboardStats.totalSales} as="p" className="text-2xl font-bold text-slate-800" /></div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm"><EditableCopy field="dashboardItemsSoldLabel" value="Items Sold" as="p" className="text-sm text-slate-500 mb-1" /><EditableCopy fieldPath="dashboardStats.itemsSold" value={dashboardStats.itemsSold} as="p" className="text-2xl font-bold text-slate-800" /></div>
              </div>
              <div className="space-y-3">
                <div className="h-10 bg-slate-200 rounded-md w-full animate-pulse" />
                <div className="h-10 bg-slate-100 rounded-md w-full animate-pulse" />
                <div className="h-10 bg-slate-50 rounded-md w-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   BLOCK 4 — Demo Details
   ════════════════════════════════════════════════════════════ */
export interface ProkipBookingDemoDetailsProps {
  title?: string;
  description?: string;
  listHeading?: string;
  benefits?: string[];
}

export function ProkipBookingDemoDetails({
  title = "What You Will See During Your Free Demo",
  description = "Your demo is focused on your business, your challenges, and your growth goals. Whether you run a shop, supermarket, pharmacy, restaurant, wholesale business, distribution company, manufacturing business, service business, school, hotel, or multi-branch operation, the demo will be tailored to your business.",
  listHeading = "We will show you how Prokip can help you:",
  benefits = [
    "Reduce employee theft, mistakes, and unauthorized activities",
    "Track every sale, payment, discount, return, and stock movement",
    "Know what is happening even when you are not physically there",
    "Understand whether your business is truly making profit",
    "Monitor expenses and identify where money is being wasted",
    "Manage one location or multiple branches from one place",
    "Keep cleaner records for accounting, reporting, and tax compliance",
    "Build a stronger system that allows your business to grow without depending on you 24/7",
  ],
}: ProkipBookingDemoDetailsProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <EditableCopy field="title" value={title} as="h2" className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight" />
          <EditableCopy field="description" value={description} as="p" multiline className="text-lg text-slate-600 leading-relaxed" />
        </div>
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.05)] border border-slate-100">
          <EditableCopy field="listHeading" value={listHeading} as="h3" className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4" />
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1 text-[#021127] font-black">✓</div>
                <span className="text-slate-700 font-medium text-sm leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   BLOCK 5 — Testimonials
   ════════════════════════════════════════════════════════════ */
export interface ProkipBookingTestimonial { id: string; title: string; }
export interface ProkipBookingTestimonialsProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  testimonials?: ProkipBookingTestimonial[];
  ctaText?: string;
}

export function ProkipBookingTestimonials({
  badge = "Success Stories",
  title = "Hear From Business Owners",
  subtitle = "See how real businesses across Africa use Prokip to take control of their operations and grow confidently.",
  testimonials = [
    { id: "WXfLnZ-iyYA", title: "Business Owner Testimonial 1" },
    { id: "dDeEqanvkRc", title: "Business Owner Testimonial 2" },
  ],
  ctaText = "Book a demo",
}: ProkipBookingTestimonialsProps) {
  const scrollToForm = () => {
    const el = document.getElementById("prokip-booking-form");
    if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
    console.warn("[ProkipBooking] Demo form section not found on this page — the \"Book a Demo Form\" block needs to be added to this page for this button to work.");
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-block px-3 py-1 bg-[#FFB800]/20 text-[#021127] border border-[#FFB800]/30 text-xs font-bold tracking-widest uppercase rounded-full mb-6"><EditableCopy field="badge" value={badge} as="span" /></div>
        <EditableCopy field="title" value={title} as="h2" className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight" />
        <EditableCopy field="subtitle" value={subtitle} as="p" multiline className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto" />
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {testimonials.map((t, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.05)] border border-slate-200 bg-white aspect-video p-2">
              <iframe className="w-full h-full rounded-xl" src={`https://www.youtube.com/embed/${t.id}?rel=0`} title={t.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <ProkipBtn size="lg" onClick={scrollToForm} className="w-full sm:w-auto font-bold"><EditableCopy field="ctaText" value={ctaText} as="span" /> <IconArrowRight /></ProkipBtn>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   BLOCK 6 — Process Section
   ════════════════════════════════════════════════════════════ */
export interface ProkipBookingStep { num: string; title: string; desc: string; }
export interface ProkipBookingProcessProps {
  title?: string;
  subtitle?: string;
  steps?: ProkipBookingStep[];
}

export function ProkipBookingProcess({
  title = "How Your Free Demo Will Go",
  subtitle = "Your Prokip demo is a personalized session focused on your business, not a general software presentation.",
  steps = [
    { num: "1", title: "We Understand Your Business", desc: "We'll ask a few questions about how your business works, your daily operations, your staff, your stock, your sales process, and the challenges you are facing." },
    { num: "2", title: "We Focus on Your Main Problems", desc: "Whether it is missing stock, employee theft, unclear profit, manual records, expenses, customer debts, or managing multiple branches, we'll focus on what matters most to your business." },
    { num: "3", title: "We Show You How Prokip Can Help", desc: "We'll demonstrate how Prokip can help you track sales, monitor stock, know who did what, manage expenses, understand profit, and run your business with better control." },
    { num: "4", title: "We Answer Your Questions", desc: "You can ask about setup, pricing, training, migration, accounting, staff access, branches, and how Prokip fits into your business." },
    { num: "5", title: "You Leave With a Clear Next Step", desc: "By the end, you'll understand how Prokip can help you reduce losses, improve accountability, cut stress, and grow your business with more confidence." },
  ],
}: ProkipBookingProcessProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <EditableCopy field="title" value={title} as="h2" className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight" />
          <EditableCopy field="subtitle" value={subtitle} as="p" className="text-lg text-slate-600 max-w-2xl mx-auto" />
        </div>
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {steps.map((step, i) => (
            <div key={i} className={`relative flex items-center justify-between md:justify-normal group is-active ${i % 2 === 0 ? "" : "md:flex-row-reverse"}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#FFB800]/20 text-[#021127] font-black shrink-0 md:order-1 shadow-sm z-10 ${i % 2 === 0 ? "md:-translate-x-1/2" : "md:translate-x-1/2"}`}>
                {step.num}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                <EditableCopy fieldPath={`steps.${i}.title`} value={step.title} as="h4" className="font-bold text-lg text-slate-900 mb-2" />
                <EditableCopy fieldPath={`steps.${i}.desc`} value={step.desc} as="p" multiline className="text-slate-600 text-sm leading-relaxed" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   BLOCK 7 — Booking Form
   ════════════════════════════════════════════════════════════ */
export interface ProkipBookingCountry { code: string; flag: string; name: string; }
export interface ProkipBookingFormProps {
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  trustLine?: string;
  trustSubline?: string;
  countries?: ProkipBookingCountry[];
  timeSlots?: string[];
  businessTypes?: { value: string; label: string }[];
  locationOptions?: { value: string; label: string }[];
  whyReasons?: string[];
}

export function ProkipBookingForm({
  title = "Book Your Free",
  titleHighlight = "Personalized Demo",
  subtitle = "Free today. No obligation. Tailored to your business.",
  trustLine = "Trusted by 30,000+ Users",
  trustSubline = "with 1,500+ Local Support Agents in 80+ Regions.",
  countries = [
    { code: "+234", flag: "🇳🇬", name: "Nigeria" },
    { code: "+233", flag: "🇬🇭", name: "Ghana" },
    { code: "+254", flag: "🇰🇪", name: "Kenya" },
    { code: "+27", flag: "🇿🇦", name: "South Africa" },
    { code: "+250", flag: "🇷🇼", name: "Rwanda" },
    { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
    { code: "+1", flag: "🇺🇸", name: "United States" },
  ],
  timeSlots = ["09:00 AM", "10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"],
  businessTypes = [
    { value: "retail", label: "Retail / Supermarket" },
    { value: "pharmacy", label: "Pharmacy" },
    { value: "restaurant", label: "Restaurant / Hotel" },
    { value: "wholesale", label: "Wholesale / Distribution" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "service", label: "Service Business" },
    { value: "other", label: "Other" },
  ],
  locationOptions = [
    { value: "1", label: "1 (Single Branch)" },
    { value: "2-5", label: "2 - 5 Branches" },
    { value: "6-10", label: "6 - 10 Branches" },
    { value: "11+", label: "11+ Branches" },
  ],
  whyReasons = [
    "They want to know where their money is going.",
    "They want to reduce staff-related losses.",
    "They want to stop depending on manual records.",
    "They want to manage their business without sitting there all day.",
    "They want to expand without losing control.",
  ],
}: ProkipBookingFormProps) {
  const storeSlug = useContext(ProkipBookingCtx).storeSlug;
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [countryCode, setCountryCode] = useState(countries[0]?.code || "+234");
  const [phoneNo, setPhoneNo] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [locations, setLocations] = useState("");
  const [challenge, setChallenge] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);

  const [upcomingDates, setUpcomingDates] = useState<{ dateString: string; dayName: string; dayNum: string; monthName: string }[]>([]);

  useEffect(() => {
    const list: typeof upcomingDates = [];
    const today = new Date();
    let count = 0;
    let daysChecked = 1;
    while (count < 14 && daysChecked < 30) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + daysChecked);
      if (nextDate.getDay() !== 0) {
        const year = nextDate.getFullYear();
        const month = String(nextDate.getMonth() + 1).padStart(2, "0");
        const day = String(nextDate.getDate()).padStart(2, "0");
        list.push({
          dateString: `${year}-${month}-${day}`,
          dayName: nextDate.toLocaleDateString("en-US", { weekday: "short" }),
          dayNum: nextDate.toLocaleDateString("en-US", { day: "numeric" }),
          monthName: nextDate.toLocaleDateString("en-US", { month: "short" }),
        });
        count++;
      }
      daysChecked++;
    }
    setUpcomingDates(list);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug) { setSubmitError("This form isn't connected to a store yet."); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const [firstName, ...rest] = fullName.trim().split(/\s+/).filter(Boolean);
      const res = await fetch(`/api/public/sites/${storeSlug}/crm/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName || "",
          lastName: rest.join(" "),
          email,
          phone: `${countryCode}${phoneNo}`,
          company: businessName,
          source: "landing",
          tags: ["demo-booking"],
          customFields: {
            businessType,
            locations,
            challenge,
            preferredDate: selectedDate,
            preferredTime: selectedTime,
          },
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to submit. Please try again.");
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fullName && businessName && phoneNo && email && businessType && locations) { setStep(2); }
    else { (document.getElementById("prokip-demo-form") as HTMLFormElement)?.reportValidity(); }
  };
  const resetForm = () => { setSubmitted(false); setStep(1); setFullName(""); setBusinessName(""); setPhoneNo(""); setEmail(""); setBusinessType(""); setLocations(""); setChallenge(""); setSelectedTime(""); setSelectedDate(""); setShowCustomDate(false); };
  const currentCountry = countries.find(c => c.code === countryCode) || countries[0];

  return (
    <section id="prokip-booking-form" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#021127] text-slate-100">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 lg:items-start">
        {/* Left column */}
        <div className="lg:w-5/12 pt-8">
          <h2 className="text-4xl font-black mb-6 text-white tracking-tight leading-[0.95]">
            <EditableCopy field="title" value={title} as="span" /> <br />
            <EditableCopy field="titleHighlight" value={titleHighlight} as="span" className="text-[#FFB800]" />
          </h2>
          <EditableCopy field="subtitle" value={subtitle} as="p" className="text-lg text-slate-300 mb-10 leading-relaxed" />
          <div className="mt-8">
            <div className="bg-[#FFB800]/10 border border-[#FFB800]/20 rounded-xl p-6">
              <EditableCopy field="trustLine" value={trustLine} as="h3" className="font-bold text-[#FFB800] mb-2 text-lg" />
              <EditableCopy field="trustSubline" value={trustSubline} as="p" className="text-slate-300 font-medium text-sm leading-relaxed" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:w-7/12 w-full">
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.5)] border border-slate-700 text-slate-800 relative overflow-hidden">
            {/* Progress bar */}
            {!submitted && (
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                <div className="h-full bg-[#FFB800] transition-all duration-500 ease-out" style={{ width: step === 1 ? "50%" : "100%" }} />
              </div>
            )}

            {submitted ? (
              /* Success state */
              <div className="text-center py-8 sm:py-12 prokip-fade-in flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-green-400 opacity-20 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
                  <IconCheckCircle2 />
                </div>
                <EditableCopy field="successTitle" value="You're all set!" as="h3" className="text-3xl font-black text-slate-900 mb-3 tracking-tight" />
                <EditableCopy field="successBody" value="We've received your request. A calendar invitation and confirmation details have been sent to you." as="p" multiline className="text-slate-600 mb-8 max-w-sm mx-auto text-sm leading-relaxed" />
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-md mx-auto mb-8 text-left shadow-sm">
                  <EditableCopy field="sessionTitle" value="Your Session Details" as="h4" className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4" />
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0"><IconCalendar className="w-5 h-5 text-[#021127]" /></div>
                      <div className="flex-1"><EditableCopy field="dateLabel" value="Date" as="p" className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5" /><EditableCopy fieldPath="selectedDate" value={selectedDate} as="p" className="text-sm font-bold text-slate-900" /></div>
                    </div>
                    <div className="h-px w-full bg-slate-200/60" />
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0"><IconClock className="w-5 h-5 text-[#021127]" /></div>
                      <div className="flex-1"><EditableCopy field="timeLabel" value="Time" as="p" className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5" /><EditableCopy fieldPath="selectedTime" value={selectedTime} as="p" className="text-sm font-bold text-slate-900" /></div>
                    </div>
                  </div>
                </div>
                <ProkipBtn variant="outline" onClick={resetForm} className="font-bold rounded-xl px-8 border-slate-300 text-slate-700 hover:bg-slate-50"><EditableCopy field="resetText" value="Book another demo" as="span" /></ProkipBtn>
              </div>
            ) : (
              <form id="prokip-demo-form" onSubmit={handleSubmit} className="relative">
                {/* Step 1 */}
                <div className={`space-y-6 transition-all duration-500 ${step === 1 ? "block prokip-fade-in" : "hidden"}`}>
                  <div className="mb-2">
                    <EditableCopy field="stepOneTitle" value="About Your Business" as="h3" className="text-xl font-bold text-slate-900" />
                    <EditableCopy field="stepOneSubtitle" value="Let's get to know you better so we can tailor the demo." as="p" className="text-sm text-slate-500 mt-1" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <EditableCopy field="fullNameLabel" value="Full Name *" as="span" className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider" />
                      <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#021127] focus:ring-1 focus:ring-[#021127] transition-all" placeholder="John Doe" />
                    </div>
                    <div className="flex flex-col">
                      <EditableCopy field="businessNameLabel" value="Business Name *" as="span" className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider" />
                      <input required type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#021127] focus:ring-1 focus:ring-[#021127] transition-all" placeholder="Acme Corp" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col relative">
                      <EditableCopy field="phoneLabel" value="Phone Number *" as="span" className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider" />
                      <div className="relative flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#021127] focus-within:ring-1 focus-within:ring-[#021127] transition-all">
                        <button type="button" onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)} className="flex items-center gap-1.5 px-3 border-r border-slate-200 hover:bg-slate-100 transition-colors rounded-l-xl text-sm font-semibold text-slate-700 shrink-0">
                          <span>{currentCountry.flag}</span><span>{currentCountry.code}</span><IconChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        {isCountryDropdownOpen && (
                          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 max-h-60 overflow-y-auto">
                            {countries.map(c => (
                              <button key={c.code} type="button" onClick={() => { setCountryCode(c.code); setIsCountryDropdownOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors">
                                <div className="flex items-center gap-3"><span className="text-lg">{c.flag}</span><span className="font-medium">{c.name}</span></div>
                                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded-md">{c.code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <input required type="tel" value={phoneNo} onChange={e => setPhoneNo(e.target.value)} className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none text-slate-800" placeholder="801 234 5678" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <EditableCopy field="emailLabel" value="Email Address *" as="span" className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider" />
                      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#021127] focus:ring-1 focus:ring-[#021127] transition-all" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <EditableCopy field="businessTypeLabel" value="Type of Business *" as="span" className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider" />
                      <div className="relative">
                        <select required value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#021127] focus:ring-1 focus:ring-[#021127] transition-all text-slate-700">
                          <option value="">Select industry...</option>
                          {businessTypes.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                        </select>
                        <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <EditableCopy field="locationsLabel" value="Locations *" as="span" className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider" />
                      <div className="relative">
                        <select required value={locations} onChange={e => setLocations(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#021127] focus:ring-1 focus:ring-[#021127] transition-all text-slate-700">
                          <option value="">Select size...</option>
                          {locationOptions.map(lo => <option key={lo.value} value={lo.value}>{lo.label}</option>)}
                        </select>
                        <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button type="button" onClick={handleNextStep} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-md mt-2 transition-all">
                      <EditableCopy field="continueText" value="Continue to Schedule" as="span" /> <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`space-y-6 transition-all duration-500 ${step === 2 ? "block prokip-fade-in" : "hidden"}`}>
                  <div className="flex items-center gap-3 mb-2">
                  <button type="button" onClick={() => setStep(1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" aria-label="Go back"><IconArrowLeft /></button>
                    <div><EditableCopy field="stepTwoTitle" value="Your Goals & Availability" as="h3" className="text-xl font-bold text-slate-900" /><EditableCopy field="stepTwoSubtitle" value="Tell us what you want to fix, and when to meet." as="p" className="text-sm text-slate-500" /></div>
                  </div>
                  <div className="flex flex-col">
                    <EditableCopy field="challengeLabel" value="What is your biggest challenge right now? *" as="span" className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider" />
                    <textarea required value={challenge} onChange={e => setChallenge(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#021127] focus:ring-1 focus:ring-[#021127] transition-all resize-none" rows={3} placeholder="e.g. Employee theft, manual records, tracking stock across branches..." />
                  </div>

                  {/* Date picker */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="mb-4 flex items-center justify-between">
                      <div><EditableCopy field="dateTitle" value="Select a Date *" as="h4" className="text-sm font-bold text-slate-800" /><EditableCopy field="dateSubtitle" value="Pick a day that works best for you." as="p" className="text-xs text-slate-500" /></div>
                      <IconCalendar className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {upcomingDates.slice(0, 5).map(item => (
                        <button key={item.dateString} type="button" onClick={() => { setSelectedDate(item.dateString); setSelectedTime(""); setShowCustomDate(false); }}
                          className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-center transition-all ${
                            selectedDate === item.dateString && !showCustomDate
                              ? "bg-[#021127] text-white border-[#021127] shadow-md ring-2 ring-[#FFB800]/50"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}>
                          <span className={`text-[9px] uppercase font-bold mb-0.5 ${selectedDate === item.dateString && !showCustomDate ? "text-slate-300" : "text-slate-400"}`}>{item.dayName}</span>
                          <span className={`text-lg font-black leading-none mb-0.5 ${selectedDate === item.dateString && !showCustomDate ? "text-[#FFB800]" : "text-slate-800"}`}>{item.dayNum}</span>
                          <span className="text-[9px] font-medium opacity-80">{item.monthName}</span>
                        </button>
                      ))}
                      <button type="button" onClick={() => setShowCustomDate(!showCustomDate)}
                        className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border border-dashed text-center transition-all ${showCustomDate ? "bg-slate-100 border-slate-400 text-slate-800" : "bg-transparent text-slate-500 border-slate-300 hover:bg-slate-50 hover:text-slate-700"}`}>
                        <IconCalendar className="w-5 h-5 mb-1.5 opacity-70" /><span className="text-[10px] font-bold">More</span>
                      </button>
                    </div>

                    {showCustomDate && (
                      <div className="relative prokip-fade-in mb-4">
                        <IconCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input type="date" required={showCustomDate} value={selectedDate} min={new Date().toISOString().split("T")[0]} onChange={e => { setSelectedDate(e.target.value); setSelectedTime(""); }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#021127] focus:ring-1 focus:ring-[#021127] transition-all text-slate-800" />
                      </div>
                    )}

                    {/* Time slots */}
                    <div className={`transition-all duration-300 overflow-hidden ${selectedDate ? "opacity-100 max-h-[400px]" : "opacity-50 max-h-0 pointer-events-none grayscale"}`}>
                      <div className="mb-4 mt-2 flex items-center justify-between">
                        <div><EditableCopy field="timeTitle" value="Select a Time *" as="h4" className="text-sm font-bold text-slate-800" /><EditableCopy field="timeSubtitle" value="Available slots for the selected date." as="p" className="text-xs text-slate-500" /></div>
                        <IconClock className="w-5 h-5 text-slate-300" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map(time => (
                          <button key={time} type="button" onClick={() => setSelectedTime(time)}
                            className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                              selectedTime === time ? "bg-[#FFB800] text-[#021127] border-[#FFB800] shadow-sm ring-1 ring-[#021127]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}>
                            {selectedTime === time && <IconCheckSmall />}{time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-6">
                    {submitError && (
                      <p className="mb-3 text-center text-sm font-medium text-red-500">{submitError}</p>
                    )}
                    <button type="submit" disabled={!selectedDate || !selectedTime || !challenge || submitting}
                      className="w-full flex items-center justify-center gap-2 bg-[#FFB800] hover:bg-[#E5A600] text-[#021127] font-bold py-4 rounded-xl shadow-lg shadow-[#FFB800]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      <EditableCopy field="submitText" value={submitting ? "Booking your demo..." : !challenge ? "Enter your biggest challenge" : !selectedDate ? "Select Preferred Date first" : !selectedTime ? "Select Available Time Slot" : "Show Me How to Run My Business"} as="span" />
                      {challenge && selectedDate && selectedTime && !submitting && <IconCheckCircle2 className="w-5 h-5" />}
                    </button>
                    <div className="text-center mt-4">
                      <EditableCopy field="trustBadge" value="Trusted by 30,000+ Users in 80+ Regions" as="p" className="text-[10px] text-slate-400 uppercase font-bold tracking-widest" />
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Why section */}
          <div className="mt-8 bg-slate-800/50 rounded-2xl p-6 sm:p-8 border border-slate-700">
            <EditableCopy field="whyTitle" value="Why Business Owners Book a Prokip Demo" as="h3" className="font-bold text-xl text-white mb-6 text-center" />
            <ul className="grid sm:grid-cols-2 gap-4">
              {whyReasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#FFB800]/20 flex items-center justify-center">
                    <span className="text-[#FFB800] font-black text-xs">✓</span>
                  </div>
                  <span className="text-slate-300 font-medium text-sm leading-relaxed"><EditableCopy fieldPath={`whyReasons.${i}`} value={reason} as="span" /></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   BLOCK 8 — Footer
   ════════════════════════════════════════════════════════════ */
export interface ProkipBookingFooterProps {
  text?: string;
}

export function ProkipBookingFooter({
  text = `© ${new Date().getFullYear()} Prokip. All rights reserved.`,
}: ProkipBookingFooterProps) {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm font-semibold tracking-wider uppercase">
      <p>{text}</p>
    </footer>
  );
}
