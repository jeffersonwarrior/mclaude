"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
exports.withErrorBoundary = withErrorBoundary;
exports.useErrorHandler = useErrorHandler;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ink_1 = require("ink");
/**
 * Error Boundary component for catching and handling React errors gracefully
 */
class ErrorBoundary extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
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
    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };
    render() {
        if (this.state.hasError) {
            // If a custom fallback is provided, use it
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default error UI
            return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", padding: 1, borderStyle: "round", borderColor: "red", children: [(0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "red", bold: true, children: "UI Error Occurred" }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: this.state.error?.message || 'An unexpected error occurred in the user interface' }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", dimColor: true, children: "This is likely a terminal compatibility issue or a temporary glitch." }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "You can:" }) }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { marginLeft: 2, flexDirection: "column", marginBottom: 1, children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "\u2022 Press 'r' to retry the UI" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "\u2022 Try a different terminal" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "\u2022 Set TERM=xterm-256color" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "\u2022 Use 'mclaude --model <model-id>' to skip UI" })] }), (0, jsx_runtime_1.jsx)(ink_1.Box, { children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "cyan", bold: true, children: "Press 'r' to retry or ESC to exit" }) })] }));
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
/**
 * Higher-order component that wraps a component in an ErrorBoundary
 */
function withErrorBoundary(Component, errorBoundaryProps) {
    const WrappedComponent = (props) => {
        const { fallback, onError, ...componentProps } = props;
        return ((0, jsx_runtime_1.jsx)(ErrorBoundary, { fallback: fallback, onError: onError, children: (0, jsx_runtime_1.jsx)(Component, { ...componentProps }) }));
    };
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}
/**
 * Hook-based error boundary for functional components
 */
function useErrorHandler() {
    const handleError = (error, errorInfo) => {
        console.error('Error caught by error handler:', error, errorInfo);
        // Log the error for debugging
        if (errorInfo) {
            console.error('Component Stack:', errorInfo.componentStack);
        }
    };
    return { handleError };
}
//# sourceMappingURL=ErrorBoundary.js.map