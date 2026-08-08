import { mkdir, cp, rm, writeFile } from "node:fs/promises";
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

  // The build may emit either a bare fetch function or a worker-style object.
  const fetchHandler =
    typeof handler === "function" ? handler : handler.fetch.bind(handler);

  const response = await fetchHandler(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );

  // Without this an SSR failure would be written out as index.html and shipped
  // by CI as a successful deploy.
  if (!response.ok) {
    throw new Error(
      `Renderer returned ${response.status} ${response.statusText}`.trim(),
    );
  }

  const html = await response.text();
  if (!/<\/html>/i.test(html)) {
    throw new Error("Rendered output is not a complete HTML document");
  }

  // Start from a clean directory so hashed assets from earlier builds are not
  // published alongside the current ones.
  await rm(outDir, { recursive: true, force: true });
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
