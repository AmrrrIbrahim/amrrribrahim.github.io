// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { wrapSections } from './src/lib/rehype-wrap-sections.mjs';

// The site lives on GitHub Pages at https://amrrribrahim.github.io until the
// owner decides to connect amribrahim.work. When that happens, change SITE_URL
// (or set the SITE_URL environment variable) and add public/CNAME.
const SITE_URL = process.env.SITE_URL || 'https://amrrribrahim.github.io';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    processor: unified({ rehypePlugins: [wrapSections] }),
  },
});
