import { createApiClient, RANDOM_QUOTE_ENDPOINT } from './client';

describe('createApiClient', () => {
  it('builds api urls from runtime config base url', () => {
    const client = createApiClient({ apiBaseUrl: 'http://localhost:3000' });

    expect(client.apiBaseUrl).toBe('http://localhost:3000');
    expect(client.randomQuotePath).toBe(RANDOM_QUOTE_ENDPOINT);
    expect(client.buildUrl('/health')).toBe('http://localhost:3000/health');
    expect(client.buildUrl('api/quotes/random')).toBe('http://localhost:3000/api/quotes/random');
  });
});
