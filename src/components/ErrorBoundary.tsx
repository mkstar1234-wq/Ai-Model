import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Optional: reload the page or navigate home
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-red-50/50 rounded-2xl border border-red-100 m-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Something went wrong
              {this.props.sectionName ? ` in ${this.props.sectionName}` : ''}
            </h2>
            <p className="text-sm text-slate-500 bg-white p-4 rounded-xl border border-slate-200 overflow-auto max-h-40 font-mono text-left">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={this.handleReset}
              className="mt-4 w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex justify-center items-center space-x-2"
            >
              <RefreshCcw className="w-5 h-5" /> <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
