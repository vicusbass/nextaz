import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const wines = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/wines' }),
  schema: z.object({
    order: z.number(),
    id: z.string(),
    image: z.string(),
    title: z.string(),
    description: z.string(),
    flavours: z.array(z.string()),
    organoleptic: z.array(z.string()),
    culinary: z.array(z.string()),
  }),
});

export const collections = { wines };
