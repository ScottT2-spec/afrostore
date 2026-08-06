# Kids Template Hero Background Image Fix

## Problem
On the Kids template (and all sites created from it), the background image in the hero section did not cover the entire hero section. There were gaps/empty areas at the top/bottom or sides.

## Root Cause
In `KidsTemplateBlocks.tsx` line 189, when a slide became active, it changed from `position: absolute` to `position: relative`. This caused the slide to collapse to its content height instead of maintaining the full hero height, which broke the background image coverage.

## Solution Applied
Modified the CSS in `KidsTemplateBlocks.tsx` (lines 186-191):

### Before:
```css
.kh-slide { position: absolute; inset: 0; opacity: 0; }
.kh-slide.kh-active { opacity: 1; position: relative; }
.kh-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; width: 100%; height: 100%; }
.kh-slide-content { position: relative; z-index: 2; width: 100%; height: 100%; display: flex; align-items: center; }
```

### After:
```css
.kh-slide { position: absolute; inset: 0; opacity: 0; min-height: var(--kh-height); }
.kh-slide.kh-active { opacity: 1; position: absolute; }
.kh-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; width: 100%; height: 100%; min-height: var(--kh-height); }
.kh-slide-content { position: relative; z-index: 2; width: 100%; height: 100%; display: flex; align-items: center; min-height: var(--kh-height); }
```

### Key Changes:
1. **`.kh-slide.kh-active`**: Changed from `position: relative` to `position: absolute` to prevent collapse
2. **`.kh-slide`**: Added `min-height: var(--kh-height)` to ensure minimum height
3. **`.kh-slide-bg`**: Added `min-height: var(--kh-height)` to ensure background covers full height
4. **`.kh-slide-content`**: Added `min-height: var(--kh-height)` to ensure content container maintains height

## Affected Sites
- kids3 (cmri852tn00002um9uthi9hqk)
- kids4 (cmria6zid00004pm96fvlm0jf)

Both sites have Home pages with `kidsHeroSlider` blocks that will benefit from this fix.

## Other Hero Components
The other hero components in the Kids template (`KidsAboutHero`, `KidsContactHero`) use gradient backgrounds instead of background images, so they are not affected by this issue.

## Deployment
Since the fix is in the React component (`KidsTemplateBlocks.tsx`), it will automatically apply to all live sites when they re-render. No database migration or content updates are required.

## Verification
The fix ensures:
- Background images cover 100% of the hero section
- Works across all screen sizes (mobile, tablet, desktop)
- Maintains the existing design and animations
- No regressions on other templates
