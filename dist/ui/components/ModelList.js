"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ink_1 = require("ink");
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
 * Get provider-specific model highlighting style
 */
const getModelHighlightStyle = (model, isSelected) => {
    if (isSelected) {
        return { color: 'blue', bold: true };
    }
    const provider = model.getProvider().toLowerCase();
    switch (provider) {
        case 'synthetic': return { color: 'cyan' };
        case 'minimax': return { color: 'red' };
        default: return { color: 'white' };
    }
};
const ModelList = ({ models, selectedIndex, showCategories = false, showProviderBadges = true, providerFilter = [] }) => {
    // Filter models by provider if filter is specified
    const filteredModels = providerFilter.length > 0
        ? models.filter(model => providerFilter.includes(model.getProvider().toLowerCase()))
        : models;
    if (filteredModels.length === 0) {
        if (providerFilter.length > 0) {
            return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: "No models available for the selected providers." }), (0, jsx_runtime_1.jsx)(ink_1.Newline, {}), (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["Filtered by: ", providerFilter.join(', ')] })] }));
        }
        return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "No models available." }), (0, jsx_runtime_1.jsx)(ink_1.Newline, {}), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Try running 'synclaude models --refresh' to update the model list." })] }));
    }
    return ((0, jsx_runtime_1.jsx)(ink_1.Box, { flexDirection: "column", children: filteredModels.map((model, index) => {
            const provider = model.getProvider();
            const providerColor = getProviderColor(provider);
            const textStyle = getModelHighlightStyle(model, selectedIndex === index);
            const isThinkingModel = model.id.toLowerCase().includes('thinking');
            return ((0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsxs)(ink_1.Box, { children: [(0, jsx_runtime_1.jsxs)(ink_1.Text, { color: textStyle.color, bold: textStyle.bold, children: [selectedIndex === index ? '➤ ' : '  ', index + 1, ". ", model.getDisplayName()] }), showProviderBadges && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(ink_1.Text, { color: providerColor, bold: true, children: ["[", model.getProviderTag(), "]"] }), provider === 'minimax' && ((0, jsx_runtime_1.jsx)(ink_1.Text, { color: "red", children: " \u3030\uFE0F" }))] })), isThinkingModel && ((0, jsx_runtime_1.jsx)(ink_1.Text, { color: "magenta", children: " \uD83E\uDD14" }))] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { marginLeft: 4, flexDirection: "column", children: [(0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", dimColor: true, children: ["Provider: ", (0, jsx_runtime_1.jsx)(ink_1.Text, { color: providerColor, children: provider }), model.context_length && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [" | Context: ", Math.round(model.context_length / 1024), "K tokens"] }), model.quantization && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [" | Quantization: ", model.quantization] }), isThinkingModel && (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: " | Type: thinking" })] }), model.owned_by && ((0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", dimColor: true, children: ["Owner: ", model.owned_by] })), showProviderBadges && model.getProviderCapabilities().length > 0 && ((0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", dimColor: true, children: ["Capabilities: ", model.getProviderCapabilities().slice(0, 3).join(', '), model.getProviderCapabilities().length > 3 && ` +${model.getProviderCapabilities().length - 3} more`] }))] })] }) }, model.id));
        }) }));
};
exports.ModelList = ModelList;
//# sourceMappingURL=ModelList.js.map