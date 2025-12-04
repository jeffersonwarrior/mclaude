"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleBasedSelector = exports.MinimalArrowSelector = exports.SimpleNumberedListSelector = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Fallback Model Selection methods
 * Provides multiple approaches when primary UI fails
 */
const react_1 = require("react");
const ink_1 = require("ink");
// Simple text-only list approach (Option 1)
const SimpleNumberedListSelector = ({ models, onSelect, onCancel }) => {
    const [selectedRegularModel, setSelectedRegularModel] = (0, react_1.useState)(null);
    const [selectedThinkingModel, setSelectedThinkingModel] = (0, react_1.useState)(null);
    const [inputBuffer, setInputBuffer] = (0, react_1.useState)('');
    const { exit } = (0, ink_1.useApp)();
    (0, ink_1.useInput)((input, key) => {
        // Handle number input for quick selection
        if (input >= '1' && input <= '9') {
            const index = parseInt(input) - 1;
            if (index < models.length) {
                const model = models[index];
                if (model) {
                    // First selection becomes regular model, second becomes thinking
                    if (!selectedRegularModel) {
                        setSelectedRegularModel(model);
                    }
                    else if (!selectedThinkingModel && model.id !== selectedRegularModel.id) {
                        setSelectedThinkingModel(model);
                    }
                }
            }
            return;
        }
        // Handle direct model ID input
        if (input && !key.ctrl && !key.meta && !key.return && !key.escape &&
            input !== 'q' && input !== 'c' && input !== 'l') {
            setInputBuffer(prev => prev + input);
            return;
        }
        // Backspace for input buffer
        if (key.backspace || key.delete) {
            setInputBuffer(prev => prev.slice(0, -1));
            return;
        }
        // Enter to launch
        if (key.return) {
            if (inputBuffer) {
                // Try to find model by partial ID match
                const matchedModel = models.find(m => m.id.toLowerCase().includes(inputBuffer.toLowerCase()));
                if (matchedModel) {
                    onSelect(matchedModel, selectedThinkingModel);
                    exit();
                }
            }
            else if (selectedRegularModel || selectedThinkingModel) {
                onSelect(selectedRegularModel, selectedThinkingModel);
                exit();
            }
            return;
        }
        // t to toggle thinking model
        if (input === 't') {
            if (selectedRegularModel) {
                if (selectedThinkingModel?.id === selectedRegularModel.id) {
                    setSelectedThinkingModel(null);
                }
                else {
                    setSelectedThinkingModel(selectedRegularModel);
                }
            }
            return;
        }
        // c to clear selection
        if (input === 'c') {
            setSelectedRegularModel(null);
            setSelectedThinkingModel(null);
            setInputBuffer('');
            return;
        }
        // l to clear input buffer only
        if (input === 'l') {
            setInputBuffer('');
            return;
        }
        // Escape or q to quit
        if (key.escape || input === 'q') {
            onCancel();
            exit();
        }
    });
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "cyan", children: "Simple Model Selection (Fallback Mode)" }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["Selected: Regular=", selectedRegularModel ? selectedRegularModel.getDisplayName() : 'none', " | Thinking=", selectedThinkingModel ? selectedThinkingModel.getDisplayName() : 'none'] }) }), inputBuffer && ((0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "yellow", children: ["Direct Input: ", inputBuffer] }) })), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Available Models (press number to select):" }) }), models.slice(0, 9).map((model, index) => {
                const isRegularSelected = selectedRegularModel?.id === model.id;
                const isThinkingSelected = selectedThinkingModel?.id === model.id;
                const providerColor = model.getProvider().toLowerCase() === 'synthetic' ? 'cyan' : 'red';
                return ((0, jsx_runtime_1.jsx)(ink_1.Box, { marginLeft: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Box, { children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: isRegularSelected || isThinkingSelected ? 'green' : 'white', children: [index + 1, ". ", model.getDisplayName(), " [", model.getProviderTag(), "]", isRegularSelected && ' [R]', isThinkingSelected && ' [T]'] }) }) }, model.id));
            }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginTop: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "1-9: Quick select | Enter: Launch | t: Toggle thinking | c: Clear selection" }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Type: Direct model ID search | l: Clear input | q: Quit" }) })] }));
};
exports.SimpleNumberedListSelector = SimpleNumberedListSelector;
// Minimal arrow-key selector (Option 2)
const MinimalArrowSelector = ({ models, onSelect, onCancel }) => {
    const [selectedIndex, setSelectedIndex] = (0, react_1.useState)(0);
    const [selectedRegularModel, setSelectedRegularModel] = (0, react_1.useState)(null);
    const [selectedThinkingModel, setSelectedThinkingModel] = (0, react_1.useState)(null);
    const { exit } = (0, ink_1.useApp)();
    (0, ink_1.useInput)((input, key) => {
        if (key.upArrow) {
            setSelectedIndex(prev => Math.max(0, prev - 1));
            return;
        }
        if (key.downArrow) {
            setSelectedIndex(prev => Math.min(models.length - 1, prev + 1));
            return;
        }
        // Enter to select as regular model
        if (key.return) {
            const selectedModel = models[selectedIndex];
            if (selectedModel) {
                if (!selectedRegularModel) {
                    setSelectedRegularModel(selectedModel);
                }
                else {
                    onSelect(selectedModel, selectedThinkingModel);
                    exit();
                }
            }
            return;
        }
        // t to toggle thinking
        if (input === 't') {
            const selectedModel = models[selectedIndex];
            if (selectedModel) {
                if (selectedThinkingModel?.id === selectedModel.id) {
                    setSelectedThinkingModel(null);
                }
                else {
                    setSelectedThinkingModel(selectedModel);
                }
            }
            return;
        }
        // Space to launch
        if (input === ' ') {
            if (selectedRegularModel || selectedThinkingModel) {
                onSelect(selectedRegularModel, selectedThinkingModel);
                exit();
            }
            return;
        }
        // q to quit
        if (input === 'q' || key.escape) {
            onCancel();
            exit();
        }
    });
    const visibleStartIndex = Math.max(0, selectedIndex - 3);
    const visibleEndIndex = Math.min(models.length, selectedIndex + 4);
    const visibleModels = models.slice(visibleStartIndex, visibleEndIndex);
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "cyan", children: "Minimal Arrow Selection (Fallback Mode)" }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["Regular: ", selectedRegularModel?.getDisplayName() || 'none', " | Thinking: ", selectedThinkingModel?.getDisplayName() || 'none'] }) }), visibleStartIndex > 0 && ((0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["\u25B2 ", visibleStartIndex, " more above"] }) })), visibleModels.map((model, index) => {
                const actualIndex = visibleStartIndex + index;
                const isSelected = actualIndex === selectedIndex;
                const isRegularSelected = selectedRegularModel?.id === model.id;
                const isThinkingSelected = selectedThinkingModel?.id === model.id;
                let prefix = '  ';
                if (isSelected)
                    prefix = '▶ ';
                else if (isRegularSelected)
                    prefix = 'R ';
                else if (isThinkingSelected)
                    prefix = 'T ';
                return ((0, jsx_runtime_1.jsx)(ink_1.Box, { children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: isSelected ? 'green' : 'white', children: [prefix, model.getDisplayName(), " [", model.getProviderTag(), "]"] }) }, model.id));
            }), visibleEndIndex < models.length && ((0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["\u25BC ", models.length - visibleEndIndex, " more below"] }) })), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginTop: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "\u2191\u2193 Navigate | Enter: Select/Launch | t: Toggle thinking | Space: Launch | q: Quit" }) })] }));
};
exports.MinimalArrowSelector = MinimalArrowSelector;
// Console-based selection (Option 3 - uses stdout directly)
const ConsoleBasedSelector = ({ models, onSelect, onCancel }) => {
    const [currentStep, setCurrentStep] = (0, react_1.useState)('regular');
    const [selectedModel, setSelectedModel] = (0, react_1.useState)(null);
    const [showModelList, setShowModelList] = (0, react_1.useState)(true);
    const { exit } = (0, ink_1.useApp)();
    const { write } = (0, ink_1.useStdout)();
    (0, ink_1.useInput)((input, key) => {
        if (key.escape || input === 'q') {
            onCancel();
            exit();
        }
        if (input >= '1' && input <= '9') {
            const index = parseInt(input) - 1;
            if (index < models.length) {
                const model = models[index];
                if (model) {
                    setSelectedModel(model);
                    setCurrentStep('done');
                    // Immediate selection for simplicity
                    if (currentStep === 'regular') {
                        onSelect(model, null);
                        exit();
                    }
                }
            }
        }
    });
    const displayModels = () => {
        let output = '\n';
        output += '=== Console-Based Model Selection ===\n\n';
        output += `Step: ${currentStep}\n\n`;
        output += 'Available Models:\n';
        models.slice(0, 9).forEach((model, index) => {
            output += `${index + 1}. ${model.getDisplayName()} - ${model.getProviderTag()}\n`;
        });
        output += '\nPress 1-9 to select a model, or q to quit\n';
        return output;
    };
    // This approach only renders when showing the list
    if (showModelList) {
        const modelText = displayModels();
        // Write directly to stdout
        write(modelText);
        setShowModelList(false);
    }
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "cyan", children: "Console Mode Selected - See Above" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Press 1-9 to select model or q to quit" })] }));
};
exports.ConsoleBasedSelector = ConsoleBasedSelector;
//# sourceMappingURL=FallbackModelSelector.js.map