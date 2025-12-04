/**
 * Fallback Model Selection methods
 * Provides multiple approaches when primary UI fails
 */

import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import { ModelInfoImpl } from '../../models';

interface FallbackModelSelectorProps {
  models: ModelInfoImpl[];
  onSelect: (regularModel: ModelInfoImpl | null, thinkingModel: ModelInfoImpl | null) => void;
  onCancel: () => void;
}

// Simple text-only list approach (Option 1)
export const SimpleNumberedListSelector: React.FC<FallbackModelSelectorProps> = ({
  models,
  onSelect,
  onCancel
}) => {
  const [selectedRegularModel, setSelectedRegularModel] = useState<ModelInfoImpl | null>(null);
  const [selectedThinkingModel, setSelectedThinkingModel] = useState<ModelInfoImpl | null>(null);
  const [inputBuffer, setInputBuffer] = useState('');
  const { exit } = useApp();

  useInput((input, key) => {
    // Handle number input for quick selection
    if (input >= '1' && input <= '9') {
      const index = parseInt(input) - 1;
      if (index < models.length) {
        const model = models[index];
        if (model) {
          // First selection becomes regular model, second becomes thinking
          if (!selectedRegularModel) {
            setSelectedRegularModel(model);
          } else if (!selectedThinkingModel && model.id !== selectedRegularModel.id) {
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
        const matchedModel = models.find(m =>
          m.id.toLowerCase().includes(inputBuffer.toLowerCase())
        );
        if (matchedModel) {
          onSelect(matchedModel, selectedThinkingModel);
          exit();
        }
      } else if (selectedRegularModel || selectedThinkingModel) {
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
        } else {
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

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan">Simple Model Selection (Fallback Mode)</Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">
          Selected: Regular={selectedRegularModel ? selectedRegularModel.getDisplayName() : 'none'} |
          Thinking={selectedThinkingModel ? selectedThinkingModel.getDisplayName() : 'none'}
        </Text>
      </Box>

      {inputBuffer && (
        <Box marginBottom={1}>
          <Text color="yellow">Direct Input: {inputBuffer}</Text>
        </Box>
      )}

      <Box marginBottom={1}>
        <Text color="gray">Available Models (press number to select):</Text>
      </Box>

      {models.slice(0, 9).map((model, index) => {
        const isRegularSelected = selectedRegularModel?.id === model.id;
        const isThinkingSelected = selectedThinkingModel?.id === model.id;
        const providerColor = model.getProvider().toLowerCase() === 'synthetic' ? 'cyan' : 'red';

        return (
          <Box key={model.id} marginLeft={1}>
            <Box>
              <Text color={isRegularSelected || isThinkingSelected ? 'green' : 'white'}>
                {index + 1}. {model.getDisplayName()} [{model.getProviderTag()}]
                {isRegularSelected && ' [R]'}
                {isThinkingSelected && ' [T]'}
              </Text>
            </Box>
          </Box>
        );
      })}

      <Box marginTop={1}>
        <Text color="gray">
          1-9: Quick select | Enter: Launch | t: Toggle thinking | c: Clear selection
        </Text>
      </Box>
      <Box>
        <Text color="gray">
          Type: Direct model ID search | l: Clear input | q: Quit
        </Text>
      </Box>
    </Box>
  );
};

// Minimal arrow-key selector (Option 2)
export const MinimalArrowSelector: React.FC<FallbackModelSelectorProps> = ({
  models,
  onSelect,
  onCancel
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedRegularModel, setSelectedRegularModel] = useState<ModelInfoImpl | null>(null);
  const [selectedThinkingModel, setSelectedThinkingModel] = useState<ModelInfoImpl | null>(null);
  const { exit } = useApp();

  useInput((input, key) => {
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
        } else {
          onSelect(selectedRegularModel, selectedThinkingModel);
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
        } else {
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

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan">Minimal Arrow Selection (Fallback Mode)</Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">
          Regular: {selectedRegularModel?.getDisplayName() || 'none'} |
          Thinking: {selectedThinkingModel?.getDisplayName() || 'none'}
        </Text>
      </Box>

      {visibleStartIndex > 0 && (
        <Box marginBottom={1}>
          <Text color="gray">▲ {visibleStartIndex} more above</Text>
        </Box>
      )}

      {visibleModels.map((model, index) => {
        const actualIndex = visibleStartIndex + index;
        const isSelected = actualIndex === selectedIndex;
        const isRegularSelected = selectedRegularModel?.id === model.id;
        const isThinkingSelected = selectedThinkingModel?.id === model.id;

        let prefix = '  ';
        if (isSelected) prefix = '▶ ';
        else if (isRegularSelected) prefix = 'R ';
        else if (isThinkingSelected) prefix = 'T ';

        return (
          <Box key={model.id}>
            <Text color={isSelected ? 'green' : 'white'}>
              {prefix}{model.getDisplayName()} [{model.getProviderTag()}]
            </Text>
          </Box>
        );
      })}

      {visibleEndIndex < models.length && (
        <Box marginBottom={1}>
          <Text color="gray">▼ {models.length - visibleEndIndex} more below</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="gray">
          ↑↓ Navigate | Enter: Select/Launch | t: Toggle thinking | Space: Launch | q: Quit
        </Text>
      </Box>
    </Box>
  );
};

// Console-based selection (Option 3 - uses stdout directly)
export const ConsoleBasedSelector = ({
  models,
  onSelect,
  onCancel
}: FallbackModelSelectorProps) => {
  const [currentStep, setCurrentStep] = useState<'regular' | 'thinking' | 'done'>('regular');
  const [selectedModel, setSelectedModel] = useState<ModelInfoImpl | null>(null);
  const [showModelList, setShowModelList] = useState(true);
  const { exit } = useApp();
  const { write } = useStdout();

  useInput((input, key) => {
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

  return (
    <Box flexDirection="column">
      <Text color="cyan">Console Mode Selected - See Above</Text>
      <Text color="gray">Press 1-9 to select model or q to quit</Text>
    </Box>
  );
};