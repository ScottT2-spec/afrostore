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

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

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

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Storefront</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

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

const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

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

const homePageTsx = `export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold">Welcome</h1>
      <p className="mt-2 text-gray-600">This page is ready to be customized.</p>
    </div>
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
- \`src/components/\` — shared/reusable UI. \`src/components/layout/\` holds
  page chrome (Header, Footer, Layout) — edit these to change nav/footer
  everywhere at once, don't duplicate them into individual pages.
- \`src/lib/\` — non-UI logic, helpers, utilities (e.g. \`cn()\` in \`utils.ts\`).
- \`src/styles/\` — global/shared CSS beyond \`src/index.css\` (Tailwind
  entrypoint), if a page needs something Tailwind utilities don't cover.

Dev server is fixed on port 3000 (see \`vite.config.ts\`) — Daytona's
preview link depends on this.
`;

/**
 * Returns the fixed starter file set for a new AI-generated storefront
 * project. Every new sandbox seeds from exactly this — nothing here
 * should vary per-generation; only files layered on top of it (new pages,
 * new components, edits to App.tsx's route list) should differ.
 */
export function getStandardScaffold(): Record<string, string> {
  return {
    "package.json": packageJson,
    "vite.config.ts": viteConfig,
    "tailwind.config.js": tailwindConfig,
    "postcss.config.js": postcssConfig,
    "tsconfig.json": tsconfigJson,
    "index.html": indexHtml,
    ".gitignore": gitignore,
    "README.md": readme,
    "src/main.tsx": mainTsx,
    "src/App.tsx": appTsx,
    "src/index.css": indexCss,
    "src/lib/utils.ts": utilsTs,
    "src/components/layout/Layout.tsx": layoutTsx,
    "src/components/layout/Header.tsx": headerTsx,
    "src/components/layout/Footer.tsx": footerTsx,
    "src/pages/Home.tsx": homePageTsx,
  };
}

/** Top-level paths the scaffold owns — used to warn/flag if generated
 * output tries to restructure rather than extend them. */
export const SCAFFOLD_OWNED_PATHS = new Set(Object.keys(getStandardScaffold()));
