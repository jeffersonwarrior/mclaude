import { ConfigManager } from '../src/config/manager';

// Shared test utilities for launcher tests
export function createMockConfigManager(): jest.Mocked<ConfigManager> {
  return {
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
          anthropicBaseUrl: 'http://127.0.0.1:9313',
          modelsApiUrl: 'https://api.synthetic.new/openai/v1/models',
          enabled: true,
        },
        minimax: {
          apiKey: 'minimax-key',
          anthropicBaseUrl: 'http://127.0.0.1:9313',
          modelsApiUrl: 'https://api.minimax.io/v1/models',
          enabled: true,
        },
      },
    },
  } as any;
}

export function setupDefaultMocks(configManager: jest.Mocked<ConfigManager>): void {
  configManager.isProviderEnabled.mockReturnValue(true);
  configManager.getProviderConfig.mockImplementation((provider) => {
    const configs: any = {
      synthetic: {
        anthropicBaseUrl: 'http://127.0.0.1:9313',
        modelsApiUrl: 'https://api.synthetic.new/openai/v1/models',
      },
      minimax: {
        anthropicBaseUrl: 'http://127.0.0.1:9313',
        modelsApiUrl: 'https://api.minimax.io/v1/models',
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
}