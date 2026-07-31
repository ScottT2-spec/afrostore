import type { CSSProperties } from "react";

export function resolveOpacity(value: unknown, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return value > 1 ? value / 100 : value;
}

/**
 * Legacy function - now uses the new schema-based resolver
 * Maps old props format to new BlockStyleSettings format
 */
export function getSectionStyle(props: Record<string, unknown>) {
  const backgroundImage = props.bgImage as string | undefined;
  const bgColor = (props.bgColor as string) || undefined;
  const textColor = (props.textColor as string) || undefined;

  return {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: backgroundImage ? "cover" : undefined,
    backgroundPosition: backgroundImage ? "center center" : undefined,
    backgroundRepeat: backgroundImage ? "no-repeat" : undefined,
    backgroundColor: bgColor,
    color: textColor,
  } as CSSProperties;
}

/**
 * Universal style resolver for blocks with styleOverrides
 * Directly maps styleOverrides to CSS properties without schema dependency
 * Works for all block types (fashionHeroSlider, fashionPromoBanners, etc.)
 */
export function resolveSectionStyleOverrides(
  styleOverrides: Record<string, unknown> | undefined,
  blockType: string = 'default',
  globalDefaults?: Record<string, unknown>
): { styles: CSSProperties; classes: string; overlayStyles: CSSProperties | null; hoverCss: string } {
  const safeGlobalDefaults = globalDefaults && typeof globalDefaults === "object" ? globalDefaults : {};
  const safeOverrides = styleOverrides && typeof styleOverrides === "object" ? styleOverrides : {};
  const nestedStyles = safeOverrides && typeof (safeOverrides as any).styles === "object"
    ? (safeOverrides as any).styles as Record<string, unknown>
    : {};

  // Merge global defaults with styleOverrides and tolerate legacy nested style payloads.
  const merged = { ...safeGlobalDefaults, ...safeOverrides, ...nestedStyles };

  const styles: CSSProperties = {};
  const classes: string = '';
  let overlayStyles: CSSProperties | null = null;
  let hoverCss = '';

  // Colors & Background
  if (merged.backgroundColor) styles.backgroundColor = merged.backgroundColor as string;
  if (merged.textColor) styles.color = merged.textColor as string;
  if (merged.backgroundImage) styles.backgroundImage = `url(${merged.backgroundImage})`;
  if (merged.backgroundSize) styles.backgroundSize = merged.backgroundSize as string;
  if (merged.backgroundPosition) styles.backgroundPosition = merged.backgroundPosition as string;
  if (merged.backgroundRepeat) styles.backgroundRepeat = merged.backgroundRepeat as string;
  if (merged.backgroundGradient) styles.backgroundImage = merged.backgroundGradient as string;

  // Spacing
  if (merged.paddingTop) styles.paddingTop = merged.paddingTop as string;
  if (merged.paddingBottom) styles.paddingBottom = merged.paddingBottom as string;
  if (merged.paddingLeft) styles.paddingLeft = merged.paddingLeft as string;
  if (merged.paddingRight) styles.paddingRight = merged.paddingRight as string;
  if (merged.paddingY) {
    styles.paddingTop = merged.paddingY as string;
    styles.paddingBottom = merged.paddingY as string;
  }
  if (merged.marginTop) styles.marginTop = merged.marginTop as string;
  if (merged.marginBottom) styles.marginBottom = merged.marginBottom as string;
  if (merged.marginLeft) styles.marginLeft = merged.marginLeft as string;
  if (merged.marginRight) styles.marginRight = merged.marginRight as string;

  // Typography
  if (merged.fontFamily) styles.fontFamily = merged.fontFamily as string;
  if (merged.fontSize) styles.fontSize = merged.fontSize as string;
  if (merged.fontWeight) styles.fontWeight = merged.fontWeight as string;
  if (merged.lineHeight) styles.lineHeight = merged.lineHeight as string;
  if (merged.letterSpacing) styles.letterSpacing = merged.letterSpacing as string;
  if (merged.textAlign) styles.textAlign = merged.textAlign as any;
  if (merged.textTransform) styles.textTransform = merged.textTransform as string;
  if (merged.textDecoration) styles.textDecoration = merged.textDecoration as string;

  // Layout
  if (merged.display) styles.display = merged.display as any;
  if (merged.position) styles.position = merged.position as any;
  if (merged.zIndex) styles.zIndex = merged.zIndex as string | number;
  if (merged.overflow) styles.overflow = merged.overflow as string;
  if (merged.alignItems) styles.alignItems = merged.alignItems as any;
  if (merged.justifyContent) styles.justifyContent = merged.justifyContent as any;
  if (merged.flexDirection) styles.flexDirection = merged.flexDirection as any;
  if (merged.flexWrap) styles.flexWrap = merged.flexWrap as any;
  if (merged.gap) styles.gap = merged.gap as string;
  if (merged.maxWidth) styles.maxWidth = merged.maxWidth as string;
  if (merged.minWidth) styles.minWidth = merged.minWidth as string;

  // Grid Layout
  if (merged.gridColumns) styles.gridTemplateColumns = merged.gridColumns as string;
  if (merged.gridRows) styles.gridTemplateRows = merged.gridRows as string;
  if (merged.gridTemplateColumns) styles.gridTemplateColumns = merged.gridTemplateColumns as string;
  if (merged.gridTemplateRows) styles.gridTemplateRows = merged.gridTemplateRows as string;
  if (merged.gridColumnGap) styles.gridColumnGap = merged.gridColumnGap as string;
  if (merged.gridRowGap) styles.gridRowGap = merged.gridRowGap as string;

  // Borders
  if (merged.borderStyle) styles.borderStyle = merged.borderStyle as any;
  if (merged.borderWidth) styles.borderWidth = merged.borderWidth as string;
  if (merged.borderColor) styles.borderColor = merged.borderColor as string;
  if (merged.borderRadius) styles.borderRadius = merged.borderRadius as string;
  if (merged.borderRadiusTopLeft) styles.borderTopLeftRadius = merged.borderRadiusTopLeft as string;
  if (merged.borderRadiusTopRight) styles.borderTopRightRadius = merged.borderRadiusTopRight as string;
  if (merged.borderRadiusBottomLeft) styles.borderBottomLeftRadius = merged.borderRadiusBottomLeft as string;
  if (merged.borderRadiusBottomRight) styles.borderBottomRightRadius = merged.borderRadiusBottomRight as string;

  // Shadows & Effects
  if (merged.boxShadow) styles.boxShadow = merged.boxShadow as string;
  if (typeof merged.opacity === 'number') styles.opacity = merged.opacity;
  if (merged.transitionDuration) styles.transitionDuration = merged.transitionDuration as string;
  if (merged.transitionTimingFunction) styles.transitionTimingFunction = merged.transitionTimingFunction as string;

  // Background Overlay
  if (merged.backgroundOverlay) {
    overlayStyles = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: merged.backgroundOverlay as string,
      opacity: typeof merged.backgroundOverlayOpacity === 'number' ? merged.backgroundOverlayOpacity : 0.5,
      pointerEvents: 'none',
    };
  }

  // Hover Styles
  const hoverStyles: Record<string, any> = {};
  if (merged.hoverScale) hoverStyles.transform = `scale(${merged.hoverScale})`;
  if (merged.hoverOpacity) hoverStyles.opacity = merged.hoverOpacity;
  if (merged.hoverShadow) hoverStyles.boxShadow = merged.hoverShadow;
  if (merged.hoverBackgroundColor) hoverStyles.backgroundColor = merged.hoverBackgroundColor;
  if (merged.hoverTextColor) hoverStyles.color = merged.hoverTextColor;

  if (Object.keys(hoverStyles).length > 0) {
    const hoverStyleStr = Object.entries(hoverStyles).map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    }).join(' ');
    hoverCss = `.builder-block-wrapper:hover { ${hoverStyleStr} }`;
  }

  return { styles, classes, overlayStyles, hoverCss };
}

