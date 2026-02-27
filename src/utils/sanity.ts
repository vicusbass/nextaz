import { createClient } from '@sanity/client';
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';

const projectId = '5fmpwxu0';
const dataset = 'production';

export const client = createClient({
  projectId,
  dataset,
  useCdn: false,
  apiVersion: '2024-01-01',
});

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource | null | undefined) {
  if (!source || !builder) {
    return null;
  }
  try {
    return builder.image(source);
  } catch {
    return null;
  }
}
