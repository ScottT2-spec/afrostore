import type { ThemePackageDefinition } from "@/lib/templates/types";
import { aegisImportedPackage } from "@/lib/templates/imported/aegis";

export function getAegisPackageDefinition(): ThemePackageDefinition {
  const packageDefinition = structuredClone(aegisImportedPackage);
  return {
    ...packageDefinition,
    slug: "aegis",
    name: "Aegis Health",
    homeSections: packageDefinition.pages?.[0]?.blocks || [],
  };
}
