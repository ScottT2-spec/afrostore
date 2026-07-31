// Compatibility layer for old builder block-style-schema
// This provides backward compatibility for existing code that still uses the old builder system

export type BlockStyleSettings = {
  // Colors & Background
  backgroundColor?: string;
  textColor?: string;
  backgroundType?: 'color' | 'gradient' | 'image' | 'video';
  backgroundGradient?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundOverlay?: string;
  backgroundOverlayOpacity?: number;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  
  // Spacing
  paddingY?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  
  // Layout
  alignContent?: any;
  alignItems?: any;
  justifyContent?: any;
  flexDirection?: any;
  flexWrap?: any;
  gap?: string;
  maxWidth?: string;
  minWidth?: string;
  display?: any;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  zIndex?: string | number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  // Grid Layout
  gridColumns?: string;
  gridRows?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumnGap?: string;
  gridRowGap?: string;
  
  // Content Layout (for Shop/Blog grids)
  contentColumns?: number;
  contentGap?: string;
  contentAlign?: 'left' | 'center' | 'right';
  
  // Borders
  borderStyle?: any;
  borderWidth?: string;
  borderColor?: string;
  borderRadius?: string;
  borderRadiusTopLeft?: string;
  borderRadiusTopRight?: string;
  borderRadiusBottomLeft?: string;
  borderRadiusBottomRight?: string;
  
  // Shadows
  boxShadow?: string;
  opacity?: number;
  
  // Motion
  transitionDuration?: string;
  transitionTimingFunction?: string;
  hoverScale?: string;
  hoverOpacity?: string;
  hoverShadow?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
  animationPreset?: string;
  
  // Responsive
  responsiveVisibility?: any;
  
  // Custom CSS
  customCss?: string;
};

export type BlockStyleSchema = {
  defaults?: Partial<BlockStyleSettings>;
  allowedProperties?: string[];
};

export function getBlockSchema(blockType: string): BlockStyleSchema {
  // Return default schema for any block type
  return {
    defaults: {},
    allowedProperties: Object.keys({} as BlockStyleSettings),
  };
}

export function mergeStylesWithDefaults(
  settings: BlockStyleSettings,
  defaults: BlockStyleSettings,
  schema: BlockStyleSchema
): BlockStyleSettings {
  return {
    ...defaults,
    ...settings,
  };
}

export function resolveBlockStyles(
  settings: BlockStyleSettings,
  schema: BlockStyleSchema
): Record<string, any> {
  const styles: Record<string, any> = {};
  
  if (settings.backgroundColor) styles.backgroundColor = settings.backgroundColor;
  if (settings.textColor) styles.color = settings.textColor;
  if (settings.backgroundImage) styles.backgroundImage = `url(${settings.backgroundImage})`;
  if (settings.backgroundSize) styles.backgroundSize = settings.backgroundSize;
  if (settings.backgroundPosition) styles.backgroundPosition = settings.backgroundPosition;
  if (settings.backgroundRepeat) styles.backgroundRepeat = settings.backgroundRepeat;
  if (settings.paddingTop) styles.paddingTop = settings.paddingTop;
  if (settings.paddingBottom) styles.paddingBottom = settings.paddingBottom;
  if (settings.paddingLeft) styles.paddingLeft = settings.paddingLeft;
  if (settings.paddingRight) styles.paddingRight = settings.paddingRight;
  if (settings.marginTop) styles.marginTop = settings.marginTop;
  if (settings.marginBottom) styles.marginBottom = settings.marginBottom;
  if (settings.marginLeft) styles.marginLeft = settings.marginLeft;
  if (settings.marginRight) styles.marginRight = settings.marginRight;
  if (settings.fontFamily) styles.fontFamily = settings.fontFamily;
  if (settings.fontSize) styles.fontSize = settings.fontSize;
  if (settings.fontWeight) styles.fontWeight = settings.fontWeight;
  if (settings.lineHeight) styles.lineHeight = settings.lineHeight;
  if (settings.letterSpacing) styles.letterSpacing = settings.letterSpacing;
  if (settings.textAlign) styles.textAlign = settings.textAlign;
  if (settings.textTransform) styles.textTransform = settings.textTransform;
  if (settings.textDecoration) styles.textDecoration = settings.textDecoration;
  if (settings.display) styles.display = settings.display;
  if (settings.position) styles.position = settings.position;
  if (settings.zIndex) styles.zIndex = settings.zIndex;
  if (settings.overflow) styles.overflow = settings.overflow;
  if (settings.borderStyle) styles.borderStyle = settings.borderStyle;
  if (settings.borderWidth) styles.borderWidth = settings.borderWidth;
  if (settings.borderColor) styles.borderColor = settings.borderColor;
  if (settings.borderRadius) styles.borderRadius = settings.borderRadius;
  if (settings.boxShadow) styles.boxShadow = settings.boxShadow;
  if (typeof settings.opacity === "number") styles.opacity = settings.opacity;
  if (settings.transitionDuration) styles.transitionDuration = settings.transitionDuration;
  if (settings.transitionTimingFunction) styles.transitionTimingFunction = settings.transitionTimingFunction;
  if (settings.gap) styles.gap = settings.gap;
  if (settings.alignItems) styles.alignItems = settings.alignItems;
  if (settings.justifyContent) styles.justifyContent = settings.justifyContent;
  if (settings.flexDirection) styles.flexDirection = settings.flexDirection;
  if (settings.flexWrap) styles.flexWrap = settings.flexWrap;
  if (settings.maxWidth) styles.maxWidth = settings.maxWidth;
  if (settings.minWidth) styles.minWidth = settings.minWidth;
  
  return styles;
}

export function getResponsiveVisibilityClasses(settings: BlockStyleSettings): string {
  return '';
}

export function getBackgroundOverlayStyles(settings: BlockStyleSettings): Record<string, any> | null {
  if (!settings.backgroundOverlay) return null;
  
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: settings.backgroundOverlay,
    opacity: settings.backgroundOverlayOpacity || 0.5,
    pointerEvents: 'none',
  };
}

export function getHoverStyles(settings: BlockStyleSettings): Record<string, any> {
  const styles: Record<string, any> = {};
  
  if (settings.hoverScale) styles.transform = `scale(${settings.hoverScale})`;
  if (settings.hoverOpacity) styles.opacity = settings.hoverOpacity;
  if (settings.hoverShadow) styles.boxShadow = settings.hoverShadow;
  if (settings.hoverBackgroundColor) styles.backgroundColor = settings.hoverBackgroundColor;
  if (settings.hoverTextColor) styles.color = settings.hoverTextColor;
  
  return styles;
}
