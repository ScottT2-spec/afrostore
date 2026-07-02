import type { ThemePackageDefinition } from "@/lib/templates/types";
import { landingGadgetImportedPackage } from "@/lib/templates/imported/landing-gadget";

export function getLandingGadgetPackageDefinition(): ThemePackageDefinition {
  const packageDefinition = structuredClone(landingGadgetImportedPackage);
  return {
    ...packageDefinition,
    slug: "landing-gadget",
    name: "Landing Gadget",
    homeSections: packageDefinition.pages?.[0]?.blocks || [],
  };
}
