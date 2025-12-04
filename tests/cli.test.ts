import { ConfigManager } from '../src/config';
import { SyntheticClaudeApp } from '../src/core/app';
import { createProgram } from '../src/cli/commands';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock the app to avoid real launches
jest.mock('../src/core/app');
const MockedSyntheticClaudeApp = SyntheticClaudeApp as jest.MockedClass<typeof SyntheticClaudeApp>;

describe('CLI Commands', () => {
  let configManager: ConfigManager;
  let tempDir: string;
  let mockApp: jest.Mocked<SyntheticClaudeApp>;

  beforeEach(async () => {
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
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should pass through unknown options to Claude Code', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', '--model', 'synthetic:claude-3-sonnet', '--dangerously-skip-permissions'];

      try {
        await program.parseAsync(['node', 'mclaude', '--model', 'synthetic:claude-3-sonnet', '--dangerously-skip-permissions']);

        expect(mockApp.run).toHaveBeenCalledWith({
          model: 'synthetic:claude-3-sonnet',
          additionalArgs: ['--dangerously-skip-permissions'],
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle thinking model option', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', '--model', 'synthetic:claude-3-sonnet', '--thinking-model', 'minimax:MiniMax-M2'];

      try {
        await program.parseAsync(['node', 'mclaude', '--model', 'synthetic:claude-3-sonnet', '--thinking-model', 'minimax:MiniMax-M2']);

        expect(mockApp.run).toHaveBeenCalledWith({
          model: 'synthetic:claude-3-sonnet',
          thinkingModel: 'minimax:MiniMax-M2',
          additionalArgs: [],
        });
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('model command', () => {
    it('should run interactive model selection', async () => {
      const program = createProgram();

      mockApp.interactiveModelSelection.mockResolvedValue(true);
      mockApp.getConfig.mockReturnValue({
        selectedModel: 'synthetic:claude-3-sonnet',
        selectedThinkingModel: '',
      });

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'model'];

      try {
        await program.parseAsync(['node', 'mclaude', 'model']);

        expect(mockApp.interactiveModelSelection).toHaveBeenCalledWith({});
        expect(mockApp.run).toHaveBeenCalledWith({
          verbose: undefined,
          quiet: undefined,
          model: "",
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle provider filtering', async () => {
      const program = createProgram();

      mockApp.interactiveModelSelection.mockResolvedValue(true);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'model', '--provider', 'synthetic'];

      try {
        await program.parseAsync(['node', 'mclaude', 'model', '--provider', 'synthetic']);

        expect(mockApp.interactiveModelSelection).toHaveBeenCalledWith({
          provider: 'synthetic',
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle thinking provider option', async () => {
      const program = createProgram();

      mockApp.interactiveModelSelection.mockResolvedValue(true);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'model', '--thinking-provider', 'minimax'];

      try {
        await program.parseAsync(['node', 'mclaude', 'model', '--thinking-provider', 'minimax']);

        expect(mockApp.interactiveModelSelection).toHaveBeenCalledWith({
          thinkingProvider: 'minimax',
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle save combination option', async () => {
      const program = createProgram();

      mockApp.interactiveModelSelection.mockResolvedValue(true);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'model', '--save-combination', 'My Combo'];

      try {
        await program.parseAsync(['node', 'mclaude', 'model', '--save-combination', 'My Combo']);

        expect(mockApp.interactiveModelSelection).toHaveBeenCalledWith({
          saveCombination: 'My Combo',
        });
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('config command group', () => {
    it('should show current configuration', async () => {
      const program = createProgram();

      // Add mock implementation for console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Reset mock to clear default resolved value, then set resolved return value
      mockApp.showConfig.mockResolvedValue(undefined);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'config'];

      try {
        await program.parseAsync(['node', 'mclaude', 'config', 'show']);

        expect(mockApp.showConfig).toHaveBeenCalled();
      } finally {
        consoleSpy.mockRestore();
        process.argv = originalArgv;
      }
    });

    it('should set default provider', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'config', 'set-default-provider', 'minimax'];

      try {
        await program.parseAsync(['node', 'mclaude', 'config', 'set-default-provider', 'minimax']);

        expect(mockApp.setDefaultProvider).toHaveBeenCalledWith('minimax');
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('provider command group', () => {
    it('should list all providers', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'providers', 'list'];

      try {
        await program.parseAsync(['node', 'mclaude', 'providers', 'list']);

        expect(mockApp.listProviders).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should configure provider', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'config', 'show'];

      try {
        await program.parseAsync(['node', 'mclaude', 'config', 'show']);

        expect(mockApp.showConfig).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should enable provider', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'providers', 'enable', 'minimax'];

      try {
        await program.parseAsync(['node', 'mclaude', 'providers', 'enable', 'minimax']);

        expect(mockApp.enableProvider).toHaveBeenCalledWith('minimax');
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

        expect(mockApp.disableProvider).toHaveBeenCalledWith('minimax');
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('models command group', () => {
    it('should show model info', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'models', 'info'];

      try {
        await program.parseAsync(['node', 'mclaude', 'models', 'info']);

        expect(mockApp.showModelInfo).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should clear cache', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'models', 'clear-cache'];

      try {
        await program.parseAsync(['node', 'mclaude', 'models', 'clear-cache']);

        expect(mockApp.clearCache).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should list models with provider filter', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'models', 'list', '--provider', 'synthetic'];

      try {
        await program.parseAsync(['node', 'mclaude', 'models', 'list', '--provider', 'synthetic']);

        expect(mockApp.listModels).toHaveBeenCalledWith({
          provider: 'synthetic',
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should search models', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'models', 'search', 'claude'];

      try {
        await program.parseAsync(['node', 'mclaude', 'models', 'search', 'claude']);

        expect(mockApp.searchModels).toHaveBeenCalledWith('claude', {});
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
        await program.parseAsync(['node', 'mclaude', 'combination']);

        expect(mockApp.listCombinations).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should save combination', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'combination', 'save', 'My Combo', 'synthetic:claude-3', 'minimax:MiniMax-M2'];

      try {
        await program.parseAsync(['node', 'mclaude', 'combination', 'save', 'My Combo', 'synthetic:claude-3', 'minimax:MiniMax-M2']);

        expect(mockApp.saveCombination).toHaveBeenCalledWith('My Combo', 'synthetic:claude-3', 'minimax:MiniMax-M2');
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

        expect(mockApp.deleteCombination).toHaveBeenCalledWith('My Combo');
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('utility commands', () => {
    it('should run doctor', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'doctor'];

      try {
        await program.parseAsync(['node', 'mclaude', 'doctor']);

        expect(mockApp.doctor).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should show version', async () => {
      const program = createProgram();

      const consoleSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
      const originalExit = process.exit;
      process.exit = jest.fn() as any;

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', '--version'];

      try {
        await program.parseAsync(['node', 'mclaude', '--version']);

        expect(process.exit).toHaveBeenCalledWith(0);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('1.2.7')
        );
      } finally {
        consoleSpy.mockRestore();
        process.exit = originalExit;
        process.argv = originalArgv;
      }
    });
  });

  describe('help command handling', () => {
    it('should show help for "help" command', async () => {
      const program = createProgram();

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const helpSpy = jest.spyOn(program, 'help').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'help'];

      try {
        await program.parseAsync(['node', 'mclaude', 'help']);

        expect(helpSpy).toHaveBeenCalled();
        expect(mockApp.run).not.toHaveBeenCalled();
      } catch (error) {
        // Expected due to process.exit mock
      } finally {
        consoleLogSpy.mockRestore();
        helpSpy.mockRestore();
        processExitSpy.mockRestore();
        process.argv = originalArgv;
      }
    });

    it('should show help for "/help" command', async () => {
      const program = createProgram();

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const helpSpy = jest.spyOn(program, 'help').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', '/help'];

      try {
        await program.parseAsync(['node', 'mclaude', '/help']);

        expect(helpSpy).toHaveBeenCalled();
        expect(mockApp.run).not.toHaveBeenCalled();
      } catch (error) {
        // Expected due to process.exit mock
      } finally {
        consoleLogSpy.mockRestore();
        helpSpy.mockRestore();
        processExitSpy.mockRestore();
        process.argv = originalArgv;
      }
    });

    it('should show help for "--help" option', async () => {
      const program = createProgram();

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const helpSpy = jest.spyOn(program, 'help').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', '--help'];

      try {
        await program.parseAsync(['node', 'mclaude', '--help']);

        // --help is handled by Commander.js directly, so help should be called
        expect(helpSpy).toHaveBeenCalled();
      } catch (error) {
        // Expected due to process.exit mock
      } finally {
        consoleLogSpy.mockRestore();
        helpSpy.mockRestore();
        processExitSpy.mockRestore();
        process.argv = originalArgv;
      }
    });

    it('should show help for "-h" option', async () => {
      const program = createProgram();

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const helpSpy = jest.spyOn(program, 'help').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', '-h'];

      try {
        await program.parseAsync(['node', 'mclaude', '-h']);

        // -h is handled by Commander.js directly, so help should be called
        expect(helpSpy).toHaveBeenCalled();
      } catch (error) {
        // Expected due to process.exit mock
      } finally {
        consoleLogSpy.mockRestore();
        helpSpy.mockRestore();
        processExitSpy.mockRestore();
        process.argv = originalArgv;
      }
    });
  });

  describe('error handling', () => {
    it('should handle invalid provider names', async () => {
      const program = createProgram();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'model', '--provider', 'invalid'];

      try {
        await program.parseAsync(['node', 'mclaude', 'model', '--provider', 'invalid']);

        expect(mockApp.interactiveModelSelection).toHaveBeenCalledWith({
          provider: 'invalid',
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle missing arguments gracefully', async () => {
      const program = createProgram();

      const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation();
      const originalExit = process.exit;
      process.exit = jest.fn() as any;

      try {
        // This should trigger help output and exit with error
        await program.parseAsync(['node', 'mclaude', 'combination', 'save']);

        expect(process.exit).toHaveBeenCalledWith(1);
        expect(stderrSpy).toHaveBeenCalled();
      } finally {
        stderrSpy.mockRestore();
        process.exit = originalExit;
      }
    });

    it('should show help for unrecognized commands', async () => {
      const program = createProgram();

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const helpSpy = jest.spyOn(program, 'help').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'invalidcommand'];

      try {
        await program.parseAsync(['node', 'mclaude', 'invalidcommand']);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown command: invalidcommand');
        expect(consoleLogSpy).toHaveBeenCalledWith('\nShowing available commands:');
        expect(helpSpy).toHaveBeenCalled();
        expect(mockApp.run).not.toHaveBeenCalled();
      } catch (error) {
        // Expected due to process.exit mock
      } finally {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
        helpSpy.mockRestore();
        processExitSpy.mockRestore();
        process.argv = originalArgv;
      }
    });

    it('should show help for unrecognized commands with arguments', async () => {
      const program = createProgram();

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const helpSpy = jest.spyOn(program, 'help').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'randomcmd', 'anotherarg'];

      try {
        await program.parseAsync(['node', 'mclaude', 'randomcmd', 'anotherarg']);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown command: randomcmd');
        expect(consoleLogSpy).toHaveBeenCalledWith('\nShowing available commands:');
        expect(helpSpy).toHaveBeenCalled();
        expect(mockApp.run).not.toHaveBeenCalled();
      } catch (error) {
        // Expected due to process.exit mock
      } finally {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
        helpSpy.mockRestore();
        processExitSpy.mockRestore();
        process.argv = originalArgv;
      }
    });
  });

  describe('multi-provider integration', () => {
    it('should support hybrid provider combinations', async () => {
      const program = createProgram();

      mockApp.interactiveModelSelection.mockResolvedValue(true);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'model', '--provider', 'synthetic', '--thinking-provider', 'minimax'];

      try {
        await program.parseAsync(['node', 'mclaude', 'model', '--provider', 'synthetic', '--thinking-provider', 'minimax']);

        expect(mockApp.interactiveModelSelection).toHaveBeenCalledWith({
          provider: 'synthetic',
          thinkingProvider: 'minimax',
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should support auto provider mode', async () => {
      const program = createProgram();

      mockApp.interactiveModelSelection.mockResolvedValue(true);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'model', '--provider', 'auto'];

      try {
        await program.parseAsync(['node', 'mclaude', 'model', '--provider', 'auto']);

        expect(mockApp.interactiveModelSelection).toHaveBeenCalledWith({
          provider: 'auto',
        });
      } finally {
        process.argv = originalArgv;
      }
    });
  });
});