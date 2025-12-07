import { ConfigManager, AppConfigSchema, LegacyAppConfigSchema, ProviderEnum, ConfigValidationError } from '../../src/config';
import { mkdtemp, rm, writeFile, rename, writeFile as fsWriteFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

// Common test setup utilities
export function setupConfigTestEnvironment() {
  let tempDir: string;
  let originalEnv: NodeJS.ProcessEnv;
  let envFileRenamed: boolean = false;

  beforeEach(async () => {
    // Store original environment and clear config-related variables
    originalEnv = { ...process.env };

    // Clear all environment variables that might affect configuration
    const configVars = [
      'SYNTHETIC_API_KEY',
      'MINIMAX_API_KEY',
      'MINIMAX_GROUP_ID',
      'ANTHROPIC_BASE_URL',
      'API_TIMEOUT_MS',
      'ANTHROPIC_AUTH_TOKEN',
      'ANTHROPIC_DEFAULT_MODEL',
      'ANTHROPIC_THINKING_MODEL',
      'MINIMAX_MODEL',
      'ANTHROPIC_DEFAULT_SONNET_MODEL',
      'ANTHROPIC_DEFAULT_HF_MODEL',
      'ANTHROPIC_DEFAULT_OPUS_MODEL',
      'ANTHROPIC_DEFAULT_HAIKU_MODEL',
      'MINIMAX_API_URL',
      'MINIMAX_ANTHROPIC_URL',
      'MINIMAX_OPENAI_URL',
      'SYNTHETIC_BASE_URL'
    ];

    configVars.forEach(varName => delete process.env[varName]);

    // Temporarily rename .env file and .mclaude directory to prevent them from being loaded
    const envPath = join(process.cwd(), '.env');
    const mclaudeDirPath = join(process.cwd(), '.mclaude');

    if (existsSync(envPath)) {
      try {
        await rename(envPath, envPath + '.test-backup');
        envFileRenamed = true;
      } catch (error) {
        // Ignore rename errors
      }
    }

    if (existsSync(mclaudeDirPath)) {
      try {
        await rename(mclaudeDirPath, mclaudeDirPath + '.test-backup');
      } catch (error) {
        // Ignore rename errors
      }
    }

    // Create a temporary directory for test configuration
    tempDir = await mkdtemp(join(tmpdir(), 'mclaude-config-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }

    // Restore .env file and .mclaude directory if they were renamed
    if (envFileRenamed) {
      const envPath = join(process.cwd(), '.env');
      const mclaudeDirPath = join(process.cwd(), '.mclaude');

      try {
        await rename(envPath + '.test-backup', envPath);
      } catch (error) {
        // Ignore restore errors
      }

      try {
        await rename(mclaudeDirPath + '.test-backup', mclaudeDirPath);
      } catch (error) {
        // Ignore restore errors
      }
    }

    // Restore original environment
    process.env = originalEnv;
  });

  return {
    createConfigManager: (subPath: string = '.config/mclaude') => {
      // Force clearing of any cached environment by temporarily requiring a fresh module
      // Reset the singleton by clearing the require cache for env module
      const envModulePath = require.resolve('../../src/config/env');
      delete require.cache[envModulePath];
      
      // Create a fresh ConfigManager instance
      return new ConfigManager(join(tempDir, subPath));
    },
  };
}

export async function createTempEnvFile() {
  const tempDir = await mkdtemp(join(tmpdir(), 'mclaude-env-test-'));
  const envPath = join(tempDir, '.env');
  
  await writeFile(envPath, `
SYNTHETIC_API_KEY=test-synthetic-key
MINIMAX_API_KEY=test-minimax-key
MINIMAX_GROUP_ID=test-group
ANTHROPIC_BASE_URL=https://test.api.com
API_TIMEOUT_MS=30000
  `.trim());
  
  return { tempDir, envPath };
}