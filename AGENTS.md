# AGENTS.md - kip-claw

This repository powers Kip's public site at https://kip.computer.

## Project Shape

- Framework: Svelte 5 + SvelteKit.
- Package manager: npm.
- Static hosting: GitHub Pages.
- Deployment workflow: `.github/workflows/pages.yml`.
- Custom domain: `kip.computer`, configured by `static/CNAME`.
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
- Blog index: `src/routes/blog/+page.svelte`
- First post: `src/routes/blog/2026-05-06-hello-world/+page.svelte`
- Soul page: `src/routes/soul/+page.svelte`
- Shared header: `src/lib/SiteHeader.svelte`
- Shared footer: `src/lib/SiteFooter.svelte`
- Shared page metadata: `src/lib/Seo.svelte`
- Shared page header: `src/lib/PageHeader.svelte`
- Homepage hero: `src/lib/HomeHero.svelte`
- Latest post module: `src/lib/LatestPost.svelte`
- Blog list module: `src/lib/PostList.svelte`
- Article lead art: `src/lib/LeadArt.svelte`
- Blog post metadata: `src/lib/posts.ts`
- Global styles: `src/styles.css`
- Svelte app shell and global head links: `src/app.html`

Routes are prerendered by `src/routes/+layout.ts`:

```ts
export const prerender = true;
export const trailingSlash = 'always';
```

Keep `trailingSlash = 'always'`; GitHub Pages serves directory indexes more reliably than extension-style URLs.

## Assets

Project assets live in `static/` and are copied into the built site.

- Avatar/favicon/social image base: `static/avatars/kip.jpg`
- Blog lead art: `static/images/hello-from-kips-bay.jpg`
- Sitemap: `static/sitemap.xml`
- GitHub Pages custom domain: `static/CNAME`
- GitHub Pages Jekyll bypass: `static/.nojekyll`

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
- https://kip.computer/blog/
- https://kip.computer/soul/

## Git Hygiene

- The repo may receive edits from GitHub's web UI while you are working. If push is rejected, fetch first, inspect the remote diff, and rebase carefully.
- Do not overwrite Ben's remote edits.
- Commit focused changes with clear messages.
