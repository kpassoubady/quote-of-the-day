import type { ConfigError, RuntimeConfig } from './types';

const API_BASE_URL_FIELD = 'EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL' as const;

export type RuntimeConfigResult =
  | { ok: true; config: RuntimeConfig }
  | { ok: false; error: ConfigError };

function buildMissingError(): ConfigError {
  return {
    code: 'CONFIG_MISSING',
    field: API_BASE_URL_FIELD,
    message: 'Missing API base URL.',
    hint: 'Set EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL in mobile/.env and restart Expo.',
  };
}

function buildInvalidUrlError(): ConfigError {
  return {
    code: 'CONFIG_INVALID_URL',
    field: API_BASE_URL_FIELD,
    message: 'Invalid API base URL.',
    hint: 'Use an absolute http(s) URL for EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL and restart Expo.',
  };
}

function normalizeApiBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

export type RuntimeEnv = Record<string, string | undefined>;

export function readApiBaseUrlFromEnv(env: RuntimeEnv = process.env): string | undefined {
  return env.EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL;
}

export function loadRuntimeConfig(env: RuntimeEnv = process.env): RuntimeConfigResult {
  const rawValue = readApiBaseUrlFromEnv(env)?.trim();

  if (!rawValue) {
    return { ok: false, error: buildMissingError() };
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawValue);
  } catch {
    return { ok: false, error: buildInvalidUrlError() };
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { ok: false, error: buildInvalidUrlError() };
  }

  return {
    ok: true,
    config: {
      apiBaseUrl: normalizeApiBaseUrl(parsedUrl.toString()),
    },
  };
}
