export type ConfigField = 'EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL';

export interface RuntimeConfig {
  apiBaseUrl: string;
}

export interface ConfigError {
  code: 'CONFIG_MISSING' | 'CONFIG_INVALID_URL';
  field: ConfigField;
  message: string;
  hint: string;
}

export type BootstrapState =
  | { status: 'loading' }
  | { status: 'ready'; config: RuntimeConfig }
  | { status: 'config_error'; error: ConfigError };
