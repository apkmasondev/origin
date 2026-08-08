# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-08-08

### Fixed

- **Posters never loaded in production**: `url("assets/posters/…")` in `globals.css` was resolved against the emitted `/assets/index-*.css`, requesting `/assets/assets/posters/…` (404). The loader backdrop was blank and, because `prefers-reduced-motion` hides the videos, reduced-motion visitors saw a fully black page. Poster URLs are now applied as inline styles from `OriginExperience.tsx`, so they resolve against the document like the video sources already did.
- **Wasted bandwidth in reduced-motion mode**: the `<video>` elements kept `src` and `preload="auto"` while being `display: none`, downloading roughly 70 MB of unused footage. Sources are now withheld when reduced motion is active.
- **Broken social link previews**: `og:image` / `twitter:image` were emitted as the relative value `og.png`, which crawlers cannot resolve. `NEXT_PUBLIC_SITE_URL` — previously documented but unused — now produces absolute `og:image` and `og:url` values, falling back to the relative path when unset.
- **`prefers-reduced-motion` changes were ignored**: the media query was read once on mount with no `change` listener, so toggling the OS setting left the experience in the wrong mode.
- **Static export could publish a broken site**: `scripts/export.mjs` ignored the response status, so an SSR failure would be written to `index.html` and deployed as a success. It now rejects non-OK responses and incomplete documents, passes the worker `env`/`ctx` like the test harness does, and clears `out/` first so hashed assets from earlier builds are no longer published alongside the current ones.
- **Accessibility**: replaced Polish `aria-label`s on a `lang="en"` document with English equivalents; dropped the `aria-label` from the decorative `.progress-rail`, where it was ignored for lack of a role; hid the per-frame loader counter from assistive tech and announced the loader caption via `role="status"`.

### Changed

- **Incomplete lockfile**: `package-lock.json` contained dependency edges with no matching entry — `@img/sharp-wasm32` required `@emnapi/runtime@^1.11.0`, and `@rolldown/binding-wasm32-wasi` required `@emnapi/core@2.0.0-alpha.3`. Neither package is platform-restricted, so `npm ci` failed outright on Linux; the workflow's `npm ci || npm install` fallback had been hiding it. The lockfile was re-resolved from a clean tree, which supplies the missing packages and moves rolldown to 1.2.3, where the wasm32 binding no longer exists. All platform binaries are retained.
- **CI**: the Pages workflow now runs `npm ci` (instead of masking lockfile drift with `npm ci || npm install`), enables npm caching, runs on Node 24 to match the toolchain the lockfile is resolved with, and gates deployment on lint and tests. Build, test and export share a single build via the new `test:rendered` and `export:static` scripts.
- **Docs**: corrected the README, which described a `<canvas>` crossfade that does not exist, pointed at a non-existent `app/icon.svg`, and claimed the project is local-only despite the GitHub Pages workflow. Added deployment and `NEXT_PUBLIC_SITE_URL` setup notes.

## [Unreleased] - 2026-07-31

### Changed

- **Favicon**: Added a clean serif monogram **"O"** vector favicon (`public/favicon.svg`) with relative head links for GitHub Pages subpath compatibility.
- **Opening composition**: Reframed the title around the real point of light so the film remains the visual anchor. Lowered `.intro-eyebrow` (`EVERYTHING BEGINS`) closer to `FROM A POINT` title. Fixed mobile text overlap where `.intro-point-word` overlapped `FROM` due to invalid negative offset, and scaled mobile font sizes for clean spacing around the central ring.
- **Third movement**: Added the hummingbird-to-cosmos film in GOP 1 variants for desktop and mobile.
- **Repository cleanup**: Removed unused `.openai/`, `build/`, and `worker/` hosting boilerplate folders, simplifying `vite.config.ts` to a clean Vite setup.
- **Mobile Viewport Optimization**: Replaced fixed `100svh` with progressive `height: 100vh; height: 100dvh;` on `.origin-scene` in `globals.css` to eliminate the bottom black gap when mobile URL bars auto-collapse on Android/iOS.
- **Hardware-Adaptive Video Scrubbing**: Updated `advanceVideo` in `OriginExperience.tsx` with dynamic scroll-velocity frame step scaling (`speedMultiplier`), preventing decoder bottleneck seeking loops during fast user scrolling.
