"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCRConfigGenerator = void 0;
const promises_1 = require("fs/promises");
const os_1 = require("os");
const path_1 = require("path");
const fs_1 = require("fs");
const config_1 = require("../config");
class CCRConfigGenerator {
    configManager;
    ccrConfigDir;
    ccrConfigPath;
    constructor(configManager) {
        this.configManager = configManager || new config_1.ConfigManager();
        this.ccrConfigDir = (0, path_1.join)((0, os_1.homedir)(), ".claude-code-router");
        this.ccrConfigPath = (0, path_1.join)(this.ccrConfigDir, "config.json");
    }
    /**
     * Generate CCR configuration from mclaude config
     */
    async generateConfig() {
        try {
            const config = this.configManager.config;
            const providers = [];
            // Add Synthetic provider if enabled
            if (config.providers.synthetic.enabled) {
                const syntheticApiKey = this.getEffectiveApiKey("synthetic");
                if (syntheticApiKey) {
                    providers.push({
                        name: "synthetic",
                        api_base_url: "https://api.synthetic.new/openai/v1/chat/completions",
                        api_key: syntheticApiKey, // Use actual key, not env var reference
                        models: this.getSyntheticModels(),
                    });
                }
            }
            // Add MiniMax provider if enabled
            if (config.providers.minimax.enabled) {
                const minimaxApiKey = this.getEffectiveApiKey("minimax");
                if (minimaxApiKey) {
                    providers.push({
                        name: "minimax",
                        api_base_url: "https://api.minimax.chat/v1/chat/completions",
                        api_key: minimaxApiKey, // Use actual key, not env var reference
                        models: this.getMinimaxModels(),
                    });
                }
            }
            // Build router configuration
            const routerConfig = this.buildRouterConfig(config);
            // Create CCR config
            const ccrConfig = {
                LOG: false,
                API_TIMEOUT_MS: 600000, // 10 minutes
                Providers: providers,
                Router: routerConfig,
            };
            // Ensure CCR config directory exists
            if (!(0, fs_1.existsSync)(this.ccrConfigDir)) {
                await (0, promises_1.mkdir)(this.ccrConfigDir, { recursive: true });
            }
            // Write config file
            const configJson = JSON.stringify(ccrConfig, null, 2);
            await (0, promises_1.writeFile)(this.ccrConfigPath, configJson, "utf-8");
            console.debug(`CCR config generated at ${this.ccrConfigPath}`);
        }
        catch (error) {
            console.error("Failed to generate CCR config:", error);
            throw error;
        }
    }
    /**
     * Build router configuration from mclaude config
     */
    buildRouterConfig(config) {
        const recommended = config.recommendedModels || {};
        return {
            default: this.formatRouterModel(recommended.default?.primary || "hf:deepseek-ai/DeepSeek-V3.2"),
            background: this.formatRouterModel(recommended.smallFast?.primary || "hf:meta-llama/Llama-4-Scout-17B-16E-Instruct"),
            think: this.formatRouterModel(recommended.thinking?.primary || "minimax:MiniMax-M2"),
            longContext: this.formatRouterModel(recommended.default?.primary || "hf:deepseek-ai/DeepSeek-V3.2"),
            longContextThreshold: 60000,
        };
    }
    /**
     * Format model for router (provider,model)
     */
    formatRouterModel(modelId) {
        // MiniMax models use minimax provider (both minimax: and hf:MiniMaxAI prefixes)
        if (modelId.startsWith("minimax:")) {
            const model = modelId.replace("minimax:", "");
            return `minimax,${model}`;
        }
        // hf:MiniMaxAI models should use minimax provider directly
        if (modelId.startsWith("hf:MiniMaxAI/")) {
            const model = modelId.replace("hf:MiniMaxAI/", "");
            return `minimax,${model}`;
        }
        // Other hf: prefixed models use synthetic provider (keep full model ID with hf:)
        if (modelId.startsWith("hf:")) {
            return `synthetic,${modelId}`;
        }
        // Default to synthetic for other models
        return `synthetic,${modelId}`;
    }
    /**
     * Get list of Synthetic models
     */
    getSyntheticModels() {
        return [
            "hf:deepseek-ai/DeepSeek-V3.2",
            "hf:meta-llama/Llama-4-Scout-17B-16E-Instruct",
            "hf:meta-llama/Llama-3.3-70B-Instruct",
            "hf:meta-llama/Llama-3.1-8B-Instruct",
        ];
    }
    /**
     * Get list of MiniMax models
     */
    getMinimaxModels() {
        return ["MiniMax-M2", "MiniMax-M1"];
    }
    /**
     * Get environment variable name for a config value
     */
    getEnvVarName(provider, key) {
        const providerMap = {
            synthetic: "SYNTHETIC",
            minimax: "MINIMAX",
        };
        const providerPrefix = providerMap[provider] || provider.toUpperCase();
        return `${providerPrefix}_API_KEY`;
    }
    /**
     * Get effective API key (environment overrides config)
     */
    getEffectiveApiKey(provider) {
        switch (provider) {
            case "synthetic":
                return (process.env.SYNTHETIC_API_KEY ||
                    this.configManager.config.envOverrides.synthetic?.apiKey ||
                    this.configManager.config.providers.synthetic.apiKey ||
                    "");
            case "minimax":
                return (process.env.MINIMAX_API_KEY ||
                    this.configManager.config.envOverrides.minimax?.apiKey ||
                    this.configManager.config.providers.minimax.apiKey ||
                    "");
            default:
                return "";
        }
    }
    /**
     * Get the path to the CCR config file
     */
    getConfigPath() {
        return this.ccrConfigPath;
    }
    /**
     * Read the generated CCR config
     */
    async readConfig() {
        try {
            const fs = require("fs");
            if (!(0, fs_1.existsSync)(this.ccrConfigPath)) {
                return null;
            }
            const configData = fs.readFileSync(this.ccrConfigPath, "utf-8");
            return JSON.parse(configData);
        }
        catch (error) {
            console.error("Failed to read CCR config:", error);
            return null;
        }
    }
}
exports.CCRConfigGenerator = CCRConfigGenerator;
//# sourceMappingURL=ccr-config.js.map