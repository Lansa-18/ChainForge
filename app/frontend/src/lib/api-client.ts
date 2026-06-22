import createClient from 'openapi-fetch';
import type { paths } from './generated/api';
import { fetchClient } from './mock-api/client';
import { apiUrl } from './env';
import { withTimeoutFetch } from './fetch-timeout';

/**
 * Typed API client for the ChainForge backend.
 *
 * - Types are generated from openapi.json via `pnpm generate:api`.
 * - Requests are routed through fetchClient so mock interception
 *   (NEXT_PUBLIC_USE_MOCKS=true) works transparently.
 * - Auth: the backend uses x-api-key headers. If a default key is needed,
 *   add `headers: { 'x-api-key': '...' }` to the createClient options.
 */
export const apiClient = createClient<paths>({
  baseUrl: apiUrl,
  fetch: withTimeoutFetch(fetchClient as typeof fetch) as typeof fetch,
});
