/**
 * The standard project scaffold every AI-generated storefront starts from.
 *
 * This is the fix for the core failure mode of unconstrained AI codegen:
 * ask an LLM to "build me a SaaS website" with no fixed structure, and it
 * invents a different file layout every time (index.html/style.css/script.js
 * one run, a completely different arrangement the next). Then a follow-up
 * prompt like "add authentication" has no stable architecture to build
 * into — the model has to re-guess the whole project's conventions from
 * whatever it produced last time, and drifts further off course with every
 * turn.
 *
 * The fix: every generated project starts from this exact same scaffold,
 * every time. The AI is never asked to invent a project structure — only
 * to fill in / extend the fixed one below. Stack: Vite + React + Tailwind
 * (fast to boot in a Daytona sandbox, small enough surface for a model to
 * reliably edit without hallucinating framework-specific footguns).
 *
 * Usage: spread getStandardScaffold() as the base of the `files` map passed
 * to createSandboxWithFiles(), then let AI-generated/edited files layer on
 * top of (not replace) this structure.
 */

import { getDesignTokens, tokensToCssVariables, tokensToTailwindExtend, type DesignTokens } from "@/lib/design/tokens";
import { getComponentLibrary } from "./component-library";
import { createSandboxWithFiles } from "./daytona";

const packageJson = `{
  "name": "storefront",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.6",
    "typescript": "^5.5.3",
    "vite": "^5.3.4"
  }
}
`;

const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Fixed dev server config — Daytona's createSandboxWithFiles() always
// starts this on port 3000 and reads the preview link from there. Don't
// change the port here without also changing daytona.ts.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
`;

function buildTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: ${tokensToTailwindExtend()},
  },
  plugins: [],
};
`;
}

const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

const tsconfigJson = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
`;

function buildIndexHtml(tokens: DesignTokens): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="${tokens.fonts.googleFontsUrl}" rel="stylesheet" />
    <title>Storefront</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

const mainTsx = `import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
`;

function buildIndexCss(tokens: DesignTokens): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

${tokensToCssVariables(tokens)}

body {
  font-family: var(--font-body);
}
`;
}

// App.tsx is the ONLY place routes get registered. New pages get added
// here as a <Route>, not by inventing a separate routing convention —
// this is one of the fixed contracts the AI is told about, so "add a
// pricing page" always means the same two-step edit (new file under
// src/pages/, one new <Route> line here) instead of a different pattern
// every time.
const appTsx = `import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Layout from "@/components/layout/Layout";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Layout>
  );
}
`;

const layoutTsx = `import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

// The one place page chrome (nav/footer) lives. Individual pages under
// src/pages/ should only contain page-specific content — this is what
// keeps "add a page" from also requiring "remember to re-add the header."
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
`;

const headerTsx = `export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <span className="text-lg font-semibold">Storefront</span>
      </div>
    </header>
  );
}
`;

const footerTsx = `export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
        {new Date().getFullYear()} Storefront
      </div>
    </footer>
  );
}
`;

const homePageTsx = `import Hero from "@/components/sections/Hero";

// Starting point only - the coding agent replaces this with real sections
// built from src/components/sections/ (see README) plus the merchant's
// actual copy and images, never left as this placeholder.
export default function Home() {
  return (
    <Hero
      heading="Welcome"
      subheading="This page is ready to be customized."
      ctaText="Get Started"
    />
  );
}
`;

// cn() (classnames helper) lives here on purpose, not re-implemented ad
// hoc per component — one canonical util file the model is told to use
// and extend, same reasoning as the routing contract above.
const utilsTs = `type ClassValue = string | number | boolean | undefined | null;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
`;

const gitignore = `node_modules
dist
.env
`;

