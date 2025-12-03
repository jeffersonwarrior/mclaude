import React from 'react';
import { Box, Text } from 'ink';

/**
 * Get provider visual indicators
 */
const getProviderIndicators = (provider: string) => {
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
const getStatusIndicators = (enabled: boolean, connected?: boolean, hasError?: boolean) => {
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

export interface ProviderStatus {
  provider: string;
  enabled: boolean;
  connected?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  modelCount?: number;
  lastChecked?: Date;
}

export interface ProviderStatusProps {
  providers: ProviderStatus[];
  showDetails?: boolean;
  compact?: boolean;
}

export const ProviderStatusIndicator: React.FC<ProviderStatusProps> = ({
  providers,
  showDetails = false,
  compact = false
}) => {
  if (providers.length === 0) {
    return null;
  }

  if (compact) {
    // Compact version: single line with status summary
    return (
      <Box>
        <Text color="gray">Providers: </Text>
        {providers.map((provider, index) => {
          const providerIndicators = getProviderIndicators(provider.provider);
          const statusIndicators = getStatusIndicators(provider.enabled, provider.connected, provider.hasError);

          return (
            <React.Fragment key={provider.provider}>
              {index > 0 && <Text color="gray"> | </Text>}
              <Text color={statusIndicators.color}>
                {providerIndicators.icon} {providerIndicators.tag} {statusIndicators.icon}
              </Text>
              {provider.modelCount !== undefined && (
                <Text color="gray"> ({provider.modelCount})</Text>
              )}
            </React.Fragment>
          );
        })}
      </Box>
    );
  }

  // Detailed version: multi-line with full information
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan" bold>Provider Status:</Text>
      </Box>

      {providers.map(provider => {
        const providerIndicators = getProviderIndicators(provider.provider);
        const statusIndicators = getStatusIndicators(provider.enabled, provider.connected, provider.hasError);

        return (
          <Box key={provider.provider} marginLeft={2} marginBottom={1}>
            <Box flexDirection="column">
              <Box>
                <Text color={providerIndicators.color} bold>
                  {providerIndicators.icon} {providerIndicators.tag}
                </Text>
                <Text> </Text>
                <Text color={statusIndicators.color}>
                  {statusIndicators.icon} {statusIndicators.status}
                </Text>
                {provider.modelCount !== undefined && (
                  <Text color="gray"> ({provider.modelCount} models)</Text>
                )}
              </Box>

              {showDetails && (
                <Box marginLeft={4} flexDirection="column">
                  <Text color="gray" dimColor>
                    API Key: {provider.enabled ? 'Configured' : 'Not configured'}
                  </Text>
                  {provider.connected !== undefined && (
                    <Text color="gray" dimColor>
                      Connection: {provider.connected ? 'Connected' : 'Disconnected'}
                    </Text>
                  )}
                  {provider.errorMessage && (
                    <Text color="red" dimColor>
                      Error: {provider.errorMessage}
                    </Text>
                  )}
                  {provider.lastChecked && (
                    <Text color="gray" dimColor>
                      Last checked: {provider.lastChecked.toLocaleTimeString()}
                    </Text>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

/**
 * Get summary status text for quick display
 */
export const getProviderSummary = (providers: ProviderStatus[]): string => {
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