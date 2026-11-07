import { loadRuntimeConfig } from './runtimeConfig';

describe('loadRuntimeConfig', () => {
  it('returns missing error when env is not provided', () => {
    const result = loadRuntimeConfig({});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('CONFIG_MISSING');
      expect(result.error.field).toBe('EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL');
    }
  });

  it('returns invalid URL when protocol is not http(s)', () => {
    const result = loadRuntimeConfig({
      EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL: 'ftp://localhost:3000',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('CONFIG_INVALID_URL');
    }
  });

  it('returns normalized config for valid URL', () => {
    const result = loadRuntimeConfig({
      EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL: 'https://kavinschool.com/',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.apiBaseUrl).toBe('https://kavinschool.com');
    }
  });
});
