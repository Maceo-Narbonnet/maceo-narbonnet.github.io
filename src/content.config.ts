import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    lang: z.enum(['fr', 'en']),
    key: z.string(),
    order: z.number(),
    kind: z.enum(['internship', 'project']),
    title: z.string(),
    tagline: z.string(),
    period: z.string(),
    context: z.string(),
    role: z.string().optional(),
    stack: z.array(z.string()),
    tags: z.array(z.string()),
    github: z.string().url().optional(),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    cover: z.string(),
    coverAlt: z.string(),
    coverFit: z.enum(['cover', 'contain']).default('cover'),
    results: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    featured: z.boolean().default(true),
  }),
});

export const collections = { projects };
