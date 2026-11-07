import type { ReactNode } from 'react';
import { Component } from 'react';

import { FallbackErrorScreen } from '../components/FallbackErrorScreen';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('Unhandled app error', error);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackErrorScreen />;
    }

    return this.props.children;
  }
}
