import type { QueryParams } from '@sanity/client';
import { client } from './sanity';

export async function loadQuery<QueryResponse>({
  query,
  params,
}: {
  query: string;
  params?: QueryParams;
}) {
  const { result } = await client.fetch<QueryResponse>(query, params ?? {}, {
    filterResponse: false,
  });
  return {
    data: result,
  };
}
