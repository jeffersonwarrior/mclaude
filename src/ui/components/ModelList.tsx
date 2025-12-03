import React from 'react';
import { Box, Text, Newline } from 'ink';
import { ModelInfoImpl } from '../../models';

interface ModelListProps {
  models: ModelInfoImpl[];
  selectedIndex?: number;
  showCategories?: boolean;
  showProviderBadges?: boolean;
  providerFilter?: string[];
}

/**
 * Get provider color scheme for highlighting
 */
const getProviderColor = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case 'synthetic': return 'cyan';
    case 'minimax': return 'red';
    default: return 'gray';
  }
};

/**
 * Get provider-specific model highlighting style
 */
const getModelHighlightStyle = (model: ModelInfoImpl, isSelected: boolean): { color: string; bold?: boolean } => {
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

export const ModelList: React.FC<ModelListProps> = ({
  models,
  selectedIndex,
  showCategories = false,
  showProviderBadges = true,
  providerFilter = []
}) => {

  // Filter models by provider if filter is specified
  const filteredModels = providerFilter.length > 0
    ? models.filter(model => providerFilter.includes(model.getProvider().toLowerCase()))
    : models;
  if (filteredModels.length === 0) {
    if (providerFilter.length > 0) {
      return (
        <Box flexDirection="column">
          <Text color="yellow">No models available for the selected providers.</Text>
          <Newline />
          <Text color="gray">Filtered by: {providerFilter.join(', ')}</Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Text color="gray">No models available.</Text>
        <Newline />
        <Text color="gray">Try running 'synclaude models --refresh' to update the model list.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {filteredModels.map((model, index) => {
        const provider = model.getProvider();
        const providerColor = getProviderColor(provider);
        const textStyle = getModelHighlightStyle(model, selectedIndex === index);
        const isThinkingModel = model.id.toLowerCase().includes('thinking');

        return (
          <Box key={model.id} marginBottom={1}>
            <Box flexDirection="column">
              {/* Main model line with provider badge */}
              <Box>
                <Text color={textStyle.color} bold={textStyle.bold}>
                  {selectedIndex === index ? '➤ ' : '  '}
                  {index + 1}. {model.getDisplayName()}
                </Text>

                {showProviderBadges && (
                  <>
                    <Text color={providerColor} bold>
                      [{model.getProviderTag()}]
                    </Text>
                    {provider === 'minimax' && (
                      <Text color="red"> 〰️</Text>
                    )}
                  </>
                )}

                {isThinkingModel && (
                  <Text color="magenta"> 🤔</Text>
                )}
              </Box>

              {/* Model details */}
              <Box marginLeft={4} flexDirection="column">
                <Text color="gray" dimColor>
                  Provider: <Text color={providerColor}>{provider}</Text>
                  {model.context_length && <> | Context: {Math.round(model.context_length / 1024)}K tokens</>}
                  {model.quantization && <> | Quantization: {model.quantization}</>}
                  {isThinkingModel && <> | Type: thinking</>}
                </Text>

                {model.owned_by && (
                  <Text color="gray" dimColor>
                    Owner: {model.owned_by}
                  </Text>
                )}

                {/* Provider-specific capabilities */}
                {showProviderBadges && model.getProviderCapabilities().length > 0 && (
                  <Text color="gray" dimColor>
                    Capabilities: {model.getProviderCapabilities().slice(0, 3).join(', ')}
                    {model.getProviderCapabilities().length > 3 && ` +${model.getProviderCapabilities().length - 3} more`}
                  </Text>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};