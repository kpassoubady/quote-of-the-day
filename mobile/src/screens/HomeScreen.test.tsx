import { act, create } from 'react-test-renderer';

import { HomeScreen } from './HomeScreen';
import { textFromTree } from '../testUtils';

describe('HomeScreen', () => {
  it('renders placeholder home shell text', () => {
    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(<HomeScreen />);
    });

    expect(tree!.root.findByProps({ testID: 'home-screen' })).toBeTruthy();
    expect(textFromTree(tree!.toJSON())).toContain('Home');

    act(() => {
      tree!.unmount();
    });
  });
});
