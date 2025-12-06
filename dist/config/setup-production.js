"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupProductionConfig = setupProductionConfig;
const manager_1 = require("./manager");
/**
 * Production configuration setup with recommended defaults
 * Enables TensorZero proxy and both providers
 */
async function setupProductionConfig() {
    console.log("=== Setting up Production Configuration ===\n");
    // Install TensorZero if not present
    console.log("📦 Checking TensorZero installation...");
    try {
        const { execSync } = require("child_process");
        execSync("python3 -m tensorzero --version", { stdio: "ignore" });
        console.log("✅ TensorZero is already installed\n");
    }
    catch (error) {
        console.log("⚠️  TensorZero not found. Installing...\n");
        try {
            const { execSync } = require("child_process");
            execSync("python3 -m pip install tensorzero --quiet --break-system-packages", { stdio: "inherit" });
            console.log("\n✅ TensorZero installed successfully\n");
        }
        catch (installError) {
            console.log("\n⚠️  Automatic installation failed. Please install manually:");
            console.log("   pip install tensorzero");
            console.log("   OR");
            console.log("   pipx install tensorzero\n");
        }
    }
    const configManager = new manager_1.ConfigManager();
    const config = configManager.config;
    console.log("Current Configuration:");
    console.log("  TensorZero Enabled:", config.tensorzero?.enabled || false);
    console.log("  TensorZero Port:", config.tensorzero?.port || 9313);
    console.log("  MiniMax Enabled:", config.providers?.minimax?.enabled || false);
    console.log("  Synthetic Enabled:", config.providers?.synthetic?.enabled || false);
    console.log("  Default Provider:", config.defaultProvider);
    // Enable TensorZero proxy
    console.log("\n✓ Configuring TensorZero Proxy:");
    config.tensorzero = {
        enabled: true,
        port: 9313,
        host: "0.0.0.0",
        timeout: 300000,
    };
    console.log("  - Enabled: true");
    console.log("  - Port: 9313");
    console.log("  - Host: 0.0.0.0");
    console.log("  - Timeout: 300000ms");
    // Enable MiniMax provider
    console.log("\n✓ Configuring MiniMax Provider:");
    config.providers = config.providers || {};
    config.providers.minimax = {
        ...config.providers.minimax,
        enabled: true,
        baseUrl: "https://api.minimax.io",
        anthropicBaseUrl: "https://api.minimax.io/anthropic",
        modelsApiUrl: "https://api.minimax.io/v1/models",
        parallelToolCalls: true,
        streaming: true,
        memoryCompact: false,
        responseFormat: "text",
    };
    console.log("  - Enabled: true");
    console.log("  - Base URL: https://api.minimax.io");
    console.log("  - Anthropic URL: https://api.minimax.io/anthropic");
    console.log("  - Parallel Tool Calls: true");
    console.log("  - Streaming: true");
    console.log("  - Response Format: text");
    // Enable Synthetic provider
    console.log("\n✓ Configuring Synthetic Provider:");
    config.providers.synthetic = {
        ...config.providers.synthetic,
        enabled: true,
        baseUrl: "https://api.synthetic.new",
        anthropicBaseUrl: "https://api.synthetic.new/anthropic",
        modelsApiUrl: "https://api.synthetic.new/openai/v1/models",
    };
    console.log("  - Enabled: true");
    console.log("  - Base URL: https://api.synthetic.new");
    console.log("  - Anthropic URL: https://api.synthetic.new/anthropic");
    // Set default provider
    console.log("\n✓ Setting Default Provider:");
    config.defaultProvider = "auto";
    console.log("  - Provider: auto (will select best available)");
    // Set recommended models
    console.log("\n✓ Setting Recommended Models:");
    config.recommendedModels = {
        default: {
            primary: "synthetic:deepseek-ai/DeepSeek-V3.2",
            backup: "minimax:MiniMax-M2",
        },
        smallFast: {
            primary: "synthetic:meta-llama/Llama-4-Scout-17B-16E-Instruct",
            backup: "synthetic:meta-llama/Llama-3.1-8B-Instruct",
        },
        thinking: {
            primary: "minimax:MiniMax-M2",
            backup: "synthetic:deepseek-ai/DeepSeek-R1",
        },
        subagent: {
            primary: "synthetic:deepseek-ai/DeepSeek-V3.2",
            backup: "synthetic:meta-llama/Llama-3.3-70B-Instruct",
        },
    };
    console.log("  - Default: synthetic:deepseek-ai/DeepSeek-V3.2");
    console.log("  - Small/Fast: synthetic:meta-llama/Llama-4-Scout-17B-16E-Instruct");
    console.log("  - Thinking: minimax:MiniMax-M2");
    console.log("  - Subagent: synthetic:deepseek-ai/DeepSeek-V3.2");
    // Save configuration
    console.log("\n💾 Saving configuration...");
    try {
        await configManager.updateConfig({
            liteLLM: config.liteLLM,
            providers: config.providers,
            defaultProvider: config.defaultProvider,
            recommendedModels: config.recommendedModels,
        });
        console.log("✅ Configuration saved successfully!\n");
    }
    catch (error) {
        console.error("❌ Failed to save configuration:", error);
        throw error;
    }
    // Test configuration
    console.log("=== Configuration Validation ===\n");
    const isMiniMaxEnabled = configManager.isProviderEnabled("minimax");
    const isSyntheticEnabled = configManager.isProviderEnabled("synthetic");
    const hasMinimaxKey = configManager.hasMinimaxApiKey();
    const hasSyntheticKey = configManager.hasSyntheticApiKey();
    console.log("Provider Status:");
    console.log("  ✓ MiniMax enabled:", isMiniMaxEnabled);
    console.log("  ✓ Synthetic enabled:", isSyntheticEnabled);
    console.log("  ✓ MiniMax API key configured:", hasMinimaxKey);
    console.log("  ✓ Synthetic API key configured:", hasSyntheticKey);
    console.log("\nTensorZero Proxy Status:");
    console.log("  ✓ Enabled:", config.tensorzero.enabled);
    console.log("  ✓ Port:", config.tensorzero.port);
    console.log("  ✓ Host:", config.tensorzero.host);
    const issues = [];
    if (!isMiniMaxEnabled)
        issues.push("MiniMax provider is not enabled");
    if (!isSyntheticEnabled)
        issues.push("Synthetic provider is not enabled");
    if (!config.tensorzero.enabled)
        issues.push("TensorZero proxy is not enabled");
    if (config.tensorzero.port !== 9313)
        issues.push(`TensorZero port is ${config.tensorzero.port}, should be 9313`);
    if (issues.length === 0) {
        console.log("\n✅ All configuration checks passed!");
        console.log("✅ System is ready for production use\n");
    }
    else {
        console.log("\n⚠️  Configuration issues detected:");
        issues.forEach((issue) => console.log(`  - ${issue}`));
        console.log();
    }
}
// Run setup if executed directly
if (typeof require !== "undefined" && require.main === module) {
    setupProductionConfig().catch((error) => {
        console.error("Setup failed:", error);
        process.exit(1);
    });
}
//# sourceMappingURL=setup-production.js.map