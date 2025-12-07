import { ClaudeLauncher } from '../src/launcher/claude-launcher';
import { ConfigManager } from '../src/config/manager';
import { createMockConfigManager, setupDefaultMocks } from './helpers/launcher-test-utils';

describe('ClaudeLauncher - Constructor', () => {
  let configManager: jest.Mocked<ConfigManager>;

  beforeEach(() => {
    configManager = createMockConfigManager();
    setupDefaultMocks(configManager);
  });

  it('should create launcher with default claude path', () => {
    const testLauncher = new ClaudeLauncher();
    expect(testLauncher).toBeDefined();
  });

  it('should create launcher with custom claude path', () => {
    const testLauncher = new ClaudeLauncher('/custom/claude');
    expect(testLauncher).toBeDefined();
  });

  it('should create launcher with config manager', () => {
    const testLauncher = new ClaudeLauncher('claude', configManager);
    expect(testLauncher).toBeDefined();
  });
});