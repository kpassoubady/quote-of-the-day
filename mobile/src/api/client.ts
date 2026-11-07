import type { RuntimeConfig } from '../config/types';

export const RANDOM_QUOTE_ENDPOINT = '/api/quotes/random';

export interface ApiClient {
  readonly apiBaseUrl: string;
  buildUrl: (path: string) => string;
  randomQuotePath: string;
}

export function createApiClient(config: RuntimeConfig): ApiClient {
  return {
    apiBaseUrl: config.apiBaseUrl,
    randomQuotePath: RANDOM_QUOTE_ENDPOINT,
    buildUrl(path: string) {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      return `${config.apiBaseUrl}${normalizedPath}`;
    },
  };
}
