import { ConfigManager } from '../src/config';
import { SyntheticClaudeApp } from '../src/core/app';
import { createProgram } from '../src/cli/commands';
import { jest } from '@jest/globals';

// Mock the app to avoid real launches
jest.mock('../src/core/app');
const MockedSyntheticClaudeApp = SyntheticClaudeApp as jest.MockedClass<typeof SyntheticClaudeApp>;

describe('CLI Model Commands', () => {
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
      managers: {
        modelInteractionManager: {
          interactiveModelSelection: jest.fn(),
          listModels: jest.fn(),
          showModelInfo: jest.fn(),
          searchModels: jest.fn(),
        } as any,
        configCliManager: {
          saveCombination: jest.fn(),
        } as any,
        setupManager: {} as any,
        systemManager: {} as any,
      } as any,
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

  describe('model command', () => {
    it('should run interactive model selection', async () => {
      const program = createProgram();

      mockApp.managers.modelInteractionManager.interactiveModelSelection.mockResolvedValue(true);
      mockApp.getConfig.mockReturnValue({ // This should ideally come from configCliManager, but keeping for now as it's a direct app mock for getConfig

        selectedModel: 'synthetic:claude-3-sonnet',
        selectedThinkingModel: '',
      });

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'model'];

      try {
        await program.parseAsync(['node', 'mclaude', 'model']);

        expect(mockApp.managers.modelInteractionManager.interactiveModelSelection).toHaveBeenCalledWith({});
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

      mockApp.managers.modelInteractionManager.interactiveModelSelection.mockResolvedValue(true);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'model', '--provider', 'synthetic'];

      try {
        await program.parseAsync(['node', 'mclaude', 'model', '--provider', 'synthetic']);

        expect(mockApp.managers.modelInteractionManager.interactiveModelSelection).toHaveBeenCalledWith({
          provider: 'synthetic',
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle thinking provider option', async () => {
      const program = createProgram();

      mockApp.managers.modelInteractionManager.interactiveModelSelection.mockResolvedValue(true);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'model', '--thinking-provider', 'minimax'];

      try {
        await program.parseAsync(['node', 'mclaude', 'model', '--thinking-provider', 'minimax']);

        expect(mockApp.managers.modelInteractionManager.interactiveModelSelection).toHaveBeenCalledWith({
          thinkingProvider: 'minimax',
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle save combination option', async () => {
      const program = createProgram();

      mockApp.managers.modelInteractionManager.interactiveModelSelection.mockResolvedValue(true);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'model', '--save-combination', 'My Combo'];

      try {
        await program.parseAsync(['node', 'mclaude', 'model', '--save-combination', 'My Combo']);

        expect(mockApp.managers.modelInteractionManager.interactiveModelSelection).toHaveBeenCalledWith({
          saveCombination: 'My Combo',
        });
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('models command', () => {
    it('should list available models', async () => {
      const program = createProgram();

      mockApp.managers.modelInteractionManager.listModels.mockResolvedValue(undefined);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'models'];

      try {
        await program.parseAsync(['node', 'mclaude', 'models']);

        expect(mockApp.managers.modelInteractionManager.listModels).toHaveBeenCalledWith({});
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle refresh option for models list', async () => {
      const program = createProgram();

      mockApp.managers.modelInteractionManager.listModels.mockResolvedValue(undefined);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'models', '--refresh'];

      try {
        await program.parseAsync(['node', 'mclaude', 'models', '--refresh']);

        expect(mockApp.managers.modelInteractionManager.listModels).toHaveBeenCalledWith({
          refresh: true,
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle models list subcommand with provider filter', async () => {
      const program = createProgram();

      mockApp.managers.modelInteractionManager.listModels.mockResolvedValue(undefined);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'models', 'list', '--provider', 'synthetic'];

      try {
        await program.parseAsync(['node', 'mclaude', 'models', 'list', '--provider', 'synthetic']);

        expect(mockApp.managers.modelInteractionManager.listModels).toHaveBeenCalledWith({
          provider: 'synthetic',
        });
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('search command', () => {
    it('should search models by query', async () => {
      const program = createProgram();

      mockApp.managers.modelInteractionManager.searchModels.mockResolvedValue(undefined);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'search', 'claude'];

      try {
        await program.parseAsync(['node', 'mclaude', 'search', 'claude']);

        expect(mockApp.managers.modelInteractionManager.searchModels).toHaveBeenCalledWith('claude', {});
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle provider filter for search', async () => {
      const program = createProgram();

      mockApp.managers.modelInteractionManager.searchModels.mockResolvedValue(undefined);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'search', '--provider', 'minimax', 'claude'];

      try {
        await program.parseAsync(['node', 'mclaude', 'search', '--provider', 'minimax', 'claude']);

        expect(mockApp.managers.modelInteractionManager.searchModels).toHaveBeenCalledWith('claude', {
          provider: 'minimax',
        });
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle refresh option for search', async () => {
      const program = createProgram();

      mockApp.managers.modelInteractionManager.searchModels.mockResolvedValue(undefined);

      const originalArgv = process.argv;
      process.argv = ['node', 'mclaude', 'search', '--refresh', 'claude'];

      try {
        await program.parseAsync(['node', 'mclaude', 'search', '--refresh', 'claude']);

        expect(mockApp.managers.modelInteractionManager.searchModels).toHaveBeenCalledWith('claude', {
          refresh: true,
        });
      } finally {
        process.argv = originalArgv;
      }
    });
  });
});