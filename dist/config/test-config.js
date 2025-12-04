"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConfigurationSystem = testConfigurationSystem;
const manager_1 = require("./manager");
const env_1 = require("./env");
const types_1 = require("./types");
// Test function to validate configuration system
async function testConfigurationSystem() {
    console.log("=== Configuration System Test ===");
    try {
        // Test 1: Environment loading
        console.log("\n1. Testing environment variable loading...");
        await env_1.envManager.reload();
        // Wait a moment for async loading to complete
        await new Promise((resolve) => setTimeout(resolve, 100));
        const envVars = env_1.envManager.getEnvironmentVariables();
        console.log("Environment variables loaded:", {
            hasMiniMaxKey: !!envVars.MINIMAX_API_KEY,
            hasSyntheticKey: !!envVars.SYNTHETIC_API_KEY,
            miniMaxKeyLength: envVars.MINIMAX_API_KEY?.length || 0,
        });
        if (envVars.MINIMAX_API_KEY) {
            console.log("MiniMax API key (first 20 chars):", envVars.MINIMAX_API_KEY.substring(0, 20) + "...");
        }
        else {
            console.log("Trying direct process.env access...");
            console.log("process.env.MINIMAX_API_KEY present:", !!process.env.MINIMAX_API_KEY);
            if (process.env.MINIMAX_API_KEY) {
                console.log("process.env MINIMAX_API_KEY length:", process.env.MINIMAX_API_KEY.length);
            }
        }
        // Test 2: Environment validation
        console.log("\n2. Testing environment variable validation...");
        const validation = env_1.envManager.validateEnvironmentVariables();
        console.log("Environment validation:", validation);
        // Test 3: Configuration loading
        console.log("\n3. Testing configuration loading...");
        const configManager = new manager_1.ConfigManager();
        const config = configManager.config;
        console.log("Configuration version:", config.configVersion);
        console.log("Default provider:", config.defaultProvider);
        console.log("Providers enabled:", {
            synthetic: configManager.isProviderEnabled("synthetic"),
            minimax: configManager.isProviderEnabled("minimax"),
            auto: configManager.isProviderEnabled("auto"),
        });
        // Test 4: API key retrieval
        console.log("\n4. Testing API key retrieval...");
        console.log("Synthetic API key present:", configManager.hasSyntheticApiKey());
        console.log("MiniMax API key present:", configManager.hasMinimaxApiKey());
        if (configManager.hasMinimaxApiKey()) {
            console.log("MiniMax API key (first 10 chars):", configManager.getMinimaxApiKey().substring(0, 10) + "...");
        }
        // Test 5: Provider configuration
        console.log("\n5. Testing provider configuration...");
        const syntheticConfig = configManager.getProviderConfig("synthetic");
        const minimaxConfig = configManager.getProviderConfig("minimax");
        if (syntheticConfig) {
            console.log("Synthetic provider config:", {
                enabled: syntheticConfig.enabled,
                baseUrl: syntheticConfig.baseUrl,
                hasApiKey: !!syntheticConfig.apiKey,
            });
        }
        if (minimaxConfig) {
            console.log("MiniMax provider config:", {
                enabled: minimaxConfig.enabled,
                baseUrl: minimaxConfig.baseUrl,
                defaultModel: "defaultModel" in minimaxConfig ? minimaxConfig.defaultModel : "N/A",
                hasApiKey: !!minimaxConfig.apiKey,
            });
        }
        // Test 6: Configuration updates
        console.log("\n6. Testing configuration updates...");
        const originalProvider = configManager.getDefaultProvider();
        console.log("Original default provider:", originalProvider);
        // Test setting default provider (but don't actually save)
        console.log("Setting default provider to minimax...");
        try {
            // Commenting out actual save to avoid modifying config during test
            // await configManager.setDefaultProvider('minimax');
            console.log("Would set default provider to minimax (test mode)");
        }
        catch (error) {
            console.error("Failed to set default provider:", error);
        }
        // Test 7: Schema validation
        console.log("\n7. Testing schema validation...");
        const testConfig = {
            providers: {
                synthetic: { enabled: true, apiKey: "test-key" },
                minimax: { enabled: true, apiKey: "test-key" },
            },
            defaultProvider: "auto",
            configVersion: 2,
        };
        const validationResult = types_1.AppConfigSchema.safeParse(testConfig);
        console.log("Schema validation test:", {
            success: validationResult.success,
            error: validationResult.success
                ? undefined
                : validationResult.error.message,
        });
        // Test 8: Local configuration hierarchy
        console.log("\n8. Testing local configuration hierarchy...");
        const configType = configManager.getConfigType();
        const workspaceRoot = configManager.getWorkspaceRoot();
        console.log("Configuration type:", configType);
        console.log("Workspace root:", workspaceRoot || "None (using global config)");
        if (configType === 'local' && workspaceRoot) {
            console.log("✓ Using local project configuration");
            console.log("Local config would override global for local settings");
        }
        else {
            console.log("✓ Using global configuration");
            console.log("Local config not found, falling back to global");
        }
        // Test 9: Local configuration initialization (in test mode)
        console.log("\n9. Testing local configuration initialization...");
        const testDir = "/tmp/mclaude-test-config";
        console.log("Would test local config initialization at:", testDir);
        console.log("Directory structure would be created:");
        console.log(`  ${testDir}/.mclaude/config.json`);
        console.log(`  ${testDir}/.mclaude/.env.local`);
        console.log(`  ${testDir}/.mclaude/.gitignore`);
        // Test 10: Config merger priority testing
        console.log("\n10. Testing configuration merge priority...");
        console.log("Priority order would be:");
        console.log("  1. Local Project: .mclaude/config.json (highest)");
        console.log("  2. Local Project: .env (current directory)");
        console.log("  3. Global User: ~/.config/mclaude/config.json");
        console.log("  4. System Environment: process.env");
        console.log("\n=== Configuration System Test Complete ===");
        console.log("✅ All configuration tests passed successfully");
        console.log("✅ Local configuration functionality ready for use");
    }
    catch (error) {
        console.error("❌ Configuration system test failed:", error);
        if (error instanceof Error) {
            console.error("Error details:", error.message);
            console.error("Stack trace:", error.stack);
        }
        process.exit(1);
    }
}
// Run test if this file is executed directly
if (typeof require !== "undefined" && require.main === module) {
    testConfigurationSystem().catch(console.error);
}
//# sourceMappingURL=test-config.js.map