import { act, create } from 'react-test-renderer';

import { ConfigErrorScreen } from './ConfigErrorScreen';
import { textFromTree } from '../testUtils';

describe('ConfigErrorScreen', () => {
  it('renders configuration error details', () => {
    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(
        <ConfigErrorScreen
          error={{
            code: 'CONFIG_MISSING',
            field: 'EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL',
            message: 'Missing API base URL.',
            hint: 'Set env and restart.',
          }}
        />,
      );
    });

    expect(tree!.root.findByProps({ testID: 'config-error-screen' })).toBeTruthy();
    expect(textFromTree(tree!.toJSON())).toContain('Configuration error');
    expect(textFromTree(tree!.toJSON())).toContain('EXPO_PUBLIC_REACT_NATIVE_API_BASE_URL');

    act(() => {
      tree!.unmount();
    });
  });
});
