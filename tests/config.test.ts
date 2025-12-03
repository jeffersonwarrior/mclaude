import {
  ConfigManager,
  AppConfigSchema,
  LegacyAppConfigSchema,
  ProviderEnum,
  ConfigValidationError
} from '../src/config';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for test configuration
    tempDir = await mkdtemp(join(tmpdir(), 'mclaude-test-'));
    configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Configuration loading', () => {
    it('should load default multi-provider configuration when no config file exists', () => {
      const config = configManager.config;

      // Check multi-provider structure
      expect(config.providers).toBeDefined();
      expect(config.providers.synthetic).toBeDefined();
      expect(config.providers.minimax).toBeDefined();
      expect(config.defaultProvider).toBe('auto');
      expect(config.configVersion).toBe(2);

      // Check defaults
      expect(config.providers.synthetic.apiKey).toBe('');
      expect(config.providers.synthetic.baseUrl).toBe('https://api.synthetic.new');
      expect(config.providers.synthetic.enabled).toBe(true);
      expect(config.providers.minimax.apiKey).toBe('');
      expect(config.providers.minimax.baseUrl).toBe('https://api.minimax.io');
      expect(config.providers.minimax.enabled).toBe(true);
      expect(config.cacheDurationHours).toBe(24);
      expect(config.selectedModel).toBe('');
      expect(config.firstRunCompleted).toBe(false);
    });

    it('should save and load multi-provider configuration', async () => {
      const testConfig = {
        providers: {
          synthetic: {
            apiKey: 'test-key-123',
            baseUrl: 'https://test.synthetic.com',
            enabled: false,
          },
          minimax: {
            apiKey: 'minimax-key-456',
            groupId: 'test-group-789',
            enabled: true,
          },
        },
        defaultProvider: 'minimax' as const,
        selectedModel: 'synthetic:claude-3',
        selectedThinkingModel: 'minimax:MiniMax-M2',
        cacheDurationHours: 12,
      };

      const success = await configManager.updateConfig(testConfig);
      expect(success).toBe(true);

      // Create new instance to test loading
      const newConfigManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = newConfigManager.config;

      expect(config.providers.synthetic.apiKey).toBe('test-key-123');
      expect(config.providers.synthetic.baseUrl).toBe('https://test.synthetic.com');
      expect(config.providers.synthetic.enabled).toBe(false);
      expect(config.providers.minimax.apiKey).toBe('minimax-key-456');
      expect(config.providers.minimax.groupId).toBe('test-group-789');
      expect(config.providers.minimax.enabled).toBe(true);
      expect(config.defaultProvider).toBe('minimax');
      expect(config.selectedModel).toBe('synthetic:claude-3');
      expect(config.selectedThinkingModel).toBe('minimax:MiniMax-M2');
      expect(config.cacheDurationHours).toBe(12);
    });
  });

  describe('API key management', () => {
    it('should check if API key is configured', async () => {
      expect(configManager.hasApiKey()).toBe(false);

      await configManager.setApiKey('test-key');
      expect(configManager.hasApiKey()).toBe(true);
    });

    it('should set and get API key', async () => {
      await configManager.setApiKey('new-api-key');
      expect(configManager.getApiKey()).toBe('new-api-key');
    });
  });

  describe('Model management', () => {
    it('should manage selected model', async () => {
      await configManager.setSelectedModel('openai:gpt-4');
      expect(configManager.getSelectedModel()).toBe('openai:gpt-4');
    });

    it('should handle saved model state', async () => {
      expect(configManager.hasSavedModel()).toBe(false);
      expect(configManager.getSavedModel()).toBe('');

      await configManager.setSavedModel('anthropic:claude-3');
      await configManager.markFirstRunCompleted();

      expect(configManager.hasSavedModel()).toBe(true);
      expect(configManager.getSavedModel()).toBe('anthropic:claude-3');
    });
  });

  describe('First run management', () => {
    it('should detect first run', () => {
      expect(configManager.isFirstRun()).toBe(true);
    });

    it('should mark first run as completed', async () => {
      await configManager.markFirstRunCompleted();
      expect(configManager.isFirstRun()).toBe(false);
    });
  });

  describe('Cache duration management', () => {
    it('should set and get cache duration', async () => {
      await configManager.setCacheDuration(48);
      expect(configManager.getCacheDuration()).toBe(48);
    });

    it('should validate cache duration range', async () => {
      const success1 = await configManager.setCacheDuration(0); // Too low
      expect(success1).toBe(false);

      const success2 = await configManager.setCacheDuration(200); // Too high
      expect(success2).toBe(false);

      const success3 = await configManager.setCacheDuration(72); // Valid
      expect(success3).toBe(true);
    });
  });
});

