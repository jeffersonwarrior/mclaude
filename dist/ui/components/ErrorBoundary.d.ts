import React, { Component, ReactNode, ErrorInfo } from 'react';
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
export declare class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    private handleRetry;
    render(): string | number | boolean | Iterable<React.ReactNode> | import("react/jsx-runtime").JSX.Element | null | undefined;
}
/**
 * Higher-order component that wraps a component in an ErrorBoundary
 */
export declare function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>): React.ComponentType<P & {
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}>;
/**
 * Hook-based error boundary for functional components
 */
export declare function useErrorHandler(): {
    handleError: (error: Error, errorInfo?: ErrorInfo) => void;
};
export {};
//# sourceMappingURL=ErrorBoundary.d.ts.map