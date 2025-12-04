import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import { ModelInfoImpl } from '../../models';
import { ModelSelectorErrorBoundary } from './ModelSelectorErrorBoundary';

interface ModelSelectorProps {
  models: ModelInfoImpl[];
  onSelect: (regularModel: ModelInfoImpl | null, thinkingModel: ModelInfoImpl | null) => void;
  onCancel: () => void;
  searchPlaceholder?: string;
  initialRegularModel?: ModelInfoImpl | null;
  initialThinkingModel?: ModelInfoImpl | null;
  enabledProviders?: string[];
  authenticationError?: string | null;
  providerStatus?: {
    synthetic: { available: boolean; lastChecked?: Date };
    minimax: { available: boolean; lastChecked?: Date };
  };
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
 * Get unique providers from models
 */
const getUniqueProviders = (models: ModelInfoImpl[]): string[] => {
  return [...new Set(models.map(model => model.getProvider().toLowerCase()))].filter(p => p); // Filter out empty/undefined values
};

/**
 * Authentication Error View component
 */
const AuthenticationErrorView: React.FC<{ error: string; onCancel: () => void }> = ({ error, onCancel }) => {
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      onCancel();
      exit();
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="red" bold>Authentication Error</Text>
      </Box>
      <Box marginBottom={1}>
        <Text color="yellow">{error}</Text>
      </Box>
      <Box marginBottom={1}>
        <Text color="gray">Please check your API credentials and try again.</Text>
      </Box>
      <Box marginBottom={1}>
        <Text color="gray">Run 'mclaude setup' to reconfigure your credentials.</Text>
      </Box>
      <Box>
        <Text color="gray">Press 'q' to quit or Escape to cancel</Text>
      </Box>
    </Box>
  );
};

/**
 * Provider Status Badge component
 */
const ProviderStatusBadge: React.FC<{
  provider: string;
  available: boolean;
  lastChecked?: Date;
}> = ({ provider, available, lastChecked }) => {
  const getStatusColor = () => {
    return available ? 'green' : 'red';
  };

  const getStatusIcon = () => {
    return available ? '●' : '●';
  };

  const formatLastChecked = () => {
    if (!lastChecked) return '';
    const now = new Date();
    const diffMs = now.getTime() - lastChecked.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return '(just now)';
    if (diffMins < 60) return `(${diffMins}m ago)`;
    if (diffMins < 1440) return `(${Math.floor(diffMins / 60)}h ago)`;
    return `(${Math.floor(diffMins / 1440)}d ago)`;
  };

  const providerColor = getProviderColor(provider);

  return (
    <Box>
      <Text color={getStatusColor()} bold>
        {getStatusIcon()}
      </Text>
      <Text color={providerColor} bold={available}>
        {" "}{provider.charAt(0).toUpperCase() + provider.slice(1)}
      </Text>
      {formatLastChecked() && (
        <Text color="gray" dimColor>
          {' '}{formatLastChecked()}
        </Text>
      )}
    </Box>
  );
};

/**
 * Provider Status Panel component
 */