describe('Multi-provider API key management', () => {
  it('should manage synthetic API keys independently', async () => {
    expect(configManager.hasSyntheticApiKey()).toBe(false);

    await configManager.setSyntheticApiKey('synthetic-key-123');
    expect(configManager.getSyntheticApiKey()).toBe('synthetic-key-123');
    expect(configManager.hasSyntheticApiKey()).toBe(true);

    // Should not affect MiniMax key
    expect(configManager.hasMinimaxApiKey()).toBe(false);
  });

  it('should manage MiniMax API keys independently', async () => {
    expect(configManager.hasMinimaxApiKey()).toBe(false);

    await configManager.setMinimaxApiKey('minimax-key-456');
    expect(configManager.getMinimaxApiKey()).toBe('minimax-key-456');
    expect(configManager.hasMinimaxApiKey()).toBe(true);

    // Should not affect synthetic key
    expect(configManager.hasSyntheticApiKey()).toBe(false);
  });

  it('should provide effective API keys with environment overrides', async () => {
    // Set up config with keys
    await configManager.setSyntheticApiKey('config-synthetic-key');
    await configManager.setMinimaxApiKey('config-minimax-key');

    // Mock environment variables
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      SYNTHETIC_API_KEY: 'env-synthetic-key',
      MINIMAX_API_KEY: 'env-minimax-key',
    };

    // Create new manager to pick up env variables
    const envConfigManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));

    // Environment variables should override config
    expect(envConfigManager.getEffectiveApiKey('synthetic')).toBe('env-synthetic-key');
    expect(envConfigManager.getEffectiveApiKey('minimax')).toBe('env-minimax-key');

    // Restore original environment
    process.env = originalEnv;
  });

  it('should maintain backward compatibility for legacy API key methods', async () => {
    await configManager.setApiKey('legacy-key');

    // Legacy methods should map to synthetic provider
    expect(configManager.getApiKey()).toBe('legacy-key');
    expect(configManager.hasApiKey()).toBe(true);

    // Should also be available through new method
    expect(configManager.getSyntheticApiKey()).toBe('legacy-key');
    expect(configManager.hasSyntheticApiKey()).toBe(true);
  });
});

describe('Provider management', () => {
  it('should enable and disable providers', async () => {
    // Default state: both providers enabled
    expect(configManager.isProviderEnabled('synthetic')).toBe(true);
    expect(configManager.isProviderEnabled('minimax')).toBe(true);
    expect(configManager.isProviderEnabled('auto')).toBe(true);

    // Disable synthetic provider
    await configManager.setProviderEnabled('synthetic', false);
    expect(configManager.isProviderEnabled('synthetic')).toBe(false);
    expect(configManager.isProviderEnabled('minimax')).toBe(true);

    // Enable synthetic provider again
    await configManager.setProviderEnabled('synthetic', true);
    expect(configManager.isProviderEnabled('synthetic')).toBe(true);
  });

  it('should manage default provider', async () => {
    expect(configManager.getDefaultProvider()).toBe('auto');

    await configManager.setDefaultProvider('synthetic');
    expect(configManager.getDefaultProvider()).toBe('synthetic');

    await configManager.setDefaultProvider('minimax');
    expect(configManager.getDefaultProvider()).toBe('minimax');
  });

  it('should throw error when trying to disable auto provider', async () => {
    await expect(configManager.setProviderEnabled('auto', false)).rejects.toThrow(
      ConfigValidationError
    );
  });

  it('should get provider configuration', () => {
    const syntheticConfig = configManager.getProviderConfig('synthetic');
    expect(syntheticConfig).toBeDefined();
    expect(syntheticConfig?.baseUrl).toBe('https://api.synthetic.new');

    const minimaxConfig = configManager.getProviderConfig('minimax');
    expect(minimaxConfig).toBeDefined();
    expect(minimaxConfig?.baseUrl).toBe('https://api.minimax.io');

    const autoConfig = configManager.getProviderConfig('auto');
    expect(autoConfig).toBeNull();
  });

  it('should update provider configuration', async () => {
    const updateSuccess = await configManager.updateProviderConfig('synthetic', {
      timeout: 30000,
      baseUrl: 'https://custom.synthetic.com',
    });

    expect(updateSuccess).toBe(true);

    const syntheticConfig = configManager.getProviderConfig('synthetic');
    expect(syntheticConfig?.timeout).toBe(30000);
    expect(syntheticConfig?.baseUrl).toBe('https://custom.synthetic.com');
  });
});

