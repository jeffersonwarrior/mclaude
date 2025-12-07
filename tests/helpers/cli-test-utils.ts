import { ConfigManager } from '../../src/config';
import { SyntheticClaudeApp } from '../../src/core/app';
import { createProgram } from '../../src/cli/commands';
import { Logger } from '../../src/utils/logger';
import { jest } from '@jest/globals';
import { mkdtemp, rm, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

// Mock the app to avoid real launches
jest.mock('../../src/core/app');
const MockedSyntheticClaudeApp = SyntheticClaudeApp as jest.MockedClass<typeof SyntheticClaudeApp>;
export { MockedSyntheticClaudeApp };

const MCLAUD_CONFIG_DIR = '.config/mclaude';

export function setupCliTestEnvironment() {
  let tempDir: string;
  let originalCwd: string;
  let originalHome: string | undefined;
  let originalArgs: string[];
  let originalExit: (code?: number) => never;
  let mockConsoleLog: jest.SpiedFunction<typeof console.log>;
  let mockConsoleError: jest.SpiedFunction<typeof console.error>;
  let configManager: ConfigManager;
  let app: SyntheticClaudeApp;
  let mockApp: jest.Mocked<SyntheticClaudeApp>;
  let mockExitCode: number | undefined;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'mclaude-cli-test-'));
    originalCwd = process.cwd();
    originalHome = process.env.HOME;
    originalArgs = [...process.argv];
    originalExit = process.exit;

    // Set up a temporary home directory for config and environment isolation
    process.env.HOME = tempDir;
    process.chdir(tempDir); // Change CWD for local config/env resolution

    // Mock console.log and console.error
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock process.exit to prevent test runner from exiting
    mockExitCode = undefined;
    Object.defineProperty(process, 'exit', {
      value: jest.fn((code?: number) => {
        mockExitCode = code;
        throw new Error('process.exit was called.'); // Prevent actual exit
      }),
      configurable: true,
    });

    // Initialize ConfigManager with a temporary path
    configManager = new ConfigManager(join(tempDir, MCLAUD_CONFIG_DIR));

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

    // Initialize app
    app = new SyntheticClaudeApp(configManager);

    // Clear any previous environment variables that might affect CLI commands
    const envVarsToClear = [
      'SYNTHETIC_API_KEY', 'MINIMAX_API_KEY', 'ANTHROPIC_DEFAULT_MODEL',
      'MCLAUD_CONFIG_DIR', // Custom env for config dir
    ];
    envVarsToClear.forEach(key => delete process.env[key]);

    // Reset argv to a minimal state
    process.argv = ['node', 'mclaude'];

    // Clear any cached instances for singletons if necessary (e.g., Logger)
    jest.resetModules(); // This is a blunt instrument, consider more targeted resets
  });

  afterEach(async () => {
    // Restore original environment
    process.chdir(originalCwd);
    process.env.HOME = originalHome;
    process.argv = originalArgs;
    Object.defineProperty(process, 'exit', { value: originalExit, configurable: true });

    // Restore console mocks
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();

    // Clean up temporary directory
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }

    // Clear any module cache for singletons if needed after tests
    jest.resetModules();
  });

  const createTestEnvFile = async (content: string) => {
    const envPath = join(tempDir, '.env');
    await writeFile(envPath, content);
  };

  const createTestConfigFile = async (content: object) => {
    const configDirPath = join(tempDir, MCLAUD_CONFIG_DIR);
    if (!existsSync(configDirPath)) {
      await mkdtemp(configDirPath); // Ensure directory exists
    }
    const configPath = join(configDirPath, 'config.json');
    await writeFile(configPath, JSON.stringify(content, null, 2));
  };

  return {
    tempDir: () => tempDir,
    configManager: () => configManager,
    app: () => app,
    mockApp: () => mockApp,
    mockConsoleLog: () => mockConsoleLog,
    mockConsoleError: () => mockConsoleError,
    getMockExitCode: () => mockExitCode,
    createTestEnvFile,
    createTestConfigFile,
  };
}