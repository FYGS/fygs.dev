"use client";

import { Component, type ComponentType, type ReactNode } from "react";

interface ErrorBoundaryProps {
  fallback: ComponentType<{ error: Error; reset: () => void }>;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { fallback: Fallback, children } = this.props;

    if (error) {
      return <Fallback error={error} reset={this.reset} />;
    }

    return children;
  }
}
