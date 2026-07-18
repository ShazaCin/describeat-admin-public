import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const message =
        this.state.error?.message || "An unexpected error occurred.";

      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          <h2 className="mb-2 text-xl font-semibold text-slate-200">
            Something went wrong
          </h2>
          <p className="mb-6 max-w-md text-sm text-slate-400">
            {message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReload}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-600 focus:ring-2 focus:ring-slate-500 focus:outline-none"
            >
              Reload page
            </button>
            <a
              href={`mailto:support@your-domain.com?subject=Bug%20report&body=${encodeURIComponent(
                `Error: ${message}\n\n(Include steps to reproduce if possible)`
              )}`}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:outline-none"
            >
              Report issue
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}