const ProviderStatusPanel: React.FC<{
  providerStatus?: {
    synthetic: { available: boolean; lastChecked?: Date };
    minimax: { available: boolean; lastChecked?: Date };
  };
}> = ({ providerStatus }) => {
  if (!providerStatus) {
    return null;
  }

  const availableCount = [
    providerStatus.synthetic.available,
    providerStatus.minimax.available
  ].filter(Boolean).length;

  return (
    <Box marginBottom={1} flexDirection="column">
      <Box marginBottom={1}>
        <Text color="gray">
          Provider Status ({availableCount}/2 available):
        </Text>
      </Box>
      <Box marginLeft={2}>
        <ProviderStatusBadge
          provider="synthetic"
          available={providerStatus.synthetic.available}
          lastChecked={providerStatus.synthetic.lastChecked}
        />
        <ProviderStatusBadge
          provider="minimax"
          available={providerStatus.minimax.available}
          lastChecked={providerStatus.minimax.lastChecked}
        />
      </Box>
    </Box>
  );
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  onSelect,
  onCancel,
  searchPlaceholder = 'Search models...',
  initialRegularModel = null,
  initialThinkingModel = null,
  enabledProviders = [],
  authenticationError = null,
  providerStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredModels, setFilteredModels] = useState<ModelInfoImpl[]>(models);
  const [providerFilter, setProviderFilter] = useState<string[]>([]);
  const [selectedRegularModel, setSelectedRegularModel] = useState<ModelInfoImpl | null>(initialRegularModel);
  const [selectedThinkingModel, setSelectedThinkingModel] = useState<ModelInfoImpl | null>(initialThinkingModel);

  const { exit } = useApp();
  const { write } = useStdout();

  // Get available providers
  const availableProviders = getUniqueProviders(models);
  const activeProviderFilter = providerFilter.length > 0 ? providerFilter : availableProviders;

  // Filter models based on search query and provider filter
  useEffect(() => {
    let filtered = models;

    // Apply provider filter first
    if (activeProviderFilter.length > 0 && activeProviderFilter.length < availableProviders.length) {
      filtered = filtered.filter(model =>
        activeProviderFilter.includes(model.getProvider().toLowerCase())
      );
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
  const toggleProviderFilter = useCallback((provider: string) => {
    setProviderFilter(prev => {
      const lowerProvider = provider.toLowerCase();
      if (prev.includes(lowerProvider)) {
        return prev.filter(p => p !== lowerProvider);
      } else {
        return [...prev, lowerProvider];
      }
    });
  }, []);

  // Clear all provider filters
  const clearProviderFilter = useCallback(() => {
    setProviderFilter([]);
  }, []);

  // Calculate visible range for better scrolling
  const visibleStartIndex = Math.max(0, selectedIndex - 5);
  const visibleEndIndex = Math.min(filteredModels.length, selectedIndex + 6);
  const visibleModels = filteredModels.slice(visibleStartIndex, visibleEndIndex);

  // Handle keyboard input
  useInput((input, key) => {
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
          } else {
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
          } else {
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
    return <AuthenticationErrorView error={authenticationError} onCancel={onCancel} />;
  }

  if (models.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: No models available</Text>
        <Text color="gray">Press 'q' to quit or Escape to cancel</Text>
      </Box>
    );
  }

  return (
    <ModelSelectorErrorBoundary
      onError={(error, errorInfo) => {
        console.error('ModelSelector Error:', error, errorInfo);
      }}
      onCancel={onCancel}
    >
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="cyan">Select Models:</Text>
        </Box>

        {/* Provider Status Panel */}
        <ProviderStatusPanel providerStatus={providerStatus} />

      {/* Selection status */}
      <Box marginBottom={1}>
        <Text color="gray">
          Regular: {(() => {
            if (!selectedRegularModel) return "none";
            const displayName = selectedRegularModel.getDisplayName().trim();
            const providerTag = selectedRegularModel.getProviderTag().trim();
            return displayName && providerTag ? `${displayName} [${providerTag}]` : displayName || "unknown";
          })()} |
          Thinking: {(() => {
            if (!selectedThinkingModel) return "none";
            const displayName = selectedThinkingModel.getDisplayName().trim();
            const providerTag = selectedThinkingModel.getProviderTag().trim();
            return displayName && providerTag ? `${displayName} [${providerTag}]` : displayName || "unknown";
          })()}
        </Text>
      </Box>

      {/* Provider filters */}
      {!searchQuery && availableProviders.length > 1 && (
        <Box marginBottom={1} flexDirection="column">
          <Box marginBottom={1}>
            <Text color="gray">Provider Filters: </Text>
            {availableProviders.map((provider, index) => {
              const isActive = activeProviderFilter.includes(provider);
              const providerColor = getProviderColor(provider);
              return (
                <React.Fragment key={provider}>
                  <Text
                    color={isActive ? providerColor : 'gray'}
                    bold={isActive}
                  >
                    {index + 1}.{provider.charAt(0).toUpperCase() + provider.slice(1)}{isActive ? '✓' : ''}{" "}
                  </Text>
                </React.Fragment>
              );
            })}
            {providerFilter.length > 0 && (
              <>
                <Text color="gray">| </Text>
                <Text color="yellow">c:Clear</Text>
              </>
            )}
          </Box>
        </Box>
      )}

      <Box marginBottom={1}>
        <Text color="gray">
          Search: {searchQuery || "(type to search)"}
          {activeProviderFilter.length < availableProviders.length && (
            <> | Filters: {activeProviderFilter.join(', ')}</>
          )}
        </Text>
      </Box>

      {filteredModels.length > 0 ? (
        <>
          <Box marginBottom={1}>
            <Text color="gray">
              Found {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''}
            </Text>
          </Box>

          {/* Show scroll indicators if needed */}
          {visibleStartIndex > 0 && (
            <Box marginBottom={1}>
              <Text color="gray">▲ {visibleStartIndex} more above</Text>
            </Box>
          )}

          {visibleModels.map((model, index) => {
            const actualIndex = visibleStartIndex + index;
            const isRegularSelected = selectedRegularModel?.id === model.id;
            const isThinkingSelected = selectedThinkingModel?.id === model.id;
            const provider = model.getProvider();
            const providerColor = getProviderColor(provider);
            const isThinkingModel = model.id.toLowerCase().includes('thinking');
            const isSelected = actualIndex === selectedIndex;

            // Selection indicators
            const getSelectionIndicator = () => {
              if (isRegularSelected && isThinkingSelected) return '[R,T] ';
              if (isRegularSelected) return '[R] ';
              if (isThinkingSelected) return '[T] ';
              return '    ';
            };

            // Get text style based on selection and provider
            const getTextStyle = () => {
              if (isSelected) return { color: 'green', bold: true as const };
              if (isRegularSelected) return { color: 'cyan', bold: true as const };
              if (isThinkingSelected) return { color: 'yellow', bold: true as const };
              return { color: providerColor, bold: false as const };
            };

            const textStyle = getTextStyle();

            return (
              <Box key={model.id} marginBottom={1}>
                <Box flexDirection="column">
                  {/* Main model line with provider badge */}
                  <Box>
                    <Text color={textStyle.color} bold={textStyle.bold}>
                      {isSelected ? '▸ ' : '  '}
                      {getSelectionIndicator()}
                      {actualIndex + 1}. {model.getDisplayName()}{" "}
                    </Text>
                    <Text color={providerColor} bold={!isSelected}>
                      [{model.getProviderTag()}]
                    </Text>

                    {model.getProvider().toLowerCase() === 'minimax' && (
                      <Text color="red"> 〰️</Text>
                    )}

                    {isThinkingModel && (
                      <Text color="magenta"> 🤔</Text>
                    )}
                  </Box>

                  {/* Model details */}
                  <Box marginLeft={4} flexDirection="column">
                    <Text color="gray" dimColor>
                      Provider: <Text color={providerColor}>{provider}</Text>
                      {model.context_length && <> | Context: {Math.round(model.context_length / 1024)}K</>}
                      {model.quantization && <> | {model.quantization}</>}
                      {isThinkingModel && <> | Type: thinking</>}
                      {model.owned_by && <> | Owner: {model.owned_by}</>}
                    </Text>

                    {/* Provider capabilities */}
                    {!isSelected && model.getProviderCapabilities().length > 0 && (
                      <Text color="gray" dimColor>
                        Capabilities: {model.getProviderCapabilities().slice(0, 2).join(', ')}
                        {model.getProviderCapabilities().length > 2 && ` +${model.getProviderCapabilities().length - 2} more`}
                      </Text>
                    )}

                    {/* Enhanced details for selected model */}
                    {isSelected && (
                      <Text color="gray" dimColor>
                        ID: {model.id}
                        {model.isClaudeCompatible() && <> | Claude-compatible ✓</>}
                      </Text>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}

          {/* Show scroll indicators if needed */}
          {visibleEndIndex < filteredModels.length && (
            <Box marginBottom={1}>
              <Text color="gray">▼ {filteredModels.length - visibleEndIndex} more below</Text>
            </Box>
          )}

          <Box marginTop={1}>
            <Text color="gray">
              ↑↓ Navigate | Space: Select Regular | t: Select Thinking | Enter: Launch | q: Quit
            </Text>
            {!searchQuery && availableProviders.length > 1 && (
              <Text color="gray">
                │ 1-{availableProviders.length}: Toggle Provider Filters | c: Clear Filters | Type to Search
              </Text>
            )}
            {searchQuery && (
              <Text color="gray">
                │ Esc: Clear Search | Backspace: Delete char | {availableProviders.length > 1 && 'c: Clear Filters when done'}
              </Text>
            )}
          </Box>
        </>
      ) : (
        <Box flexDirection="column">
          <Text color="yellow">No models match your search.</Text>
          <Text color="gray">Try different search terms.</Text>
        </Box>
      )}
      </Box>
    </ModelSelectorErrorBoundary>
  );
};