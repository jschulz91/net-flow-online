import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 bg-red-50 border border-red-300 rounded text-xs text-red-800 overflow-auto max-h-screen">
          <strong>Fehler:</strong> {this.state.error.message}
          <pre className="mt-2 whitespace-pre-wrap text-[10px] text-red-600">
            {this.state.error.stack}
          </pre>
          <button
            className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-xs"
            onClick={() => this.setState({ error: null })}
          >
            Zurücksetzen
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
