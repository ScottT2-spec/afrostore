"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Store, Globe, MapPin, Clock, Bell, Shield, Truck, MessageCircle, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader title="Settings" subtitle="Manage your store settings" />
      <div className="p-6 max-w-3xl space-y-6">
        {/* Store Info */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-5">
            <Store className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-bold text-surface-900">Store Information</h3>
          </div>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Store name</label><input type="text" className="input-field" defaultValue="My Fashion Store" /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Store description</label><textarea className="input-field min-h-[80px]" defaultValue="Beautiful handmade African fashion and accessories" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Country</label><select className="input-field"><option>Nigeria</option><option>Ghana</option><option>Kenya</option><option>South Africa</option></select></div>
              <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Currency</label><select className="input-field"><option>NGN (₦)</option><option>GHS (GH₵)</option><option>KES (KSh)</option><option>ZAR (R)</option></select></div>
            </div>
          </div>
        </div>

        {/* Domain */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-5">
            <Globe className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-bold text-surface-900">Domain</h3>
          </div>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Free subdomain</label><div className="input-field bg-surface-50 text-surface-500">myfashionstore.afrostore.com</div></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Custom domain</label><input type="text" className="input-field" placeholder="yourdomain.com" /></div>
          </div>
        </div>

        {/* Delivery */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-5">
            <Truck className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-bold text-surface-900">Delivery Zones</h3>
          </div>
          <div className="space-y-3">
            {[
              { zone: "Lagos Mainland", fee: "₦2,000", free: "₦50,000" },
              { zone: "Lagos Island", fee: "₦3,500", free: "₦50,000" },
              { zone: "Other States", fee: "₦5,000", free: "₦100,000" },
            ].map((z) => (
              <div key={z.zone} className="flex items-center justify-between rounded-xl border border-surface-100 bg-surface-50 p-3">
                <div><span className="text-sm font-medium text-surface-900">{z.zone}</span></div>
                <div className="text-right"><span className="text-sm font-semibold text-surface-900">{z.fee}</span><span className="text-[10px] text-surface-400 ml-2">Free above {z.free}</span></div>
              </div>
            ))}
            <button className="btn-ghost text-xs">+ Add delivery zone</button>
          </div>
        </div>

        {/* Checkout */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-5">
            <Shield className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-bold text-surface-900">Checkout Settings</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Allow guest checkout", desc: "Customers can buy without creating an account", checked: true },
              { label: "WhatsApp ordering", desc: "Allow customers to order via WhatsApp", checked: true },
              { label: "Pay on delivery", desc: "Enable pay-on-delivery option", checked: true },
              { label: "Show stock count", desc: "Display remaining stock on product pages", checked: false },
              { label: "Low-data mode", desc: "Optimize storefront for slow connections", checked: false },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div><span className="text-sm font-medium text-surface-900">{s.label}</span><p className="text-xs text-surface-500">{s.desc}</p></div>
                <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" defaultChecked={s.checked} className="sr-only peer" /><div className="w-11 h-6 bg-surface-200 peer-focus:ring-4 peer-focus:ring-brand-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" /></label>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-5">
            <MessageCircle className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-bold text-surface-900">WhatsApp</h3>
          </div>
          <div><label className="block text-sm font-medium text-surface-700 mb-1.5">WhatsApp number</label><input type="tel" className="input-field" defaultValue="+234 812 345 6789" /></div>
        </div>

        <button className="btn-primary w-full"><Save className="h-4 w-4" />Save Settings</button>
      </div>
    </>
  );
}
