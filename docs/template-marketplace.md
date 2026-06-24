# Template Marketplace and AI Website Builder

Afrostore templates are stored as internal JSON configurations and cloned per tenant when selected. Preview URLs can point to external demos, but generated sites render from Afrostore-owned `themeConfig` and page blocks.

## Data Model

- `Template` stores marketplace metadata, recommendation keywords, variants, and the master `themeConfig`.
- `SiteTemplate` stores a tenant-scoped clone of the selected template config and generated page plan.
- `Page.template` stores the template slug used for generated pages.

Tenant isolation is handled by `SiteTemplate.themeConfig`: customizing one store never mutates the master `Template`.

## Recommendation Scoring

Recommendations are calculated in `src/lib/templates/recommendation.ts`:

- Business category match: 50 points
- Keyword match: 20 points
- Industry match: 20 points
- Product/service match: 10 points

The classifier is deterministic today and returns `{ industry, confidence, recommended_templates }`. It is intentionally isolated so an OpenAI or Claude provider can replace or augment `classifyBusiness` later.

## Runtime Flow

Manual template flow:

1. User enters business details in `/dashboard/new-site`.
2. `/api/templates/recommend` ranks templates.
3. User selects a template and optional branding overrides.
4. `POST /api/workspaces/:workspaceId/sites` creates the site and calls `applyTemplateToSite`.
5. The selected template config is cloned into `SiteTemplate`, industry pages are generated, and the storefront renders the generated blocks.

AI build flow:

1. User chooses quick launch or AI build.
2. The API recommends the highest scoring template.
3. Pages, starter content, and theme config are generated automatically.

## Adding A Template

1. Add a config to `src/lib/templates/catalog.ts` or create a config entry under `src/templates/configs`.
2. Upload or provide a `previewImage`.
3. Add or create the database record through `/admin/templates`.
4. Define `recommendationKeywords` and optional `variants`.

No renderer or controller changes are needed when the template uses existing section block types. New visual sections should be added once to `src/components/storefront/BlockRenderer.tsx`, then any template can reference them.

## API Endpoints

- `GET /api/templates`
- `GET /api/templates/:id`
- `POST /api/templates`
- `PUT /api/templates/:id`
- `DELETE /api/templates/:id`
- `POST /api/templates/recommend`
- `POST /api/stores/:id/select-template`
- `POST /api/stores/:id/ai-build`

Admin UI is available at `/admin/templates`. Public gallery is available at `/templates` and `/templates/:slug`.
