# CLAUDE.md — amribrahim.work

## What this project is
Personal website for Amr Ibrahim (Transformation Specialist in IT consulting, based in Germany), served at https://amribrahim.work.
The owner has no development background: explain what you are doing in plain language, ask before anything destructive, and keep the setup as simple as possible.

## Stack (keep it simple)
- Static site built with **Astro**. No backend, no database, no CMS.
- Plain CSS (one global stylesheet + scoped component styles). No CSS framework unless the owner asks.
- Content lives in Markdown files under `src/content/pages/`, one folder per language (`en/`, `de/`). Pages are generated from these files.
- Content Markdown comes from a separate Claude Project and uses this front matter:
  ```
  ---
  title: "Page title"
  description: "Meta description, max 155 characters"
  lang: en
  slug: about
  ---
  ```
  Define this as an Astro content collection schema so a missing field fails the build.
- Hosting: **GitHub Pages**, deployed automatically by a GitHub Actions workflow on every push to `main`. Custom domain via `public/CNAME` containing `amribrahim.work`.

## Site structure
Home, About, Experience, Contact, Impressum, Datenschutzerklärung (privacy policy).
English is the default at `/`; German at `/de/` with a language switcher in the left column / mobile header (see brief section 8). If German isn't ready yet, build the structure but hide the switcher.

No portfolio pages for now, but keep the content setup easy to extend later.

## Design rules
- **Source of truth: section 8 ("Look and feel: Editorial transformation") of `website-brief.md`.** Read it before any design or layout work. It defines the layout (fixed left column on desktop, compact header on mobile, page navigation with section markers, view transitions, numbered headings), the exact colours (light and dark), fonts (Fraunces + Inter via @fontsource, Latin only), the "one story" line motif, the horizontal Experience timeline, motion and performance targets. If this file and the brief disagree, the brief wins; ask the owner if unsure.
- Mobile first. Motion is CSS-first and always respects `prefers-reduced-motion`. No animation libraries.
- Check all text/background colour pairs for WCAG AA contrast (light and dark mode).
- Contact = LinkedIn + email only; no CV download.
- Accessible: semantic HTML, alt text, sufficient contrast, keyboard navigation.
- Fast: no heavy JavaScript, optimised images, system or self-hosted fonts (no Google Fonts loaded from Google's servers — GDPR).
- No cookies, no trackers. If analytics is ever added, use a cookie-free option and update the privacy page.

## SEO basics
Per-page `<title>` and meta description from front matter, Open Graph tags, `sitemap.xml`, `robots.txt`, `hreflang` links between language versions.

## Commands
- `npm install` — install dependencies
- `npm run dev` — local preview at http://localhost:4321
- `npm run build` — production build into `dist/`

## Working rules
- Before big changes, say the plan in 3–5 bullets and wait for approval.
- After changes, run `npm run build` and fix errors before saying it's done.
- Commit in small steps with clear messages; never force-push; never commit secrets.
- Never invent personal content (experience, clients, figures). Use clearly marked placeholders and tell the owner.
- DNS: never suggest changing MX or email-related DNS records when setting up the domain.
