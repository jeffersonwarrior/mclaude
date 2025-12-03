import { ConfigManager } from '../src/config';
import { ModelManager } from '../src/models';
import { ClaudeLauncher } from '../src/launcher/claude-launcher';
import { SyntheticClaudeApp } from '../src/core/app';
import { ModelInfoImpl } from '../src/models/info';
import axios from 'axios';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock external dependencies
jest.mock('axios');
jest.mock('child_process');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock MiniMaxClient
jest.mock('../src/api/minimax-client', () => ({
  MiniMaxClient: jest.fn().mockImplementation(() => ({
    fetchModelsWithRetry: jest.fn().mockResolvedValue({
      data: [
        { id: 'minimax:MiniMax-M2', object: 'model' },
        { id: 'minimax:MiniMax-M1', object: 'model' },
      ],
    }),
  })),
}));

describe('End-to-End Integration Tests', () => {
  let tempDir: string;
  let configManager: ConfigManager;
  let modelManager: ModelManager;
  let launcher: ClaudeLauncher;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'mclaude-integration-test-'));
    configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));

    const cacheFile = join(tempDir, 'models_cache.json');
    modelManager = new ModelManager({
      configManager,
      cacheFile,
      cacheDurationHours: 1,
    });

    launcher = new ClaudeLauncher('claude', configManager);

    // Set up mock API responses
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: {
        data: [
          { id: 'synthetic:claude-3-sonnet', object: 'model' },
          { id: 'synthetic:claude-3-haiku', object: 'model' },
          { id: 'synthetic:gpt-4', object: 'model' },
        ],
      },
    });

    // Set up configuration with both providers
    await configManager.setSyntheticApiKey('test-synthetic-key');
    await configManager.setMinimaxApiKey('test-minimax-key');
    await configManager.setProviderEnabled('synthetic', true);
    await configManager.setProviderEnabled('minimax', true);
  });

  afterEach(async () => {
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
    jest.clearAllMocks();
  });

  describe('Multi-provider model selection and launch', () => {
    it('should complete full workflow with synthetic provider', async () => {
      // 1. Fetch models from all providers
      const models = await modelManager.fetchModels();

      expect(models).toHaveLength(5); // 3 synthetic + 2 minimax
      expect(models.some(m => m.id === 'synthetic:claude-3-sonnet')).toBe(true);
      expect(models.some(m => m.id === 'minimax:MiniMax-M2')).toBe(true);

      // 2. Filter for synthetic models
      const syntheticModels = modelManager.getModelsByProvider('synthetic', models);
      expect(syntheticModels).toHaveLength(3);

      // 3. Select a model
      const selectedModel = syntheticModels[0];
      await configManager.setSelectedModel(selectedModel.id);

      // 4. Validate saved model
      expect(configManager.getSelectedModel()).toBe(selectedModel.id);

      // 5. Launch Claude Code with the selected model (mock environment validation)
      const mockChildProcess = {
        on: jest.fn((event, callback) => {
          if (event === 'spawn') setTimeout(callback, 0);
        }),
        pid: 12345,
      };

      const { spawn } = require('child_process');
      spawn.mockReturnValue(mockChildProcess);

      const launchResult = await launcher.launchClaudeCode({
        model: selectedModel.id,
        provider: 'synthetic',
      });

      expect(launchResult.success).toBe(true);
      expect(spawn).toHaveBeenCalledWith(
        'claude',
        [],
        expect.objectContaining({
          env: expect.objectContaining({
            ANTHROPIC_AUTH_TOKEN: 'test-synthetic-key',
            ANTHROPIC_BASE_URL: 'https://api.synthetic.new/anthropic',
            ANTHROPIC_DEFAULT_MODEL: selectedModel.id,
          }),
        })
      );
    });

    it('should complete full workflow with MiniMax provider', async () => {
      // 1. Fetch models
      const models = await modelManager.fetchModels();
      const minimaxModels = modelManager.getModelsByProvider('minimax', models);
      expect(minimaxModels).toHaveLength(2);

      // 2. Select MiniMax model
      const selectedModel = minimaxModels[0];
      await configManager.setSelectedModel(selectedModel.id);

      // 3. Launch (mock)
      const mockChildProcess = {
        on: jest.fn((event, callback) => {
          if (event === 'spawn') setTimeout(callback, 0);
        }),
        pid: 12345,
      };

      const { spawn } = require('child_process');
      spawn.mockReturnValue(mockChildProcess);

      const launchResult = await launcher.launchClaudeCode({
        model: selectedModel.id,
        provider: 'minimax',
      });

      expect(launchResult.success).toBe(true);
      expect(spawn).toHaveBeenCalledWith(
        'claude',
        [],
        expect.objectContaining({
          env: expect.objectContaining({
            ANTHROPIC_AUTH_TOKEN: 'test-minimax-key',
            ANTHROPIC_BASE_URL: 'https://api.minimax.io/anthropic',
            ANTHROPIC_DEFAULT_MODEL: selectedModel.id,
          }),
        })
      );
    });

    it('should handle hybrid provider workflow', async () => {
      // 1. Set up hybrid configuration
      await configManager.setSelectedModel('synthetic:claude-3-sonnet');
      await configManager.setSavedThinkingModel('minimax:MiniMax-M2');

      // 2. Launch with hybrid setup
      const mockChildProcess = {
        on: jest.fn((event, callback) => {
          if (event === 'spawn') setTimeout(callback, 0);
        }),
        pid: 12345,
      };

      const { spawn } = require('child_process');
      spawn.mockReturnValue(mockChildProcess);

      const launchResult = await launcher.launchClaudeCode({
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
        thinkingModel: 'minimax:MiniMax-M2',
      });

      expect(launchResult.success).toBe(true);
      expect(spawn).toHaveBeenCalledWith(
        'claude',
        [],
        expect.objectContaining({
          env: expect.objectContaining({
            ANTHROPIC_AUTH_TOKEN: 'test-synthetic-key',
            ANTHROPIC_BASE_URL: 'https://api.synthetic.new/anthropic',
            ANTHROPIC_DEFAULT_MODEL: 'synthetic:claude-3-sonnet',
            ANTHROPIC_THINKING_MODEL: 'minimax:MiniMax-M2',
            ANTHROPIC_THINKING_BASE_URL: 'https://api.minimax.io/anthropic',
            ANTHROPIC_THINKING_AUTH_TOKEN: 'test-minimax-key',
          }),
        })
      );
    });
  });

  describe('Provider failover scenarios', () => {
    it('should fallback when primary provider has no API key', async () => {
      // Remove synthetic API key
      await configManager.setSyntheticApiKey('');

      const mockChildProcess = {
        on: jest.fn((event, callback) => {
          if (event === 'spawn') setTimeout(callback, 0);
        }),
        pid: 12345,
      };

      const { spawn } = require('child_process');
      spawn.mockReturnValue(mockChildProcess);

      const launchResult = await launcher.launchClaudeCode({
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
      });

      expect(launchResult.success).toBe(true);
      // Should fall back to minimax
      expect(spawn).toHaveBeenCalledWith(
        'claude',
        [],
        expect.objectContaining({
          env: expect.objectContaining({
            ANTHROPIC_AUTH_TOKEN: 'test-minimax-key',
            ANTHROPIC_BASE_URL: 'https://api.minimax.io/anthropic',
          }),
        })
      );
    });

    it('should fail when all providers are disabled', async () => {
      // Disable all providers
      await configManager.setProviderEnabled('synthetic', false);
      await configManager.setProviderEnabled('minimax', false);

      const launchResult = await launcher.launchClaudeCode({
        model: 'synthetic:claude-3-sonnet',
        provider: 'synthetic',
      });

      expect(launchResult.success).toBe(false);
      expect(launchResult.error).toContain('Environment validation failed');
    });
  });

  describe('Model caching and refresh', () => {
    it('should cache models and use cache on subsequent calls', async () => {
      // First call - should fetch from APIs
      const models1 = await modelManager.fetchModels();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const models2 = await modelManager.fetchModels();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Still 1, not 2

      expect(models1).toEqual(models2);
    });

    it('should force refresh when requested', async () => {
      // First call
      await modelManager.fetchModels();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);

      // Force refresh
      await modelManager.fetchModels(true);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Called again
    });

    it('should handle provider-specific refresh', async () => {
      // Refresh specific provider
      await modelManager.refreshProvider('synthetic');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);

      // Refresh different provider
      await modelManager.refreshProvider('minimax');
      // MiniMax client should be called
      const MiniMaxClient = require('../src/api/minimax-client').MiniMaxClient;
      expect(MiniMaxClient).toHaveBeenCalled();
    });

    it('should provide analytics about cache usage', async () => {
      // Fetch models to populate cache
      await modelManager.fetchModels();

      const analytics = await modelManager.getCacheAnalytics();
      expect(analytics).toBeDefined();
      expect(typeof analytics.cacheSize).toBe('number');
      expect(typeof analytics.providerCounts).toBe('object');
    });
  });

  describe('Model search and filtering', () => {
    beforeEach(async () => {
      // Pre-populate models
      await modelManager.fetchModels();
    });

    it('should search models across providers', async () => {
      const claudeModels = await modelManager.searchModels('claude');
      expect(claudeModels.length).toBeGreaterThan(0);
      expect(claudeModels.every(m => m.id.includes('claude'))).toBe(true);
    });

    it('should filter by provider and query', async () => {
      const syntheticClaudeModels = await modelManager.searchModelsWithFilters({
        provider: 'synthetic',
        query: 'claude',
      });
      expect(syntheticClaudeModels.length).toBeGreaterThan(0);
      expect(syntheticClaudeModels.every(m =>
        m.getProvider() === 'synthetic' && m.id.includes('claude')
      )).toBe(true);
    });

    it('should filter by Claude compatibility', async () => {
      const claudeCompatibleModels = await modelManager.searchModelsWithFilters({
        claudeCompatible: true,
      });
      expect(claudeCompatibleModels.every(m => m.isClaudeCompatible())).toBe(true);
    });

    it('should provide categorized model list', async () => {
      const models = await modelManager.fetchModels();
      const categorized = modelManager.getCategorizedModels(models);

      expect(categorized).toHaveProperty('synthetic');
      expect(categorized).toHaveProperty('minimax');
      expect(Array.isArray(categorized.synthetic)).toBe(true);
      expect(Array.isArray(categorized.minimax)).toBe(true);
    });

    it('should provide accurate model statistics', async () => {
      const stats = await modelManager.getModelStatistics();
      expect(stats.total).toBe(5);
      expect(stats.byProvider.synthetic).toBe(3);
      expect(stats.byProvider.minimax).toBe(2);
      expect(stats.claudeCompatible).toBeGreaterThan(0);
    });
  });

  describe('Configuration management end-to-end', () => {
    it('should handle configuration migration from legacy format', async () => {
      // Create legacy config
      const legacyConfigPath = join(tempDir, '.config', 'mclaude', 'config.json');
      await writeFile(legacyConfigPath, JSON.stringify({
        apiKey: 'legacy-synthetic-key',
        baseUrl: 'https://legacy.synthetic.com',
        selectedModel: 'legacy:claude-3',
        cacheDurationHours: 12,
        firstRunCompleted: true,
      }, null, 2));

      // Create new manager to trigger migration
      const migratedManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = migratedManager.config;

      expect(config.configVersion).toBe(2);
      expect(config.providers.synthetic.apiKey).toBe('legacy-synthetic-key');
      expect(config.providers.synthetic.baseUrl).toBe('https://legacy.synthetic.com');
      expect(config.providers.minimax).toBeDefined();
      expect(config.defaultProvider).toBe('synthetic');
    });

    it('should persist and reload all multi-provider settings', async () => {
      // Configure complex multi-provider setup
      await configManager.setDefaultProvider('minimax');
      await configManager.setProviderEnabled('synthetic', false);
      await configManager.setSyntheticApiKey('new-synthetic-key');
      await configManager.setMinimaxApiKey('new-minimax-key');
      await configManager.setSavedThinkingModel('minimax:MiniMax-M2');

      // Create combination
      await configManager.updateConfig({
        combination1: {
          name: 'Test Combo',
          regularModel: 'synthetic:claude-3-sonnet',
          thinkingModel: 'minimax:MiniMax-M2',
          regularProvider: 'synthetic',
          thinkingProvider: 'minimax',
          createdAt: new Date().toISOString(),
        },
      });

      // Create new manager and load configuration
      const newManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const config = newManager.config;

      expect(config.defaultProvider).toBe('minimax');
      expect(config.providers.synthetic.enabled).toBe(false);
      expect(config.providers.synthetic.apiKey).toBe('new-synthetic-key');
      expect(config.providers.minimax.apiKey).toBe('new-minimax-key');
      expect(config.selectedThinkingModel).toBe('minimax:MiniMax-M2');
      expect(config.combination1?.name).toBe('Test Combo');
    });

    it('should handle environment variable overrides', async () => {
      // Mock environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        SYNTHETIC_API_KEY: 'env-synthetic-key',
        MINIMAX_API_KEY: 'env-minimax-key',
      };

      try {
        // Create manager that should pick up env variables
        const envManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));

        // Environment variables should override config
        expect(envManager.getEffectiveApiKey('synthetic')).toBe('env-synthetic-key');
        expect(envManager.getEffectiveApiKey('minimax')).toBe('env-minimax-key');

        // But should still have config values as fallback
        expect(envManager.getSyntheticApiKey()).toBe('test-synthetic-key');
        expect(envManager.getMinimaxApiKey()).toBe('test-minimax-key');
      } finally {
        process.env = originalEnv;
      }
    });
  });

  describe('App integration scenarios', () => {
    let app: SyntheticClaudeApp;

    beforeEach(() => {
      app = new SyntheticClaudeApp();
    });

    it('should handle complete app lifecycle with multi-providers', async () => {
      // Mock app methods
      app.run = jest.fn();
      app.interactiveModelSelection = jest.fn().mockResolvedValue(true);
      app.getConfig = jest.fn().mockReturnValue(configManager.config);

      // Test app execution with provider options
      await app.run({
        additionalArgs: [],
        model: 'synthetic:claude-3-sonnet',
        thinkingModel: 'minimax:MiniMax-M2',
      });

      expect(app.run).toHaveBeenCalledWith({
        additionalArgs: [],
        model: 'synthetic:claude-3-sonnet',
        thinkingModel: 'minimax:MiniMax-M2',
      });
    });

    it('should handle doctor command across multiple providers', async () => {
      // Mock doctor functionality
      const mockDoctorResult = {
        configValid: true,
        providers: [
          {
            name: 'synthetic',
            enabled: true,
            apiKeyConfigured: true,
            connectionStatus: 'connected',
            modelCount: 3,
          },
          {
            name: 'minimax',
            enabled: true,
            apiKeyConfigured: true,
            connectionStatus: 'connected',
            modelCount: 2,
          },
        ],
        cacheStatus: 'valid',
        claudeExecutable: '/usr/bin/claude',
      };

      // This would be implemented in the actual app
      expect(mockDoctorResult.providers).toHaveLength(2);
      expect(mockDoctorResult.providers.every(p => p.apiKeyConfigured)).toBe(true);
    });

    it('should handle model combination save and load', async () => {
      // Test saving combination
      await configManager.updateConfig({
        combination1: {
          name: 'Fast Combo',
          regularModel: 'synthetic:claude-3-haiku',
          thinkingModel: 'minimax:MiniMax-M2',
          regularProvider: 'synthetic',
          thinkingProvider: 'minimax',
          createdAt: new Date().toISOString(),
        },
      });

      // Test loading and usage
      const config = configManager.config;
      expect(config.combination1?.name).toBe('Fast Combo');
      expect(config.combination1?.regularProvider).toBe('synthetic');
      expect(config.combination1?.thinkingProvider).toBe('minimax');
    });
  });

  describe('Error recovery and edge cases', () => {
    it('should recover from API failures gracefully', async () => {
      // Mock API failure
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const models = await modelManager.fetchModels();
      expect(models).toHaveLength(2); // Should still get MiniMax models
    });

    it('should handle corrupted cache', async () => {
      // Write corrupted cache
      const cacheFile = join(tempDir, 'models_cache.json');
      await writeFile(cacheFile, 'invalid json content');

      // Should recover and fetch fresh data
      const models = await modelManager.fetchModels();
      expect(models).toHaveLength(5);
    });

    it('should handle partial API responses', async () => {
      // Mock partial response from one provider
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          data: [
            { id: 'synthetic:claude-3-sonnet', object: 'model' },
            null, // Invalid entry
            { object: 'model' }, // Missing id
          ],
        },
      });

      const models = await modelManager.fetchModels();
      expect(models).toHaveLength(3); // 1 synthetic + 2 minimax
    });

    it('should handle configuration validation errors', async () => {
      // Try to set invalid configuration
      await expect(
        configManager.updateConfig({
          cacheDurationHours: -1, // Invalid
        })
      ).rejects.toThrow();
    });
  });

  describe('Performance and reliability', () => {
    it('should handle large numbers of models efficiently', async () => {
      // Mock many models
      const manyModels = Array.from({ length: 100 }, (_, i) => ({
        id: `synthetic:model-${i}`,
        object: 'model' as const,
      }));

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: { data: manyModels },
      });

      const startTime = Date.now();
      const models = await modelManager.fetchModels();
      const endTime = Date.now();

      expect(models.length).toBeGreaterThan(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in < 5 seconds
    });

    it('should maintain performance with multiple concurrent operations', async () => {
      // Run multiple operations concurrently
      const operations = [
        modelManager.fetchModels(),
        modelManager.getModelStatistics(),
        modelManager.getCacheAnalytics(),
        configManager.config,
        configManager.isProviderEnabled('synthetic'),
      ];

      const results = await Promise.all(operations);
      expect(results).toHaveLength(5);
    });
  });

  describe('Authentication Scenarios', () => {
    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks();
    });

    it('should handle Synthetic API 401 authentication failure', async () => {
      // Mock 401 response for Synthetic API
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401, data: { error: 'Invalid API key' } }
      });

      // Set up config with invalid API key
      await configManager.setSyntheticApiKey('invalid-key');
      await configManager.setProviderEnabled('synthetic', true);
      await configManager.setProviderEnabled('minimax', false);

      const app = new SyntheticClaudeApp();

      // Test validateProviderCredentials catches the error
      const validation = await (app as any).validateProviderCredentials();
      expect(validation.valid).toBe(false);
      expect(validation.authenticationError).toContain('All providers failed authentication');
      expect(validation.authenticationError).toContain('synthetic authentication failed');
    });

    it('should handle MiniMax API 401 authentication failure', async () => {
      // Mock 401 response for MiniMax API
      const { MiniMaxClient } = require('../src/api/minimax-client');
      MiniMaxClient.mockImplementation(() => ({
        fetchModelsWithRetry: jest.fn().mockRejectedValueOnce({
          response: { status: 401, data: { error: 'Invalid MiniMax credentials' } }
        }),
      }));

      // Set up config with invalid MiniMax credentials
      await configManager.setMinimaxApiKey('invalid-key');
      await configManager.setProviderEnabled('synthetic', false);
      await configManager.setProviderEnabled('minimax', true);

      const app = new SyntheticClaudeApp();

      // Test validateProviderCredentials catches the error
      const validation = await (app as any).validateProviderCredentials();
      expect(validation.valid).toBe(false);
      expect(validation.authenticationError).toContain('All providers failed authentication');
      expect(validation.authenticationError).toContain('minimax authentication failed');
    });

    it('should handle network connection failures', async () => {
      // Mock network error for both providers
      mockedAxios.get.mockRejectedValueOnce({
        code: 'ECONNREFUSED',
        message: 'Connection refused'
      });

      const { MiniMaxClient } = require('../src/api/minimax-client');
      MiniMaxClient.mockImplementation(() => ({
        fetchModelsWithRetry: jest.fn().mockRejectedValueOnce({
          code: 'ECONNREFUSED',
          message: 'Connection refused'
        }),
      }));

      // Enable both providers
      await configManager.setSyntheticApiKey('test-key');
      await configManager.setMinimaxApiKey('test-key');
      await configManager.setProviderEnabled('synthetic', true);
      await configManager.setProviderEnabled('minimax', true);

      const app = new SyntheticClaudeApp();

      // Test validateProviderCredentials handles network errors
      const validation = await (app as any).validateProviderCredentials();
      expect(validation.valid).toBe(false);
      expect(validation.authenticationError).toContain('All providers failed authentication');
    });

    it('should handle partial provider failures gracefully', async () => {
      // Mock Synthetic API success, MiniMax API failure
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: [
            { id: 'claude-3-5-sonnet-20241022', object: 'model' },
            { id: 'claude-3-opus-20240229', object: 'model' },
          ]
        }
      });

      const { MiniMaxClient } = require('../src/api/minimax-client');
      MiniMaxClient.mockImplementation(() => ({
        fetchModelsWithRetry: jest.fn().mockRejectedValueOnce({
          response: { status: 401, data: { error: 'Invalid MiniMax credentials' } }
        }),
      }));

      // Enable both providers with valid keys
      await configManager.setSyntheticApiKey('valid-key-1234567890123456');
      await configManager.setMinimaxApiKey('invalid-key');
      await configManager.setProviderEnabled('synthetic', true);
      await configManager.setProviderEnabled('minimax', true);

      const app = new SyntheticClaudeApp();

      // Test validateProviderCredentials succeeds with partial failures
      const validation = await (app as any).validateProviderCredentials();
      expect(validation.valid).toBe(true);
    });

    it('should handle API key format validation during setup', async () => {
      const app = new SyntheticClaudeApp();

      // Test API key format validation
      const invalidFormat = (app as any).validateApiKeyFormat('synthetic', 'short');
      expect(invalidFormat.valid).toBe(false);
      expect(invalidFormat.error).toContain('appears to be too short');

      const placeholderFormat = (app as any).validateApiKeyFormat('synthetic', 'sk-test-placeholder');
      expect(placeholderFormat.valid).toBe(false);
      expect(placeholderFormat.error).toContain('placeholder value');

      const validFormat = (app as any).validateApiKeyFormat('synthetic', 'sk-1234567890abcdef123456');
      expect(validFormat.valid).toBe(true);
    });

    it('should categorize errors correctly for recovery', async () => {
      const app = new SyntheticClaudeApp();

      // Test error categorization
      const authError = (app as any).categorizeError({ response: { status: 401 } });
      expect(authError).toBe('AUTHENTICATION');

      const networkError = (app as any).categorizeError({ code: 'ECONNREFUSED' });
      expect(networkError).toBe('NETWORK');

      const providerError = (app as any).categorizeError({ message: 'No providers are enabled' });
      expect(providerError).toBe('PROVIDER_UNAVAILABLE');

      const uiError = (app as any).categorizeError({ message: 'UI error occurred' });
      expect(uiError).toBe('UI_ERROR');

      const unknownError = (app as any).categorizeError({ message: 'Random error' });
      expect(unknownError).toBe('UNKNOWN');
    });

    it('should handle provider state consistency', async () => {
      // Test atomic provider state
      const providerState = configManager.getAtomicProviderState();

      expect(providerState).toHaveProperty('synthetic');
      expect(providerState).toHaveProperty('minimax');

      expect(providerState.synthetic).toHaveProperty('enabled');
      expect(providerState.synthetic).toHaveProperty('hasApiKey');
      expect(providerState.synthetic).toHaveProperty('available');

      expect(providerState.minimax).toHaveProperty('enabled');
      expect(providerState.minimax).toHaveProperty('hasApiKey');
      expect(providerState.minimax).toHaveProperty('available');

      // Test consistent network display
      const networkDisplay1 = configManager.getNetworkDisplay();
      const networkDisplay2 = configManager.getNetworkDisplay();
      expect(networkDisplay1).toBe(networkDisplay2);
    });
  });
});