import { mkdir, cp, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.resolve(root, "out");

async function exportStatic() {
  console.log("Generating static HTML for GitHub Pages...");
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("export", Date.now().toString());
  const { default: handler } = await import(workerUrl.href);

  const response = await handler(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    })
  );

  let html = await response.text();

  // Create output directory
  await mkdir(outDir, { recursive: true });

  // Copy public assets
  const publicDir = path.resolve(root, "public");
  await cp(publicDir, outDir, { recursive: true });

  // Copy client dist assets if exists
  const clientDist = path.resolve(root, "dist", "client");
  try {
    await cp(clientDist, outDir, { recursive: true });
  } catch {
    // optional
  }

  // Create .nojekyll for GitHub Pages
  await writeFile(path.resolve(outDir, ".nojekyll"), "");

  // Save index.html
  await writeFile(path.resolve(outDir, "index.html"), html, "utf8");

  console.log("Static export completed successfully in ./out!");
}

exportStatic().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
