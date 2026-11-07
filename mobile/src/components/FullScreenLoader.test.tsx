import { act, create } from 'react-test-renderer';

import { FullScreenLoader } from './FullScreenLoader';
import { textFromTree } from '../testUtils';

describe('FullScreenLoader', () => {
  it('renders the global loading indicator and label', () => {
    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(<FullScreenLoader />);
    });

    expect(tree!.root.findByProps({ testID: 'global-loader' })).toBeTruthy();
    expect(textFromTree(tree!.toJSON())).toContain('Loading app');

    act(() => {
      tree!.unmount();
    });
  });
});
