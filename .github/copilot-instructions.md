# Project implementation guide

## Active architecture

- Astro 6 static site, Tailwind CSS 4 via `@tailwindcss/vite`, strict TypeScript.
- Active homepage: `src/pages/index.astro`, composed of reusable Astro sections.
- All project metadata, section titles, paper abstract, figures, metrics, video
  groups, resource links, and BibTeX are configured in `src/data/project.ts`.
- `src/layouts/Layout.astro` owns metadata, styles, and the single lightweight
  TypeScript interaction bundle from `src/scripts/interactions.ts`.
- `src/styles/site.css` is the academic page styling layer. `global.css` and
  older template components remain for compatibility.
- React remains installed for optional legacy components, but the new page
  contains no React client islands or third-party embedded players.

## Content and privacy

Do not invent authors, publication information, resource URLs, footage,
experiment metrics, or dataset attribution.
Research content must come only from the supplied SteerUMI manuscript.
The data-collection section reports the paper’s UMI setup and episode quotas,
not a separately specified dataset. Demo slots are restricted to the five
evaluated tasks; do not introduce extra household tasks or collection modalities.
Preserve the original research PNGs. Local assets only unless
explicitly requested otherwise. Do not push or publish without authorization.

## Assets and playback

- Source figures live in `src/assets/`; imported metadata enables Astro image
  optimization. `ProjectFigure.astro` links to the full original local image.
- Public media is configured as `videos/name.mp4`, `images/poster.jpg`, or
  `papers/paper.pdf`, relative to `public/`, with no repository prefix.
- Use `withBase()` from `src/lib/urls.ts` for all public media/resource paths.
- Undefined media renders labeled placeholders, not broken requests.
- `VideoGallery.astro` supports two/three columns and six-video 2×3 desktop grids.
- Synchronization is scoped to `sync: true` multi-view groups, not independent
  tasks; common time, pause, seek, rate, shortest-view loops, and drift correction
  are handled in `interactions.ts`. Playback is approximate browser synchronization.

## Commands and deployment

Recommended Node.js 24; minimum 22.12. `npm install`, `npm run dev`,
`npm run build` (check + build), `npm test` (checks dist after building), and
`npm run preview`. Set `ASTRO_TELEMETRY_DISABLED=1` for local checks.

`SITE_URL` and `BASE_PATH` control future deployment destinations. Test project
paths with `BASE_PATH=/REPOSITORY/` at both build and `npm test` time.
The Pages workflow is **manual only**, requires typing `PUBLISH`, and rejects
confidential pages or citation draft flags through
`REQUIRE_PUBLICATION_READY=1 npm test`. Pushes do not deploy.

See README.md for content replacement, media configuration, repository migration,
publication prerequisites, and template attribution. Do not remove attribution
or confuse a `noindex` tag with access control.
