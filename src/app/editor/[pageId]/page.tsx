"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VisualEditor from "@/components/visual-editor/VisualEditor";
import { api } from "@/lib/api-client";
import { PageStructure } from "@/lib/visual-editor/types"

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.pageId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageData, setPageData] = useState<any>(null);
  const [siteData, setSiteData] = useState<{ id: string } | null>(null);

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
    // Convert existing page content to the new editor structure
    // Handle both old block-based content and new editor structure

    console.log("convertToEditorStructure - pageContent:", pageContent);

    let elements: any[] = [];

    const mapStyleOverridesToEditorStyles = (styleOverrides: Record<string, any> | undefined) => {
      if (!styleOverrides || typeof styleOverrides !== "object") {
        // Return empty but properly structured styles object
        return {
          typography: {},
          colors: {},
          spacing: {},
          border: {},
          background: {},
          effects: {},
          position: {},
        };
      }

      return {
        typography: {
          color: styleOverrides.textColor,
          fontFamily: styleOverrides.fontFamily,
          fontSize: styleOverrides.fontSize,
          fontWeight: styleOverrides.fontWeight,
          lineHeight: styleOverrides.lineHeight,
          letterSpacing: styleOverrides.letterSpacing,
          textAlign: styleOverrides.textAlign,
          textTransform: styleOverrides.textTransform,
        },
        colors: {
          background: styleOverrides.backgroundColor,
          text: styleOverrides.textColor,
          border: styleOverrides.borderColor,
        },
        spacing: {
          top: styleOverrides.paddingTop,
          right: styleOverrides.paddingRight,
          bottom: styleOverrides.paddingBottom,
          left: styleOverrides.paddingLeft,
        },
        border: {
          width: styleOverrides.borderWidth,
          style: styleOverrides.borderStyle,
          color: styleOverrides.borderColor,
          radius: styleOverrides.borderRadius,
        },
        background: {
          type: styleOverrides.backgroundType,
          color: styleOverrides.backgroundColor,
          gradient: styleOverrides.backgroundGradient,
          image: styleOverrides.backgroundImage,
          video: styleOverrides.backgroundVideo,
          overlay: styleOverrides.backgroundOverlay,
          overlayOpacity: styleOverrides.backgroundOverlayOpacity,
          position: styleOverrides.backgroundPosition,
          size: styleOverrides.backgroundSize,
          repeat: styleOverrides.backgroundRepeat,
        },
        effects: {
          boxShadow: styleOverrides.boxShadow,
          opacity: typeof styleOverrides.opacity === "number"
            ? styleOverrides.opacity
            : typeof styleOverrides.hoverOpacity === "string"
              ? Number(styleOverrides.hoverOpacity)
              : undefined,
        },
        position: {
          type: styleOverrides.position,
          top: styleOverrides.top,
          right: styleOverrides.right,
          bottom: styleOverrides.bottom,
          left: styleOverrides.left,
          zIndex: styleOverrides.zIndex,
        },
      };
    };

    const elementToBlock = (element: any) => {
      const props = element.content?.props
        ? element.content.props
        : element.content && typeof element.content === "object"
          ? { ...element.content }
          : {};

      // Ensure element has properly structured styles
      const elementStyles = element.styles || mapStyleOverridesToEditorStyles(element.styleOverrides);

      const styleOverrides = (element.styleOverrides || element.styles)
        ? {
            ...(element.styleOverrides || {}),
            ...(element.styles
              ? {
                  textColor: element.styles.typography?.color || element.styles.colors?.text,
                  backgroundColor: element.styles.colors?.background,
                  backgroundType: element.styles.background?.type,
                  backgroundGradient: element.styles.background?.gradient,
                  backgroundImage: element.styles.background?.image,
                  backgroundVideo: element.styles.background?.video,
                  backgroundOverlay: element.styles.background?.overlay,
                  backgroundOverlayOpacity: element.styles.background?.overlayOpacity,
                  backgroundPosition: element.styles.background?.position,
                  backgroundSize: element.styles.background?.size,
                  backgroundRepeat: element.styles.background?.repeat,
                  fontFamily: element.styles.typography?.fontFamily,
                  fontSize: element.styles.typography?.fontSize,
                  fontWeight: element.styles.typography?.fontWeight,
                  lineHeight: element.styles.typography?.lineHeight,
                  letterSpacing: element.styles.typography?.letterSpacing,
                  textAlign: element.styles.typography?.textAlign,
                  textTransform: element.styles.typography?.textTransform,
                  paddingTop: element.styles.spacing?.top,
                  paddingRight: element.styles.spacing?.right,
                  paddingBottom: element.styles.spacing?.bottom,
                  paddingLeft: element.styles.spacing?.left,
                  borderWidth: element.styles.border?.width,
                  borderStyle: element.styles.border?.style,
                  borderColor: element.styles.border?.color,
                  borderRadius: element.styles.border?.radius,
                  boxShadow: element.styles.effects?.boxShadow,
                  opacity: element.styles.effects?.opacity,
                  position: element.styles.position?.type,
                  top: element.styles.position?.top,
                  right: element.styles.position?.right,
                  bottom: element.styles.position?.bottom,
                  left: element.styles.position?.left,
                  zIndex: element.styles.position?.zIndex,
                  customCss: element.settings?.customCss,
                }
              : {}),
          }
        : undefined;

      return {
        id: element.id,
        type: element.type,
        props,
        styles: elementStyles,
        settings: element.settings || {},
        ...(styleOverrides ? { styleOverrides } : {}),
      };
    };

    if (pageContent?.blocks && Array.isArray(pageContent.blocks)) {
      // Convert old block-based content to new element structure
      console.log("Converting blocks array:", pageContent.blocks);
      elements = pageContent.blocks.map((block: any, index: number) => {
        // Handle template blocks with props (like aegisHeader, aegisHero, etc.)
        if (block.props) {
          console.log("Found template block with props:", block.type, "props:", block.props);
          return {
            id: block.id || `block-${index}`,
            type: block.type, // Keep original type (aegisHeader, aegisHero, etc.)
            parentId: null,
            order: index,
            visible: true,
            locked: false,
            name: block.type || "Block",
            content: {
              props: block.props,
            },
            settings: {
              customCss: (block as any).styleOverrides?.customCss || "",
            },
            styles: mapStyleOverridesToEditorStyles((block as any).styleOverrides),
          };
        }

        // Standard block conversion
        return {
          id: block.id || `block-${index}`,
          type: block.type || "section",
          parentId: null,
          order: index,
          visible: true,
          locked: false,
          name: block.name || block.type || "Block",
          content: block.content || {},
          settings: block.settings || {},
          styles: mapStyleOverridesToEditorStyles((block as any).styleOverrides || block.styles),
        };
      });
    } else if (pageContent?.elements && Array.isArray(pageContent.elements)) {
      // Already in new format
      console.log("Already in new format with elements");
      elements = pageContent.elements;
    } else if (Array.isArray(pageContent)) {
      // Content is directly an array
      console.log("Content is directly an array:", pageContent);
      elements = pageContent.map((block: any, index: number) => {
        if (block.props) {
          console.log("Found template block with props in array:", block.type);
          return {
            id: block.id || `block-${index}`,
            type: block.type, // Keep original type
            parentId: null,
            order: index,
            visible: true,
            locked: false,
            name: block.type || "Block",
            content: {
              props: block.props,
            },
            settings: {
              customCss: (block as any).styleOverrides?.customCss || "",
            },
            styles: mapStyleOverridesToEditorStyles((block as any).styleOverrides),
          };
        }
        return {
          id: block.id || `block-${index}`,
          type: block.type || "section",
          parentId: null,
          order: index,
          visible: true,
          locked: false,
          name: block.name || block.type || "Block",
          content: block.content || {},
          settings: block.settings || {},
          styles: mapStyleOverridesToEditorStyles((block as any).styleOverrides || block.styles),
        };
      });
    } else if (pageContent) {
      // Try to convert raw content to a section
      console.log("Converting raw content to section");
      elements = [{
        id: "section-1",
        type: "section",
        parentId: null,
        order: 0,
        visible: true,
        locked: false,
        name: "Main Content",
        content: pageContent,
        settings: {},
        styles: {},
      }];
    }

    console.log("Final elements:", elements);
    
    return {
      id: pageData?.id || pageId,
      title: pageData?.title || "Untitled Page",
      slug: pageData?.slug || "untitled",
      elements: elements,
      settings: {
        layout: "default",
        hideTitle: false,
        customCss: "",
        customJs: "",
        padding: { top: "0", right: "0", bottom: "0", left: "0" },
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        backgroundColor: "#ffffff",
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
    console.log("handleSave called with content:", content);
    console.log("siteData:", siteData);
    console.log("pageId:", pageId);
    
    // Convert editor structure back to your page content format
    const editorElementToBlock = (element: any): any => {
      console.log("Converting element to block:", element.id, element.type);
      console.log("Element styles:", element.styles);
      
      const styleOverrides = {
        ...(element.styles?.typography?.color || element.styles?.colors?.text ? { textColor: element.styles.typography?.color || element.styles.colors?.text } : {}),
        ...(element.styles?.colors?.background ? { backgroundColor: element.styles.colors.background } : {}),
        ...(element.styles?.background?.type ? { backgroundType: element.styles.background.type } : {}),
        ...(element.styles?.background?.gradient ? { backgroundGradient: element.styles.background.gradient } : {}),
        ...(element.styles?.background?.image ? { backgroundImage: element.styles.background.image } : {}),
        ...(element.styles?.background?.video ? { backgroundVideo: element.styles.background.video } : {}),
        ...(element.styles?.background?.overlay ? { backgroundOverlay: element.styles.background.overlay } : {}),
        ...(typeof element.styles?.background?.overlayOpacity === "number" ? { backgroundOverlayOpacity: element.styles.background.overlayOpacity } : {}),
        ...(element.styles?.background?.position ? { backgroundPosition: element.styles.background.position } : {}),
        ...(element.styles?.background?.size ? { backgroundSize: element.styles.background.size } : {}),
        ...(element.styles?.background?.repeat ? { backgroundRepeat: element.styles.background.repeat } : {}),
        ...(element.styles?.typography?.fontFamily ? { fontFamily: element.styles.typography.fontFamily } : {}),
        ...(element.styles?.typography?.fontSize ? { fontSize: element.styles.typography.fontSize } : {}),
        ...(element.styles?.typography?.fontWeight ? { fontWeight: element.styles.typography.fontWeight } : {}),
        ...(element.styles?.typography?.lineHeight ? { lineHeight: element.styles.typography.lineHeight } : {}),
        ...(element.styles?.typography?.letterSpacing ? { letterSpacing: element.styles.typography.letterSpacing } : {}),
        ...(element.styles?.typography?.textAlign ? { textAlign: element.styles.typography.textAlign } : {}),
        ...(element.styles?.typography?.textTransform ? { textTransform: element.styles.typography.textTransform } : {}),
        ...(element.styles?.spacing?.top ? { paddingTop: element.styles.spacing.top } : {}),
        ...(element.styles?.spacing?.right ? { paddingRight: element.styles.spacing.right } : {}),
        ...(element.styles?.spacing?.bottom ? { paddingBottom: element.styles.spacing.bottom } : {}),
        ...(element.styles?.spacing?.left ? { paddingLeft: element.styles.spacing.left } : {}),
        ...(element.styles?.border?.width ? { borderWidth: element.styles.border.width } : {}),
        ...(element.styles?.border?.style ? { borderStyle: element.styles.border.style } : {}),
        ...(element.styles?.border?.color ? { borderColor: element.styles.border.color } : {}),
        ...(element.styles?.border?.radius ? { borderRadius: element.styles.border.radius } : {}),
        ...(element.styles?.effects?.boxShadow ? { boxShadow: element.styles.effects.boxShadow } : {}),
        ...(typeof element.styles?.effects?.opacity === "number" ? { opacity: element.styles.effects.opacity } : {}),
        ...(element.styles?.position?.type ? { position: element.styles.position.type } : {}),
        ...(element.styles?.position?.top ? { top: element.styles.position.top } : {}),
        ...(element.styles?.position?.right ? { right: element.styles.position.right } : {}),
        ...(element.styles?.position?.bottom ? { bottom: element.styles.position.bottom } : {}),
        ...(element.styles?.position?.left ? { left: element.styles.position.left } : {}),
        ...(typeof element.styles?.position?.zIndex === "number" ? { zIndex: element.styles.position.zIndex } : {}),
        ...(element.settings?.customCss ? { customCss: element.settings.customCss } : {}),
      };

      console.log("Generated styleOverrides:", styleOverrides);

      return {
        id: element.id,
        type: element.type,
        props: element.content?.props
          ? element.content.props
          : element.content && typeof element.content === "object"
            ? { ...element.content }
            : {},
        styleOverrides,
      };
    };

    const pageContent = {
      blocks: content.elements.map(editorElementToBlock),
      settings: {
        customCss: content.settings.customCss,
      },
    };

    console.log("pageContent to save:", pageContent);
    console.log("First block styleOverrides:", pageContent.blocks[0]?.styleOverrides);

    try {
      const savePath = siteData?.id
        ? `/api/sites/${siteData.id}/pages/${pageId}`
        : `/api/pages/${pageId}`;

      console.log("savePath:", savePath);

      const res = await api.patch(savePath, {
        content: pageContent,
        title: content.title,
        slug: content.slug,
        metaTitle: content.meta.title,
        metaDescription: content.meta.description,
      });

      console.log("API response:", res);

      if (!res.success) {
        throw new Error(res.error || "Failed to save page");
      }
    } catch (err) {
      console.error("Error saving page:", err);
      throw err;
    }
  };

  const handleBack = () => {
    // Navigate back to the site pages list
    if (siteData) {
      router.push(`/dashboard/sites/${siteData.id}/pages`);
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

  const initialContent = convertToEditorStructure(pageData?.content || {});

  return (
    <VisualEditor
      pageId={pageId}
      siteId={siteData?.id || ""}
      initialContent={initialContent}
      onSave={handleSave}
      onBack={handleBack}
      pageTitle={pageData?.title || "Visual Editor"}
    />
  );
}
