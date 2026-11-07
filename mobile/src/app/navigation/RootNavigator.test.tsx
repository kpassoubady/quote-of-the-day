import { act, create } from 'react-test-renderer';

import { RootNavigator } from './RootNavigator';

describe('RootNavigator', () => {
  it('renders Home as the initial route', () => {
    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(<RootNavigator />);
    });

    expect(tree!.root.findByProps({ testID: 'home-screen' })).toBeTruthy();

    act(() => {
      tree!.unmount();
    });
  });
});
