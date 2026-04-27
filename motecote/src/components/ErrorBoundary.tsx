import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="text-5xl">⚠️</div>
          <h2 className="font-heading text-2xl text-accent-red">Beklenmedik Bir Hata Oluştu</h2>
          <p className="max-w-md text-sm text-text-secondary">
            {this.state.error?.message || 'Bilinmeyen hata'}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-2 rounded-xl bg-accent-red/15 px-6 py-2.5 text-sm font-semibold text-accent-red transition-colors hover:bg-accent-red/25"
          >
            Tekrar Dene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
