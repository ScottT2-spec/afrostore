import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { FASHION_TEMPLATE_PRESET } from "./presets/fashion-preset";
import { FASHION_COLORED_PRESET } from "./presets/fashion-colored-preset";
import { HANDMADE_BAGS_PRESET } from "./presets/handmade-bags-preset";
import { T_SHIRTS_PRINTS_PRESET } from "./presets/t-shirts-prints-preset";
import { ELECTRONICS_TEMPLATE_PRESET } from "./presets/electronics-preset";
import { TOOLS_TEMPLATE_PRESET } from "./presets/tools-preset";
import { BAKERY_TEMPLATE_PRESET } from "./presets/bakery-preset";
import { COSMETICS_TEMPLATE_PRESET } from "./presets/cosmetics-preset";
import { GROCERY_TEMPLATE_PRESET } from "./presets/grocery-preset";
import { HEALTH_TEMPLATE_PRESET } from "./presets/health-preset";
import { INTERIOR_DECOR_PRESET, INTERIOR_RETAIL_PRESET } from "./presets/interior-preset";
import { KIDS_TEMPLATE_PRESET } from "./presets/kids-preset";
import { TOYS_TEMPLATE_PRESET } from "./presets/toys-preset";
import { MAKEUP_TEMPLATE_PRESET } from "./presets/makeup-preset";
import { PERFUMES_TEMPLATE_PRESET } from "./presets/perfumes-preset";
import { AI_TEMPLATE_PRESET } from "./presets/ai-preset";

export const TEMPLATE_PRESET_MAP: Record<string, TemplateBlock[]> = {
  fashion: FASHION_TEMPLATE_PRESET,
  "fashion-colored": FASHION_COLORED_PRESET,
  "handmade-bags": HANDMADE_BAGS_PRESET,
  "t-shirts-prints": T_SHIRTS_PRINTS_PRESET,
  electronics: ELECTRONICS_TEMPLATE_PRESET,
  "electronics-accessories": ELECTRONICS_TEMPLATE_PRESET,
  hardware: ELECTRONICS_TEMPLATE_PRESET,
  tools: TOOLS_TEMPLATE_PRESET,
  "sweets-bakery": BAKERY_TEMPLATE_PRESET,
  cosmetics: COSMETICS_TEMPLATE_PRESET,
  grocery: GROCERY_TEMPLATE_PRESET,
  vegetables: GROCERY_TEMPLATE_PRESET,
  pills: HEALTH_TEMPLATE_PRESET,
  decor: INTERIOR_DECOR_PRESET,
  retail: INTERIOR_RETAIL_PRESET,
  kids: KIDS_TEMPLATE_PRESET,
  toys: TOYS_TEMPLATE_PRESET,
  makeup: MAKEUP_TEMPLATE_PRESET,
  perfumes: PERFUMES_TEMPLATE_PRESET,
  ai: AI_TEMPLATE_PRESET,
};
