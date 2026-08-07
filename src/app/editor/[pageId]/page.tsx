"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VisualEditor from "@/components/visual-editor/VisualEditor";
import { api } from "@/lib/api-client";
import { PageStructure } from "@/lib/visual-editor/types"
import { migrateLegacyPageContentToEditorTree } from "@/lib/visual-editor/node-tree";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.pageId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageData, setPageData] = useState<any>(null);
  const [siteData, setSiteData] = useState<{ id: string } | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    loadPageData();
  }, [pageId]);

  const loadPageData = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Fetch page data - this would need to be adapted to your actual API structure
      const pageRes = await api.get(`/api/pages/${pageId}`);
      
      if (!pageRes.success || !pageRes.data) {
        throw new Error(pageRes.error || "Failed to load page");
      }

      const page = pageRes.data as any;
      setPageData(page);
      setIsPublished(page.isPublished || false);

      // Fetch site data
      if (page.siteId) {
        const siteRes = await api.get(`/api/sites/${page.siteId}`);
        if (siteRes.success && siteRes.data) {
          const siteData = siteRes.data as { id: string };
          setSiteData({ id: siteData.id });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load editor");
      console.error("Error loading page:", err);
    } finally {
      setLoading(false);
    }
  };

  const convertToEditorStructure = (pageContent: any): PageStructure => {
    const migrated = migrateLegacyPageContentToEditorTree(pageContent);
    const migratedSettings = migrated.settings || {};

    return {
      id: pageData?.id || pageId,
      title: pageData?.title || "Untitled Page",
      slug: pageData?.slug || "untitled",
      elements: migrated.elements,
      settings: {
        layout: (migratedSettings.layout as PageStructure["settings"]["layout"]) || "default",
        hideTitle: typeof migratedSettings.hideTitle === "boolean" ? migratedSettings.hideTitle : false,
        customCss: typeof migratedSettings.customCss === "string" ? migratedSettings.customCss : "",
        customJs: typeof migratedSettings.customJs === "string" ? migratedSettings.customJs : "",
        padding: (migratedSettings.padding as PageStructure["settings"]["padding"]) || { top: "0", right: "0", bottom: "0", left: "0" },
        margin: (migratedSettings.margin as PageStructure["settings"]["margin"]) || { top: "0", right: "0", bottom: "0", left: "0" },
        backgroundColor: typeof migratedSettings.backgroundColor === "string" ? migratedSettings.backgroundColor : "#ffffff",
        backgroundImage: typeof migratedSettings.backgroundImage === "string" ? migratedSettings.backgroundImage : undefined,
      },
      meta: {
        title: pageData?.metaTitle || pageData?.title || "",
        description: pageData?.metaDescription || "",
        keywords: "",
      },
      createdAt: pageData?.createdAt || new Date().toISOString(),
      updatedAt: pageData?.updatedAt || new Date().toISOString(),
    };
  };

  const handleSave = async (content: PageStructure): Promise<void> => {
    const pageContent = {
      elements: content.elements,
      settings: content.settings,
    };

    try {
      const savePath = siteData?.id
        ? `/api/sites/${siteData.id}/pages/${pageId}`
        : `/api/pages/${pageId}`;

      const res = await api.patch(savePath, {
        content: pageContent,
        title: content.title,
        slug: content.slug,
        metaTitle: content.meta.title,
        metaDescription: content.meta.description,
        isPublished: isPublished,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to save page");
      }
    } catch (err) {
      console.error("Error saving page:", err);
      throw err;
    }
  };

  const handlePublishToggle = async () => {
    const newValue = !isPublished;
    const savePath = siteData?.id
      ? `/api/sites/${siteData.id}/pages/${pageId}`
      : `/api/pages/${pageId}`;

    try {
      const res = await api.patch(savePath, { isPublished: newValue });
      if (!res.success) {
        throw new Error(res.error || "Failed to update publish status");
      }
      setIsPublished(newValue);
    } catch (err) {
      console.error("Error toggling publish status:", err);
      alert("Failed to update publish status. Please try again.");
    }
  };

  const handleBack = () => {
    // Navigate back to the site's pages list
    if (siteData) {
      router.push(`/dashboard/sites/${siteData.id}/editor`);
    } else {
      router.push("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Editor</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  let initialContent: PageStructure;
  try {
    initialContent = convertToEditorStructure(pageData?.content || {});
  } catch (err) {
    console.error("Error converting page content for editor:", err);
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">This page can&apos;t be opened in the editor yet</h2>
            <p className="text-red-700 mb-4">
              {err instanceof Error ? err.message : "Its saved content isn't in a format the editor understands."}
            </p>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VisualEditor
      pageId={pageId}
      siteId={siteData?.id || ""}
      initialContent={initialContent}
      onSave={handleSave}
      onBack={handleBack}
      pageTitle={pageData?.title || "Visual Editor"}
      isPublished={isPublished}
      onPublishChange={handlePublishToggle}
    />
  );
}
