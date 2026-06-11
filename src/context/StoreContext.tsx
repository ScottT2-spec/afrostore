"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "./AuthContext";

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  subdomain: string;
  customDomain?: string;
  currency: string;
  country: string;
  businessType: string;
  status: string;
  plan: string;
  createdAt: string;
}

interface StoreContextType {
  stores: Store[];
  currentStore: Store | null;
  loading: boolean;
  setCurrentStore: (store: Store) => void;
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStoreState] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStores = useCallback(async () => {
    if (!user) {
      setStores([]);
      setCurrentStoreState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await api.get<Store[]>("/api/stores");
    if (res.success && res.data) {
      const storeList = Array.isArray(res.data) ? res.data : [];
      setStores(storeList);
      // Restore last selected or pick first
      const savedId = typeof window !== "undefined" ? localStorage.getItem("currentStoreId") : null;
      const saved = storeList.find((s) => s.id === savedId);
      if (saved) {
        setCurrentStoreState(saved);
      } else if (storeList.length > 0) {
        setCurrentStoreState(storeList[0]);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshStores();
  }, [refreshStores]);

  const setCurrentStore = (store: Store) => {
    setCurrentStoreState(store);
    if (typeof window !== "undefined") localStorage.setItem("currentStoreId", store.id);
  };

  return (
    <StoreContext.Provider value={{ stores, currentStore, loading, setCurrentStore, refreshStores }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
