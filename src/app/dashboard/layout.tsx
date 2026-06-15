"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { StoreProvider } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <StoreProvider>
      <div className="min-h-screen bg-surface-50">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-surface-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-600 hover:bg-surface-100"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-display text-base font-bold text-surface-900">
            Afro<span className="text-brand-600">Store</span>
          </span>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — hidden on mobile, visible on lg+ */}
        <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0`}>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        <main className="lg:pl-64 min-h-screen">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </StoreProvider>
  );
}
