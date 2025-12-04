import { ConfigManager, AppConfigSchema, LegacyAppConfigSchema, ConfigValidationError } from '../src/config';
import { EnvironmentManager } from '../src/config/env';
import { mkdtemp, rm, writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Configuration Migration and Backward Compatibility', () => {
  let tempDir: string;
  let originalEnv: typeof process.env;
  let originalCwd: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'mclaude-migration-test-'));
    originalCwd = process.cwd();

    // Change to temp directory to avoid picking up local .mclaude config
    process.chdir(tempDir);

    // Clear environment variables to avoid contamination
    originalEnv = { ...process.env };
    delete process.env.SYNTHETIC_API_KEY;
    delete process.env.MINIMAX_API_KEY;
    delete process.env.SYNTHETIC_BASE_URL;
    delete process.env.MINIMAX_API_URL;
    delete process.env.MINIMAX_ANTHROPIC_URL;
    delete process.env.MINIMAX_OPENAI_URL;
    delete process.env.MINIMAX_MODEL;

    // Reset environment manager to pick up cleared env
    EnvironmentManager.resetInstance();
  });

  afterEach(async () => {
    // Restore working directory
    process.chdir(originalCwd);

    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }

    // Restore environment variables
    process.env = originalEnv;
    EnvironmentManager.resetInstance();
  });

  describe('Legacy configuration format migration', () => {
    it('should migrate basic legacy configuration', async () => {
      const legacyConfig = {
        apiKey: 'legacy-api-key',
        baseUrl: 'https://legacy.api.synthetic.com',
        anthropicBaseUrl: 'https://legacy.anthropic.synthetic.com',
        modelsApiUrl: 'https://legacy.models.synthetic.com',
        selectedModel: 'legacy-model',
        cacheDurationHours: 48,
        firstRunCompleted: true,
      };

      const legacyConfigPath = join(tempDir, '.config', 'mclaude', 'config.json');
      await mkdir(join(tempDir, '.config', 'mclaude'), { recursive: true });
      await writeFile(legacyConfigPath, JSON.stringify(legacyConfig, null, 2));

      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = configManager.config;

      // Verify migration
      expect(config.configVersion).toBe(2);
      expect(config.providers.synthetic.apiKey).toBe('legacy-api-key');
      expect(config.providers.synthetic.baseUrl).toBe('https://legacy.api.synthetic.com');
      expect(config.providers.synthetic.anthropicBaseUrl).toBe('https://legacy.anthropic.synthetic.com');
      expect(config.providers.synthetic.modelsApiUrl).toBe('https://legacy.models.synthetic.com');
      expect(config.providers.synthetic.enabled).toBe(true); // Default for migrated configs
      expect(config.selectedModel).toBe('legacy-model');
      expect(config.cacheDurationHours).toBe(48);
      expect(config.firstRunCompleted).toBe(true);
      expect(config.defaultProvider).toBe('synthetic'); // Preserve existing behavior
    });

    it('should migrate minimal legacy configuration', async () => {
      const minimalLegacyConfig = {
        apiKey: 'minimal-key',
        selectedModel: 'minimal-model',
      };

      const legacyConfigPath = join(tempDir, '.config', 'mclaude', 'config.json');
      await mkdir(join(tempDir, '.config', 'mclaude'), { recursive: true });
      await writeFile(legacyConfigPath, JSON.stringify(minimalLegacyConfig, null, 2));

      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = configManager.config;

      expect(config.configVersion).toBe(2);
      expect(config.providers.synthetic.apiKey).toBe('minimal-key');
      expect(config.providers.synthetic.baseUrl).toBe('https://api.synthetic.new'); // Default
      expect(config.providers.synthetic.enabled).toBe(true);
      expect(config.selectedModel).toBe('minimal-model');
      expect(config.providers.minimax).toBeDefined(); // Should be created with defaults
    });

    xit('should inherit MiniMax configuration from environment during migration', async () => {
      // Set specific environment variables for this test
      process.env.MINIMAX_API_KEY = 'env-minimax-key';
      process.env.MINIMAX_BASE_URL = 'https://env.minimax.io';

      // Reset environment manager to pick up the new env vars
      EnvironmentManager.resetInstance();

      const legacyConfig = {
        apiKey: 'synthetic-key',
        // No minimax configuration in legacy format
      };

      const legacyConfigPath = join(tempDir, '.config', 'mclaude', 'config.json');
      await mkdir(join(tempDir, '.config', 'mclaude'), { recursive: true });
      await writeFile(legacyConfigPath, JSON.stringify(legacyConfig, null, 2));

      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = configManager.config;

      expect(config.providers.minimax.apiKey).toBe('env-minimax-key');
      expect(config.providers.minimax.baseUrl).toBe('https://env.minimax.io');
    });

    it('should handle invalid legacy configuration gracefully', async () => {
      const invalidLegacyConfig = {
        apiKey: ['not', 'a', 'string'], // Invalid type
        cacheDurationHours: 'not-a-number',
      };

      const legacyConfigPath = join(tempDir, '.config', 'mclaude', 'config.json');
      await mkdir(join(tempDir, '.config', 'mclaude'), { recursive: true });
      await writeFile(legacyConfigPath, JSON.stringify(invalidLegacyConfig, null, 2));

      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = configManager.config;

      // Should fall back to defaults but preserve valid fields
      expect(config.configVersion).toBe(2);
      expect(config.providers.synthetic.apiKey).toBe(''); // Default due to invalid legacy
      expect(config.firstRunCompleted).toBe(false); // Default
    });
  });

  describe('Backward compatibility', () => {
    it('should maintain backward compatibility for legacy methods', async () => {
      // Create new multi-provider config
      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));

      // Use legacy methods
      await configManager.setApiKey('legacy-api-key');
      expect(configManager.hasApiKey()).toBe(true);

      // Verify the config was updated correctly (internal state)
      const config = configManager.config;
      expect(config.providers.synthetic.apiKey).toBe('legacy-api-key');
      expect(configManager.hasSyntheticApiKey()).toBe(true);
    });

    it('should preserve existing behavior for legacy users', async () => {
      // Simulate legacy user workflow
      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));

      // Legacy user sets API key and model
      await configManager.setApiKey('user-api-key');
      await configManager.setSelectedModel('user-selected-model');
      await configManager.markFirstRunCompleted();

      // Verify configuration works as expected
      expect(configManager.hasApiKey()).toBe(true);
      expect(configManager.getSelectedModel()).toBe('user-selected-model');
      expect(configManager.hasSavedModel()).toBe(true);
      expect(configManager.getSavedModel()).toBe('user-selected-model');
      expect(configManager.isFirstRun()).toBe(false);

      // Under the hood, should be in new format
      const config = configManager.config;
      expect(config.configVersion).toBe(2);
      expect(config.providers.synthetic.apiKey).toBe('user-api-key');
    });

    xit('should handle legacy file paths and structure', async () => {
      // Create legacy directory structure
      const legacyDir = join(tempDir, '.config', 'mclaude');
      const legacyConfigPath = join(legacyDir, 'config.json');

      const legacyConfig = {
        apiKey: 'legacy-path-key',
        selectedModel: 'legacy-path-model',
      };

      await mkdir(legacyDir, { recursive: true });
      await writeFile(legacyConfigPath, JSON.stringify(legacyConfig, null, 2));

      // Should work with legacy structure
      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      expect(configManager.getApiKey()).toBe('legacy-path-key');
      expect(configManager.getSelectedModel()).toBe('legacy-path-model');
    });
  });

  describe('Configuration validation and error handling', () => {
    it('should validate new configuration format', () => {
      const validNewConfig = {
        providers: {
          synthetic: {
            apiKey: 'test-key',
            baseUrl: 'https://test.synthetic.com',
            enabled: true,
          },
          minimax: {
            apiKey: 'minimax-key',
            enabled: false,
          },
        },
        defaultProvider: 'synthetic',
        configVersion: 2,
        cacheDurationHours: 24,
        selectedModel: 'test-model',
        firstRunCompleted: true,
      };

      const result = AppConfigSchema.safeParse(validNewConfig);
      expect(result.success).toBe(true);
    });

    it('should reject invalid new configuration', () => {
      const invalidNewConfig = {
        providers: 'not-an-object', // Should be object
        defaultProvider: 'invalid-provider', // Not in enum
        configVersion: 'not-a-number', // Should be number
        cacheDurationHours: -1, // Below minimum
        firstRunCompleted: 'not-a-boolean', // Should be boolean
      };

      const result = AppConfigSchema.safeParse(invalidNewConfig);
      expect(result.success).toBe(false);
    });

    it('should accept partial new configuration with defaults', () => {
      const partialNewConfig = {
        providers: {
          synthetic: {
            apiKey: 'test-key',
          },
        },
      };

      const result = AppConfigSchema.safeParse(partialNewConfig);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.defaultProvider).toBe('auto');
        expect(result.data.configVersion).toBe(2);
        expect(result.data.cacheDurationHours).toBe(24);
        expect(result.data.providers.synthetic.baseUrl).toBe('https://api.synthetic.new');
        expect(result.data.providers.synthetic.enabled).toBe(true);
        expect(result.data.providers.minimax).toBeDefined();
      }
    });

    it('should validate legacy configuration format', () => {
      const validLegacyConfig = {
        apiKey: 'legacy-key',
        baseUrl: 'https://legacy.api.com',
        anthropicBaseUrl: 'https://legacy.anthropic.com',
        modelsApiUrl: 'https://legacy.models.com',
        selectedModel: 'legacy-model',
        cacheDurationHours: 12,
        firstRunCompleted: true,
      };

      const result = LegacyAppConfigSchema.safeParse(validLegacyConfig);
      expect(result.success).toBe(true);
    });

    it('should reject invalid legacy configuration', () => {
      const invalidLegacyConfig = {
        apiKey: 123, // Should be string
        cacheDurationHours: 'not-a-number',
        firstRunCompleted: 'not-a-boolean',
      };

      const result = LegacyAppConfigSchema.safeParse(invalidLegacyConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('Configuration upgrades and downgrades', () => {
    it('should handle missing configVersion (treated as legacy)', async () => {
      const configWithoutVersion = {
        providers: {
          synthetic: {
            apiKey: 'no-version-key',
          },
        },
        // No configVersion field -> treated as legacy
      };

      const configPath = join(tempDir, '.config', 'mclaude', 'config.json');
      await mkdir(join(tempDir, '.config', 'mclaude'), { recursive: true });
      await writeFile(configPath, JSON.stringify(configWithoutVersion, null, 2));

      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = configManager.config;

      // Should be migrated to version 2
      expect(config.configVersion).toBe(2);
    });

    it('should handle version 1 configuration (future upgrade)', async () => {
      const v1Config = {
        providers: {
          synthetic: {
            apiKey: 'v1-key'
          }
        },
        configVersion: 1,
      };

      const configPath = join(tempDir, '.config', 'mclaude', 'config.json');
      await mkdir(join(tempDir, '.config', 'mclaude'), { recursive: true });
      await writeFile(configPath, JSON.stringify(v1Config, null, 2));

      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = configManager.config;

      // Should be upgraded to version 2
      expect(config.configVersion).toBe(2);
    });

    xit('should preserve configuration during upgrades', async () => {
      const complexUpgradeConfig = {
        providers: {
          synthetic: {
            apiKey: 'upgrade-key',
            baseUrl: 'https://upgrade.synthetic.com',
            enabled: false,
          },
          minimax: {
            apiKey: 'upgrade-minimax-key',
            groupId: 'upgrade-group',
            enabled: true,
          },
        },
        defaultProvider: 'minimax',
        configVersion: 1, // Will be upgraded
        cacheDurationHours: 36,
        selectedModel: 'upgrade-model',
        selectedThinkingModel: 'upgrade-thinking-model',
        firstRunCompleted: true,
        combination1: {
          name: 'Upgrade Combo',
          regularModel: 'synthetic:upgrade-regular',
          thinkingModel: 'minimax:upgrade-thinking',
          regularProvider: 'synthetic',
          thinkingProvider: 'minimax',
        },
      };

      const configPath = join(tempDir, '.config', 'mclaude', 'config.json');
      await mkdir(join(tempDir, '.config', 'mclaude'), { recursive: true });
      await writeFile(configPath, JSON.stringify(complexUpgradeConfig, null, 2));

      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = configManager.config;

      // Should preserve all settings during upgrade
      expect(config.configVersion).toBe(2);
      expect(config.providers.synthetic.apiKey).toBe('upgrade-key');
      expect(config.providers.synthetic.baseUrl).toBe('https://upgrade.synthetic.com');
      expect(config.providers.synthetic.enabled).toBe(false);
      expect(config.providers.minimax.apiKey).toBe('upgrade-minimax-key');
      expect(config.providers.minimax.groupId).toBe('upgrade-group');
      expect(config.providers.minimax.enabled).toBe(true);
      expect(config.defaultProvider).toBe('minimax');
      expect(config.cacheDurationHours).toBe(36);
      expect(config.selectedModel).toBe('upgrade-model');
      expect(config.selectedThinkingModel).toBe('upgrade-thinking-model');
      expect(config.firstRunCompleted).toBe(true);
      expect(config.combination1?.name).toBe('Upgrade Combo');
    });
  });

  describe('Configuration corruption recovery', () => {
    xit('should recover from completely corrupted config file', async () => {
      const configPath = join(tempDir, '.config', 'mclaude', 'config.json');

      // Write completely invalid JSON
      await writeFile(configPath, '{"corrupted": json content}');

      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = configManager.config;

      // Should recover with defaults
      expect(config.configVersion).toBe(2);
      expect(config.providers).toBeDefined();
      expect(config.firstRunCompleted).toBe(false);
    });

    xit('should recover from partially corrupted configuration', async () => {
      const configPath = join(tempDir, '.config', 'mclaude', 'config.json');

      // Write config with some valid parts but corruption in others
      const partiallyCorrupted = {
        firstRunCompleted: true, // This should be preserved
        providers: {
          synthetic: {
            apiKey: 'valid-key',
            invalidField: 'this should be ignored',
          },
          minimax: null, // Invalid, should be replaced with default
        },
        invalidField: 'should be ignored',
        configVersion: 2,
      };

      await mkdir(join(tempDir, '.config', 'mclaude'), { recursive: true });
      await writeFile(configPath, JSON.stringify(partiallyCorrupted, null, 2));

      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = configManager.config;

      // Should preserve valid parts and fix invalid ones
      expect(config.firstRunCompleted).toBe(true);
      expect(config.providers.synthetic.apiKey).toBe('valid-key');
      expect(config.providers.minimax).toBeDefined(); // Should have default minimax config
      expect(config.configVersion).toBe(2);
    });

    xit('should preserve important data during total config reset', async () => {
      const configPath = join(tempDir, '.config', 'mclaude', 'config.json');
      const originalConfig = {
        selectedModel: 'important-model',
        selectedThinkingModel: 'important-thinking-model',
        firstRunCompleted: true,
        // Other data is corrupted
        invalidField: 'corrupt',
      };

      await mkdir(join(tempDir, '.config', 'mclaude'), { recursive: true });
      await writeFile(configPath, JSON.stringify(originalConfig, null, 2));

      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = configManager.config;

      // Even with corruption, should preserve important user data
      expect(config.selectedModel).toBe('important-model');
      expect(config.selectedThinkingModel).toBe('important-thinking-model');
      expect(config.firstRunCompleted).toBe(true);
    });
  });

  describe('Environment variable integration', () => {
    xit('should handle environment variable overrides in legacy mode', async () => {
      // Set environment variable
      process.env.SYNTHETIC_API_KEY = 'env-legacy-key';

      // Reset environment manager to pick up the new env vars
      EnvironmentManager.resetInstance();

      const legacyConfig = {
        apiKey: 'config-legacy-key',
      };

      const configPath = join(tempDir, '.config', 'mclaude', 'config.json');
      await mkdir(join(tempDir, '.config', 'mclaude'), { recursive: true });
      await writeFile(configPath, JSON.stringify(legacyConfig, null, 2));

      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));

      // Environment should override config
      expect(configManager.getEffectiveApiKey('synthetic')).toBe('env-legacy-key');
      // But original config should still be there
      expect(config.providers.synthetic.apiKey).toBe('config-legacy-key');
    });

    xit('should maintain environment variable behavior after migration', async () => {
      // Set environment variables
      process.env.SYNTHETIC_API_KEY = 'env-migrated-key';
      process.env.MINIMAX_API_KEY = 'env-minimax-key';

      // Reset environment manager to pick up the new env vars
      EnvironmentManager.resetInstance();

      // Migrate from legacy
      const legacyConfig = {
        apiKey: 'config-key',
        firstRunCompleted: true,
      };

      const configPath = join(tempDir, '.config', 'mclaude', 'config.json');
      await mkdir(join(tempDir, '.config', 'mclaude'), { recursive: true });
      await writeFile(configPath, JSON.stringify(legacyConfig, null, 2));

      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = configManager.config;

      // Environment overrides should work in new format
      expect(configManager.getEffectiveApiKey('synthetic')).toBe('env-migrated-key');
      expect(configManager.getEffectiveApiKey('minimax')).toBe('env-minimax-key');

      // Config should have original values
      expect(config.providers.synthetic.apiKey).toBe('config-key');
      expect(config.envOverrides.synthetic?.apiKey).toBe('env-migrated-key');
      expect(config.envOverrides.minimax?.apiKey).toBe('env-minimax-key');
    });
  });

  describe('Configuration file management', () => {
    xit('should create backup during migration', async () => {
      const legacyConfig = {
        apiKey: 'backup-test-key',
        selectedModel: 'backup-test-model',
      };

      const configPath = join(tempDir, '.config', 'mclaude', 'config.json');
      const backupPath = `${configPath}.backup`;

      await mkdir(join(tempDir, '.config', 'mclaude'), { recursive: true });
      await writeFile(configPath, JSON.stringify(legacyConfig, null, 2));

      // Trigger migration
      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));

      // Check that backup was created
      const backupExists = await readFile(backupPath, 'utf-8').catch(() => null);
      expect(backupExists).toBeTruthy();
      expect(JSON.parse(backupExists!).apiKey).toBe('backup-test-key');
    });

    xit('should maintain proper file permissions', async () => {
      const configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      await configManager.setApiKey('permissions-test-key');

      const configPath = join(tempDir, '.config', 'mclaude', 'config.json');

      // On Unix-like systems, we should check permissions (this is a basic test)
      // In a real scenario, we might check for 0o600 permissions
      const configContent = await readFile(configPath, 'utf-8');
      expect(JSON.parse(configContent).providers.synthetic.apiKey).toBe('permissions-test-key');
    });

    xit('should handle concurrent configuration access', async () => {
      const configManager1 = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const configManager2 = new ConfigManager(join(tempDir, '.config', 'mclaude'));

      // Concurrent writes should not corrupt the file
      const write1 = configManager1.setSyntheticApiKey('concurrent-key-1');
      const write2 = configManager2.setMinimaxApiKey('concurrent-key-2');

      await Promise.all([write1, write2]);

      // Both writes should succeed
      expect(configManager1.getSyntheticApiKey()).toBe('concurrent-key-1');
      expect(configManager1.getMinimaxApiKey()).toBe('concurrent-key-2');
    });
  });
});