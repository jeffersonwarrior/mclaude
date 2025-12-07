import { ConfigManager } from '../src/config';
import { setupConfigTestEnvironment } from './helpers/config-test-utils';

describe('ConfigManager - Model Management', () => {
  const { createConfigManager } = setupConfigTestEnvironment();
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = createConfigManager();
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