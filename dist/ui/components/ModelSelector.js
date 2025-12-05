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
exports.ModelSelector = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const ink_1 = require("ink");
const ModelSelectorErrorBoundary_1 = require("./ModelSelectorErrorBoundary");
/**
 * Get provider color scheme for highlighting
 */
const getProviderColor = (provider) => {
    switch (provider.toLowerCase()) {
        case 'synthetic': return 'cyan';
        case 'minimax': return 'red';
        default: return 'gray';
    }
};
/**
 * Get unique providers from models
 */
const getUniqueProviders = (models) => {
    return [...new Set(models.map(model => model.getProvider().toLowerCase()))].filter(p => p); // Filter out empty/undefined values
};
/**
 * Authentication Error View component
 */
const AuthenticationErrorView = ({ error, onCancel }) => {
    const { exit } = (0, ink_1.useApp)();
    (0, ink_1.useInput)((input, key) => {
        if (key.escape || input === 'q') {
            onCancel();
            exit();
        }
    });
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "red", bold: true, children: "Authentication Error" }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: error }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Please check your API credentials and try again." }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Run 'mclaude setup' to reconfigure your credentials." }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Press 'q' to quit or Escape to cancel" }) })] }));
};
/**
 * Provider Status Badge component
 */
const ProviderStatusBadge = ({ provider, available, lastChecked }) => {
    const getStatusColor = () => {
        return available ? 'green' : 'red';
    };
    const getStatusIcon = () => {
        return available ? '●' : '●';
    };
    const formatLastChecked = () => {
        if (!lastChecked)
            return '';
        const now = new Date();
        const diffMs = now.getTime() - lastChecked.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 1)
            return '(just now)';
        if (diffMins < 60)
            return `(${diffMins}m ago)`;
        if (diffMins < 1440)
            return `(${Math.floor(diffMins / 60)}h ago)`;
        return `(${Math.floor(diffMins / 1440)}d ago)`;
    };
    const providerColor = getProviderColor(provider);
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: getStatusColor(), bold: true, children: getStatusIcon() }), (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: providerColor, bold: available, children: [" ", provider.charAt(0).toUpperCase() + provider.slice(1)] }), formatLastChecked() && ((0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", dimColor: true, children: [' ', formatLastChecked()] }))] }));
};
/**
 * Provider Status Panel component
 */
const ProviderStatusPanel = ({ providerStatus }) => {
    if (!providerStatus) {
        return null;
    }
    const availableCount = [
        providerStatus.synthetic.available,
        providerStatus.minimax.available
    ].filter(Boolean).length;
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { marginBottom: 1, flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["Provider Status (", availableCount, "/2 available):"] }) }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { marginLeft: 2, children: [(0, jsx_runtime_1.jsx)(ProviderStatusBadge, { provider: "synthetic", available: providerStatus.synthetic.available, lastChecked: providerStatus.synthetic.lastChecked }), (0, jsx_runtime_1.jsx)(ProviderStatusBadge, { provider: "minimax", available: providerStatus.minimax.available, lastChecked: providerStatus.minimax.lastChecked })] })] }));
};
const ModelSelector = ({ models, onSelect, onCancel, searchPlaceholder = 'Search models...', initialRegularModel = null, initialThinkingModel = null, enabledProviders = [], authenticationError = null, providerStatus }) => {
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [selectedIndex, setSelectedIndex] = (0, react_1.useState)(0);
    const [filteredModels, setFilteredModels] = (0, react_1.useState)(models);
    const [providerFilter, setProviderFilter] = (0, react_1.useState)([]);
    const [selectedRegularModel, setSelectedRegularModel] = (0, react_1.useState)(initialRegularModel);
    const [selectedThinkingModel, setSelectedThinkingModel] = (0, react_1.useState)(initialThinkingModel);
    const { exit } = (0, ink_1.useApp)();
    const { write } = (0, ink_1.useStdout)();
    // Get available providers
    const availableProviders = getUniqueProviders(models);
    const activeProviderFilter = providerFilter.length > 0 ? providerFilter : availableProviders;
    // Filter models based on search query and provider filter
    (0, react_1.useEffect)(() => {
        let filtered = models;
        // Apply provider filter first
        if (activeProviderFilter.length > 0 && activeProviderFilter.length < availableProviders.length) {
            filtered = filtered.filter(model => activeProviderFilter.includes(model.getProvider().toLowerCase()));
        }
        // Then apply search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(model => {
                const searchParts = [
                    model.id.toLowerCase(),
                    model.getProvider().toLowerCase(),
                    model.getModelName().toLowerCase(),
                    model.owned_by?.toLowerCase() || '',
                    model.getProviderTag().toLowerCase(),
                    model.getProviderCapabilities().join(' ').toLowerCase()
                ].filter(part => part.trim().length > 0);
                const searchText = searchParts.join(' ').trim();
                return searchText.includes(query);
            });
        }
        setFilteredModels(filtered);
        setSelectedIndex(0); // Reset selection when filter changes
    }, [searchQuery, models, activeProviderFilter]);
    // Toggle provider filter
    const toggleProviderFilter = (0, react_1.useCallback)((provider) => {
        setProviderFilter(prev => {
            const lowerProvider = provider.toLowerCase();
            if (prev.includes(lowerProvider)) {
                return prev.filter(p => p !== lowerProvider);
            }
            else {
                return [...prev, lowerProvider];
            }
        });
    }, []);
    // Clear all provider filters
    const clearProviderFilter = (0, react_1.useCallback)(() => {
        setProviderFilter([]);
    }, []);
    // Calculate visible range for better scrolling
    const visibleStartIndex = Math.max(0, selectedIndex - 5);
    const visibleEndIndex = Math.min(filteredModels.length, selectedIndex + 6);
    const visibleModels = filteredModels.slice(visibleStartIndex, visibleEndIndex);
    // Handle keyboard input
    (0, ink_1.useInput)((input, key) => {
        // Handle provider filters (1-9 keys) when not in search mode
        if (!searchQuery && !key.ctrl && !key.meta && input >= '1' && input <= '9') {
            const providerIndex = parseInt(input) - 1;
            if (providerIndex < availableProviders.length) {
                const provider = availableProviders[providerIndex];
                if (provider) {
                    toggleProviderFilter(provider);
                }
            }
            return;
        }
        // Handle 'c' to clear provider filters when not in search mode
        if (input === 'c' && !searchQuery && !key.ctrl && !key.meta) {
            clearProviderFilter();
            return;
        }
        // Handle special 't' key for thinking model selection when no search query exists
        if (input === 't' && !searchQuery && !key.ctrl && !key.meta) {
            if (filteredModels.length > 0 && selectedIndex < filteredModels.length) {
                const selectedModel = filteredModels[selectedIndex];
                if (selectedModel) {
                    // Toggle thinking model selection
                    if (selectedThinkingModel?.id === selectedModel.id) {
                        setSelectedThinkingModel(null);
                    }
                    else {
                        setSelectedThinkingModel(selectedModel);
                    }
                }
            }
            return;
        }
        // Handle text input for search
        if (input && !key.ctrl && !key.meta && !key.return && !key.escape && !key.tab &&
            !key.upArrow && !key.downArrow && !key.leftArrow && !key.rightArrow &&
            !key.delete && !key.backspace && input !== 'q' && !(input === 't' && !searchQuery) &&
            !(input >= '1' && input <= '9' && !searchQuery) && !(input === 'c' && !searchQuery)) {
            setSearchQuery(prev => prev + input);
            return;
        }
        // Handle backspace
        if (key.backspace || key.delete) {
            setSearchQuery(prev => prev.slice(0, -1));
            return;
        }
        if (key.escape) {
            onCancel();
            exit();
            return;
        }
        // Space to select/toggle regular model
        if (input === ' ') {
            if (filteredModels.length > 0 && selectedIndex < filteredModels.length) {
                const selectedModel = filteredModels[selectedIndex];
                if (selectedModel) {
                    // Toggle regular model selection
                    if (selectedRegularModel?.id === selectedModel.id) {
                        setSelectedRegularModel(null);
                    }
                    else {
                        setSelectedRegularModel(selectedModel);
                    }
                }
            }
            return;
        }
        // Enter to launch with selections
        if (key.return) {
            if (selectedRegularModel || selectedThinkingModel) {
                onSelect(selectedRegularModel, selectedThinkingModel);
                exit();
            }
            return;
        }
        if (key.upArrow) {
            setSelectedIndex(prev => Math.max(0, prev - 1));
            return;
        }
        if (key.downArrow) {
            setSelectedIndex(prev => Math.min(filteredModels.length - 1, prev + 1));
            return;
        }
        // 'q' to quit
        if (input === 'q') {
            onCancel();
            exit();
        }
    });
    // Handle authentication errors with dedicated view
    if (authenticationError) {
        return (0, jsx_runtime_1.jsx)(AuthenticationErrorView, { error: authenticationError, onCancel: onCancel });
    }
    if (models.length === 0) {
        return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "red", children: "Error: No models available" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Press 'q' to quit or Escape to cancel" })] }));
    }
    return ((0, jsx_runtime_1.jsx)(ModelSelectorErrorBoundary_1.ModelSelectorErrorBoundary, { onError: (error, errorInfo) => {
            console.error('ModelSelector Error:', error, errorInfo);
        }, onCancel: onCancel, children: (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "cyan", children: "Select Models:" }) }), (0, jsx_runtime_1.jsx)(ProviderStatusPanel, { providerStatus: providerStatus }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["Regular: ", (() => {
                                if (!selectedRegularModel)
                                    return "none";
                                const displayName = selectedRegularModel.getDisplayName().trim();
                                const providerTag = selectedRegularModel.getProviderTag().trim();
                                return displayName && providerTag ? `${displayName} [${providerTag}]` : displayName || "unknown";
                            })(), " | Thinking: ", (() => {
                                if (!selectedThinkingModel)
                                    return "none";
                                const displayName = selectedThinkingModel.getDisplayName().trim();
                                const providerTag = selectedThinkingModel.getProviderTag().trim();
                                return displayName && providerTag ? `${displayName} [${providerTag}]` : displayName || "unknown";
                            })()] }) }), !searchQuery && availableProviders.length > 1 && ((0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, flexDirection: "column", children: (0, jsx_runtime_1.jsxs)(ink_1.Box, { marginBottom: 1, children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Provider Filters: " }), availableProviders.map((provider, index) => {
                                const isActive = activeProviderFilter.includes(provider);
                                const providerColor = getProviderColor(provider);
                                return ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: isActive ? providerColor : 'gray', bold: isActive, children: [index + 1, ".", provider.charAt(0).toUpperCase() + provider.slice(1), isActive ? '✓' : '', " "] }) }, provider));
                            }), providerFilter.length > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "| " }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: "c:Clear" })] }))] }) })), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["Search: ", searchQuery || "(type to search)", activeProviderFilter.length < availableProviders.length && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [" | Filters: ", activeProviderFilter.join(', ')] }))] }) }), filteredModels.length > 0 ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["Found ", filteredModels.length, " model", filteredModels.length !== 1 ? 's' : ''] }) }), visibleStartIndex > 0 && ((0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["\u25B2 ", visibleStartIndex, " more above"] }) })), visibleModels.map((model, index) => {
                            const actualIndex = visibleStartIndex + index;
                            const isRegularSelected = selectedRegularModel?.id === model.id;
                            const isThinkingSelected = selectedThinkingModel?.id === model.id;
                            const provider = model.getProvider();
                            const providerColor = getProviderColor(provider);
                            const isThinkingModel = model.id.toLowerCase().includes('thinking');
                            const isSelected = actualIndex === selectedIndex;
                            // Selection indicators
                            const getSelectionIndicator = () => {
                                if (isRegularSelected && isThinkingSelected)
                                    return '[R,T] ';
                                if (isRegularSelected)
                                    return '[R] ';
                                if (isThinkingSelected)
                                    return '[T] ';
                                return '    ';
                            };
                            // Get text style based on selection and provider
                            const getTextStyle = () => {
                                if (isSelected)
                                    return { color: 'green', bold: true };
                                if (isRegularSelected)
                                    return { color: 'cyan', bold: true };
                                if (isThinkingSelected)
                                    return { color: 'yellow', bold: true };
                                return { color: providerColor, bold: false };
                            };
                            const textStyle = getTextStyle();
                            return ((0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsxs)(ink_1.Box, { children: [(0, jsx_runtime_1.jsxs)(ink_1.Text, { color: textStyle.color, bold: textStyle.bold, children: [isSelected ? '▸ ' : '  ', getSelectionIndicator(), actualIndex + 1, ". ", model.getDisplayName(), " "] }), (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: providerColor, bold: !isSelected, children: ["[", model.getProviderTag(), "]"] }), model.getProvider().toLowerCase() === 'minimax' && ((0, jsx_runtime_1.jsx)(ink_1.Text, { color: "red", children: " \u3030\uFE0F" })), isThinkingModel && ((0, jsx_runtime_1.jsx)(ink_1.Text, { color: "magenta", children: " \uD83E\uDD14" }))] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { marginLeft: 4, flexDirection: "column", children: [(0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", dimColor: true, children: ["Provider: ", (0, jsx_runtime_1.jsx)(ink_1.Text, { color: providerColor, children: provider }), model.context_length && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [" | Context: ", Math.round(model.context_length / 1024), "K"] }), model.quantization && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [" | ", model.quantization] }), isThinkingModel && (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: " | Type: thinking" }), model.owned_by && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [" | Owner: ", model.owned_by] })] }), !isSelected && model.getProviderCapabilities().length > 0 && ((0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", dimColor: true, children: ["Capabilities: ", model.getProviderCapabilities().slice(0, 2).join(', '), model.getProviderCapabilities().length > 2 && ` +${model.getProviderCapabilities().length - 2} more`] })), isSelected && ((0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", dimColor: true, children: ["ID: ", model.id, model.isClaudeCompatible() && (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: " | Claude-compatible \u2713" })] }))] })] }) }, model.id));
                        }), visibleEndIndex < filteredModels.length && ((0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["\u25BC ", filteredModels.length - visibleEndIndex, " more below"] }) })), (0, jsx_runtime_1.jsxs)(ink_1.Box, { marginTop: 1, children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "\u2191\u2193 Navigate | Space: Select Regular | t: Select Thinking | Enter: Launch | q: Quit" }), !searchQuery && availableProviders.length > 1 && ((0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["\u2502 1-", availableProviders.length, ": Toggle Provider Filters | c: Clear Filters | Type to Search"] })), searchQuery && ((0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["\u2502 Esc: Clear Search | Backspace: Delete char | ", availableProviders.length > 1 && 'c: Clear Filters when done'] }))] })] })) : ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: "No models match your search." }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Try different search terms." })] }))] }) }));
};
exports.ModelSelector = ModelSelector;
//# sourceMappingURL=ModelSelector.js.map