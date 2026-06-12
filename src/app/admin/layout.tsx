"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }
    
    if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-accent-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <AdminSidebar />
      <main className="lg:pl-64 min-h-screen">{children}</main>
    </div>
  );
}