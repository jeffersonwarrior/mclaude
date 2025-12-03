import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Box, Text, useInput } from 'ink';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary component for catching and handling React errors gracefully
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);

    // Store additional error info
    this.setState({
      errorInfo
    });

    // Call the error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  override render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box flexDirection="column" padding={1} borderStyle="round" borderColor="red">
          <Box marginBottom={1}>
            <Text color="red" bold>UI Error Occurred</Text>
          </Box>

          <Box marginBottom={1}>
            <Text color="yellow">
              {this.state.error?.message || 'An unexpected error occurred in the user interface'}
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text color="gray" dimColor>
              This is likely a terminal compatibility issue or a temporary glitch.
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text color="gray">
              You can:
            </Text>
          </Box>

          <Box marginLeft={2} flexDirection="column" marginBottom={1}>
            <Text color="gray">• Press 'r' to retry the UI</Text>
            <Text color="gray">• Try a different terminal</Text>
            <Text color="gray">• Set TERM=xterm-256color</Text>
            <Text color="gray">• Use 'mclaude --model &lt;model-id&gt;' to skip UI</Text>
          </Box>

          <Box>
            <Text color="cyan" bold>
              Press 'r' to retry or ESC to exit
            </Text>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component that wraps a component in an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P & { fallback?: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }> {
  const WrappedComponent = (props: P & { fallback?: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) => {
    const { fallback, onError, ...componentProps } = props;

    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...(componentProps as P)} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook-based error boundary for functional components
 */
export function useErrorHandler() {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);

    // Log the error for debugging
    if (errorInfo) {
      console.error('Component Stack:', errorInfo.componentStack);
    }
  };

  return { handleError };
}