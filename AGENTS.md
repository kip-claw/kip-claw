# AGENTS.md - kip-claw

This repository powers Kip's public site at https://kip.computer.

## Project Shape

- Framework: Svelte 5 + SvelteKit.
- Blog preprocessor: mdsvex (markdown posts with YAML frontmatter).
- Package manager: npm.
- Static hosting: GitHub Pages.
- CI workflow: `.github/workflows/ci.yml` (type check + lint on push and PRs).
- Deployment workflow: `.github/workflows/pages.yml` (build, lighthouse, deploy on push).
- Dependabot: `.github/dependabot.yml` (weekly npm + GitHub Actions updates).
- Custom domain: `kip.computer`, configured by `CNAME`.
- Static adapter: `@sveltejs/adapter-static`, configured in `svelte.config.js`.
- Static output directory: `build/`.

Do not edit generated output in `build/` or `.svelte-kit/`. Make changes in `src/` and `static/`, then rebuild.

## Important Commands

- Install dependencies: `npm ci`
- Run local dev server: `npm run dev`
- Type/Svelte check: `npm run check`
- Format check: `npm run lint`
- Format files: `npm run format`
- Production build: `npm run build`
- Lighthouse quality audit: `npm run lighthouse`
- Preview production build: `npm run preview`

Before committing site changes, run:

```bash
npm run check
npm run lint
npm run build
npm run lighthouse
```

## Routing And Content

- Homepage: `src/routes/+page.svelte`
- Apps index: `src/routes/apps/+page.svelte`
- App pages: `src/routes/apps/humidor/`, `src/routes/apps/nyc/`, `src/routes/apps/runs/`
- Blog index: `src/routes/blog/+page.svelte`
- Blog posts: `src/routes/blog/<slug>/+page.md` (mdsvex markdown with YAML frontmatter)
- Stats page: `src/routes/stats/+page.svelte`
- Soul page: `src/routes/soul/+page.svelte`
- Sitemap: `src/routes/sitemap.xml/+server.ts`
- Shared header: `src/lib/SiteHeader.svelte`
- Shared footer: `src/lib/SiteFooter.svelte`
- Shared page metadata: `src/lib/Seo.svelte`
- Shared page header: `src/lib/PageHeader.svelte`
- Shared blog post layout: `src/lib/BlogPostLayout.svelte` (used by mdsvex for all blog posts)
- Homepage hero: `src/lib/HomeHero.svelte`
- Blog list module: `src/lib/PostList.svelte`
- Article layout wrapper: `src/lib/ArticlePage.svelte`
- Article lead art: `src/lib/LeadArt.svelte`
- Blog post metadata: `src/lib/posts.ts`
- Speed test data: `src/lib/speedTests.ts`
- Speed chart geometry: `src/lib/speedChart.ts`, generated with D3 during prerender.
- Global styles: `src/styles.css`
- Svelte app shell and global head links: `src/app.html`
- Page content for non-blog routes: `copy.yaml` files within each route directory.

### Blog Posts

Blog posts use mdsvex. Each post is a single `+page.md` file with YAML frontmatter (title, deck, description, url, slug, leadArt) and a markdown body. The shared layout at `src/lib/BlogPostLayout.svelte` renders the SEO tags, header, lead art, and content slot.

To add a new post:

1. Create `src/routes/blog/<slug>/+page.md` with frontmatter and markdown body.
2. Register the post in `src/lib/posts.ts`.
3. Add the URL to `lighthouserc.cjs`.
4. Place lead art in `static/images/` (`.jpg` plus `-1200.webp` and `-760.webp` variants).

Routes are prerendered by `src/routes/+layout.ts`:

```ts
export const prerender = true;
export const trailingSlash = 'always';
```

Keep `trailingSlash = 'always'`; GitHub Pages serves directory indexes more reliably than extension-style URLs.

## Assets

Project assets live in `static/` and are copied into the built site.

- Avatar/favicon/social image base: `static/avatars/kip.jpg`
- Blog lead art images: `static/images/` (`.jpg` originals plus `.webp` variants)
- Nightly data exports: `static/data/` (`humidor.json`, `nycList.json`, `runs.json`, `speedTests.json`)
- Sitemap: `static/sitemap.xml`
- NYC map style: `static/nyc-map-style.json`
- GitHub Pages custom domain: `CNAME`
- GitHub Pages Jekyll bypass: `.nojekyll`

When adding a new public asset, place it under `static/` and reference it from the site with an absolute path like `/images/example.jpg`.

## Design Notes

- Keep the visual tone restrained, editorial, and personal.
- Use the `:root` design tokens in `src/styles.css` for fonts, colors, spacing, line heights, layout widths, radii, shadows, and other site fundamentals.
- Prefer localized `<style>` blocks in shared Svelte components for component-specific layout and presentation.
- The homepage H1 intentionally keeps `Ben Welsh's` together with a `.nowrap` span to avoid an awkward name widow.
- The footer is shared across pages, uses the lobster prefix, links Ben to `https://palewi.re`, and should stay at the bottom of short viewports.
- The article detail page should keep common news-article elements: date, headline, deck, byline, lead art, caption, and body copy.
- Do not reintroduce the old homepage operating-principles section unless Ben asks for it.

## Deployment

Pushing to `main` triggers GitHub Pages:

1. `npm ci`
2. `npm run build`
3. `npm run lighthouse`
4. Upload `build/`
5. Deploy Pages

After pushing, verify the workflow and spot-check:

- https://kip.computer/
- https://kip.computer/apps/
- https://kip.computer/blog/
- https://kip.computer/stats/
- https://kip.computer/soul/

## Git Hygiene

- The repo may receive edits from GitHub's web UI while you are working. If push is rejected, fetch first, inspect the remote diff, and rebase carefully.
- Do not overwrite Ben's remote edits.
- Commit focused changes with clear messages.
