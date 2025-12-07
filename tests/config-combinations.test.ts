import { ConfigManager } from '../src/config';
import { setupConfigTestEnvironment } from './helpers/config-test-utils';

describe('ConfigManager - Model Combination Management', () => {
  const { createConfigManager } = setupConfigTestEnvironment();
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = createConfigManager();
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

    it('should handle partial model combination updates', async () => {
      // Create first combination
      const combination1 = {
        name: 'Initial Combo',
        regularModel: 'synthetic:claude-3-sonnet',
        thinkingModel: 'synthetic:claude-3-sonnet',
        regularProvider: 'synthetic',
        thinkingProvider: 'synthetic',
        createdAt: new Date().toISOString(),
      };

      await configManager.updateConfig({ combination1 });

      // Update only combination2
      const combination2 = {
        name: 'Second Combo',
        regularModel: 'minimax:MiniMax-M2',
        thinkingModel: 'minimax:MiniMax-M2',
        regularProvider: 'minimax',
        thinkingProvider: 'minimax',
        createdAt: new Date().toISOString(),
      };

      await configManager.updateConfig({ combination2 });

      const config = configManager.config;
      expect(config.combination1?.name).toBe('Initial Combo');
      expect(config.combination2?.name).toBe('Second Combo');
    });
  });
});