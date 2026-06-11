"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { StoreProvider } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

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
        <Sidebar />
        <main className="lg:pl-64 min-h-screen">{children}</main>
      </div>
    </StoreProvider>
  );
}
