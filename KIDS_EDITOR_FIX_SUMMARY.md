# Kids Template Editor Screen Fix

## Problems Identified
1. **Blog pages not showing blogs**: The builder preview only fetched blog data for cosmetics template, not kids template
2. **Non-home pages only showing footer**: The API created synthetic kids pages with empty blocks (`content: { blocks: [], settings: {} }`), so only the footer was rendered
3. **Missing store context**: Kids template blocks require `KidsStoreContext` to access products, blogs, and store data, but this wasn't provided in the editor preview
4. **Missing template-level page content**: Kids template had no page block presets in `TEMPLATE_PAGE_CONTENT_MAP`, so pages were created with empty content
5. **Slug mismatch**: Database pages used `about` and `contact` slugs, but synthetic pages used different slugs

## Solutions Applied

### 1. Removed Extra Blog Rendering for Kids Template
**File**: `src/app/builder/preview/[siteId]/[pageSlug]/page.tsx`

Removed the Kids-specific blog data fetching and blog list rendering. The Kids blog page now relies solely on the `kidsBlogPosts` block that is seeded in the database, which uses the Kids template's own blog component to display blogs. This ensures the blog page matches the Kids template's page structure.

### 2. Store Context Provider for Kids Template
**File**: `src/app/builder/preview/[siteId]/[pageSlug]/page.tsx`

Added store context providers to ensure Kids template blocks can access products, blogs, and store data:
```typescript
const kidsStoreContextValue = {
  products: products || [],
  blogs: blogData?.blogs || [],
  currency: store.currency || 'NGN',
  storeSlug: storeSlug,
  socialLinks: socialLinks || {},
};

const renderWithStoreContext = (children: React.ReactNode) => {
  switch (templateSlug) {
    case 'kids':
      return (
        <KidsStoreContext.Provider value={kidsStoreContextValue}>
          {children}
        </KidsStoreContext.Provider>
      );
    // ... other templates
  }
};
```

### 3. Template-Level Page Block Presets
**File**: `src/lib/templates/presets/kids-pages-preset.ts` (NEW)

Created page block presets for Kids template:
- `KIDS_ABOUT_PAGE_BLOCKS`: Announcement bar, header, hero, team section, footer
- `KIDS_CONTACT_PAGE_BLOCKS`: Announcement bar, header, contact hero, contact info, footer
- `KIDS_BLOG_PAGE_BLOCKS`: Announcement bar, header, hero, blog posts grid, footer

### 4. Register Kids Page Content in Template System
**File**: `src/lib/templates/template-pages.ts`

Added Kids template to `TEMPLATE_PAGE_CONTENT_MAP`:
```typescript
const TEMPLATE_PAGE_CONTENT_MAP: Record<string, Record<string, unknown[]>> = {
  kids: {
    about: KIDS_ABOUT_PAGE_BLOCKS,
    contact: KIDS_CONTACT_PAGE_BLOCKS,
    blog: KIDS_BLOG_PAGE_BLOCKS,
  },
  // ... other templates
};
```

### 5. Synthetic Page Fallback (for edge cases)
**File**: `src/app/api/storefront/[slug]/pages/[pageSlug]/route.ts`

Updated synthetic page builder to use correct slugs (`about`, `contact`, `blog`) matching the database pages. This serves as a fallback if pages don't exist in the database.

### 6. Seeding All Existing Kids Sites
**File**: `seed-kids-pages-to-all-sites.ts` (NEW)

Created script to seed page content to all existing Kids template sites using `ensureTemplatePages` with force update. Successfully seeded 9 Kids template sites.

## Template-Level Implementation
The fix is now implemented at the template level:
- Page block presets are defined in `src/lib/templates/presets/kids-pages-preset.ts`
- The presets are registered in `src/lib/templates/template-pages.ts`
- When a Kids template is imported or a Kids site is created, `ensureTemplatePages` is automatically called (via `importer.ts`)
- This ensures all new Kids sites will have proper page content from day one

## Applied to All Existing Sites
All 9 existing Kids template sites have been seeded with the new page content:
- Kids (kids-1)
- neur
- kids3
- kais (newly created site)
- Kids2
- kids4
- kstra
- kids (kids-2)
- kids

## Testing
The fixes ensure that:
1. Kids blog pages now fetch and display blog posts from the current site
2. Non-home pages (About, Contact, Blog) display full content with proper blocks instead of just footer
3. Kids template blocks have access to store context data (products, blogs, currency, etc.)
4. Page content is seeded at the template level and applies to all Kids sites
5. New Kids sites will automatically have proper page content when created
6. The editor preview works similarly to WordPress page builders with proper content rendering

## Files Modified
- `src/app/builder/preview/[siteId]/[pageSlug]/page.tsx`
- `src/app/api/storefront/[slug]/pages/[pageSlug]/route.ts`
- `src/lib/templates/template-pages.ts`
- `src/lib/templates/seed-kids-pages.ts`

## Files Created
- `src/lib/templates/presets/kids-pages-preset.ts` - Template-level page block presets
- `seed-kids-pages-to-all-sites.ts` - Script to seed all existing Kids sites
- `check-new-kids-site.ts` - Verification script
- `KIDS_EDITOR_FIX_SUMMARY.md` - This summary document
