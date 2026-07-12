"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Copy, Clipboard, ArrowUp, ArrowDown, Trash } from 'lucide-react';
import { KidsStoreContext } from './KidsTemplateBlocks';
import {
  KidsAnnouncementBar,
  KidsHeroSlider,
  KidsCategoryCards,
  KidsProductGrid,
  KidsBundlePromo,
  KidsBlogPosts,
  KidsInstagram,
  KidsNewsletter,
} from './KidsTemplateBlocks';

// Section type matching the Prokip reference
export interface KidsSection {
  id: string;
  type: string;
  order: number;
  props: Record<string, any>;
  styleOverrides?: {
    backgroundType?: 'color' | 'gradient' | 'image';
    backgroundColor?: string;
    backgroundGradient?: string;
    backgroundImage?: string;
    backgroundOverlay?: string;
    textColor?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    paddingY?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    borderColor?: string;
    borderWidth?: string;
    borderStyle?: string;
    borderRadius?: string;
    boxShadow?: string;
    transitionDuration?: string;
    hoverScale?: string;
    hoverOpacity?: string;
    hoverShadow?: string;
    responsiveVisibility?: {
      desktop?: boolean;
      tablet?: boolean;
      mobile?: boolean;
    };
  };
}

interface KidsPageRendererProps {
  sections: KidsSection[];
  mode: 'live' | 'edit';
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  onDuplicateSection?: (id: string) => void;
  onDeleteSection?: (id: string) => void;
  onMoveSection?: (id: string, direction: 'up' | 'down') => void;
  onCopyStyle?: (id: string) => void;
  onPasteStyle?: (id: string) => void;
  copiedStyleSectionId?: string | null;
}

