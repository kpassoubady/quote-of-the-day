import { useEffect, useState } from 'react';

import { FullScreenLoader } from '../components/FullScreenLoader';
import { loadRuntimeConfig } from '../config/runtimeConfig';
import type { BootstrapState } from '../config/types';
import { ConfigErrorScreen } from '../screens/ConfigErrorScreen';
import { RootNavigator } from './navigation/RootNavigator';

export function AppRoot() {
  const [state, setState] = useState<BootstrapState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      if (!isMounted) {
        return;
      }

      const result = loadRuntimeConfig();

      if (result.ok) {
        setState({ status: 'ready', config: result.config });
        return;
      }

      setState({ status: 'config_error', error: result.error });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (state.status === 'loading') {
    return <FullScreenLoader />;
  }

  if (state.status === 'config_error') {
    return <ConfigErrorScreen error={state.error} />;
  }

  return <RootNavigator />;
}
