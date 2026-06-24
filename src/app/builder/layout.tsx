"use client";

import { useAuth } from "@/context/AuthContext";
import { SiteProvider } from "@/context/StoreContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <SiteProvider>
      {children}
    </SiteProvider>
  );
}
