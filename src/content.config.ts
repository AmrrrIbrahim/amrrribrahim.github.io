import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per page and language, e.g. src/content/pages/en/about.md.
// If any of these fields is missing or wrong, `npm run build` stops with an
// error, so a page can never go live without its title or description.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(155),
    lang: z.enum(['en', 'de']),
    slug: z.string(),
    // Optional: language of the page text when it differs from `lang`
    // (the Impressum is written in German on the English site).
    contentLang: z.enum(['en', 'de']).optional(),
  }),
});

export const collections = { pages };
