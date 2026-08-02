import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: handler } = await import(workerUrl.href);

  const fetch = typeof handler === "function"
    ? handler
    : handler.fetch.bind(handler);

  return fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the ORIGIN experience and its metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>ORIGIN — The Cycle of Becoming<\/title>/i);
  assert.match(html, /EVERYTHING BEGINS/);
  assert.match(html, /aria-label="From a point"/i);
  assert.match(html, />FROM<\/span>/);
  assert.match(html, />A POINT<\/span>/);
  assert.match(html, /LIFE REMEMBERS/);
  assert.match(html, /NOT AN END/);
  assert.match(html, /A RETURN/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("keeps the cinematic implementation and supplied media intact", async () => {
  const [component, css, packageJson] = await Promise.all([
    readFile(new URL("../app/OriginExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.equal((component.match(/<video/g) ?? []).length, 3);
  assert.match(component, /scene-01-point-explosion-1080p-gop1\.mp4/);
  assert.match(component, /scene-02-hummingbird-1080p-gop1\.mp4/);
  assert.match(component, /scene-03-hummingbird-cosmos-1080p-gop1\.mp4/);
  assert.match(component, /scene-03-hummingbird-cosmos-720p-gop1\.mp4/);
  assert.match(component, /smoothstep/);
  assert.match(component, /SCROLL_SMOOTHING_MS = 110/);
  assert.match(component, /FRAME_DURATION = 1 \/ 24/);
  assert.match(component, /MAXIMUM_FRAME_STEP/);
  assert.match(component, /video\.seeking/);
  assert.doesNotMatch(component, /<canvas|drawImage|globalAlpha/);
  assert.match(css, /\.origin-video/);
  assert.match(css, /object-fit:\s*cover/);
  assert.match(css, /will-change:\s*opacity/);
  assert.match(css, /height:\s*900svh/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/assets/video/scene-01-point-explosion-1080p-gop1.mp4", import.meta.url)),
    access(new URL("../public/assets/video/scene-02-hummingbird-1080p-gop1.mp4", import.meta.url)),
    access(new URL("../public/assets/video/scene-03-hummingbird-cosmos-1080p-gop1.mp4", import.meta.url)),
    access(new URL("../public/assets/video/scene-03-hummingbird-cosmos-720p-gop1.mp4", import.meta.url)),
    access(new URL("../public/assets/posters/poster-start.webp", import.meta.url)),
    access(new URL("../public/assets/posters/poster-final-hummingbird.webp", import.meta.url)),
    access(new URL("../public/assets/posters/poster-final-cosmos.webp", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);

  await assert.rejects(access(new URL("app/_sites-preview", root)));
});
