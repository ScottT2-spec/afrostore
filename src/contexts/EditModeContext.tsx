"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface EditModeContextType {
  isEditMode: boolean;
  storeSlug: string | null;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  storeSlug: null,
});

interface EditModeProviderProps {
  children: ReactNode;
  storeSlug?: string | null;
}

export function EditModeProvider({ children, storeSlug: propStoreSlug }: EditModeProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [storeSlug, setStoreSlug] = useState<string | null>(propStoreSlug || null);

  useEffect(() => {
    // Check URL search params for afro_editor=1
    const checkEditMode = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const editMode = params.get("afro_editor") === "1";
      setIsEditMode(editMode);

      // Also extract storeSlug from URL if not provided
      if (!storeSlug) {
        const pathParts = window.location.pathname.split("/");
        const storeSlugIndex = pathParts.indexOf("store");
        if (storeSlugIndex !== -1 && pathParts[storeSlugIndex + 1]) {
          setStoreSlug(pathParts[storeSlugIndex + 1]);
        }
      }
    };

    checkEditMode();

    // Listen for URL changes (client-side navigation)
    const handlePopState = () => checkEditMode();
    window.addEventListener("popstate", handlePopState);

    // Also listen for custom events from Next.js router
    const handleRouteChange = () => checkEditMode();
    window.addEventListener("hashchange", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleRouteChange);
    };
  }, [storeSlug]);

  return (
    <EditModeContext.Provider value={{ isEditMode, storeSlug }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) {
    // Fallback if provider is not used
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return {
        isEditMode: params.get("afro_editor") === "1",
        storeSlug: null,
      };
    }
    return { isEditMode: false, storeSlug: null };
  }
  return context;
}
