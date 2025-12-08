import { ConfigManager } from '../src/config';
import { SyntheticClaudeApp } from '../src/core/app';
import { createProgram } from '../src/cli/commands';
import { jest } from '@jest/globals';

// Mock the app to avoid real launches
jest.mock('../src/core/app');
const MockedSyntheticClaudeApp = SyntheticClaudeApp as jest.MockedClass<typeof SyntheticClaudeApp>;

describe('CLI Provider Commands', () => {
  let configManager: ConfigManager;
  let tempDir: string;
  let mockApp: jest.Mocked<SyntheticClaudeApp>;

  beforeEach(async () => {
    // Create test environment inline
    const { mkdtemp } = await import('fs/promises');
    const { join } = await import('path');
    const { tmpdir } = await import('os');
    
    tempDir = await mkdtemp(join(tmpdir(), 'mclaude-cli-test-'));
    configManager = new ConfigManager(join(tempDir, '.config', 'mclaude'));

    // Mock app instance
    mockApp = {
      run: jest.fn(),
      interactiveModelSelection: jest.fn(),
      getConfig: jest.fn().mockReturnValue({
        selectedModel: '',
        selectedThinkingModel: '',
        defaultProvider: 'synthetic',
        combinations: {},
        providers: {
          synthetic: { enabled: true, hasApiKey: true },
          minimax: { enabled: false, hasApiKey: false }
        }
      }),
      setDefaultProvider: jest.fn(),
      doctor: jest.fn(),
      showModelInfo: jest.fn(),
      clearCache: jest.fn(),
      listProviders: jest.fn(),
      configureProvider: jest.fn(),
      listCombinations: jest.fn(),
      saveCombination: jest.fn(),
      deleteCombination: jest.fn(),
      showConfig: jest.fn().mockResolvedValue(undefined),
      enableProvider: jest.fn().mockResolvedValue(undefined),
      disableProvider: jest.fn().mockResolvedValue(undefined),
      providerStatus: jest.fn().mockResolvedValue(undefined),
      testProvider: jest.fn().mockResolvedValue(undefined),
      listModels: jest.fn().mockResolvedValue(undefined),
      searchModels: jest.fn().mockResolvedValue(undefined),
      cacheInfo: jest.fn().mockResolvedValue(undefined),
      authStatus: jest.fn().mockResolvedValue(undefined),
      checkAuth: jest.fn().mockResolvedValue(undefined),
      testAuth: jest.fn().mockResolvedValue(undefined),
      resetAuth: jest.fn().mockResolvedValue(undefined),
      refreshAuth: jest.fn().mockResolvedValue(undefined),
      setConfig: jest.fn().mockResolvedValue(undefined),
      listProviderConfigs: jest.fn().mockResolvedValue(undefined),
      getProviderConfigInfo: jest.fn().mockResolvedValue(undefined),
      setProviderConfig: jest.fn().mockResolvedValue(undefined),
      initLocalConfig: jest.fn().mockResolvedValue(undefined),
      switchToLocalConfig: jest.fn().mockResolvedValue(undefined),
      switchToGlobalConfig: jest.fn().mockResolvedValue(undefined),
      migrateConfig: jest.fn().mockResolvedValue(undefined),
      showConfigContext: jest.fn().mockResolvedValue(undefined),
      resetConfig: jest.fn().mockResolvedValue(undefined),
      setup: jest.fn().mockResolvedValue(undefined),
      managers: {
        providerManager: {
          listProviders: jest.fn().mockResolvedValue(undefined),
          enableProvider: jest.fn().mockResolvedValue(undefined),
          disableProvider: jest.fn().mockResolvedValue(undefined),
          providerStatus: jest.fn().mockResolvedValue(undefined),
          testProvider: jest.fn().mockResolvedValue(undefined),
        },
        configManager: {
          get: jest.fn(),
          set: jest.fn(),
        },
        ui: {
          info: jest.fn(),
        },
        authManager: {
          authStatus: jest.fn().mockResolvedValue(undefined),
          checkAuth: jest.fn().mockResolvedValue(undefined),
          testAuth: jest.fn().mockResolvedValue(undefined),
          resetAuth: jest.fn().mockResolvedValue(undefined),
          refreshAuth: jest.fn().mockResolvedValue(undefined),
        },
      },
    } as any;

    MockedSyntheticClaudeApp.mockImplementation(() => mockApp);
  });

  afterEach(async () => {
    try {
      const { rm } = await import('fs/promises');
      await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
    jest.clearAllMocks();
  });

  describe('providers command group', () => {
    it('should list all providers', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'providers', 'list'];

      try {
        await program.parseAsync(['node', 'mclaude', 'providers', 'list']);

        expect(mockApp.managers.providerManager.listProviders).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should enable provider', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'providers', 'enable', 'synthetic'];

      try {
        await program.parseAsync(['node', 'mclaude', 'providers', 'enable', 'synthetic']);

        expect(mockApp.managers.providerManager.enableProvider).toHaveBeenCalledWith('synthetic');
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should disable provider', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'providers', 'disable', 'minimax'];

      try {
        await program.parseAsync(['node', 'mclaude', 'providers', 'disable', 'minimax']);

        expect(mockApp.managers.providerManager.disableProvider).toHaveBeenCalledWith('minimax');
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should show provider status', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'providers', 'status'];

      try {
        await program.parseAsync(['node', 'mclaude', 'providers', 'status']);

        expect(mockApp.managers.providerManager.providerStatus).toHaveBeenCalledWith({});
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should show specific provider status', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'providers', 'status', '--provider', 'synthetic'];

      try {
        await program.parseAsync(['node', 'mclaude', 'providers', 'status', '--provider', 'synthetic']);

        expect(mockApp.managers.providerManager.providerStatus).toHaveBeenCalledWith({
          provider: 'synthetic',
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should test provider', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'providers', 'test', 'synthetic'];

      try {
        await program.parseAsync(['node', 'mclaude', 'providers', 'test', 'synthetic']);

        expect(mockApp.managers.providerManager.testProvider).toHaveBeenCalledWith('synthetic');
      } finally {
        process.argv = originalArgv;
      }
    });
  });
});