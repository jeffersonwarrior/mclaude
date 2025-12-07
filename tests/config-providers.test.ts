import { ConfigManager } from '../src/config';
import { setupConfigTestEnvironment } from './helpers/config-test-utils';

describe('ConfigManager - Provider Management', () => {
  const { createConfigManager } = setupConfigTestEnvironment();
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = createConfigManager();
  });

  describe('Provider management', () => {
    it('should enable and disable providers', async () => {
      // Initially synthetic should be enabled
      expect(configManager.isProviderEnabled('synthetic')).toBe(true);
      
      await configManager.setProviderEnabled('synthetic', false);
      expect(configManager.isProviderEnabled('synthetic')).toBe(false);
      
      await configManager.setProviderEnabled('synthetic', true);
      expect(configManager.isProviderEnabled('synthetic')).toBe(true);
    });

    it('should get provider configuration', async () => {
      const syntheticConfig = configManager.getProviderConfig('synthetic');
      expect(syntheticConfig).toBeDefined();
      expect(syntheticConfig!.anthropicBaseUrl).toBe('https://api.synthetic.new/anthropic');
      
      const minimaxConfig = configManager.getProviderConfig('minimax');
      expect(minimaxConfig).toBeDefined();
      expect(minimaxConfig!.anthropicBaseUrl).toBe('https://api.minimax.io/anthropic');
    });

    it('should handle unknown provider', () => {
      const unknownConfig = configManager.getProviderConfig('unknown' as any);
      expect(unknownConfig).toBeNull();
    });

    it('should get effective API key for provider', () => {
      const syntheticKey = configManager.getEffectiveApiKey('synthetic');
      expect(typeof syntheticKey).toBe('string');
      
      const minimaxKey = configManager.getEffectiveApiKey('minimax');
      expect(typeof minimaxKey).toBe('string');
    });

    it('should set default provider', async () => {
      await configManager.setDefaultProvider('synthetic');
      expect(configManager.config.defaultProvider).toBe('synthetic');
      
      await configManager.setDefaultProvider('minimax');
      expect(configManager.config.defaultProvider).toBe('minimax');
      
      await configManager.setDefaultProvider('auto');
      expect(configManager.config.defaultProvider).toBe('auto');
    });

    it('should check if providers are enabled', () => {
      // Auto should always be enabled
      expect(configManager.isProviderEnabled('auto')).toBe(true);
      
      // Synthetic and MiniMax should be enabled by default
      expect(configManager.isProviderEnabled('synthetic')).toBe(true);
      expect(configManager.isProviderEnabled('minimax')).toBe(true);
    });
  });
});