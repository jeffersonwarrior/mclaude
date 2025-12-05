"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSelectorErrorBoundary = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ink_1 = require("ink");
const ErrorBoundary_1 = require("./ErrorBoundary");
/**
 * Error boundary with retry functionality specifically for ModelSelector
 */
const ModelSelectorErrorBoundary = ({ children, onError, onCancel }) => {
    const [retryKey, setRetryKey] = (0, react_1.useState)(0);
    const handleRetry = (0, react_1.useCallback)(() => {
        setRetryKey(prev => prev + 1);
    }, []);
    const handleError = (0, react_1.useCallback)((error, errorInfo) => {
        if (onError) {
            onError(error, errorInfo);
        }
        console.error('ModelSelector Error:', error, errorInfo);
    }, [onError]);
    const fallbackUI = ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", padding: 1, borderStyle: "round", borderColor: "red", children: [(0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "red", bold: true, children: "UI Error Occurred" }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: "The model selection interface encountered an error." }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", dimColor: true, children: "This is likely a terminal compatibility issue or a temporary glitch." }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Recovery options:" }) }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { marginLeft: 2, flexDirection: "column", marginBottom: 1, children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "\u2022 Press 'r' to retry the UI" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "\u2022 Press 'q' or ESC to exit" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "\u2022 Try: TERM=xterm-256color mclaude models" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "\u2022 Try: mclaude --model <model-id> (skip UI)" })] }), (0, jsx_runtime_1.jsx)(ink_1.Box, { children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "cyan", bold: true, children: "Controls: r=retry, q/ESC=exit" }) })] }));
    const ErrorBoundaryWithRetry = ({ children: content }) => {
        return ((0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { fallback: fallbackUI, onError: handleError, children: content }, retryKey));
    };
    // Handle keyboard input for retry
    (0, ink_1.useInput)((input, key) => {
        if (input === 'r') {
            handleRetry();
        }
        else if (input === 'q' || key.escape) {
            if (onCancel) {
                onCancel();
            }
        }
    });
    return ((0, jsx_runtime_1.jsx)(ErrorBoundaryWithRetry, { children: children }));
};
exports.ModelSelectorErrorBoundary = ModelSelectorErrorBoundary;
//# sourceMappingURL=ModelSelectorErrorBoundary.js.map