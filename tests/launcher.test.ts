import { ClaudeLauncher, LaunchOptions, LaunchResult } from '../src/launcher/claude-launcher';
import { ConfigManager } from '../src/config/manager';
import { ModelInfoImpl } from '../src/models/info';
import { ProviderType } from '../src/config/types';

// Mock spawn for testing
jest.mock('child_process', () => ({
  ...jest.requireActual('child_process'),
  spawn: jest.fn(),
  exec: jest.fn(),
}));

import { spawn } from 'child_process';

const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe('ClaudeLauncher', () => {
  let configManager: jest.Mocked<ConfigManager>;
  let launcher: ClaudeLauncher;
  let mockChildProcess: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock child process
    mockChildProcess = {
      on: jest.fn((event, callback) => {
        if (event === 'spawn') {
          setTimeout(callback, 0); // Simulate successful spawn
        }
      }),
      pid: 12345,
    };

    mockSpawn.mockReturnValue(mockChildProcess);

    // Mock ConfigManager with full multi-provider support
    configManager = {
      isProviderEnabled: jest.fn(),
      getProviderConfig: jest.fn(),
      getEffectiveApiKey: jest.fn(),
      getSyntheticApiKey: jest.fn(),
      getMinimaxApiKey: jest.fn(),
      config: {
        defaultProvider: 'auto',
        providers: {
          synthetic: {
            apiKey: 'synthetic-key',
            anthropicBaseUrl: 'https://api.synthetic.new/anthropic',
            modelsApiUrl: 'https://api.synthetic.new/openai/v1/models',
            enabled: true,
          },
          minimax: {
            apiKey: 'minimax-key',
            anthropicBaseUrl: 'https://api.minimax.io/anthropic',
            modelsApiUrl: 'https://api.minimax.io/v1/models',
            enabled: true,
          },
        },
      },
    } as any;

    // Default provider config
    configManager.isProviderEnabled.mockReturnValue(true);
    configManager.getProviderConfig.mockImplementation((provider) => {
      const configs: any = {
        synthetic: {
          anthropicBaseUrl: 'https://api.synthetic.new/anthropic',
        },
        minimax: {
          anthropicBaseUrl: 'https://api.minimax.io/anthropic',
        },
      };
      return configs[provider as string] || null;
    });
    configManager.getEffectiveApiKey.mockImplementation((provider) => {
      const keys: any = {
        synthetic: 'synthetic-key',
        minimax: 'minimax-key',
      };
      return keys[provider as string] || '';
    });

    launcher = new ClaudeLauncher('claude', configManager);
  });

  describe('constructor', () => {
    it('should create launcher with default claude path', () => {
      const testLauncher = new ClaudeLauncher();
      expect(testLauncher).toBeDefined();
    });

    it('should create launcher with custom claude path', () => {
      const testLauncher = new ClaudeLauncher('/custom/claude');
      expect(testLauncher).toBeDefined();
    });

    it('should create launcher with config manager', () => {
      const testLauncher = new ClaudeLauncher('claude', configManager);
      expect(testLauncher).toBeDefined();
    });
  });

  describe('provider resolution', () => {
    it('should resolve provider from explicit option', async () => {
      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'minimax',
      };

      // Access private method for testing
      const resolveProvider = (launcher as any).resolveProvider.bind(launcher);
      const provider = resolveProvider(options);

      expect(provider).toBe('minimax');
    });

    it('should resolve provider from modelInfo', async () => {
      const modelInfo = new ModelInfoImpl({
        id: 'synthetic:claude-3-sonnet',
        object: 'model',
        provider: 'synthetic',
      });

      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        modelInfo,
      };

      const resolveProvider = (launcher as any).resolveProvider.bind(launcher);
      const provider = resolveProvider(options);

      expect(provider).toBe('synthetic');
    });

    it('should resolve provider from model ID format', async () => {
      const options: LaunchOptions = {
        model: 'minimax:MiniMax-M2',
      };

      const resolveProvider = (launcher as any).resolveProvider.bind(launcher);
      const provider = resolveProvider(options);

      expect(provider).toBe('minimax');
    });

    it('should fallback to synthetic when provider cannot be determined', async () => {
      const options: LaunchOptions = {
        model: 'claude-3-sonnet',
      };

      const resolveProvider = (launcher as any).resolveProvider.bind(launcher);
      const provider = resolveProvider(options);

      expect(provider).toBe('synthetic');
    });
  });

  describe('thinking model provider resolution', () => {
    it('should resolve thinking model provider from model ID', async () => {
      const thinkingModel = 'synthetic:claude-3-sonnet-thinking';

      const resolveThinkingProvider = (launcher as any).resolveThinkingProvider.bind(launcher);
      const provider = resolveThinkingProvider(thinkingModel, 'minimax');

      expect(provider).toBe('synthetic');
    });

    it('should use default provider for thinking model when not specified', async () => {
      const thinkingModel = 'claude-3-thinking';

      const resolveThinkingProvider = (launcher as any).resolveThinkingProvider.bind(launcher);
      const provider = resolveThinkingProvider(thinkingModel, 'synthetic');

      expect(provider).toBe('synthetic');
    });
  });

  describe('environment configuration', () => {
    beforeEach(() => {
      configManager.isProviderEnabled.mockReturnValue(true);
      configManager.getProviderConfig.mockImplementation((provider) => {
        if (provider === 'synthetic') {
          return {
            anthropicBaseUrl: 'https://api.synthetic.new/anthropic',
            modelsApiUrl: 'https://api.synthetic.new/openai/v1/models',
          };
        }
        if (provider === 'minimax') {
          return {
            anthropicBaseUrl: 'https://api.minimax.io/anthropic',
            modelsApiUrl: 'https://api.minimax.io/v1/models',
          };
        }
        return null;
      });
      configManager.getEffectiveApiKey.mockImplementation((provider) => {
        if (provider === 'synthetic') return 'synthetic-key';
        if (provider === 'minimax') return 'minimax-key';
        return null;
      });
    });

    it('should configure environment for synthetic provider', async () => {
      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
      };

      const createClaudeEnvironment = (launcher as any).createClaudeEnvironment.bind(launcher);
      const env = await createClaudeEnvironment(options);

      expect(env.ANTHROPIC_BASE_URL).toBe('http://127.0.0.1:9313');
      expect(env.ANTHROPIC_API_KEY).toBe('sk-master');
      expect(env.ANTHROPIC_MODEL).toBe('synthetic:claude-3-sonnet');
      expect(env.CLAUDE_CODE_SUBAGENT_MODEL).toBeTruthy();
    });

    it('should configure environment for minimax provider', async () => {
      const options: LaunchOptions = {
        model: 'minimax:MiniMax-M2',
        provider: 'minimax',
      };

      const createClaudeEnvironment = (launcher as any).createClaudeEnvironment.bind(launcher);
      const env = await createClaudeEnvironment(options);

      expect(env.ANTHROPIC_BASE_URL).toBe('http://127.0.0.1:9313');
      expect(env.ANTHROPIC_API_KEY).toBe('sk-master');
      expect(env.ANTHROPIC_MODEL).toBe('minimax:MiniMax-M2');
      expect(env.CLAUDE_CODE_REQUEST_TIMEOUT).toBe('3000000');
    });
    });

    it('should configure hybrid environment with different providers', async () => {
      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
        thinkingModel: 'minimax:MiniMax-M2',
      };

      const createClaudeEnvironment = (launcher as any).createClaudeEnvironment.bind(launcher);
      const env = await createClaudeEnvironment(options);

      expect(env.ANTHROPIC_BASE_URL).toBe('http://127.0.0.1:9313');
      expect(env.ANTHROPIC_API_KEY).toBe('sk-master');
      expect(env.ANTHROPIC_MODEL).toBe('synthetic:claude-3-sonnet');
      expect(env.ANTHROPIC_THINKING_MODEL).toBe('minimax:MiniMax-M2');
    });

    it('should apply provider-specific optimizations', () => {
      const minimaxOptions: LaunchOptions = {
        model: 'minimax:MiniMax-M2',
        provider: 'minimax',
      };

      const syntheticOptions: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
      };

      const createClaudeEnvironment = (launcher as any).createClaudeEnvironment.bind(launcher);

      const minimaxEnv = await createClaudeEnvironment(minimaxOptions);
      const syntheticEnv = await createClaudeEnvironment(syntheticOptions);

      // MiniMax optimizations
      expect(minimaxEnv.CLAUDE_CODE_REQUEST_TIMEOUT).toBe('3000000');

      // Synthetic optimizations
      expect(syntheticEnv.CLAUDE_CODE_REQUEST_TIMEOUT).toBe('600000');

      // Common optimizations
      expect(minimaxEnv.CLAUDE_CODE_ENABLE_STREAMING).toBe('1');
      expect(syntheticEnv.CLAUDE_CODE_ENABLE_STREAMING).toBe('1');
    });
  });

  describe('environment validation', () => {
    beforeEach(() => {
      configManager.isProviderEnabled.mockReturnValue(true);
      configManager.getEffectiveApiKey.mockReturnValue('test-key');
      configManager.getProviderConfig.mockReturnValue({
        anthropicBaseUrl: 'https://test.anthropic.com',
        modelsApiUrl: 'https://test.models.com',
      });
    });

    it('should validate valid environment', async () => {
      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
      };

      const validateEnvironment = (launcher as any).validateEnvironment.bind(launcher);
      const result = await validateEnvironment(options);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect disabled provider', async () => {
      configManager.isProviderEnabled.mockReturnValue(false);

      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
      };

      const validateEnvironment = (launcher as any).validateEnvironment.bind(launcher);
      const result = await validateEnvironment(options);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Provider \'synthetic\' is not enabled');
    });

    it('should detect missing API key', async () => {
      configManager.getEffectiveApiKey.mockReturnValue('');

      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
      };

      const validateEnvironment = (launcher as any).validateEnvironment.bind(launcher);
      const result = await validateEnvironment(options);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No API key configured for provider \'synthetic\'');
    });

    it('should validate thinking model configuration', async () => {
      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
        thinkingModel: 'minimax:MiniMax-M2',
      };

      configManager.isProviderEnabled.mockImplementation((provider) => {
        return provider === 'synthetic'; // minimax disabled
      });

      const validateEnvironment = (launcher as any).validateEnvironment.bind(launcher);
      const result = await validateEnvironment(options);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Thinking model provider \'minimax\' is not enabled');
    });
  });

  describe('fallback mechanism', () => {
    beforeEach(() => {
      configManager.isProviderEnabled.mockImplementation((provider) => {
        return provider === 'synthetic'; // only synthetic enabled
      });
      configManager.getEffectiveApiKey.mockImplementation((provider) => {
        return provider === 'synthetic' ? 'synthetic-key' : '';
      });
      configManager.getProviderConfig.mockImplementation((provider) => {
        if (provider === 'synthetic') {
          return {
            anthropicBaseUrl: 'https://api.synthetic.new/anthropic',
            modelsApiUrl: 'https://api.synthetic.new/openai/v1/models',
          };
        }
        return null;
      });
    });

    it('should find fallback provider', () => {
      const getFallbackProvider = (launcher as any).getFallbackProvider.bind(launcher);
      const fallback = getFallbackProvider('minimax');

      expect(fallback).toBe('synthetic');
    });

    it('should return null when no fallback available', () => {
      configManager.isProviderEnabled.mockReturnValue(false);

      const getFallbackProvider = (launcher as any).getFallbackProvider.bind(launcher);
      const fallback = getFallbackProvider('minimax');

      expect(fallback).toBeNull();
    });

    it('should use fallback when primary provider fails validation', async () => {
      // Mock successful spawn
      mockSpawn.mockReturnValue({
        on: jest.fn((event, callback) => {
          if (event === 'spawn') callback();
        }),
        pid: 12345,
      } as any);

      const options: LaunchOptions = {
        model: 'minimax:MiniMax-M2',
        provider: 'minimax',
      };

      // MiniMax provider not enabled, should fallback to synthetic
      const result = await launcher.launchClaudeCode(options);

      expect(mockSpawn).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.pid).toBe(12345);
    });
  });

  describe('launch process', () => {
    beforeEach(() => {
      configManager.isProviderEnabled.mockReturnValue(true);
      configManager.getEffectiveApiKey.mockReturnValue('test-key');
      configManager.getProviderConfig.mockReturnValue({
        anthropicBaseUrl: 'https://test.anthropic.com',
        modelsApiUrl: 'https://test.models.com',
      });
    });

    it('should launch Claude Code successfully', async () => {
      mockSpawn.mockReturnValue({
        on: jest.fn((event, callback) => {
          if (event === 'spawn') callback();
        }),
        pid: 12345,
      } as any);

      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
      };

      const result = await launcher.launchClaudeCode(options);

      expect(result.success).toBe(true);
      expect(result.pid).toBe(12345);
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [],
        expect.objectContaining({
          env: expect.objectContaining({
            ANTHROPIC_BASE_URL: 'https://test.anthropic.com',
            ANTHROPIC_AUTH_TOKEN: 'test-key',
            ANTHROPIC_DEFAULT_MODEL: 'synthetic:claude-3-sonnet',
            CLAUDE_CODE_SUBAGENT_MODEL: 'synthetic:claude-3-sonnet',
            CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
          }),
        })
      );
    });

    it('should handle spawn failure', async () => {
      mockSpawn.mockReturnValue({
        on: jest.fn((event, callback) => {
          if (event === 'error') callback(new Error('Claude not found'));
        }),
      } as any);

      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
      };

      const result = await launcher.launchClaudeCode(options);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Claude not found');
    });

    it('should propagate additional environment variables', async () => {
      mockSpawn.mockReturnValue({
        on: jest.fn((event, callback) => {
          if (event === 'spawn') callback();
        }),
        pid: 12345,
      } as any);

      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
        env: {
          CUSTOM_VAR: 'custom-value',
          ANOTHER_VAR: 'another-value',
        },
      };

      await launcher.launchClaudeCode(options);

      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [],
        expect.objectContaining({
          env: expect.objectContaining({
            CUSTOM_VAR: 'custom-value',
            ANOTHER_VAR: 'another-value',
          }),
        })
      );
    });

    it('should propagate additional arguments', async () => {
      mockSpawn.mockReturnValue({
        on: jest.fn((event, callback) => {
          if (event === 'spawn') callback();
        }),
        pid: 12345,
      } as any);

      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
        additionalArgs: ['--verbose', '--debug'],
      };

      await launcher.launchClaudeCode(options);

      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        ['--verbose', '--debug'],
        expect.any(Object)
      );
    });
  });

  describe('Claude installation checks', () => {
    it('should check Claude installation successfully', async () => {
      mockSpawn.mockReturnValue({
        on: jest.fn((event, callback) => {
          if (event === 'spawn') callback();
        }),
      } as any);

      const result = await launcher.checkClaudeInstallation();
      expect(result).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith('claude', ['--version'], {
        stdio: 'pipe',
      });
    });

    it('should handle Claude not installed', async () => {
      mockSpawn.mockReturnValue({
        on: jest.fn((event, callback) => {
          if (event === 'error') callback(new Error('Command not found'));
        }),
      } as any);

      const result = await launcher.checkClaudeInstallation();
      expect(result).toBe(false);
    });
  });

  describe('Claude version retrieval', () => {
    it('should get Claude version successfully', async () => {
      const mockChild = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') callback('claude version 1.0.0');
          }),
        },
        on: jest.fn((event, callback) => {
          if (event === 'close') callback(0);
        }),
      } as any;

      mockSpawn.mockReturnValue(mockChild);

      const result = await launcher.getClaudeVersion();
      expect(result).toBe('claude version 1.0.0');
      expect(mockSpawn).toHaveBeenCalledWith('claude', ['--version'], {
        stdio: 'pipe',
      });
    });

    it('should handle version check failure', async () => {
      mockSpawn.mockReturnValue({
        on: jest.fn((event, callback) => {
          if (event === 'close') callback(1);
        }),
      } as any);

      const result = await launcher.getClaudeVersion();
      expect(result).toBeNull();
    });
  });

  describe('path management', () => {
    it('should set custom Claude path', () => {
      launcher.setClaudePath('/custom/path/claude');
      expect(launcher.getClaudePath()).toBe('/custom/path/claude');
    });

    it('should return initial Claude path', () => {
      const testLauncher = new ClaudeLauncher('test-claude');
      expect(testLauncher.getClaudePath()).toBe('test-claude');
    });
  });

  describe('Multi-provider failover', () => {
    it('should attempt fallback when primary provider fails validation', async () => {
      // Mock primary provider failure
      configManager.isProviderEnabled.mockImplementation((provider) => {
        return provider === 'synthetic' ? true : false; // MiniMax disabled initially
      });
      configManager.getEffectiveApiKey.mockImplementation((provider) => {
        return provider === 'synthetic' ? '' : 'minimax-key'; // No synthetic key
      });

      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
      };

      const result = await launcher.launchClaudeCode(options);

      // Should fail because primary provider has no API key and fallback provider is disabled
      expect(result.success).toBe(false);
      expect(result.error).toContain('Environment validation failed');
    });

    it('should succeed with fallback provider', async () => {
      // Mock primary provider failure but enable fallback
      configManager.isProviderEnabled.mockReturnValue(true);
      configManager.getEffectiveApiKey.mockImplementation((provider) => {
        return provider === 'synthetic' ? '' : 'minimax-key'; // No synthetic key, but MiniMax has key
      });

      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
      };

      const result = await launcher.launchClaudeCode(options);

      // Should succeed with fallback to MiniMax
      expect(result.success).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [],
        expect.objectContaining({
          env: expect.objectContaining({
            ANTHROPIC_AUTH_TOKEN: 'minimax-key',
            ANTHROPIC_BASE_URL: 'https://api.minimax.io/anthropic',
          }),
        })
      );
    });

    it('should handle hybrid provider failover', async () => {
      // Mock thinking model provider failure
      configManager.isProviderEnabled.mockReturnValue(true);
      configManager.getEffectiveApiKey.mockImplementation((provider) => {
        return provider === 'synthetic' ? 'synthetic-key' : ''; // MiniMax has no key
      });

      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
        thinkingModel: 'minimax:MiniMax-M2',
      };

      const result = await launcher.launchClaudeCode(options);

      // Should fall back to single provider or fail gracefully
      expect(result.success).toBe(false); // Since thinking model has no key
    });
  });

  describe('Provider resolution', () => {
    it('should resolve provider from model ID when not specified', async () => {
      const options: LaunchOptions = {
        model: 'minimax:MiniMax-M2',
        // provider not specified
      };

      const resolveProvider = (launcher as any).resolveProvider.bind(launcher);
      const provider = resolveProvider(options);
      expect(provider).toBe('minimax');
    }, 10000);

    it('should handle unknown provider gracefully', async () => {
      configManager.isProviderEnabled.mockReturnValue(false);

      const options: LaunchOptions = {
        model: 'unknown:model',
        provider: 'unknown' as any,
      };

      const result = await launcher.launchClaudeCode(options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Environment validation failed');
    });

    it('should resolve auto provider to enabled providers', async () => {
      const options: LaunchOptions = {
        model: 'claude-3-sonnet',
        provider: 'auto',
      };

      const resolveProvider = (launcher as any).resolveProvider.bind(launcher);
      const provider = resolveProvider(options);
      expect(provider).toBe('synthetic');
    }, 10000);
  });

  describe('Environment variable overrides', () => {
    it('should apply custom environment variables', async () => {
      const customEnv = {
        CUSTOM_VAR: 'custom-value',
        ANTHROPIC_BASE_URL: 'https://custom.override.url',
      };

      const options: LaunchOptions = {
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
        env: customEnv,
      };

      const createClaudeEnvironment = (launcher as any).createClaudeEnvironment.bind(launcher);
      const env = await createClaudeEnvironment(options);
      expect(env.ANTHROPIC_BASE_URL).toBe('https://custom.override.url');
      expect(env.CUSTOM_VAR).toBe('custom-value');
    }, 10000);
  });
});