export function buildScopedStyleCss(scopeSelector: string, styles: CSSProperties, hoverCss = ""): string {
  const root = `${scopeSelector} > .section-content`;
  const textTargets = `${scopeSelector} :is(h1, h2, h3, h4, h5, h6, p, span, a, button, li, label, strong, em, small)`;
  const mediaTargets = `${scopeSelector} :is(img, video, svg)`;
  const css: string[] = [];

  if (
    styles.backgroundColor ||
    styles.paddingTop ||
    styles.paddingRight ||
    styles.paddingBottom ||
    styles.paddingLeft ||
    styles.marginTop ||
    styles.marginRight ||
    styles.marginBottom ||
    styles.marginLeft ||
    styles.borderRadius ||
    styles.borderWidth ||
    styles.borderStyle ||
    styles.borderColor ||
    styles.boxShadow ||
    styles.position ||
    typeof styles.zIndex === "number" ||
    typeof styles.opacity === "number" ||
    styles.maxWidth ||
    styles.minWidth ||
    styles.display ||
    styles.justifyContent ||
    styles.alignItems ||
    styles.flexDirection ||
    styles.flexWrap ||
    styles.gap
  ) {
    css.push(`
${scopeSelector} {
  ${styles.position ? `position: ${styles.position} !important;` : ""}
  ${typeof styles.zIndex === "number" ? `z-index: ${styles.zIndex} !important;` : ""}
  ${typeof styles.opacity === "number" ? `opacity: ${styles.opacity} !important;` : ""}
  ${styles.maxWidth ? `max-width: ${styles.maxWidth} !important;` : ""}
  ${styles.minWidth ? `min-width: ${styles.minWidth} !important;` : ""}
  ${styles.display ? `display: ${styles.display} !important;` : ""}
  ${styles.justifyContent ? `justify-content: ${styles.justifyContent} !important;` : ""}
  ${styles.alignItems ? `align-items: ${styles.alignItems} !important;` : ""}
  ${styles.flexDirection ? `flex-direction: ${styles.flexDirection} !important;` : ""}
  ${styles.flexWrap ? `flex-wrap: ${styles.flexWrap} !important;` : ""}
  ${styles.gap ? `gap: ${styles.gap} !important;` : ""}
}

${root} {
  ${styles.backgroundColor ? `background-color: ${styles.backgroundColor} !important;` : ""}
  ${styles.paddingTop ? `padding-top: ${styles.paddingTop} !important;` : ""}
  ${styles.paddingRight ? `padding-right: ${styles.paddingRight} !important;` : ""}
  ${styles.paddingBottom ? `padding-bottom: ${styles.paddingBottom} !important;` : ""}
  ${styles.paddingLeft ? `padding-left: ${styles.paddingLeft} !important;` : ""}
  ${styles.marginTop ? `margin-top: ${styles.marginTop} !important;` : ""}
  ${styles.marginRight ? `margin-right: ${styles.marginRight} !important;` : ""}
  ${styles.marginBottom ? `margin-bottom: ${styles.marginBottom} !important;` : ""}
  ${styles.marginLeft ? `margin-left: ${styles.marginLeft} !important;` : ""}
  ${styles.borderRadius ? `border-radius: ${styles.borderRadius} !important;` : ""}
  ${styles.boxShadow ? `box-shadow: ${styles.boxShadow} !important;` : ""}
  ${styles.borderWidth ? `border-width: ${styles.borderWidth} !important;` : ""}
  ${styles.borderStyle ? `border-style: ${styles.borderStyle} !important;` : ""}
  ${styles.borderColor ? `border-color: ${styles.borderColor} !important;` : ""}
}`);
  }

  if (
    styles.color ||
    styles.fontFamily ||
    styles.fontSize ||
    styles.fontWeight ||
    styles.lineHeight ||
    styles.letterSpacing ||
    styles.textAlign ||
    styles.textTransform ||
    styles.textDecoration
  ) {
    css.push(`
${textTargets} {
  ${styles.color ? `color: ${styles.color} !important;` : ""}
  ${styles.fontFamily ? `font-family: ${styles.fontFamily} !important;` : ""}
  ${styles.fontSize ? `font-size: ${styles.fontSize} !important;` : ""}
  ${styles.fontWeight ? `font-weight: ${styles.fontWeight} !important;` : ""}
  ${styles.lineHeight ? `line-height: ${styles.lineHeight} !important;` : ""}
  ${styles.letterSpacing ? `letter-spacing: ${styles.letterSpacing} !important;` : ""}
  ${styles.textAlign ? `text-align: ${styles.textAlign} !important;` : ""}
  ${styles.textTransform ? `text-transform: ${styles.textTransform} !important;` : ""}
  ${styles.textDecoration ? `text-decoration: ${styles.textDecoration} !important;` : ""}
}`);
  }

  if (styles.backgroundColor || styles.borderColor || styles.borderWidth || styles.borderStyle || styles.borderRadius || styles.boxShadow || typeof styles.opacity === "number") {
    css.push(`
${mediaTargets} {
  ${styles.borderRadius ? `border-radius: ${styles.borderRadius} !important;` : ""}
  ${styles.boxShadow ? `box-shadow: ${styles.boxShadow} !important;` : ""}
  ${styles.borderWidth ? `border-width: ${styles.borderWidth} !important;` : ""}
  ${styles.borderStyle ? `border-style: ${styles.borderStyle} !important;` : ""}
  ${styles.borderColor ? `border-color: ${styles.borderColor} !important;` : ""}
  ${typeof styles.opacity === "number" ? `opacity: ${styles.opacity} !important;` : ""}
}`);
  }

  if (hoverCss) {
    css.push(hoverCss);
  }

  return css.join("\n");
}
