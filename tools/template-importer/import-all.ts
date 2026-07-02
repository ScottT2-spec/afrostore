import { importTemplateFromReference } from "./import-template";
import { TEMPLATE_IMPORT_SOURCES } from "./sources";

async function run() {
  const results = [];
  for (const source of TEMPLATE_IMPORT_SOURCES) {
    try {
      const report = await importTemplateFromReference(source);
      results.push({
        slug: source.slug,
        capturedAt: report.capturedAt,
        assetCount: report.assets.length,
        substitutedAssets: report.substitutedAssets.length,
        status: "ok",
      });
    } catch (error) {
      results.push({
        slug: source.slug,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
    console.log(JSON.stringify(results[results.length - 1]));
  }
  console.log(JSON.stringify({ completed: results.length }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
