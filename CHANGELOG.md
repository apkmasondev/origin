# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-07-31

### Changed

- **Favicon**: Added a clean serif monogram **"O"** vector favicon (`public/favicon.svg`) with relative head links for GitHub Pages subpath compatibility.
- **Opening composition**: Reframed the title around the real point of light so the film remains the visual anchor. Lowered `.intro-eyebrow` (`EVERYTHING BEGINS`) closer to `FROM A POINT` title. Fixed mobile text overlap where `.intro-point-word` overlapped `FROM` due to invalid negative offset, and scaled mobile font sizes for clean spacing around the central ring.
- **Third movement**: Added the hummingbird-to-cosmos film in GOP 1 variants for desktop and mobile.
- **Repository cleanup**: Removed unused `.openai/`, `build/`, and `worker/` hosting boilerplate folders, simplifying `vite.config.ts` to a clean Vite setup.
- **GitHub Pages Deployment**: Added `scripts/export.mjs` static HTML generator and automated `.github/workflows/deploy.yml` workflow for automatic GitHub Pages deployment. Fixed video and poster paths to use relative URLs so media loads under GitHub Pages subpaths (`/origin/`).
