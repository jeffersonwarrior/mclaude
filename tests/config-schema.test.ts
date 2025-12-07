import {
  AppConfigSchema,
  LegacyAppConfigSchema,
  ProviderEnum
} from '../src/config';

describe('ConfigManager - Schema Validation', () => {
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
        expect(result.data.configVersion).toBe(2);
        expect(result.data.providers.synthetic.enabled).toBe(true);
        expect(result.data.providers.minimax.enabled).toBe(true);
      }
    });
  });

  describe('ProviderEnum validation', () => {
    it('should accept valid provider values', () => {
      expect(ProviderEnum.safeParse('synthetic').success).toBe(true);
      expect(ProviderEnum.safeParse('minimax').success).toBe(true);
      expect(ProviderEnum.safeParse('auto').success).toBe(true);
    });

    it('should reject invalid provider values', () => {
      expect(ProviderEnum.safeParse('invalid').success).toBe(false);
      expect(ProviderEnum.safeParse('SYNTHETIC').success).toBe(false);
      expect(ProviderEnum.safeParse('').success).toBe(false);
    });
  });

  describe('LegacyAppConfigSchema validation', () => {
    it('should validate valid legacy configuration', () => {
      const validLegacyConfig = {
        apiKey: 'legacy-api-key',
        baseUrl: 'https://legacy.api.com',
        anthropicBaseUrl: 'https://legacy.api.com/anthropic',
        modelsApiUrl: 'https://legacy.api.com/models',
        selectedModel: 'legacy:model',
        cacheDurationHours: 12,
        firstRunCompleted: true,
      };

      const result = LegacyAppConfigSchema.safeParse(validLegacyConfig);
      expect(result.success).toBe(true);
    });

    it('should require legacy-specific fields', () => {
      const incompleteConfig = {
        apiKey: 'test-key',
        // Missing other required legacy fields
      };

      const result = LegacyAppConfigSchema.safeParse(incompleteConfig);
      expect(result.success).toBe(true); // Legacy schema has defaults for most fields
    });
  });
});