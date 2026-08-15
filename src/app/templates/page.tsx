import TemplateGallery from "@/templates/TemplateGallery";

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-brand-600">Template Marketplace</p>
          <h1 className="mt-1 text-3xl font-bold text-surface-900">Choose a website template</h1>
          <p className="mt-2 max-w-2xl text-surface-600">
            Browse industry-specific templates, preview layouts, and start with a professional site structure.
          </p>
        </div>
        <TemplateGallery />
      </div>
    </main>
  );
}
