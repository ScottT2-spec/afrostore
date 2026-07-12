"use client";

import { useState, useRef } from "react";
import { Section, SectionStyleOverrides } from "@/types";

interface TemplateRendererProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  onSectionUpdate: (section: Section) => void;
  viewport: "desktop" | "tablet" | "mobile";
  isEditing: boolean;
}

export default function TemplateRenderer({
  sections,
  selectedSectionId,
  onSectionSelect,
  onSectionUpdate,
  viewport,
  isEditing,
}: TemplateRendererProps) {
  // Log error if sections data is malformed
  if (!Array.isArray(sections)) {
    console.error("[TemplateRenderer] Invalid sections data: expected array, got", typeof sections, sections);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">Error: Invalid sections data. Expected an array.</p>
      </div>
    );
  }

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    sectionId: string;
  }>({ visible: false, x: 0, y: 0, sectionId: "" });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent, sectionId: string) => {
    if (!isEditing) return;
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      sectionId,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, sectionId: "" });
  };

  const handleContextAction = (action: string) => {
    const section = sections.find((s) => s.id === contextMenu.sectionId);
    if (!section) return;

    switch (action) {
      case "edit":
        onSectionSelect(contextMenu.sectionId);
        break;
      case "duplicate":
        const newSection = {
          ...section,
          id: crypto.randomUUID(),
        };
        onSectionUpdate(newSection);
        break;
      case "delete":
        // This would be handled by the parent component
        break;
      case "moveUp":
        const index = sections.findIndex((s) => s.id === contextMenu.sectionId);
        if (index > 0) {
          const newSections = [...sections];
          [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
          // Parent would handle the reordering
        }
        break;
      case "moveDown":
        const idx = sections.findIndex((s) => s.id === contextMenu.sectionId);
        if (idx < sections.length - 1) {
          const newSections = [...sections];
          [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
          // Parent would handle the reordering
        }
        break;
    }
    closeContextMenu();
  };

  const getViewportClass = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[375px] border-x border-slate-700 shadow-2xl mx-auto";
      case "tablet":
        return "max-w-[768px] border-x border-slate-700 shadow-xl mx-auto";
      default:
        return "w-full";
    }
  };

  const buildSectionStyle = (section: Section): React.CSSProperties => {
    const style: React.CSSProperties = {};
    const overrides = section.styleOverrides || {};

    if (overrides.backgroundColor) style.backgroundColor = overrides.backgroundColor;
    if (overrides.textColor) style.color = overrides.textColor;
    if (overrides.paddingY) style.paddingTop = style.paddingBottom = overrides.paddingY;
    if (overrides.marginTop) style.marginTop = overrides.marginTop;
    if (overrides.marginBottom) style.marginBottom = overrides.marginBottom;
    if (overrides.marginLeft) style.marginLeft = overrides.marginLeft;
    if (overrides.marginRight) style.marginRight = overrides.marginRight;
    if (overrides.paddingTop) style.paddingTop = overrides.paddingTop;
    if (overrides.paddingBottom) style.paddingBottom = overrides.paddingBottom;
    if (overrides.paddingLeft) style.paddingLeft = overrides.paddingLeft;
    if (overrides.paddingRight) style.paddingRight = overrides.paddingRight;
    if (overrides.borderColor) style.borderColor = overrides.borderColor;
    if (overrides.borderWidth) style.borderWidth = overrides.borderWidth;
    if (overrides.borderRadius) style.borderRadius = overrides.borderRadius;
    if (overrides.borderStyle) style.borderStyle = overrides.borderStyle;
    if (overrides.boxShadow) style.boxShadow = overrides.boxShadow;

    // Background handling
    if (overrides.backgroundType === "gradient" && overrides.backgroundGradient) {
      style.background = overrides.backgroundGradient;
    } else if (overrides.backgroundType === "image" && overrides.backgroundImage) {
      style.backgroundImage = `url(${overrides.backgroundImage})`;
      style.backgroundSize = "cover";
      style.backgroundPosition = "center";
    } else if (overrides.backgroundType === "video" && overrides.backgroundVideo) {
      style.background = `url(${overrides.backgroundVideo})`;
    }

    // Motion FX
    if (overrides.transitionDuration) style.transition = `all ${overrides.transitionDuration} ease`;
    if (overrides.hoverScale) {
      style.transform = `scale(${overrides.hoverScale})`;
    }
    if (overrides.hoverOpacity) {
      style.opacity = overrides.hoverOpacity;
    }

    // Responsive visibility
    if (overrides.responsiveVisibility) {
      if (!overrides.responsiveVisibility.desktop && viewport === "desktop") {
        style.display = "none";
      }
      if (!overrides.responsiveVisibility.tablet && viewport === "tablet") {
        style.display = "none";
      }
      if (!overrides.responsiveVisibility.mobile && viewport === "mobile") {
        style.display = "none";
      }
    }

    return style;
  };

  const renderSectionContent = (section: Section) => {
    const content = section.content || {};

    switch (section.type) {
      case "heading":
        return (
          <div className="space-y-2">
            {content.badge ? (
              <span className="inline-block px-3 py-1 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full">
                {String(content.badge)}
              </span>
            ) : null}
            <h1 className="theme-h1 text-4xl font-bold">{String(content.heading || "Heading")}</h1>
            {content.subheading ? (
              <p className="theme-body text-lg text-surface-600">{String(content.subheading)}</p>
            ) : null}
          </div>
        );

      case "text":
        return (
          <div className="theme-body prose prose-slate max-w-none">
            <p>{String(content.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.")}</p>
          </div>
        );

      case "button":
        return (
          <button className="theme-button bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors">
            {String(content.text || "Click Me")}
          </button>
        );

      case "image":
        return (
          <img
            src={String(content.url || "https://via.placeholder.com/800x400")}
            alt={String(content.alt || "Image")}
            className="w-full h-auto rounded-lg"
          />
        );

      case "columns":
        return (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-surface-50 rounded-lg">
              <p className="text-sm text-surface-600">Column 1</p>
            </div>
            <div className="p-4 bg-surface-50 rounded-lg">
              <p className="text-sm text-surface-600">Column 2</p>
            </div>
          </div>
        );

      case "grid":
        return (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-surface-50 rounded-lg">
                <p className="text-sm text-surface-600">Grid Item {i}</p>
              </div>
            ))}
          </div>
        );

      case "spacer":
        return <div className="h-16" />;

      case "divider":
        return <hr className="border-surface-200" />;

      case "product":
        return (
          <div className="border border-surface-200 rounded-lg p-4">
            <div className="aspect-square bg-surface-100 rounded-lg mb-3" />
            <h3 className="font-semibold text-sm mb-1">Product Name</h3>
            <p className="text-brand-600 font-bold">$99.00</p>
          </div>
        );

      case "products":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-surface-200 rounded-lg p-4">
                <div className="aspect-square bg-surface-100 rounded-lg mb-3" />
                <h3 className="font-semibold text-sm mb-1">Product {i}</h3>
                <p className="text-brand-600 font-bold">$99.00</p>
              </div>
            ))}
          </div>
        );

      case "whatsapp":
        return (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-green-800">Contact us on WhatsApp</p>
              <p className="text-xs text-green-600">+1 234 567 890</p>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="flex gap-4">
            {["Facebook", "Twitter", "Instagram"].map((social) => (
              <button
                key={social}
                className="px-4 py-2 bg-surface-100 rounded-lg text-sm font-medium hover:bg-surface-200 transition-colors"
              >
                {social}
              </button>
            ))}
          </div>
        );

      case "countdown":
        return (
          <div className="flex gap-4 justify-center">
            {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-brand-600">00</div>
                <div className="text-xs text-surface-500 uppercase">{label}</div>
              </div>
            ))}
          </div>
        );

      case "testimonial":
        return (
          <div className="bg-surface-50 rounded-lg p-6">
            <p className="text-surface-600 italic mb-4">"This is an amazing product!"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-200 rounded-full" />
              <div>
                <p className="font-semibold text-sm">John Doe</p>
                <p className="text-xs text-surface-500">Customer</p>
              </div>
            </div>
          </div>
        );

      case "cta":
        return (
          <div className="bg-gradient-to-r from-brand-600 to-purple-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Get Started Today</h2>
            <p className="mb-4 opacity-90">Join thousands of satisfied customers</p>
            <button className="bg-white text-brand-600 px-6 py-3 rounded-lg font-semibold hover:bg-surface-100 transition-colors">
              Sign Up Now
            </button>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-surface-50 rounded-lg border border-surface-200">
            <p className="text-sm text-surface-500">Unknown section type: {section.type}</p>
          </div>
        );
    }
  };

  return (
    <>
      <div ref={containerRef} className={getViewportClass()}>
        {sections.map((section, index) => (
          <div
            key={section.id}
            onContextMenu={(e) => handleContextMenu(e, section.id)}
            onClick={() => isEditing && onSectionSelect(section.id)}
            className={`relative transition-all ${
              selectedSectionId === section.id && isEditing
                ? "ring-2 ring-brand-600 ring-offset-2"
                : isEditing
                ? "hover:ring-2 hover:ring-brand-300 hover:ring-offset-1 cursor-pointer"
                : ""
            }`}
            style={buildSectionStyle(section)}
          >
            {isEditing && selectedSectionId === section.id && (
              <div className="absolute -top-2 left-2 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {section.type}
              </div>
            )}
            {section.styleOverrides?.customCss && (
              <style>{section.styleOverrides.customCss}</style>
            )}
            {renderSectionContent(section)}
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
            onContextMenu={closeContextMenu}
          />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-surface-200 py-1 min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              onClick={() => handleContextAction("edit")}
              className="w-full px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-50 flex items-center gap-2"
            >
              <span className="w-4 h-4 bg-surface-100 rounded" /> Edit Properties
            </button>
            <button
              type="button"
              onClick={() => handleContextAction("duplicate")}
              className="w-full px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-50 flex items-center gap-2"
            >
              <span className="w-4 h-4 bg-surface-100 rounded" /> Duplicate Block
            </button>
            <button
              type="button"
              onClick={() => handleContextAction("moveUp")}
              className="w-full px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-50 flex items-center gap-2"
            >
              <span className="w-4 h-4 bg-surface-100 rounded" /> Move Up
            </button>
            <button
              type="button"
              onClick={() => handleContextAction("moveDown")}
              className="w-full px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-50 flex items-center gap-2"
            >
              <span className="w-4 h-4 bg-surface-100 rounded" /> Move Down
            </button>
            <div className="border-t border-surface-100 my-1" />
            <button
              type="button"
              onClick={() => handleContextAction("delete")}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <span className="w-4 h-4 bg-red-100 rounded" /> Delete Block
            </button>
          </div>
        </>
      )}
    </>
  );
}
