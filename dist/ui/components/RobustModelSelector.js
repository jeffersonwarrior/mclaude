"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobustModelSelector = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Robust ModelSelector with automatic fallback mechanisms
 * Tries different UI approaches and falls back when errors occur
 */
const react_1 = __importStar(require("react"));
const ink_1 = require("ink");
const FallbackModelSelector_1 = require("./FallbackModelSelector");
// Import the original ModelSelector for fallback (but without complex Text components)
const ModelSelector_1 = require("./ModelSelector");
const RobustModelSelector = ({ models, onSelect, onSelectSubagent, onSelectFast, onCancel, ...restProps }) => {
    const [selectionMode, setSelectionMode] = (0, react_1.useState)('minimal');
    const [errorCount, setErrorCount] = (0, react_1.useState)(0);
    const [lastError, setLastError] = (0, react_1.useState)(null);
    const { exit } = (0, ink_1.useApp)();
    const stdout = (0, ink_1.useStdout)();
    // Use models directly instead of creating safe wrapper to maintain type compatibility
    // Auto-fallback logic
    (0, react_1.useEffect)(() => {
        if (errorCount >= 2) {
            console.log('Multiple UI errors detected, switching to fallback mode...');
            if (selectionMode === 'minimal') {
                setSelectionMode('console');
            }
            else if (selectionMode === 'console') {
                setSelectionMode('numbered');
            }
            setErrorCount(0);
        }
    }, [errorCount, selectionMode]);
    const handleError = (0, react_1.useCallback)((error) => {
        console.error('UI Error in ModelSelector:', error);
        setLastError(error.message);
        setErrorCount(prev => prev + 1);
        // Immediate fallback for critical errors
        if (error.message.includes('empty string') || error.message.includes('Text')) {
            console.log('Text component error detected, switching to console mode...');
            setSelectionMode('console');
        }
    }, []);
    const handleManualFallback = (0, react_1.useCallback)(() => {
        const modes = ['minimal', 'console', 'numbered', 'advanced'];
        const currentIndex = modes.indexOf(selectionMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setSelectionMode(modes[nextIndex] || 'minimal');
        setErrorCount(0);
        setLastError(null);
    }, [selectionMode]);
    // Keyboard shortcuts for manual fallback
    (0, ink_1.useInput)((input, key) => {
        // Ctrl+F to cycle through fallback modes
        if ((key.ctrl && input === 'f') || (input === 'f' && key.ctrl)) {
            handleManualFallback();
            return;
        }
        // Escape with Ctrl to immediately go to safest mode
        if (key.ctrl && key.escape) {
            setSelectionMode('minimal');
            return;
        }
    });
    // Mode-specific error boundary logic
    const renderSelector = () => {
        try {
            const commonProps = {
                models: models,
                onSelect,
                onSelectSubagent,
                onSelectFast,
                onCancel
            };
            switch (selectionMode) {
                case 'advanced':
                    // Try the original ModelSelector with error handling
                    return ((0, jsx_runtime_1.jsx)(ErrorBoundary, { onError: (error) => {
                            handleError(error);
                            setSelectionMode('minimal'); // Immediate fallback
                        }, fallback: () => (0, jsx_runtime_1.jsx)(FallbackModelSelector_1.MinimalArrowSelector, { ...commonProps }), children: (0, jsx_runtime_1.jsx)(ModelSelector_1.ModelSelector, { models: models, onSelect: onSelect, onCancel: onCancel, ...restProps }) }));
                case 'minimal':
                    return (0, jsx_runtime_1.jsx)(FallbackModelSelector_1.MinimalArrowSelector, { ...commonProps });
                case 'numbered':
                    return (0, jsx_runtime_1.jsx)(FallbackModelSelector_1.SimpleNumberedListSelector, { ...commonProps });
                case 'console':
                    return (0, jsx_runtime_1.jsx)(FallbackModelSelector_1.ConsoleBasedSelector, { ...commonProps });
                default:
                    return (0, jsx_runtime_1.jsx)(FallbackModelSelector_1.MinimalArrowSelector, { ...commonProps });
            }
        }
        catch (error) {
            console.error('Critical error in renderSelector:', error);
            // Final fallback - always works
            return (0, jsx_runtime_1.jsx)(FallbackModelSelector_1.MinimalArrowSelector, { models: models, onSelect: onSelect, onSelectSubagent: onSelectSubagent, onSelectFast: onSelectFast, onCancel: onCancel });
        }
    };
    // Status display
    const renderStatus = () => {
        if (lastError) {
            return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { marginBottom: 1, children: [(0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "red", children: ["UI Error: ", lastError] }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: " Press Ctrl+F to try different selection mode" })] }));
        }
        const modeDescriptions = {
            advanced: 'Advanced UI',
            minimal: 'Minimal Arrow UI',
            numbered: 'Numbered List UI',
            console: 'Console UI'
        };
        return ((0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, justifyContent: "flex-end", children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", dimColor: true, children: ["Mode: ", modeDescriptions[selectionMode], " | Ctrl+F: Switch Mode", errorCount > 0 && ` | Errors: ${errorCount}`] }) }));
    };
    return ((0, jsx_runtime_1.jsx)(ink_1.Box, { flexDirection: "column", width: "100%", children: (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [renderStatus(), renderSelector()] }) }));
};
exports.RobustModelSelector = RobustModelSelector;
class ErrorBoundary extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught error:', error, errorInfo);
        this.props.onError(error);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback();
        }
        return this.props.children;
    }
}
exports.default = exports.RobustModelSelector;
//# sourceMappingURL=RobustModelSelector.js.map