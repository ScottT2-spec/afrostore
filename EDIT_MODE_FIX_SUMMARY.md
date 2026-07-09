# Edit Mode Routing Fix - Implementation Summary

## Root Cause Analysis (Why Previous Fixes Failed)

The previous fixes failed because they relied on **non-reactive URL state management**:

1. **`window.location.search` is not reactive**: The old `isEditMode()` function checked `window.location.search` globally, but React components don't automatically re-render when the URL changes during client-side navigation via `<Link>`.

2. **Client-side navigation breaks the pattern**: When you click a `<Link>` in the iframe, Next.js performs client-side navigation. The URL in the browser bar changes, but components that already rendered with the old URL state don't re-evaluate `isEditMode()`.

3. **Server vs Client mismatch**: Links generated during initial server render have no access to `window`, so `isEditMode()` returns false. Client-side hydration might not catch up correctly.

4. **Iframe isolation**: The iframe has its own `window.location`, but the parent editor page controls the initial load. Client-side navigation inside the iframe changes the iframe's URL, potentially losing the query param.

5. **No React Context for edit mode**: We were relying on a global function instead of a React Context that would propagate edit mode state to all components reactively.

## The Bulletproof Solution

### 1. Created React Context for Edit Mode (`src/contexts/EditModeContext.tsx`)

- Provides reactive `isEditMode` and `storeSlug` state to all components
- Listens for URL changes via `popstate` and `hashchange` events
- Automatically extracts storeSlug from URL when not provided
- Falls back to URL search params if context is not used

### 2. Created Reactive Hook (`src/hooks/useEditLink.ts`)

- Uses `useParams()` to get storeSlug from Next.js App Router (most reliable)
- Uses `useSearchParams()` to detect edit mode reactively
- Uses `useEditMode()` context as additional fallback
- Provides `resolveLink()` function that:
  - Always includes the current store slug
  - Preserves `afro_editor=1` query parameter in edit mode
  - Works for both `<Link href={...}>` and programmatic navigation
  - Includes debug logging to verify generated href values
- Provides `resolveFooterLink()` for intelligent footer link resolution

### 3. Updated Core Components

**`src/app/store/[slug]/page.tsx`**
- Wrapped entire component with `EditModeProvider` to provide context
- Passes `storeSlug` from URL params to provider

**`src/components/storefront/FashionStoreChrome.tsx`**
- Uses `useEditLink()` hook instead of global `isEditMode()` function
- Updated `resolveNavHref()` to accept `resolveLink` function
- All hardcoded links now use `resolveLink()` for reactive resolution

**`src/components/storefront/FashionTemplateBlocks.tsx`**
- Added `useEditLink` import
- Updated all components to use `resolveLink()` instead of `resolveStoreLink()`
- Components updated:
  - `FashionHeroSlider`
  - `FashionPromoBanners`
  - `FashionProductGrid`
  - `FashionCategoryCards`
  - `FashionBlogPosts`
  - `FashionFeatures`
  - `FashionFooter`

### 4. Updated Legacy Utilities

**`src/lib/template-link-utils.ts`**
- Marked as DEPRECATED for backward compatibility
- Now imports `appendEditModeParam` from the new hook
- Old functions still work but new code should use `useEditLink`

## How It Works Now

### Edit Mode Detection (Reactive)
```typescript
// Multiple sources for maximum reliability:
1. useSearchParams().get("afro_editor") === "1"  // Next.js search params
2. useEditMode().isEditMode                     // React Context
3. window.location.search (fallback)           // Global URL
```

### Link Resolution (Reactive)
```typescript
// All links go through this single source of truth:
const { resolveLink, isEditMode, storeSlug } = useEditLink();

// Example usage:
<Link href={resolveLink("shop", storeSlug)}>Shop</Link>
// In edit mode: /store/{slug}/shop?afro_editor=1
// In live mode: /store/{slug}/shop
```

### Debug Logging
The `useEditLink` hook includes console.log statements that show:
- When links are resolved
- What the resolved URL is
- Whether edit mode was detected
- Warnings when storeSlug is missing

## Testing Instructions

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Open Edit Mode
1. Navigate to a site in the editor: `/dashboard/sites/{siteId}/editor`
2. The preview iframe should load with `?afro_editor=1`
3. Open browser DevTools Console to see debug logs

### 3. Test Link Navigation
1. Click navigation links (Home, Shop, Reviews, etc.)
2. Click product links
3. Click category links
4. Click footer links
5. Verify in Console that resolved URLs include:
   - Full path: `/store/{slug}/...`
   - Edit param: `?afro_editor=1`

### 4. Verify Network Tab
1. Open Network tab in DevTools
2. Click various links
3. Verify all requests go to correct URLs (no 404s)
4. URLs should look like: `/store/{slug}/shop?afro_editor=1`

### 5. Test Live Site
1. Navigate to live site without `?afro_editor=1`
2. Verify links work normally without the parameter
3. Verify no edit mode logs appear in console

## Alternative Approach (If Query Param Method Fails)

If the query param method continues to be flaky, consider:

### Option 1: Separate Edit Route Structure
```
Current: /store/{slug}?afro_editor=1
Alternative: /edit/{siteId}/preview/{slug}
```

This would:
- Use a completely different route for edit mode
- Eliminate query param preservation issues
- Provide clearer separation between edit and live modes
- Require updating all link generation to use different base paths

### Option 2: Middleware-Based Edit Mode Detection
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const isEditMode = request.nextUrl.searchParams.get('afro_editor') === '1';
  // Set a cookie or header that components can read
  // This would be available during SSR and CSR
}
```

### Option 3: Server Component Props
Pass edit mode as a prop from the root layout:
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  const isEditMode = checkEditMode();
  return <EditModeProvider isEditMode={isEditMode}>{children}</EditModeProvider>;
}
```

## Files Modified

1. **Created:**
   - `src/contexts/EditModeContext.tsx`
   - `src/hooks/useEditLink.ts`

2. **Updated:**
   - `src/lib/template-link-utils.ts` (deprecated, backward compatible)
   - `src/app/store/[slug]/page.tsx` (added EditModeProvider)
   - `src/components/storefront/FashionStoreChrome.tsx` (uses useEditLink)
   - `src/components/storefront/FashionTemplateBlocks.tsx` (uses useEditLink)

## Verification Checklist

- [ ] Edit mode loads correctly in iframe
- [ ] Navigation links preserve edit mode
- [ ] Product links preserve edit mode
- [ ] Category links preserve edit mode
- [ ] Footer links preserve edit mode
- [ ] Logo links preserve edit mode
- [ ] No 404 errors on any internal links
- [ ] Live site works without edit param
- [ ] Debug logs show correct URL resolution
- [ ] Client-side navigation maintains edit mode

## Rollback Plan

If issues arise, rollback by:
1. Remove `EditModeProvider` from `store/[slug]/page.tsx`
2. Revert `FashionStoreChrome.tsx` to use old `isEditMode()` function
3. Revert `FashionTemplateBlocks.tsx` to use `resolveStoreLink()` directly
4. Delete `src/contexts/EditModeContext.tsx` and `src/hooks/useEditLink.ts`

The old `template-link-utils.ts` functions remain as fallback.
