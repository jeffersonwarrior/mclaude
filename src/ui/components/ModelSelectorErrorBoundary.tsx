import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { ErrorBoundary } from './ErrorBoundary';

interface ModelSelectorErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onCancel?: () => void;
}

/**
 * Error boundary with retry functionality specifically for ModelSelector
 */
export const ModelSelectorErrorBoundary: React.FC<ModelSelectorErrorBoundaryProps> = ({
  children,
  onError,
  onCancel
}) => {
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = useCallback(() => {
    setRetryKey(prev => prev + 1);
  }, []);

  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    if (onError) {
      onError(error, errorInfo);
    }
    console.error('ModelSelector Error:', error, errorInfo);
  }, [onError]);

  const fallbackUI = (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="red">
      <Box marginBottom={1}>
        <Text color="red" bold>UI Error Occurred</Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="yellow">
          The model selection interface encountered an error.
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray" dimColor>
          This is likely a terminal compatibility issue or a temporary glitch.
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">
          Recovery options:
        </Text>
      </Box>

      <Box marginLeft={2} flexDirection="column" marginBottom={1}>
        <Text color="gray">• Press 'r' to retry the UI</Text>
        <Text color="gray">• Press 'q' or ESC to exit</Text>
        <Text color="gray">• Try: TERM=xterm-256color mclaude models</Text>
        <Text color="gray">• Try: mclaude --model &lt;model-id&gt; (skip UI)</Text>
      </Box>

      <Box>
        <Text color="cyan" bold>
          Controls: r=retry, q/ESC=exit
        </Text>
      </Box>
    </Box>
  );

  const ErrorBoundaryWithRetry: React.FC<{ children: React.ReactNode }> = ({ children: content }) => {
    return (
      <ErrorBoundary
        key={retryKey}
        fallback={fallbackUI}
        onError={handleError}
      >
        {content}
      </ErrorBoundary>
    );
  };

  // Handle keyboard input for retry
  useInput((input, key) => {
    if (input === 'r') {
      handleRetry();
    } else if (input === 'q' || key.escape) {
      if (onCancel) {
        onCancel();
      }
    }
  });

  return (
    <ErrorBoundaryWithRetry>
      {children}
    </ErrorBoundaryWithRetry>
  );
};