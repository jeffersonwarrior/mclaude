import { ConfigManager } from '../src/config';
import { SyntheticClaudeApp } from '../src/core/app';
import { createProgram } from '../src/cli/commands';
import { jest } from '@jest/globals';

// Mock the app to avoid real launches
jest.mock('../src/core/app');
const MockedSyntheticClaudeApp = SyntheticClaudeApp as jest.MockedClass<typeof SyntheticClaudeApp>;

// Helper function to fail test when expected error doesn't occur
const fail = () => {
  throw new Error('Test was supposed to fail but it passed');
};

describe('CLI Main Commands', () => {
  let configManager: ConfigManager;
  let tempDir: string;
  let mockApp: jest.Mocked<SyntheticClaudeApp>;

  beforeEach(async () => {
    // Create test environment inline for now
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

  describe('main command', () => {
    it('should launch Claude Code with basic options', async () => {
      const program = createProgram();

      // Mock process.argv
      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', '--model', 'synthetic:claude-3-sonnet'];

      try {
        await program.parseAsync(['node', 'mclaude', '--model', 'synthetic:claude-3-sonnet']);

        expect(mockApp.run).toHaveBeenCalledWith({
          model: 'synthetic:claude-3-sonnet',
          additionalArgs: [],
          stream: true,
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle stream flag correctly', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', '--model', 'synthetic:claude-3-sonnet', '--no-stream'];

      try {
        await program.parseAsync(['node', 'mclaude', '--model', 'synthetic:claude-3-sonnet', '--no-stream']);

        expect(mockApp.run).toHaveBeenCalledWith({
          model: 'synthetic:claude-3-sonnet',
          additionalArgs: [],
          stream: false,
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should pass additional arguments correctly', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', '--model', 'synthetic:claude-3-sonnet', '--', '--help'];

      try {
        await program.parseAsync(['node', 'mclaude', '--model', 'synthetic:claude-3-sonnet', '--', '--help']);

        expect(mockApp.run).toHaveBeenCalledWith({
          model: 'synthetic:claude-3-sonnet',
          additionalArgs: ['--'],
          stream: true,
        });
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('help command', () => {
    it('should show help when requested', async () => {
      // For help, we just need to make sure the program doesn't crash
      // Since process.exit is mocked to throw, we expect that behavior
      const program = createProgram();

      // Mock console to avoid actual output
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      // Mock process.exit with different behavior for help (exit code 0)
      const originalExit = process.exit;
      Object.defineProperty(process, 'exit', {
        value: jest.fn((code?: number) => {
          throw new Error(`process.exit was called with code ${code}.`);
        }),
        configurable: true,
      });

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', '--help'];

      try {
        await program.parseAsync(['node', 'mclaude', '--help']);
        fail('Expected process.exit to be called');
      } catch (error) {
        expect((error as Error).message).toBe('process.exit was called with code 0.');
      } finally {
        process.argv = originalArgv;
        process.exit = originalExit;
        mockConsoleLog.mockRestore();
      }
    });
  });
});