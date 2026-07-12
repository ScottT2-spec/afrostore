"use client";

import { useState } from "react";
import { X, Settings, Sliders, Copy, Trash2, Sparkles } from "lucide-react";
import { Section, SectionStyleOverrides } from "@/types";

interface RightSidebarProps {
  selectedSection: Section | null;
  onSectionUpdate: (section: Section) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionDuplicate: (sectionId: string) => void;
  onClose: () => void;
  onCopyStyles: (sectionId: string) => void;
  onPasteStyles: (sectionId: string) => void;
  hasCopiedStyles: boolean;
}

type StylingTab = "content" | "advanced";

export default function RightSidebar({
  selectedSection,
  onSectionUpdate,
  onSectionDelete,
  onSectionDuplicate,
  onClose,
  onCopyStyles,
  onPasteStyles,
  hasCopiedStyles,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<StylingTab>("content");

  if (!selectedSection) {
    return (
      <div className="w-80 border-l border-surface-200 bg-white h-full flex flex-col">
        <div className="p-4 border-b border-surface-100">
          <h3 className="text-sm font-bold text-surface-900">No Selection</h3>
          <p className="mt-1 text-xs text-surface-500">Click on a section to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateStyleOverride = (key: keyof SectionStyleOverrides, value: any) => {
    onSectionUpdate({
      ...selectedSection,
      styleOverrides: {
        ...selectedSection.styleOverrides,
        [key]: value,
      },
    });
  };

  const updateContent = (key: string, value: any) => {
    onSectionUpdate({
      ...selectedSection,
      content: {
        ...selectedSection.content,
        [key]: value,
      },
    });
  };

  return (
    <div className="w-80 border-l border-surface-200 bg-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-surface-900 capitalize">{selectedSection.type}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onCopyStyles(selectedSection.id)}
            className="p-1.5 rounded hover:bg-surface-100 transition-colors"
            title="Copy Styles"
          >
            <Copy className="h-4 w-4 text-surface-400" />
          </button>
          {hasCopiedStyles && (
            <button
              type="button"
              onClick={() => onPasteStyles(selectedSection.id)}
              className="p-1.5 rounded hover:bg-brand-50 transition-colors"
              title="Paste Styles"
            >
              <Copy className="h-4 w-4 text-brand-600" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onSectionDuplicate(selectedSection.id)}
            className="p-1.5 rounded hover:bg-surface-100 transition-colors"
            title="Duplicate"
          >
            <Copy className="h-4 w-4 text-surface-400" />
          </button>
          <button
            type="button"
            onClick={() => onSectionDelete(selectedSection.id)}
            className="p-1.5 rounded hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-surface-400 hover:text-red-600" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-surface-100 transition-colors"
            title="Close"
          >
            <X className="h-4 w-4 text-surface-400" />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-surface-100">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "content" ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50" : "text-surface-400 hover:text-surface-600"
          }`}
        >
          <Settings className="h-4 w-4" /> Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("advanced")}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "advanced" ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50" : "text-surface-400 hover:text-surface-600"
          }`}
        >
          <Sliders className="h-4 w-4" /> Advanced
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "content" ? (
          <ContentTab section={selectedSection} updateContent={updateContent} />
        ) : (
          <AdvancedTab
            styleOverrides={selectedSection.styleOverrides || {}}
            updateStyleOverride={updateStyleOverride}
          />
        )}
      </div>
    </div>
  );
}

function ContentTab({
  section,
  updateContent,
}: {
  section: Section;
  updateContent: (key: string, value: any) => void;
}) {
  const content = section.content || {};

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Content</h3>
        
        {/* Dynamic content fields based on section type */}
        {section.type === "heading" && (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-700 mb-1">Heading Text</label>
              <input
                type="text"
                value={(content.heading as string) || ""}
                onChange={(e) => updateContent("heading", e.target.value)}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                placeholder="Enter heading text"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-700 mb-1">Subheading</label>
              <input
                type="text"
                value={(content.subheading as string) || ""}
                onChange={(e) => updateContent("subheading", e.target.value)}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                placeholder="Enter subheading"
              />
            </div>
          </>
        )}

        {section.type === "text" && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-surface-700 mb-1">Text Content</label>
            <textarea
              value={(content.text as string) || ""}
              onChange={(e) => updateContent("text", e.target.value)}
              className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2 h-32 resize-none"
              placeholder="Enter text content"
            />
          </div>
        )}

        {section.type === "button" && (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-700 mb-1">Button Text</label>
              <input
                type="text"
                value={(content.text as string) || ""}
                onChange={(e) => updateContent("text", e.target.value)}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                placeholder="Button label"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-700 mb-1">Link URL</label>
              <input
                type="text"
                value={(content.url as string) || ""}
                onChange={(e) => updateContent("url", e.target.value)}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                placeholder="https://..."
              />
            </div>
          </>
        )}

        {section.type === "image" && (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-700 mb-1">Image URL</label>
              <input
                type="text"
                value={(content.url as string) || ""}
                onChange={(e) => updateContent("url", e.target.value)}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                placeholder="https://..."
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-700 mb-1">Alt Text</label>
              <input
                type="text"
                value={(content.alt as string) || ""}
                onChange={(e) => updateContent("alt", e.target.value)}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                placeholder="Image description"
              />
            </div>
          </>
        )}

        {/* Generic fields for all sections */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-surface-700 mb-1">Badge Text</label>
          <input
            type="text"
            value={(content.badge as string) || ""}
            onChange={(e) => updateContent("badge", e.target.value)}
            className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
            placeholder="Optional badge"
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-surface-700 mb-1">Custom CSS Class</label>
          <input
            type="text"
            value={(content.className as string) || ""}
            onChange={(e) => updateContent("className", e.target.value)}
            className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
            placeholder="my-custom-class"
          />
        </div>
      </div>

      {/* AI Improve Button */}
      <div className="pt-4 border-t border-surface-100">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs font-semibold py-2.5 rounded-lg hover:from-brand-700 hover:to-purple-700 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          AI Improve Section
        </button>
      </div>
    </div>
  );
}

