import { act, create } from 'react-test-renderer';

import App from '../../App';
import { createApiClient } from '../../src/api/client';
import { AppErrorBoundary } from '../../src/app/AppErrorBoundary';
import { loadRuntimeConfig } from '../../src/config/runtimeConfig';
import { textFromTree } from '../../src/testUtils';

function CrashScreen() {
  throw new Error('screen crashed');
}

describe('Spec 01 acceptance: app shell and environment setup', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('AC1/AC4/AC5: launches to app shell, shows loader, then opens Home route', async () => {
    jest.spyOn(require('../../src/config/runtimeConfig'), 'loadRuntimeConfig').mockReturnValue({
      ok: true,
      config: { apiBaseUrl: 'http://localhost:3000' },
    });

    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(<App />);
    });

    expect(tree!.root.findByProps({ testID: 'global-loader' })).toBeTruthy();

    await act(async () => {
      await Promise.resolve();
    });

    expect(tree!.root.findByProps({ testID: 'home-screen' })).toBeTruthy();
    expect(textFromTree(tree!.toJSON())).toContain('Home');
    expect(() => tree!.root.findByProps({ testID: 'global-loader' })).toThrow();

    act(() => {
      tree!.unmount();
    });
  });

  it('AC2: uses dev and prod API base URL from env without changing screen behavior', () => {
    const dev = loadRuntimeConfig({ EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL: 'http://localhost:3000' });
    const prod = loadRuntimeConfig({ EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL: 'https://kavinschool.com' });

    expect(dev.ok).toBe(true);
    expect(prod.ok).toBe(true);

    if (dev.ok && prod.ok) {
      const devClient = createApiClient(dev.config);
      const prodClient = createApiClient(prod.config);

      expect(devClient.buildUrl('/api/quotes/random')).toBe('http://localhost:3000/api/quotes/random');
      expect(prodClient.buildUrl('/api/quotes/random')).toBe('https://kavinschool.com/api/quotes/random');
    }
  });

  it('AC3: shows app-level fallback UI when a screen throws runtime error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(
        <AppErrorBoundary>
          <CrashScreen />
        </AppErrorBoundary>,
      );
    });

    expect(tree!.root.findByProps({ testID: 'app-fallback-error' })).toBeTruthy();

    act(() => {
      tree!.unmount();
    });

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('AC5: opens to Home route on restart as well as cold start', async () => {
    jest.spyOn(require('../../src/config/runtimeConfig'), 'loadRuntimeConfig').mockReturnValue({
      ok: true,
      config: { apiBaseUrl: 'http://localhost:3000' },
    });

    const mountAndAssertHome = async () => {
      let tree: ReturnType<typeof create>;

      act(() => {
        tree = create(<App />);
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(tree!.root.findByProps({ testID: 'home-screen' })).toBeTruthy();

      act(() => {
        tree!.unmount();
      });
    };

    await mountAndAssertHome();
    await mountAndAssertHome();
  });

  it('AC6: shows clear config error when API env is missing', async () => {
    jest.spyOn(require('../../src/config/runtimeConfig'), 'loadRuntimeConfig').mockReturnValue({
      ok: false,
      error: {
        code: 'CONFIG_MISSING',
        field: 'EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL',
        message: 'Missing API base URL.',
        hint: 'Set EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL in mobile/.env and restart Expo.',
      },
    });

    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(<App />);
    });

    await act(async () => {
      await Promise.resolve();
    });

    const treeText = textFromTree(tree!.toJSON());
    expect(tree!.root.findByProps({ testID: 'config-error-screen' })).toBeTruthy();
    expect(treeText).toContain('Configuration error');
    expect(treeText).toContain('EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL');

    act(() => {
      tree!.unmount();
    });
  });

  it('AC6: shows clear config error when API env URL is invalid', async () => {
    jest.spyOn(require('../../src/config/runtimeConfig'), 'loadRuntimeConfig').mockReturnValue({
      ok: false,
      error: {
        code: 'CONFIG_INVALID_URL',
        field: 'EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL',
        message: 'Invalid API base URL.',
        hint: 'Use an absolute http(s) URL for EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL and restart Expo.',
      },
    });

    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(<App />);
    });

    await act(async () => {
      await Promise.resolve();
    });

    const treeText = textFromTree(tree!.toJSON());
    expect(tree!.root.findByProps({ testID: 'config-error-screen' })).toBeTruthy();
    expect(treeText).toContain('Invalid API base URL.');
    expect(treeText).toContain('EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL');

    act(() => {
      tree!.unmount();
    });
  });
});
