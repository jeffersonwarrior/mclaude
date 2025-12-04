"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProviderSummary = exports.ProviderStatusIndicator = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const ink_1 = require("ink");
/**
 * Get provider visual indicators
 */
const getProviderIndicators = (provider) => {
    const lowerProvider = provider.toLowerCase();
    switch (lowerProvider) {
        case 'synthetic':
            return { icon: '🤖', color: 'cyan', tag: 'Synthetic' };
        case 'minimax':
            return { icon: '⚡', color: 'yellow', tag: 'MiniMax' };
        case 'auto':
            return { icon: '🔄', color: 'green', tag: 'Auto' };
        default:
            return { icon: '❓', color: 'gray', tag: provider };
    }
};
/**
 * Get status color and icon based on status and enabled state
 */
const getStatusIndicators = (enabled, connected, hasError) => {
    if (hasError) {
        return { status: 'Error', icon: '✗', color: 'red' };
    }
    if (!enabled) {
        return { status: 'Disabled', icon: '○', color: 'gray' };
    }
    if (connected === false) {
        return { status: 'Offline', icon: '⊗', color: 'yellow' };
    }
    if (connected === true) {
        return { status: 'Online', icon: '●', color: 'green' };
    }
    return { status: 'Enabled', icon: '◐', color: 'blue' };
};
const ProviderStatusIndicator = ({ providers, showDetails = false, compact = false }) => {
    if (providers.length === 0) {
        return null;
    }
    if (compact) {
        // Compact version: single line with status summary
        return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Providers: " }), providers.map((provider, index) => {
                    const providerIndicators = getProviderIndicators(provider.provider);
                    const statusIndicators = getStatusIndicators(provider.enabled, provider.connected, provider.hasError);
                    return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [index > 0 && (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: " | " }), (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: statusIndicators.color, children: [providerIndicators.icon, " ", providerIndicators.tag, " ", statusIndicators.icon] }), provider.modelCount !== undefined && ((0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: [" (", provider.modelCount, ")"] }))] }, provider.provider));
                })] }));
    }
    // Detailed version: multi-line with full information
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "cyan", bold: true, children: "Provider Status:" }) }), providers.map(provider => {
                const providerIndicators = getProviderIndicators(provider.provider);
                const statusIndicators = getStatusIndicators(provider.enabled, provider.connected, provider.hasError);
                return ((0, jsx_runtime_1.jsx)(ink_1.Box, { marginLeft: 2, marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsxs)(ink_1.Box, { children: [(0, jsx_runtime_1.jsxs)(ink_1.Text, { color: providerIndicators.color, bold: true, children: [providerIndicators.icon, " ", providerIndicators.tag] }), (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: statusIndicators.color, children: [statusIndicators.icon, " ", statusIndicators.status] }), provider.modelCount !== undefined && ((0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: [" (", provider.modelCount, " models)"] }))] }), showDetails && ((0, jsx_runtime_1.jsxs)(ink_1.Box, { marginLeft: 4, flexDirection: "column", children: [(0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", dimColor: true, children: ["API Key: ", provider.enabled ? 'Configured' : 'Not configured'] }), provider.connected !== undefined && ((0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", dimColor: true, children: ["Connection: ", provider.connected ? 'Connected' : 'Disconnected'] })), provider.errorMessage && ((0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "red", dimColor: true, children: ["Error: ", provider.errorMessage] })), provider.lastChecked && ((0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", dimColor: true, children: ["Last checked: ", provider.lastChecked.toLocaleTimeString()] }))] }))] }) }, provider.provider));
            })] }));
};
exports.ProviderStatusIndicator = ProviderStatusIndicator;
/**
 * Get summary status text for quick display
 */
const getProviderSummary = (providers) => {
    const enabled = providers.filter(p => p.enabled).length;
    const connected = providers.filter(p => p.connected !== false && p.enabled).length;
    const withErrors = providers.filter(p => p.hasError).length;
    let summary = `${enabled}/${providers.length} enabled`;
    if (connected !== enabled) {
        summary += `, ${connected} connected`;
    }
    if (withErrors > 0) {
        summary += `, ${withErrors} with errors`;
    }
    return summary;
};
exports.getProviderSummary = getProviderSummary;
//# sourceMappingURL=ProviderStatus.js.map