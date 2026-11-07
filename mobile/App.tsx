import { AppErrorBoundary } from './src/app/AppErrorBoundary';
import { AppRoot } from './src/app/AppRoot';

export default function App() {
  return (
    <AppErrorBoundary>
      <AppRoot />
    </AppErrorBoundary>
  );
}