describe('Configuration migration', () => {
  it('should migrate legacy configuration format', async () => {
    // Create legacy config file
    const legacyConfigPath = join(tempDir, '.config', 'mclaude', 'config.json');
    const legacyConfig = {
      apiKey: 'legacy-api-key',
      baseUrl: 'https://legacy.api.com',
      selectedModel: 'legacy:model',
      cacheDurationHours: 12,
      firstRunCompleted: true,
      // No configVersion - indicates legacy format
    };

    await configManager.saveConfig(); // Create the config directory
    await writeFile(legacyConfigPath, JSON.stringify(legacyConfig, null, 2));

    // Create new manager and load migrated config
    const migratedManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
    const config = migratedManager.config;

    // Check migration
    expect(config.configVersion).toBe(2);
    expect(config.providers.synthetic.apiKey).toBe('legacy-api-key');
    expect(config.providers.synthetic.baseUrl).toBe('https://legacy.api.com');
    expect(config.providers.synthetic.enabled).toBe(true);
    expect(config.providers.minimax).toBeDefined();
    expect(config.defaultProvider).toBe('synthetic');
    expect(config.selectedModel).toBe('legacy:model');
    expect(config.cacheDurationHours).toBe(12);
    expect(config.firstRunCompleted).toBe(true);
  });

  it('should handle corrupted configuration gracefully', async () => {
    // Create corrupted config file
    const corruptedConfigPath = join(tempDir, '.config', 'mclaude', 'config.json');
    await configManager.saveConfig(); // Create the config directory
    await writeFile(corruptedConfigPath, 'invalid json content');

    // Should fall back to defaults
    const corruptedManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
    const config = corruptedManager.config;

    expect(config.configVersion).toBe(2);
    expect(config.providers).toBeDefined();
    expect(config.firstRunCompleted).toBe(false);
  });
});

describe('Model combination management', () => {
  it('should save and load model combinations', async () => {
    const combination1 = {
      name: 'Fast Thinking',
      regularModel: 'synthetic:claude-3-haiku',
      thinkingModel: 'minimax:MiniMax-M2',
      regularProvider: 'synthetic',
      thinkingProvider: 'minimax',
      createdAt: new Date().toISOString(),
    };

    const combination2 = {
      name: 'Power Combo',
      regularModel: 'minimax:MiniMax-M2',
      thinkingModel: 'synthetic:claude-3-opus',
      regularProvider: 'minimax',
      thinkingProvider: 'synthetic',
      createdAt: new Date().toISOString(),
    };

    await configManager.updateConfig({ combination1, combination2 });

    const config = configManager.config;
    expect(config.combination1?.name).toBe('Fast Thinking');
    expect(config.combination2?.name).toBe('Power Combo');
    expect(config.combination1?.regularProvider).toBe('synthetic');
    expect(config.combination2?.thinkingProvider).toBe('synthetic');
  });
});

describe('AppConfigSchema validation', () => {
  it('should validate valid multi-provider configuration', () => {
    const validConfig = {
      providers: {
        synthetic: {
          apiKey: 'test-synthetic-key',
          baseUrl: 'https://api.test.com',
          enabled: true,
        },
        minimax: {
          apiKey: 'test-minimax-key',
          groupId: 'test-group',
          enabled: false,
        },
      },
      defaultProvider: 'synthetic',
      cacheDurationHours: 24,
      selectedModel: 'synthetic:claude-3',
      selectedThinkingModel: 'minimax:MiniMax-M2',
      firstRunCompleted: true,
      configVersion: 2,
    };

    const result = AppConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('should reject invalid multi-provider configuration', () => {
    const invalidConfig = {
      providers: {
        synthetic: {
          apiKey: 'test-synthetic-key',
          enabled: 'not-a-boolean', // Invalid type
        },
      },
      defaultProvider: 'invalid-provider', // Not in enum
      cacheDurationHours: -1, // Invalid: must be >= 1
    };

    const result = AppConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should use default values for missing multi-provider fields', () => {
    const partialConfig = {
      providers: {
        synthetic: {
          apiKey: 'test-key',
        },
      },
    };

    const result = AppConfigSchema.safeParse(partialConfig);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.defaultProvider).toBe('auto');
      expect(result.data.providers.synthetic.baseUrl).toBe('https://api.synthetic.new');
      expect(result.data.providers.synthetic.enabled).toBe(true);
      expect(result.data.providers.minimax).toBeDefined();
      expect(result.data.cacheDurationHours).toBe(24);
      expect(result.data.configVersion).toBe(2);
    }
  });
});

describe('ProviderEnum validation', () => {
  it('should validate provider enum values', () => {
    expect(ProviderEnum.safeParse('synthetic').success).toBe(true);
    expect(ProviderEnum.safeParse('minimax').success).toBe(true);
    expect(ProviderEnum.safeParse('auto').success).toBe(true);
    expect(ProviderEnum.safeParse('invalid').success).toBe(false);
    expect(ProviderEnum.safeParse('SYNTHETIC').success).toBe(false); // Case sensitive
  });
});

describe('LegacyAppConfigSchema validation', () => {
  it('should validate valid legacy configuration', () => {
    const validLegacyConfig = {
      apiKey: 'test-key',
      baseUrl: 'https://api.test.com',
      modelsApiUrl: 'https://api.test.com/models',
    };

    const result = LegacyAppConfigSchema.safeParse(validLegacyConfig);
    expect(result.success).toBe(true);
  });

  it('should reject invalid legacy configuration', () => {
    const invalidLegacyConfig = {
      apiKey: 123, // Should be string
    };

    const result = LegacyAppConfigSchema.safeParse(invalidLegacyConfig);
    expect(result.success).toBe(false);
  });
});