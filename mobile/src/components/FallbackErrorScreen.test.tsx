import { act, create } from 'react-test-renderer';

import { FallbackErrorScreen } from './FallbackErrorScreen';
import { textFromTree } from '../testUtils';

describe('FallbackErrorScreen', () => {
  it('renders app fallback messaging', () => {
    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(<FallbackErrorScreen />);
    });

    expect(tree!.root.findByProps({ testID: 'app-fallback-error' })).toBeTruthy();
    expect(textFromTree(tree!.toJSON())).toContain('Something went wrong');

    act(() => {
      tree!.unmount();
    });
  });
});
