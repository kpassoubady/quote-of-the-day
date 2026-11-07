import { act, create } from 'react-test-renderer';

import { AppRoot } from './AppRoot';
import { textFromTree } from '../testUtils';
import * as runtimeConfig from '../config/runtimeConfig';

jest.mock('../config/runtimeConfig');

const mockedLoadRuntimeConfig = runtimeConfig.loadRuntimeConfig as jest.MockedFunction<typeof runtimeConfig.loadRuntimeConfig>;

describe('AppRoot', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows loader while bootstrapping', () => {
    mockedLoadRuntimeConfig.mockReturnValue({
      ok: true,
      config: { apiBaseUrl: 'http://localhost:3000' },
    });

    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(<AppRoot />);
    });

    expect(tree!.root.findByProps({ testID: 'global-loader' })).toBeTruthy();

    act(() => {
      tree!.unmount();
    });
  });

  it('renders root navigator when config is valid', async () => {
    mockedLoadRuntimeConfig.mockReturnValue({
      ok: true,
      config: { apiBaseUrl: 'http://localhost:3000' },
    });

    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(<AppRoot />);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(tree!.root.findByProps({ testID: 'home-screen' })).toBeTruthy();
    expect(textFromTree(tree!.toJSON())).toContain('Home');

    act(() => {
      tree!.unmount();
    });
  });

  it('renders config error screen when config is invalid', async () => {
    mockedLoadRuntimeConfig.mockReturnValue({
      ok: false,
      error: {
        code: 'CONFIG_INVALID_URL',
        field: 'EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL',
        message: 'Invalid API base URL.',
        hint: 'Set a valid URL.',
      },
    });

    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(<AppRoot />);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(textFromTree(tree!.toJSON())).toContain('Configuration error');
    act(() => {
      tree!.unmount();
    });
  });
});
