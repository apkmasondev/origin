# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-07-31

### Changed

- **Favicon**: Added a clean serif monogram **"O"** vector favicon (`public/favicon.svg`) with relative head links for GitHub Pages subpath compatibility.
- **Opening composition**: Reframed the title around the real point of light so the film remains the visual anchor. Lowered `.intro-eyebrow` (`EVERYTHING BEGINS`) closer to `FROM A POINT` title. Fixed mobile text overlap where `.intro-point-word` overlapped `FROM` due to invalid negative offset, and scaled mobile font sizes for clean spacing around the central ring.
- **Third movement**: Added the hummingbird-to-cosmos film in GOP 1 variants for desktop and mobile.
- **Repository cleanup**: Removed unused `.openai/`, `build/`, and `worker/` hosting boilerplate folders, simplifying `vite.config.ts` to a clean Vite setup.
- **Mobile Viewport Optimization**: Replaced fixed `100svh` with progressive `height: 100vh; height: 100dvh;` on `.origin-scene` in `globals.css` to eliminate the bottom black gap when mobile URL bars auto-collapse on Android/iOS.
- **Hardware-Adaptive Video Scrubbing**: Updated `advanceVideo` in `OriginExperience.tsx` with dynamic scroll-velocity frame step scaling (`speedMultiplier`), preventing decoder bottleneck seeking loops during fast user scrolling.
