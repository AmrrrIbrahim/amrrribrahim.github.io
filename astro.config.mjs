// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { wrapSections } from './src/lib/rehype-wrap-sections.mjs';

// The site is served by GitHub Pages under the custom domain amribrahim.work
// (see public/CNAME). SITE_URL can be overridden with an environment variable.
const SITE_URL = process.env.SITE_URL || 'https://amribrahim.work';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    processor: unified({ rehypePlugins: [wrapSections] }),
  },
});