const readme = `# Storefront

Generated project. Fixed structure — do not restructure or rename these
top-level folders; add to them instead:

- \`src/pages/\` — one file per route. Register new routes in \`src/App.tsx\`.
- \`src/components/sections/\` — the pre-built section vocabulary (Hero,
  FeatureGrid, Testimonials, CtaSection, FaqAccordion). Reach for these
  FIRST when building a page — they're already responsive and use the
  site's design tokens correctly. Only write a custom section component
  when nothing here fits.
- \`src/components/layout/\` — page chrome (Header, Footer, Layout) — edit
  these to change nav/footer everywhere at once, don't duplicate them
  into individual pages.
- \`src/lib/\` — non-UI logic, helpers, utilities (e.g. \`cn()\` in \`utils.ts\`).
- \`src/styles/\` — global/shared CSS beyond \`src/index.css\` (Tailwind
  entrypoint), if a page needs something Tailwind utilities don't cover.

## Design tokens — use these, don't invent your own colors/fonts

This site's color palette and typography are fixed CSS variables (see
\`src/index.css\`), wired into Tailwind (see \`tailwind.config.js\`) as:
\`bg-primary\`, \`text-primary-foreground\`, \`bg-secondary\`, \`bg-accent\`,
\`bg-background\`, \`text-foreground\`, \`bg-muted\`, \`border-border\`,
\`font-heading\`, \`font-body\`. Always use these classes instead of raw hex
codes or arbitrary Tailwind color names (\`bg-blue-500\` etc.) — that's
what keeps every page on a generated site visually consistent with each
other.

Dev server is fixed on port 3000 (see \`vite.config.ts\`) — Daytona's
preview link depends on this.
`;

/**
 * Returns the fixed starter file set for a new AI-generated storefront
 * project. Every new sandbox seeds from exactly this — nothing here
 * should vary per-generation except the design tokens (colors/fonts),
 * which are deterministically derived from businessType + seed (pass the
 * siteId) so the same site always gets the same visual identity even
 * across regenerations, while different sites still get real variety.
 */
export function getStandardScaffold(businessType: string, seed: string): Record<string, string> {
  const tokens = getDesignTokens(businessType, seed);
  return {
    "package.json": packageJson,
    "vite.config.ts": viteConfig,
    "tailwind.config.js": buildTailwindConfig(),
    "postcss.config.js": postcssConfig,
    "tsconfig.json": tsconfigJson,
    "index.html": buildIndexHtml(tokens),
    ".gitignore": gitignore,
    "README.md": readme,
    "src/main.tsx": mainTsx,
    "src/App.tsx": appTsx,
    "src/index.css": buildIndexCss(tokens),
    "src/lib/utils.ts": utilsTs,
    "src/components/layout/Layout.tsx": layoutTsx,
    "src/components/layout/Header.tsx": headerTsx,
    "src/components/layout/Footer.tsx": footerTsx,
    "src/pages/Home.tsx": homePageTsx,
    ...getComponentLibrary(),
  };
}

/** Top-level paths the scaffold owns — used to warn/flag if generated
 * output tries to restructure rather than extend them. Component-library
 * files are deliberately NOT included here: the agent is expected to
 * edit/extend those (e.g. tweak Hero's markup for a specific site), just
 * not the core architecture files (App.tsx routing, Layout.tsx, config). */
export const SCAFFOLD_OWNED_PATHS = new Set([
  "package.json", "vite.config.ts", "tailwind.config.js", "postcss.config.js",
  "tsconfig.json", "index.html", "src/main.tsx", "src/App.tsx", "src/index.css", "src/lib/utils.ts",
  "src/components/layout/Layout.tsx", "src/components/layout/Header.tsx", "src/components/layout/Footer.tsx",
]);

/**
 * Convenience entry point for whatever kicks off a brand-new AI site
 * generation: builds the file map (scaffold + tokens + component
 * library) and creates the sandbox in one call. Use createSandboxWithFiles()
 * directly instead when editing/resuming an EXISTING project - this is
 * only for the first-ever creation of a project.
 */
export async function createProjectSandbox(siteId: string, businessType: string) {
  return createSandboxWithFiles(getStandardScaffold(businessType, siteId));
}
