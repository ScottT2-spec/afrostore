"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Globe, CheckCircle2, AlertCircle, Plus, ExternalLink, Copy, RefreshCw } from "lucide-react";

export default function DomainsPage() {
  return (
    <>
      <DashboardHeader title="Domains" subtitle="Manage your store domains" action={{ label: "Add Domain" }} />
      <div className="p-6 max-w-3xl space-y-6">
        {/* Free Subdomain */}
        <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6">
          <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="h-5 w-5 text-brand-500" /><h3 className="text-base font-bold text-surface-900">Free Subdomain</h3></div>
          <div className="flex items-center gap-3">
            <div className="flex-1 input-field bg-white flex items-center gap-2"><Globe className="h-4 w-4 text-surface-400" /><span className="text-surface-700">myfashionstore.afrostore.com</span></div>
            <button className="btn-ghost text-sm py-2.5"><Copy className="h-4 w-4" /></button>
            <a href="#" className="btn-ghost text-sm py-2.5"><ExternalLink className="h-4 w-4" /></a>
          </div>
          <p className="text-xs text-surface-500 mt-2">Your store is always available at this address.</p>
        </div>

        {/* Custom Domain */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4">Custom Domain</h3>
          <div className="space-y-4">
            <div className="flex gap-3"><input type="text" className="input-field flex-1" placeholder="yourbrand.com" /><button className="btn-primary text-sm">Connect</button></div>
            <div className="rounded-xl bg-surface-50 border border-surface-200 p-4">
              <h4 className="text-sm font-semibold text-surface-900 mb-3">DNS Setup Instructions</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-white border border-surface-200 px-4 py-2.5">
                  <div><span className="text-[10px] font-semibold text-surface-400 uppercase">Type</span><p className="text-sm font-mono text-surface-900">CNAME</p></div>
                  <div><span className="text-[10px] font-semibold text-surface-400 uppercase">Name</span><p className="text-sm font-mono text-surface-900">www</p></div>
                  <div><span className="text-[10px] font-semibold text-surface-400 uppercase">Value</span><p className="text-sm font-mono text-surface-900">shops.afrostore.com</p></div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white border border-surface-200 px-4 py-2.5">
                  <div><span className="text-[10px] font-semibold text-surface-400 uppercase">Type</span><p className="text-sm font-mono text-surface-900">A</p></div>
                  <div><span className="text-[10px] font-semibold text-surface-400 uppercase">Name</span><p className="text-sm font-mono text-surface-900">@</p></div>
                  <div><span className="text-[10px] font-semibold text-surface-400 uppercase">Value</span><p className="text-sm font-mono text-surface-900">76.76.21.21</p></div>
                </div>
              </div>
              <button className="mt-3 btn-ghost text-xs"><RefreshCw className="h-3.5 w-3.5" />Verify DNS</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