function AdvancedTab({
  styleOverrides,
  updateStyleOverride,
}: {
  styleOverrides: SectionStyleOverrides;
  updateStyleOverride: (key: keyof SectionStyleOverrides, value: any) => void;
}) {
  return (
    <div className="p-4 space-y-5">
      {/* Colors & Background */}
      <div>
        <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Colors & Background</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={styleOverrides.backgroundColor || "#ffffff"}
                onChange={(e) => updateStyleOverride("backgroundColor", e.target.value)}
                className="h-8 w-8 rounded border border-surface-200 cursor-pointer"
              />
              <input
                type="text"
                value={styleOverrides.backgroundColor || ""}
                onChange={(e) => updateStyleOverride("backgroundColor", e.target.value)}
                className="flex-1 text-xs border border-surface-200 rounded px-2 py-1.5"
                placeholder="#ffffff"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={styleOverrides.textColor || "#000000"}
                onChange={(e) => updateStyleOverride("textColor", e.target.value)}
                className="h-8 w-8 rounded border border-surface-200 cursor-pointer"
              />
              <input
                type="text"
                value={styleOverrides.textColor || ""}
                onChange={(e) => updateStyleOverride("textColor", e.target.value)}
                className="flex-1 text-xs border border-surface-200 rounded px-2 py-1.5"
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1">Background Type</label>
            <select
              value={styleOverrides.backgroundType || "color"}
              onChange={(e) => updateStyleOverride("backgroundType", e.target.value)}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
            >
              <option value="color">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          {styleOverrides.backgroundType === "gradient" && (
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1">Gradient CSS</label>
              <input
                type="text"
                value={styleOverrides.backgroundGradient || ""}
                onChange={(e) => updateStyleOverride("backgroundGradient", e.target.value)}
                className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
                placeholder="linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
              />
            </div>
          )}
          {(styleOverrides.backgroundType === "image" || styleOverrides.backgroundType === "video") && (
            <>
              <div>
                <label className="block text-xs font-medium text-surface-700 mb-1">
                  {styleOverrides.backgroundType === "image" ? "Image URL" : "Video URL"}
                </label>
                <input
                  type="text"
                  value={styleOverrides.backgroundImage || styleOverrides.backgroundVideo || ""}
                  onChange={(e) =>
                    updateStyleOverride(
                      styleOverrides.backgroundType === "image" ? "backgroundImage" : "backgroundVideo",
                      e.target.value
                    )
                  }
                  className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-700 mb-1">Overlay Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styleOverrides.backgroundOverlay || "#000000"}
                    onChange={(e) => updateStyleOverride("backgroundOverlay", e.target.value)}
                    className="h-8 w-8 rounded border border-surface-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={styleOverrides.backgroundOverlay || ""}
                    onChange={(e) => updateStyleOverride("backgroundOverlay", e.target.value)}
                    className="flex-1 text-xs border border-surface-200 rounded px-2 py-1.5"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Spacing */}
      <div>
        <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Spacing</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1">Padding (Top/Bottom)</label>
            <input
              type="text"
              value={styleOverrides.paddingY || ""}
              onChange={(e) => updateStyleOverride("paddingY", e.target.value)}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
              placeholder="4rem"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-surface-500 mb-0.5">Margin Top</label>
              <input
                type="text"
                value={styleOverrides.marginTop || ""}
                onChange={(e) => updateStyleOverride("marginTop", e.target.value)}
                className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] text-surface-500 mb-0.5">Margin Bottom</label>
              <input
                type="text"
                value={styleOverrides.marginBottom || ""}
                onChange={(e) => updateStyleOverride("marginBottom", e.target.value)}
                className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] text-surface-500 mb-0.5">Margin Left</label>
              <input
                type="text"
                value={styleOverrides.marginLeft || ""}
                onChange={(e) => updateStyleOverride("marginLeft", e.target.value)}
                className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] text-surface-500 mb-0.5">Margin Right</label>
              <input
                type="text"
                value={styleOverrides.marginRight || ""}
                onChange={(e) => updateStyleOverride("marginRight", e.target.value)}
                className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-surface-500 mb-0.5">Padding Top</label>
              <input
                type="text"
                value={styleOverrides.paddingTop || ""}
                onChange={(e) => updateStyleOverride("paddingTop", e.target.value)}
                className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] text-surface-500 mb-0.5">Padding Bottom</label>
              <input
                type="text"
                value={styleOverrides.paddingBottom || ""}
                onChange={(e) => updateStyleOverride("paddingBottom", e.target.value)}
                className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] text-surface-500 mb-0.5">Padding Left</label>
              <input
                type="text"
                value={styleOverrides.paddingLeft || ""}
                onChange={(e) => updateStyleOverride("paddingLeft", e.target.value)}
                className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] text-surface-500 mb-0.5">Padding Right</label>
              <input
                type="text"
                value={styleOverrides.paddingRight || ""}
                onChange={(e) => updateStyleOverride("paddingRight", e.target.value)}
                className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Borders */}
      <div>
        <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Borders</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1">Border Style</label>
            <select
              value={styleOverrides.borderStyle || "none"}
              onChange={(e) => updateStyleOverride("borderStyle", e.target.value)}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
            >
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1">Border Width</label>
            <input
              type="text"
              value={styleOverrides.borderWidth || ""}
              onChange={(e) => updateStyleOverride("borderWidth", e.target.value)}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
              placeholder="1px"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1">Border Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={styleOverrides.borderColor || "#000000"}
                onChange={(e) => updateStyleOverride("borderColor", e.target.value)}
                className="h-8 w-8 rounded border border-surface-200 cursor-pointer"
              />
              <input
                type="text"
                value={styleOverrides.borderColor || ""}
                onChange={(e) => updateStyleOverride("borderColor", e.target.value)}
                className="flex-1 text-xs border border-surface-200 rounded px-2 py-1.5"
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1">Border Radius</label>
            <input
              type="text"
              value={styleOverrides.borderRadius || ""}
              onChange={(e) => updateStyleOverride("borderRadius", e.target.value)}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
              placeholder="8px"
            />
          </div>
        </div>
      </div>

      {/* Shadows */}
      <div>
        <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Shadows</h3>
        <div>
          <label className="block text-xs font-medium text-surface-700 mb-1">Box Shadow</label>
          <input
            type="text"
            value={styleOverrides.boxShadow || ""}
            onChange={(e) => updateStyleOverride("boxShadow", e.target.value)}
            className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
            placeholder="0 4px 6px rgba(0,0,0,0.1)"
          />
        </div>
      </div>

      {/* Motion FX */}
      <div>
        <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Motion FX</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1">Transition Duration</label>
            <input
              type="text"
              value={styleOverrides.transitionDuration || ""}
              onChange={(e) => updateStyleOverride("transitionDuration", e.target.value)}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
              placeholder="0.3s"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1">Hover Scale</label>
            <input
              type="text"
              value={styleOverrides.hoverScale || ""}
              onChange={(e) => updateStyleOverride("hoverScale", e.target.value)}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
              placeholder="1.05"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1">Hover Opacity</label>
            <input
              type="text"
              value={styleOverrides.hoverOpacity || ""}
              onChange={(e) => updateStyleOverride("hoverOpacity", e.target.value)}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
              placeholder="0.9"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1">Hover Shadow</label>
            <input
              type="text"
              value={styleOverrides.hoverShadow || ""}
              onChange={(e) => updateStyleOverride("hoverShadow", e.target.value)}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
              placeholder="0 8px 16px rgba(0,0,0,0.15)"
            />
          </div>
        </div>
      </div>

      {/* Responsive Visibility */}
      <div>
        <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Responsive Visibility</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={styleOverrides.responsiveVisibility?.desktop ?? true}
              onChange={(e) =>
                updateStyleOverride("responsiveVisibility", {
                  ...styleOverrides.responsiveVisibility,
                  desktop: e.target.checked,
                })
              }
              className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs text-surface-700">Show on Desktop</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={styleOverrides.responsiveVisibility?.tablet ?? true}
              onChange={(e) =>
                updateStyleOverride("responsiveVisibility", {
                  ...styleOverrides.responsiveVisibility,
                  tablet: e.target.checked,
                })
              }
              className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs text-surface-700">Show on Tablet</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={styleOverrides.responsiveVisibility?.mobile ?? true}
              onChange={(e) =>
                updateStyleOverride("responsiveVisibility", {
                  ...styleOverrides.responsiveVisibility,
                  mobile: e.target.checked,
                })
              }
              className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs text-surface-700">Show on Mobile</span>
          </label>
        </div>
      </div>

      {/* Section Custom CSS */}
      <div>
        <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Custom CSS</h3>
        <textarea
          value={styleOverrides.customCss || ""}
          onChange={(e) => updateStyleOverride("customCss", e.target.value)}
          className="w-full text-xs border border-surface-200 rounded px-2 py-1.5 h-24 font-mono"
          placeholder="/* Add section-specific CSS here */"
        />
      </div>
    </div>
  );
}
