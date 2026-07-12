"use client";

import React, { useState } from 'react';
import { PerfumesPageRenderer, type PerfumesSection } from '@/components/storefront/PerfumesPageRenderer';
import { PerfumesStoreContext, PerfumesHeader, PerfumesFontLoader } from '@/components/storefront/PerfumesTemplateBlocks';
import { RenderTemplateBlocks } from '@/components/storefront/TemplateBlockRenderer';
import { seedPerfumesPageSections } from '@/lib/templates/seed-perfumes-pages';
import { PERFUMES_TEMPLATE_PRESET } from '@/lib/templates/presets/perfumes-preset';

/**
 * THROWAWAY HARNESS PAGE FOR PERFUMES RENDERER VERIFICATION
 * 
 * This page renders the new PerfumesPageRenderer alongside the current
 * RenderTemplateBlocks for visual comparison.
 * 
 * Purpose: Verify pixel-identical rendering before cutting over the real storefront.
 * Delete this page after verification is complete.
 */

export default function TestPerfumesRendererPage() {
  const [mode, setMode] = useState<'live' | 'edit'>('live');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [view, setView] = useState<'new' | 'old' | 'split'>('new');
  
  // Seed sections from the preset
  const sections = seedPerfumesPageSections();

  // Mock store context data
  const storeContextValue = {
    products: [],
    blogs: [],
    categories: [],
    currency: 'NGN',
    storeSlug: 'test-perfumes',
    socialLinks: [],
  };

  const handleSelectSection = (id: string) => {
    setSelectedSectionId(id);
  };

  const handleDuplicateSection = (id: string) => {
    console.log('Duplicate section:', id);
  };

  const handleDeleteSection = (id: string) => {
    console.log('Delete section:', id);
  };

  const handleMoveSection = (id: string, direction: 'up' | 'down') => {
    console.log('Move section:', id, direction);
  };

  const handleCopyStyle = (id: string) => {
    console.log('Copy style:', id);
  };

  const handlePasteStyle = (id: string) => {
    console.log('Paste style:', id);
  };

  return (
    <div className="min-h-screen bg-[#f6f0eb]">
      <PerfumesFontLoader />
      
      {/* Test Controls */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 text-white p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold">PERFUMES RENDERER TEST HARNESS</h1>
          <span className="text-xs text-gray-400">Compare new renderer vs current live</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('new')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${view === 'new' ? 'bg-green-600' : 'bg-gray-700'}`}
          >
            New Renderer
          </button>
          <button
            onClick={() => setView('old')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${view === 'old' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Old Renderer
          </button>
          <button
            onClick={() => setView('split')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${view === 'split' ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            Split View
          </button>
          <div className="w-px h-6 bg-gray-600" />
          <button
            onClick={() => setMode('live')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${mode === 'live' ? 'bg-indigo-600' : 'bg-gray-700'}`}
          >
            Live Mode
          </button>
          <button
            onClick={() => setMode('edit')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${mode === 'edit' ? 'bg-indigo-600' : 'bg-gray-700'}`}
          >
            Edit Mode
          </button>
          <button
            onClick={() => setSelectedSectionId(null)}
            className="px-3 py-1.5 text-xs font-medium bg-gray-700 rounded"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="pt-16">
        <PerfumesHeader
          storeName="Test Perfumes Store"
          storeSlug="test-perfumes"
          logo={null}
          categories={[]}
          cartCount={0}
          wishlistCount={0}
        />
      </div>

      {/* Renderers */}
      <PerfumesStoreContext.Provider value={storeContextValue}>
        {view === 'new' && (
          <div className="relative">
            <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-2 py-1 z-40">NEW RENDERER</div>
            <PerfumesPageRenderer
              sections={sections}
              mode={mode}
              selectedSectionId={selectedSectionId}
              onSelectSection={handleSelectSection}
              onDuplicateSection={handleDuplicateSection}
              onDeleteSection={handleDeleteSection}
              onMoveSection={handleMoveSection}
              onCopyStyle={handleCopyStyle}
              onPasteStyle={handlePasteStyle}
              copiedStyleSectionId={null}
            />
          </div>
        )}
        
        {view === 'old' && (
          <div className="relative">
            <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-2 py-1 z-40">OLD RENDERER (RenderTemplateBlocks)</div>
            <RenderTemplateBlocks blocks={PERFUMES_TEMPLATE_PRESET} />
          </div>
        )}
        
        {view === 'split' && (
          <div className="grid grid-cols-2">
            <div className="relative border-r border-gray-300">
              <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-2 py-1 z-40">NEW RENDERER</div>
              <PerfumesPageRenderer
                sections={sections}
                mode={mode}
                selectedSectionId={selectedSectionId}
                onSelectSection={handleSelectSection}
                onDuplicateSection={handleDuplicateSection}
                onDeleteSection={handleDeleteSection}
                onMoveSection={handleMoveSection}
                onCopyStyle={handleCopyStyle}
                onPasteStyle={handlePasteStyle}
                copiedStyleSectionId={null}
              />
            </div>
            <div className="relative">
              <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-2 py-1 z-40">OLD RENDERER</div>
              <RenderTemplateBlocks blocks={PERFUMES_TEMPLATE_PRESET} />
            </div>
          </div>
        )}
      </PerfumesStoreContext.Provider>

      {/* Debug Info */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 text-white p-2 text-xs">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <span>Sections: {sections.length}</span>
          <span>View: {view}</span>
          <span>Mode: {mode}</span>
          <span>Selected: {selectedSectionId || 'none'}</span>
        </div>
      </div>
    </div>
  );
}
