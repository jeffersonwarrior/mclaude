import { ConfigManager } from '../src/config';
import { SyntheticClaudeApp } from '../src/core/app';
import { createProgram } from '../src/cli/commands';
import { jest } from '@jest/globals';

// Mock the app to avoid real launches
jest.mock('../src/core/app');
const MockedSyntheticClaudeApp = SyntheticClaudeApp as jest.MockedClass<typeof SyntheticClaudeApp>;

describe('CLI Config Commands', () => {
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
      getConfig: jest.fn().mockReturnValue({ // Keeping getConfig here as it's directly used by app.run
        selectedModel: '',
        selectedThinkingModel: '',
        defaultProvider: 'synthetic',
        combinations: {},
        providers: {
          synthetic: { enabled: true, hasApiKey: true },
          minimax: { enabled: false, hasApiKey: false }
        }
      }),
      managers: {
        modelInteractionManager: {
          interactiveModelSelection: jest.fn().mockResolvedValue(true), // interactiveModelSelection is called
        } as any,
        providerManager: {
          listProviderConfigs: jest.fn().mockResolvedValue(undefined),
          getProviderConfigInfo: jest.fn().mockResolvedValue(undefined),
          setProviderConfig: jest.fn().mockResolvedValue(undefined),
          listProviders: jest.fn().mockResolvedValue(undefined),
          enableProvider: jest.fn().mockResolvedValue(undefined),
          disableProvider: jest.fn().mockResolvedValue(undefined),
          providerStatus: jest.fn().mockResolvedValue(undefined),
          testProvider: jest.fn().mockResolvedValue(undefined),
        } as any,
        configCliManager: {
          showConfig: jest.fn().mockResolvedValue(undefined),
          setConfig: jest.fn().mockResolvedValue(undefined),
          listCombinations: jest.fn().mockResolvedValue(undefined),
          saveCombination: jest.fn().mockResolvedValue(undefined),
          deleteCombination: jest.fn().mockResolvedValue(undefined),
          manageSysprompt: jest.fn().mockResolvedValue(undefined),
        } as any,
        setupManager: {
          setup: jest.fn().mockResolvedValue(undefined),
        } as any,
        systemManager: {
          doctor: jest.fn().mockResolvedValue(undefined),
          clearCache: jest.fn().mockResolvedValue(undefined),
          cacheInfo: jest.fn().mockResolvedValue(undefined),
        } as any,
        authManager: {
          authStatus: jest.fn().mockResolvedValue(undefined),
          checkAuth: jest.fn().mockResolvedValue(undefined),
          testAuth: jest.fn().mockResolvedValue(undefined),
          resetAuth: jest.fn().mockResolvedValue(undefined),
          refreshAuth: jest.fn().mockResolvedValue(undefined),
        } as any,
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

  describe('config command group', () => {
    it('should show current configuration', async () => {
      const program = createProgram();

      // Add mock implementation for console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Reset mock to clear default resolved value, then set resolved return value
      mockApp.managers.configCliManager.showConfig.mockResolvedValue(undefined);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'config'];

      try {
        await program.parseAsync(['node', 'mclaude', 'config', 'show']);

        expect(mockApp.managers.configCliManager.showConfig).toHaveBeenCalled();
      } finally {
        consoleSpy.mockRestore();
        process.argv = originalArgv;
      }
    });

    it('should set configuration value', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'config', 'set', 'defaultProvider', 'minimax'];

      try {
        await program.parseAsync(['node', 'mclaude', 'config', 'set', 'defaultProvider', 'minimax']);

        expect(mockApp.managers.configCliManager.setConfig).toHaveBeenCalledWith('defaultProvider', 'minimax');
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should set provider configuration', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'config', 'provider', 'set', 'synthetic', 'apiKey', 'new-key'];

      try {
        await program.parseAsync(['node', 'mclaude', 'config', 'provider', 'set', 'synthetic', 'apiKey', 'new-key']);

        expect(mockApp.managers.providerManager.setProviderConfig).toHaveBeenCalledWith('synthetic', 'apiKey', 'new-key');
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should list provider configurations', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'config', 'provider', 'list'];

      try {
        await program.parseAsync(['node', 'mclaude', 'config', 'provider', 'list']);

        expect(mockApp.managers.providerManager.listProviderConfigs).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should get provider configuration', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'config', 'provider', 'get', 'synthetic'];

      try {
        await program.parseAsync(['node', 'mclaude', 'config', 'provider', 'get', 'synthetic']);

        expect(mockApp.managers.providerManager.getProviderConfigInfo).toHaveBeenCalledWith('synthetic');
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('combination command group', () => {
    it('should list combinations', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'combination'];

      try {
        await program.parseAsync(['node', 'mclaude', 'combination', 'list']);

        expect(mockApp.managers.configCliManager.listCombinations).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should save combination', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'combination', 'save', 'My Combo', 'synthetic:claude-3-sonnet', 'minimax:MiniMax-M2'];

      try {
        await program.parseAsync(['node', 'mclaude', 'combination', 'save', 'My Combo', 'synthetic:claude-3-sonnet', 'minimax:MiniMax-M2']);

        expect(mockApp.managers.configCliManager.saveCombination).toHaveBeenCalledWith('My Combo', 'synthetic:claude-3-sonnet', 'minimax:MiniMax-M2');
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should delete combination', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'combination', 'delete', 'My Combo'];

      try {
        await program.parseAsync(['node', 'mclaude', 'combination', 'delete', 'My Combo']);

        expect(mockApp.managers.configCliManager.deleteCombination).toHaveBeenCalledWith('My Combo');
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('setup command', () => {
    it('should run initial setup', async () => {
      const program = createProgram();

      // Add setup method to mock
      mockApp.managers.setupManager.setup = jest.fn().mockResolvedValue(undefined);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'setup'];

      try {
        await program.parseAsync(['node', 'mclaude', 'setup']);

        expect(mockApp.managers.setupManager.setup).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('doctor command', () => {
    it('should check system health', async () => {
      const program = createProgram();

      // Mock console output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'doctor'];

      try {
        await program.parseAsync(['node', 'mclaude', 'doctor']);

        expect(mockApp.managers.systemManager.doctor).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
        consoleSpy.mockRestore();
      }
    });
  });
});