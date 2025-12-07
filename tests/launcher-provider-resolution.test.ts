import { ClaudeLauncher } from '../src/launcher/claude-launcher';
import { ConfigManager } from '../src/config/manager';
import { ModelInfoImpl } from '../src/models/info';
import { LaunchOptions } from '../src/launcher/claude-launcher';
import { createMockConfigManager, setupDefaultMocks } from './helpers/launcher-test-utils';

describe('ClaudeLauncher - Provider Resolution', () => {
  let configManager: jest.Mocked<ConfigManager>;
  let launcher: ClaudeLauncher;

  beforeEach(() => {
    configManager = createMockConfigManager();
    setupDefaultMocks(configManager);
    launcher = new ClaudeLauncher('claude', configManager);
  });

  it('should resolve provider from explicit option', async () => {
    const options: LaunchOptions = {
      model: 'synthetic:claude-3-sonnet',
      provider: 'minimax',
    };

    const resolveProvider = (launcher as any).resolveProvider.bind(launcher);
    const provider = resolveProvider(options);

    expect(provider).toBe('minimax');
  });

  it('should resolve provider from modelInfo', async () => {
    const modelInfo = new ModelInfoImpl({
      id: 'synthetic:claude-3-sonnet',
      object: 'model',
      provider: 'synthetic',
    });

    const options: LaunchOptions = {
      model: 'synthetic:claude-3-sonnet',
      modelInfo,
    };

    const resolveProvider = (launcher as any).resolveProvider.bind(launcher);
    const provider = resolveProvider(options);

    expect(provider).toBe('synthetic');
  });

  it('should resolve provider from model ID format', async () => {
    const options: LaunchOptions = {
      model: 'minimax:MiniMax-M2',
    };

    const resolveProvider = (launcher as any).resolveProvider.bind(launcher);
    const provider = resolveProvider(options);

    expect(provider).toBe('minimax');
  });

  it('should fallback to synthetic when provider cannot be determined', async () => {
    const options: LaunchOptions = {
      model: 'claude-3-sonnet',
    };

    const resolveProvider = (launcher as any).resolveProvider.bind(launcher);
    const provider = resolveProvider(options);

    expect(provider).toBe('synthetic');
  });

  it('should resolve thinking model provider from model ID', async () => {
    const thinkingModel = 'synthetic:claude-3-sonnet-thinking';

    const resolveThinkingProvider = (launcher as any).resolveThinkingProvider.bind(launcher);
    const provider = resolveThinkingProvider(thinkingModel, 'minimax');

    expect(provider).toBe('synthetic');
  });

  it('should use default provider for thinking model when not specified', async () => {
    const thinkingModel = 'claude-3-thinking';

    const resolveThinkingProvider = (launcher as any).resolveThinkingProvider.bind(launcher);
    const provider = resolveThinkingProvider(thinkingModel, 'synthetic');

    expect(provider).toBe('synthetic');
  });
});