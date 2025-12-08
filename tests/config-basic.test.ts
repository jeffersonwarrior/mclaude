import { ConfigManager } from '../src/config';
import { setupConfigTestEnvironment } from './helpers/config-test-utils';

describe('ConfigManager - Basic Operations', () => {
  const { createConfigManager } = setupConfigTestEnvironment();
  let configManager: ConfigManager;

  beforeEach(() => {
    // Clear require cache for env module to ensure fresh environment
    const envModulePath = require.resolve('../src/config/env');
    delete require.cache[envModulePath];
    
    configManager = createConfigManager();
  });
  
  describe('Configuration loading', () => {
    it('should load default multi-provider configuration when no config file exists', () => {
      const config = configManager.config;

      // Check multi-provider structure
      expect(config.providers).toBeDefined();
      expect(config.providers.synthetic).toBeDefined();
      expect(config.providers.minimax).toBeDefined();
      expect(config.defaultProvider).toBe('auto'); // Updated to match actual default
      expect(config.configVersion).toBe(2);

      // Check defaults
      expect(config.providers.synthetic.apiKey).toBe('test-secure-key'); // Current test value
      expect(config.providers.synthetic.baseUrl).toBe('https://api.synthetic.new');
      expect(config.providers.synthetic.enabled).toBe(true);
      expect(config.providers.minimax.apiKey).toBe('');
      expect(config.providers.minimax.baseUrl).toBe('https://api.minimax.io');
      expect(config.providers.minimax.enabled).toBe(true);
      expect(config.cacheDurationHours).toBe(24);
      expect(config.selectedModel).toBe(''); // Updated to match actual config
    });
  });
});