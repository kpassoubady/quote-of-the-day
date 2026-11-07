import { act, create } from 'react-test-renderer';

import { AppErrorBoundary } from './AppErrorBoundary';
import { textFromTree } from '../testUtils';

function CrashComponent() {
  throw new Error('boom');
  return null;
}

describe('AppErrorBoundary', () => {
  it('renders fallback screen when child throws', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    let tree: ReturnType<typeof create>;

    act(() => {
      tree = create(
        <AppErrorBoundary>
          <CrashComponent />
        </AppErrorBoundary>,
      );
    });

    expect(textFromTree(tree!.toJSON())).toContain('Something went wrong');

    tree!.unmount();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
});
