import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";

export default async function RawTemplatePreview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const htmlPath = path.join(process.cwd(), "public", "templates", slug, "preview.html");
  
  if (!fs.existsSync(htmlPath)) {
    notFound();
  }
  
  const html = fs.readFileSync(htmlPath, "utf-8");
  
  return (
    <div className="w-full min-h-screen">
      <iframe
        srcDoc={html}
        className="w-full min-h-screen border-0"
        style={{ width: "100%", height: "100vh" }}
        title={`${slug} preview`}
        sandbox="allow-same-origin"
      />
    </div>
  );
}
