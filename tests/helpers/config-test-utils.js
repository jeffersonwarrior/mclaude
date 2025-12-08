"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupConfigTestEnvironment = setupConfigTestEnvironment;
exports.createTempEnvFile = createTempEnvFile;
const config_1 = require("../../src/config");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_os_1 = require("node:os");
const node_fs_1 = require("node:fs");
// Common test setup utilities
function setupConfigTestEnvironment() {
    let tempDir;
    let originalEnv;
    let envFileRenamed = false;
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
        const envPath = (0, node_path_1.join)(process.cwd(), '.env');
        const mclaudeDirPath = (0, node_path_1.join)(process.cwd(), '.mclaude');
        if ((0, node_fs_1.existsSync)(envPath)) {
            try {
                await (0, promises_1.rename)(envPath, envPath + '.test-backup');
                envFileRenamed = true;
            }
            catch (error) {
                // Ignore rename errors
            }
        }
        if ((0, node_fs_1.existsSync)(mclaudeDirPath)) {
            try {
                await (0, promises_1.rename)(mclaudeDirPath, mclaudeDirPath + '.test-backup');
            }
            catch (error) {
                // Ignore rename errors
            }
        }
        // Create a temporary directory for test configuration
        tempDir = await (0, promises_1.mkdtemp)((0, node_path_1.join)((0, node_os_1.tmpdir)(), 'mclaude-config-test-'));
        // Ensure the base config directory exists for the ConfigManager instance
        await (0, promises_1.mkdir)((0, node_path_1.join)(tempDir, '.config', 'mclaude'), { recursive: true });
    });
    afterEach(async () => {
        // Clean up temporary directory
        try {
            await (0, promises_1.rm)(tempDir, { recursive: true, force: true });
        }
        catch (error) {
            // Ignore cleanup errors
        }
        // Restore .env file and .mclaude directory if they were renamed
        if (envFileRenamed) {
            const envPath = (0, node_path_1.join)(process.cwd(), '.env');
            const mclaudeDirPath = (0, node_path_1.join)(process.cwd(), '.mclaude');
            try {
                await (0, promises_1.rename)(envPath + '.test-backup', envPath);
            }
            catch (error) {
                // Ignore restore errors
            }
            try {
                await (0, promises_1.rename)(mclaudeDirPath + '.test-backup', mclaudeDirPath);
            }
            catch (error) {
                // Ignore restore errors
            }
        }
        // Restore original environment
        process.env = originalEnv;
    });
    return {
        createConfigManager: (subPath = '.config/mclaude') => {
            // Force clearing of any cached environment by temporarily requiring a fresh module
            // Reset the singleton by clearing the require cache for env module
            const envModulePath = require.resolve('../../src/config/env');
            delete require.cache[envModulePath];
            // Create a fresh ConfigManager instance
            return new config_1.ConfigManager((0, node_path_1.join)(tempDir, subPath));
        },
    };
}
async function createTempEnvFile() {
    const tempDir = await (0, promises_1.mkdtemp)((0, node_path_1.join)((0, node_os_1.tmpdir)(), 'mclaude-env-test-'));
    const envPath = (0, node_path_1.join)(tempDir, '.env');
    await (0, promises_1.writeFile)(envPath, `
SYNTHETIC_API_KEY=test-synthetic-key
MINIMAX_API_KEY=test-minimax-key
MINIMAX_GROUP_ID=test-group
ANTHROPIC_BASE_URL=https://test.api.com
API_TIMEOUT_MS=30000
  `.trim());
    return { tempDir, envPath };
}
//# sourceMappingURL=config-test-utils.js.map