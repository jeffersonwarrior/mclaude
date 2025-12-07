import { ConfigManager } from '../src/config';
import { setupConfigTestEnvironment } from './helpers/config-test-utils';
import { writeFile } from 'fs/promises';
import { join } from 'path';

describe('ConfigManager - Configuration Migration', () => {
  const { createConfigManager } = setupConfigTestEnvironment();
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = createConfigManager();
  });

  describe('Configuration migration', () => {
    it('should migrate legacy configuration format', async () => {
      // Create legacy config file
      const tempDir = configManager['globalConfigDir'].replace(/\/config\.json$/, '').replace(/\.config\/mclaude$/, '');
      const legacyConfigPath = join(tempDir, '.config', 'mclaude', 'config.json');
      const legacyConfig = {
        apiKey: 'legacy-api-key',
        baseUrl: 'https://legacy.api.com',
        selectedModel: 'legacy:model',
        cacheDurationHours: 12,
        firstRunCompleted: true,
        // No configVersion - indicates legacy format
      };

      // Initialize config first, then save to create directory
      const defaultConfig = configManager.config; // This triggers loading defaults
      await configManager.saveConfig(defaultConfig); // Create the config directory
      await writeFile(legacyConfigPath, JSON.stringify(legacyConfig, null, 2));

      // Create new manager and load migrated config
      const migratedManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));
      const migratedConfig = migratedManager.config;

      // Should have migrated to new format
      expect(migratedConfig.configVersion).toBe(2);
      expect(migratedConfig.providers.synthetic.apiKey).toBe('legacy-api-key');
      expect(migratedConfig.providers.synthetic.baseUrl).toBe('https://legacy.api.com');
      expect(migratedConfig.selectedModel).toBe('legacy:model');
      expect(migratedConfig.cacheDurationHours).toBe(12);
      expect(migratedConfig.firstRunCompleted).toBe(true);
    });

    it('should handle current configuration format without migration', async () => {
      // Current format should load without changes
      const config = configManager.config;
      expect(config.configVersion).toBe(2);
      expect(config.providers).toBeDefined();
      expect(config.defaultProvider).toBe('auto');
    });
  });
});