export const KidsPageRenderer: React.FC<KidsPageRendererProps> = ({
  sections,
  mode,
  selectedSectionId = null,
  onSelectSection,
  onDuplicateSection,
  onDeleteSection,
  onMoveSection,
  onCopyStyle,
  onPasteStyle,
  copiedStyleSectionId = null,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sectionId: string } | null>(null);

  // Compile section style properties
  const getSectionStyles = (sec: KidsSection): React.CSSProperties => {
    const overrides = sec.styleOverrides;
    if (!overrides) return {};

    const s: React.CSSProperties = {};

    // Background type settings
    if (overrides.backgroundType === 'color' && overrides.backgroundColor) {
      s.backgroundColor = overrides.backgroundColor;
    } else if (overrides.backgroundType === 'gradient' && overrides.backgroundGradient) {
      s.background = overrides.backgroundGradient;
    } else if (overrides.backgroundType === 'image' && overrides.backgroundImage) {
      s.backgroundImage = `url(${overrides.backgroundImage})`;
      s.backgroundSize = 'cover';
      s.backgroundPosition = 'center';
    } else if (overrides.backgroundColor) {
      s.backgroundColor = overrides.backgroundColor;
    }

    if (overrides.textColor) {
      s.color = overrides.textColor;
    }

    // Advanced paddings
    if (overrides.paddingTop) s.paddingTop = overrides.paddingTop;
    if (overrides.paddingBottom) s.paddingBottom = overrides.paddingBottom;
    if (overrides.paddingLeft) s.paddingLeft = overrides.paddingLeft;
    if (overrides.paddingRight) s.paddingRight = overrides.paddingRight;

    // Fallback standard spacing if individual directions are not defined
    if (!overrides.paddingTop && !overrides.paddingBottom && overrides.paddingY) {
      s.paddingTop = overrides.paddingY;
      s.paddingBottom = overrides.paddingY;
    }

    // Advanced margins
    if (overrides.marginTop) s.marginTop = overrides.marginTop;
    if (overrides.marginBottom) s.marginBottom = overrides.marginBottom;
    if (overrides.marginLeft) s.marginLeft = overrides.marginLeft;
    if (overrides.marginRight) s.marginRight = overrides.marginRight;

    // Borders
    if (overrides.borderColor) s.borderColor = overrides.borderColor;
    if (overrides.borderWidth) s.borderWidth = overrides.borderWidth;
    if (overrides.borderStyle) s.borderStyle = overrides.borderStyle;
    if (overrides.borderRadius) {
      switch (overrides.borderRadius) {
        case 'none': s.borderRadius = '0px'; break;
        case 'sm': s.borderRadius = '0.125rem'; break;
        case 'md': s.borderRadius = '0.375rem'; break;
        case 'lg': s.borderRadius = '0.5rem'; break;
        case 'xl': s.borderRadius = '0.75rem'; break;
        case '2xl': s.borderRadius = '1rem'; break;
        case '3xl': s.borderRadius = '1.5rem'; break;
        case 'full': s.borderRadius = '9999px'; break;
        default: s.borderRadius = overrides.borderRadius;
      }
    }

    // Shadow
    if (overrides.boxShadow) {
      switch (overrides.boxShadow) {
        case 'none': s.boxShadow = 'none'; break;
        case 'sm': s.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'; break;
        case 'md': s.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'; break;
        case 'lg': s.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'; break;
        case 'xl': s.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'; break;
        case '2xl': s.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'; break;
        default: s.boxShadow = overrides.boxShadow;
      }
    }

    // Manual transitions
    if (overrides.transitionDuration) {
      s.transitionDuration = overrides.transitionDuration;
      s.transitionProperty = 'all';
    }

    return s;
  };

  // Render individual block based on type
  const renderBlock = (sec: KidsSection) => {
    const { type, props } = sec;

    switch (type) {
      case 'kidsAnnouncementBar':
        return <KidsAnnouncementBar {...props} />;
      case 'kidsHeroSlider':
        return <KidsHeroSlider slides={props.slides as any || []} autoplaySpeed={props.autoplaySpeed} minHeight={props.minHeight} />;
      case 'kidsCategoryCards':
        return <KidsCategoryCards categories={props.categories as any || []} sectionTitle={props.sectionTitle} />;
      case 'kidsProductGrid':
        return <KidsProductGrid {...props} />;
      case 'kidsBundlePromo':
        return <KidsBundlePromo title={props.title as string} productImages={props.productImages as any || []} {...props} />;
      case 'kidsBlogPosts':
        return <KidsBlogPosts posts={props.posts as any || []} columns={props.columns} sectionTitle={props.sectionTitle} />;
      case 'kidsInstagram':
        return <KidsInstagram items={props.items as any || []} sectionTitle={props.sectionTitle} />;
      case 'kidsNewsletter':
        return <KidsNewsletter {...props} />;
      default:
        return <div className="p-8 text-center text-gray-500">Unknown block type: {type}</div>;
    }
  };

  return (
    <div className="relative min-h-screen text-slate-800 flex flex-col">
      
      {/* Dynamic Sections Renderer */}
      <div className="flex-1">
        {sections
          .sort((a, b) => a.order - b.order)
          .map((sec) => {
            const isSelected = selectedSectionId === sec.id;
            const overrides = sec.styleOverrides || {};
            const sectionStyles = getSectionStyles(sec);

            // Responsive Visibility Classes
            const hideDesktop = overrides.responsiveVisibility?.desktop === false;
            const hideTablet = overrides.responsiveVisibility?.tablet === false;
            const hideMobile = overrides.responsiveVisibility?.mobile === false;

            const visibilityClass = `
              ${hideDesktop ? 'lg:hidden' : ''}
              ${hideTablet ? 'md:max-lg:hidden' : ''}
              ${hideMobile ? 'max-md:hidden' : ''}
            `.trim().replace(/\s+/g, ' ');

            // Hover effects mapping
            const isHoverEnabled = overrides.hoverScale || overrides.hoverOpacity || overrides.hoverShadow;
            const motionProps = isHoverEnabled && mode === 'edit' ? {
              whileHover: {
                scale: overrides.hoverScale ? parseFloat(overrides.hoverScale) : 1,
                opacity: overrides.hoverOpacity ? parseFloat(overrides.hoverOpacity) : 1,
                boxShadow: overrides.hoverShadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.05)' :
                           overrides.hoverShadow === 'md' ? '0 4px 6px rgba(0,0,0,0.1)' :
                           overrides.hoverShadow === 'lg' ? '0 10px 15px rgba(0,0,0,0.1)' :
                           overrides.hoverShadow === 'xl' ? '0 20px 25px rgba(0,0,0,0.1)' : undefined
              },
              transition: {
                duration: overrides.transitionDuration ? parseFloat(overrides.transitionDuration) / 1000 : 0.2
              }
            } : {};
            
            // Outer wrapper for each block with editing hover & highlight effects
            return (
              <motion.div
                key={sec.id}
                style={sectionStyles}
                {...motionProps}
                onClick={(e) => {
                  if (mode === 'edit' && onSelectSection) {
                    e.stopPropagation();
                    onSelectSection(sec.id);
                  }
                }}
                onContextMenu={(e) => {
                  if (mode === 'edit') {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      sectionId: sec.id
                    });
                  }
                }}
                className={`relative group transition-all duration-200 ${visibilityClass} ${
                  mode === 'edit' ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:ring-offset-1' : ''
                } ${isSelected && mode === 'edit' ? 'ring-2 ring-indigo-600 ring-offset-2 z-10' : ''}`}
              >
                {/* Active Section Label for Builder Canvas */}
                {isSelected && mode === 'edit' && (
                  <div className="absolute top-0 left-4 -translate-y-1/2 bg-indigo-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow z-20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Active Section: {sec.type}
                  </div>
                )}

                {/* Background overlay div if requested */}
                {overrides.backgroundOverlay && (
                  <div 
                    className="absolute inset-0 z-0 pointer-events-none" 
                    style={{ backgroundColor: overrides.backgroundOverlay }}
                  />
                )}

                <div className="relative z-10 w-full">
                  {/* Individual block rendering */}
                  {renderBlock(sec)}
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* RIGHT-CLICK CONTEXT MENU POPUP */}
      <AnimatePresence>
        {contextMenu && mode === 'edit' && (
          <>
            {/* Click-away backdrop */}
            <div 
              className="fixed inset-0 z-50 cursor-default" 
              onClick={() => setContextMenu(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{ 
                position: 'fixed',
                left: Math.min(contextMenu.x, window.innerWidth - 220), 
                top: Math.min(contextMenu.y, window.innerHeight - 320) 
              }}
              className="fixed z-50 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 text-xs text-slate-200 select-none cursor-default"
            >
              <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-850 mb-1.5 flex items-center justify-between">
                <span>Block Actions</span>
                <span className="text-indigo-400 font-mono">
                  {(sections.find(s => s.id === contextMenu.sectionId)?.type || '').toUpperCase()}
                </span>
              </div>
              
              <button
                onClick={() => {
                  if (onSelectSection) onSelectSection(contextMenu.sectionId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-md flex items-center gap-2 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit Properties</span>
              </button>

              <button
                onClick={() => {
                  if (onDuplicateSection) onDuplicateSection(contextMenu.sectionId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-md flex items-center gap-2 transition"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Duplicate Block</span>
              </button>

              {onCopyStyle && (
                <button
                  onClick={() => {
                    onCopyStyle(contextMenu.sectionId);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-md flex items-center gap-2 transition"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Copy Styling Override</span>
                </button>
              )}

              {onPasteStyle && (
                <button
                  onClick={() => {
                    onPasteStyle(contextMenu.sectionId);
                    setContextMenu(null);
                  }}
                  disabled={!copiedStyleSectionId}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-md flex items-center gap-2 transition disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Clipboard className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Paste Styling Override</span>
                </button>
              )}

              <hr className="border-slate-800 my-1" />

              <button
                onClick={() => {
                  if (onMoveSection) onMoveSection(contextMenu.sectionId, 'up');
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-md flex items-center gap-2 transition"
              >
                <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
                <span>Move Level Up</span>
              </button>

              <button
                onClick={() => {
                  if (onMoveSection) onMoveSection(contextMenu.sectionId, 'down');
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-md flex items-center gap-2 transition"
              >
                <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Move Level Down</span>
              </button>

              <hr className="border-slate-800 my-1" />

              <button
                onClick={() => {
                  if (onDeleteSection) onDeleteSection(contextMenu.sectionId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-red-950/50 hover:text-red-300 text-red-400 rounded-md flex items-center gap-2 transition font-medium"
              >
                <Trash className="w-3.5 h-3.5 text-red-500" />
                <span>Delete Block</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
