/**
 * Robust ModelSelector with automatic fallback mechanisms
 * Tries different UI approaches and falls back when errors occur
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import { ModelInfoImpl } from '../../models';
import {
  SimpleNumberedListSelector,
  MinimalArrowSelector,
  ConsoleBasedSelector
} from './FallbackModelSelector';

// Import the original ModelSelector for fallback (but without complex Text components)
import { ModelSelector } from './ModelSelector';

interface RobustModelSelectorProps {
  models: ModelInfoImpl[];
  onSelect: (regularModel: ModelInfoImpl | null, thinkingModel: ModelInfoImpl | null) => void;
  onSelectSubagent?: (model: ModelInfoImpl | null) => void;
  onSelectFast?: (model: ModelInfoImpl | null) => void;
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

type SelectionMode = 'advanced' | 'numbered' | 'minimal' | 'console';

export const RobustModelSelector: React.FC<RobustModelSelectorProps> = ({
  models,
  onSelect,
  onSelectSubagent,
  onSelectFast,
  onCancel,
  ...restProps
}) => {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('minimal');
  const [errorCount, setErrorCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const { exit } = useApp();
  const stdout = useStdout();

  // Use models directly instead of creating safe wrapper to maintain type compatibility

  // Auto-fallback logic
  useEffect(() => {
    if (errorCount >= 2) {
      console.log('Multiple UI errors detected, switching to fallback mode...');
      if (selectionMode === 'minimal') {
        setSelectionMode('console');
      } else if (selectionMode === 'console') {
        setSelectionMode('numbered');
      }
      setErrorCount(0);
    }
  }, [errorCount, selectionMode]);

  const handleError = useCallback((error: Error) => {
    console.error('UI Error in ModelSelector:', error);
    setLastError(error.message);
    setErrorCount(prev => prev + 1);

    // Immediate fallback for critical errors
    if (error.message.includes('empty string') || error.message.includes('Text')) {
      console.log('Text component error detected, switching to console mode...');
      setSelectionMode('console');
    }
  }, []);

  const handleManualFallback = useCallback(() => {
    const modes: SelectionMode[] = ['minimal', 'console', 'numbered', 'advanced'];
    const currentIndex = modes.indexOf(selectionMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setSelectionMode(modes[nextIndex] || 'minimal');
    setErrorCount(0);
    setLastError(null);
  }, [selectionMode]);

  // Keyboard shortcuts for manual fallback
  useInput((input, key) => {
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
          return (
            <ErrorBoundary
              onError={(error) => {
                handleError(error);
                setSelectionMode('minimal'); // Immediate fallback
              }}
              fallback={() => <MinimalArrowSelector {...commonProps} />}
            >
              <ModelSelector
                models={models}
                onSelect={onSelect}
                onCancel={onCancel}
                {...restProps}
              />
            </ErrorBoundary>
          );

        case 'minimal':
          return <MinimalArrowSelector {...commonProps} />;

        case 'numbered':
          return <SimpleNumberedListSelector {...commonProps} />;

        case 'console':
          return <ConsoleBasedSelector {...commonProps} />;

        default:
          return <MinimalArrowSelector {...commonProps} />;
      }
    } catch (error) {
      console.error('Critical error in renderSelector:', error);
      // Final fallback - always works
      return <MinimalArrowSelector models={models} onSelect={onSelect} onSelectSubagent={onSelectSubagent} onSelectFast={onSelectFast} onCancel={onCancel} />;
    }
  };

  // Status display
  const renderStatus = () => {
    if (lastError) {
      return (
        <Box marginBottom={1}>
          <Text color="red">UI Error: {lastError}</Text>
          <Text color="yellow"> Press Ctrl+F to try different selection mode</Text>
        </Box>
      );
    }

    const modeDescriptions = {
      advanced: 'Advanced UI',
      minimal: 'Minimal Arrow UI',
      numbered: 'Numbered List UI',
      console: 'Console UI'
    };

    return (
      <Box marginBottom={1} justifyContent="flex-end">
        <Text color="gray" dimColor>
          Mode: {modeDescriptions[selectionMode]} | Ctrl+F: Switch Mode
          {errorCount > 0 && ` | Errors: ${errorCount}`}
        </Text>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" width="100%">
      <Box flexDirection="column">
        {renderStatus()}
        {renderSelector()}
      </Box>
    </Box>
  );
};

// Simple error boundary component for React
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: () => React.ReactNode;
  onError: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.props.onError(error);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback();
    }
    return this.props.children;
  }
}

export default RobustModelSelector;