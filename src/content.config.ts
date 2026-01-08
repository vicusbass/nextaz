import { defineCollection, z } from 'astro:content';

const wines = defineCollection({
  type: 'data',
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
