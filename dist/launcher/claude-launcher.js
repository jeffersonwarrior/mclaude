"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeLauncher = void 0;
const child_process_1 = require("child_process");
const manager_1 = require("../router/manager");
class ClaudeLauncher {
    claudePath;
    configManager;
    constructor(claudePath, configManager) {
        this.claudePath = claudePath || "claude";
        this.configManager = configManager;
    }
    async launchClaudeCode(options) {
        try {
            // Initialize TensorZero proxy if enabled in config
            if (this.configManager?.config.liteLLM?.enabled) {
                try {
                    const routerManager = (0, manager_1.getRouterManager)(this.configManager);
                    const routerStatus = await routerManager.initializeRouter();
                    if (routerStatus.running) {
                        console.info(`TensorZero proxy started successfully at ${routerStatus.url}`);
                    }
                }
                catch (error) {
                    console.warn(`Failed to start TensorZero proxy, will use direct connections: ${error}`);
                }
            }
            // Validate environment setup before launch
            const validation = await this.validateEnvironment(options);
            if (!validation.valid) {
                console.error("Environment validation failed:");
                validation.errors.forEach((error) => console.error(`  - ${error}`));
                // Try fallback mechanism if available
                const primaryProvider = this.resolveProvider(options);
                const fallbackProvider = this.getFallbackProvider(primaryProvider);
                if (fallbackProvider) {
                    console.info(`Attempting fallback to ${fallbackProvider} provider`);
                    const fallbackOptions = { ...options, provider: fallbackProvider };
                    const fallbackValidation = await this.validateEnvironment(fallbackOptions);
                    if (fallbackValidation.valid) {
                        return this.launchWithOptions(fallbackOptions);
                    }
                    else {
                        console.error("Fallback provider validation also failed:");
                        fallbackValidation.errors.forEach((error) => console.error(`  - ${error}`));
                    }
                }
                return {
                    success: false,
                    error: `Environment validation failed: ${validation.errors.join(", ")}`,
                };
            }
            return this.launchWithOptions(options);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error(`Error launching Claude Code: ${errorMessage}`);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    /**
     * Launch Claude Code with validated options
     */
    async launchWithOptions(options) {
        try {
            // Set up environment variables for Claude Code with API key only
            const env = {
                ...(await this.createClaudeEnvironment(options)),
                ...options.env,
                // Inherit process.env but exclude any conflicting auth tokens
                ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.includes("AUTH_TOKEN") &&
                    !key.includes("CLAUDE_CLI_SESSION") &&
                    !key.includes("ALAI_TOKEN"))),
            };
            const provider = this.resolveProvider(options);
            console.info(`Launching Claude Code with ${provider} provider using model: ${options.model}`);
            if (options.thinkingModel) {
                const thinkingProvider = this.resolveThinkingProvider(options.thinkingModel, provider);
                if (thinkingProvider !== provider) {
                    console.info(`Hybrid setup: Regular model from ${provider}, thinking model from ${thinkingProvider}`);
                }
                console.info(`Thinking model: ${options.thinkingModel}`);
            }
            // Prepare command arguments
            const args = [...(options.additionalArgs || [])];
            // Add system prompt if provided (v1.3.0)
            if (options.sysprompt) {
                args.push("--append-system-prompt", options.sysprompt);
            }
            return new Promise((resolve) => {
                const child = (0, child_process_1.spawn)(this.claudePath, args, {
                    stdio: "inherit",
                    env,
                    // Remove detached mode to maintain proper terminal interactivity
                });
                child.on("spawn", () => {
                    // empty
                });
                child.on("close", (code) => {
                    this.cleanup().finally(() => {
                        if (code === 0) {
                            resolve({
                                success: true,
                                pid: child.pid || undefined,
                            });
                        }
                        else {
                            resolve({
                                success: false,
                                error: `Claude Code exited with code ${code}`,
                            });
                        }
                    });
                });
                child.on("error", (error) => {
                    console.error(`Failed to launch Claude Code: ${error.message}`);
                    this.cleanup().finally(() => {
                        resolve({
                            success: false,
                            error: error.message,
                        });
                    });
                });
                // Don't unref the process - let it maintain control of the terminal
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error(`Error launching Claude Code: ${errorMessage}`);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    async createClaudeEnvironment(options) {
        const env = {};
        const provider = this.resolveProvider(options);
        const providerConfig = this.getProviderConfig(provider);
        if (!providerConfig) {
            throw new Error(`No configuration found for provider: ${provider}`);
        }
        // Use TensorZero proxy if enabled and running for standardized routing
        let baseUrl = providerConfig.anthropicBaseUrl;
        if (this.configManager?.config.tensorzero?.enabled) {
            try {
                const routerManager = (0, manager_1.getRouterManager)(this.configManager);
                const routerStatus = await routerManager.getRouterStatus();
                if (routerStatus?.running) {
                    baseUrl = "http://127.0.0.1:9313"; // Fixed proxy endpoint
                    console.info(`Routing through TensorZero proxy: ${baseUrl}`);
                }
            }
            catch (error) {
                console.warn(`Failed to get router status, using direct connection: ${error}`);
            }
        }
        // The model will be routed through the proxy with provider prefix
        const model = options.model;
        // Use standardized proxy authentication - provider routing handled by TensorZero
        env.ANTHROPIC_API_URL = baseUrl; // Set custom API URL
        env.ANTHROPIC_API_KEY = "sk-master"; // Fixed proxy-internal key
        env.ANTHROPIC_MODEL = model; // Set explicitly
        // Force Claude Code to use our proxy by overriding all URL variables
        env.ANTHROPIC_BASE_URL = baseUrl; // Alternative variable
        env.ANTHROPIC_CLOUD_API_BASE_URL = baseUrl; // Another alternative
        // Clear ALL existing authentication from parent environment
        delete env.ANTHROPIC_AUTH_TOKEN;
        delete env.CLAUDE_CLI_SESSION;
        delete env.CLAUDE_CLI_SESSION_ID;
        delete env.ALAI_TOKEN;
        delete env.CLAUDE_API_KEY;
        // Also clear from the environment we're inheriting from
        delete process.env.ANTHROPIC_AUTH_TOKEN;
        delete process.env.CLAUDE_CLI_SESSION;
        delete process.env.CLAUDE_CLI_SESSION_ID;
        delete process.env.ALAI_TOKEN;
        delete process.env.CLAUDE_API_KEY;
        // Set all the model environment variables to the full model identifier
        // This ensures Claude Code uses the correct model regardless of which tier it requests
        env.ANTHROPIC_DEFAULT_OPUS_MODEL = model;
        env.ANTHROPIC_DEFAULT_SONNET_MODEL = model;
        env.ANTHROPIC_DEFAULT_HAIKU_MODEL = model;
        env.ANTHROPIC_DEFAULT_HF_MODEL = model;
        env.ANTHROPIC_DEFAULT_MODEL = model;
        // Get subagent model from config (use same provider)
        const subagentModel = this.configManager?.config.recommendedModels?.subagent?.primary || model;
        env.CLAUDE_CODE_SUBAGENT_MODEL = subagentModel;
        // Set thinking model if provided
        if (options.thinkingModel) {
            env.ANTHROPIC_THINKING_MODEL = options.thinkingModel;
        }
        // Apply provider-specific optimizations
        this.applyProviderOptimizations(env, provider, options);
        // Disable non-essential traffic
        env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = "1";
        return env;
    }
    /**
     * Resolve the provider for the given model/options
     */
    resolveProvider(options) {
        // If provider is explicitly specified, use it
        if (options.provider) {
            return options.provider;
        }
        // If modelInfo is available, get provider from there
        if (options.modelInfo) {
            return options.modelInfo.getProvider();
        }
        // Try to infer provider from model ID
        if (options.model.includes(":")) {
            const modelProvider = options.model.split(":", 1)[0];
            if (modelProvider === "synthetic" || modelProvider === "minimax") {
                return modelProvider;
            }
        }
        // Fallback to synthetic (default provider)
        console.warn(`Could not determine provider for model ${options.model}, defaulting to synthetic`);
        return "synthetic";
    }
    /**
     * Resolve provider for thinking model (might be different from main model)
     */
    resolveThinkingProvider(thinkingModel, defaultProvider) {
        // Try to infer provider from thinking model ID
        if (thinkingModel.includes(":")) {
            const thinkingProvider = thinkingModel.split(":", 1)[0];
            if (thinkingProvider === "synthetic" || thinkingProvider === "minimax") {
                return thinkingProvider;
            }
        }
        // If no specific provider info, use same as main model
        return defaultProvider;
    }
    /**
     * Get provider configuration
     */
    getProviderConfig(provider) {
        if (!this.configManager) {
            // Fallback to default configurations if no config manager
            const defaultConfigs = {
                synthetic: {
                    anthropicBaseUrl: "https://api.synthetic.new/anthropic",
                    modelsApiUrl: "https://api.synthetic.new/openai/v1/models",
                },
                minimax: {
                    anthropicBaseUrl: "https://api.minimax.io/anthropic",
                    modelsApiUrl: "https://api.minimax.io/v1/models",
                },
            };
            if (provider === "auto") {
                // For 'auto' provider, fallback to synthetic
                return defaultConfigs.synthetic;
            }
            return defaultConfigs[provider];
        }
        if (provider === "auto") {
            // For 'auto' provider, get the first enabled provider's config
            if (!this.configManager) {
                throw new Error("ConfigManager required for auto provider");
            }
            const configManager = this.configManager;
            const enabledProviders = ["synthetic", "minimax"].filter((p) => configManager.isProviderEnabled(p));
            if (enabledProviders.length > 0) {
                return configManager.getProviderConfig(enabledProviders[0]);
            }
            // Fallback to synthetic if no providers enabled
            return configManager.getProviderConfig("synthetic");
        }
        if (!this.configManager) {
            throw new Error("ConfigManager required");
        }
        return this.configManager.getProviderConfig(provider);
    }
    /**
     * Get API key for provider
     */
    getProviderApiKey(provider) {
        if (!this.configManager) {
            throw new Error(`ConfigManager required to get API key for provider: ${provider}`);
        }
        if (provider === "auto") {
            // For 'auto' provider, get the first available API key
            if (!this.configManager) {
                throw new Error("ConfigManager required for auto provider");
            }
            const configManager = this.configManager;
            const enabledProviders = ["synthetic", "minimax"].filter((p) => configManager.isProviderEnabled(p));
            for (const p of enabledProviders) {
                const apiKey = configManager.getEffectiveApiKey(p);
                if (apiKey) {
                    return apiKey;
                }
            }
            // Fallback to synthetic if no API keys available
            return configManager.getEffectiveApiKey("synthetic");
        }
        if (!this.configManager) {
            throw new Error("ConfigManager required");
        }
        return this.configManager.getEffectiveApiKey(provider);
    }
    /**
     * Apply provider-specific optimizations
     */
    applyProviderOptimizations(env, provider, options) {
        switch (provider) {
            case "minimax": {
                // MiniMax-specific optimizations
                // Extended timeout for MiniMax M2
                if (options.model.includes("MiniMax-M2") ||
                    options.model.includes("M2")) {
                    env.CLAUDE_CODE_REQUEST_TIMEOUT = "3000000"; // 50 minutes
                }
                // MiniMax may benefit from smaller batch sizes
                env.CLAUDE_CODE_BATCH_SIZE = "1";
                // MiniMax M2 enhancements (v1.3.0)
                // Get minimax config for default values
                const minimaxConfig = this.configManager?.getProviderConfig("minimax");
                // Temperature
                const temperature = options.temperature ?? minimaxConfig?.temperature;
                if (temperature !== undefined) {
                    env.CLAUDE_CODE_TEMPERATURE = String(temperature);
                }
                // Top-P
                const topP = options.topP ?? minimaxConfig?.topP;
                if (topP !== undefined) {
                    env.CLAUDE_CODE_TOP_P = String(topP);
                }
                // Context size (MiniMax M2 supports up to 1M tokens)
                const contextSize = options.contextSize ?? minimaxConfig?.contextSize;
                if (contextSize !== undefined) {
                    env.CLAUDE_CODE_CONTEXT_SIZE = String(contextSize);
                }
                // Tool choice
                const toolChoice = options.toolChoice ?? minimaxConfig?.toolChoice;
                if (toolChoice !== undefined) {
                    env.CLAUDE_CODE_TOOL_CHOICE = toolChoice;
                }
                // Parallel tool calls (default true for MiniMax M2)
                const parallelToolCalls = minimaxConfig?.parallelToolCalls ?? true;
                if (parallelToolCalls) {
                    env.CLAUDE_CODE_PARALLEL_TOOL_CALLS = "1";
                }
                // Response format (JSON mode)
                const responseFormat = options.jsonMode
                    ? "json_object"
                    : minimaxConfig?.responseFormat;
                if (responseFormat === "json_object") {
                    env.CLAUDE_CODE_RESPONSE_FORMAT = "json_object";
                }
                // Memory compact mode
                const memoryCompact = options.memoryCompact ?? minimaxConfig?.memoryCompact;
                if (memoryCompact) {
                    env.CLAUDE_CODE_MEMORY_COMPACT = "1";
                }
                break;
            }
            case "synthetic":
                // Synthetic-specific optimizations
                env.CLAUDE_CODE_REQUEST_TIMEOUT = "600000"; // 10 minutes default
                break;
        }
        // Common optimizations
        // Streaming (can be disabled with --no-stream)
        if (options.stream === false) {
            env.CLAUDE_CODE_ENABLE_STREAMING = "0";
        }
        else {
            env.CLAUDE_CODE_ENABLE_STREAMING = "1";
        }
        env.CLAUDE_CODE_ENABLE_THINKING = options.thinkingModel ? "1" : "0";
    }
    /**
     * Validate environment setup before launch
     */
    async validateEnvironment(options) {
        const errors = [];
        try {
            const provider = this.resolveProvider(options);
            // Check if provider is enabled
            if (this.configManager &&
                !this.configManager.isProviderEnabled(provider)) {
                errors.push(`Provider '${provider}' is not enabled`);
            }
            // Check if API key is available
            try {
                const apiKey = this.getProviderApiKey(provider);
                if (!apiKey) {
                    errors.push(`No API key configured for provider '${provider}'`);
                }
            }
            catch (error) {
                errors.push(`Failed to get API key for provider '${provider}': ${error}`);
            }
            // Validate thinking model setup if provided
            if (options.thinkingModel) {
                const thinkingProvider = this.resolveThinkingProvider(options.thinkingModel, provider);
                if (this.configManager &&
                    !this.configManager.isProviderEnabled(thinkingProvider)) {
                    errors.push(`Thinking model provider '${thinkingProvider}' is not enabled`);
                }
                try {
                    const thinkingApiKey = this.getProviderApiKey(thinkingProvider);
                    if (!thinkingApiKey) {
                        errors.push(`No API key configured for thinking model provider '${thinkingProvider}'`);
                    }
                }
                catch (error) {
                    errors.push(`Failed to get API key for thinking model provider '${thinkingProvider}': ${error}`);
                }
            }
        }
        catch (error) {
            errors.push(`Environment validation failed: ${error}`);
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Get fallback provider if primary provider fails
     */
    getFallbackProvider(primaryProvider) {
        if (!this.configManager) {
            return null;
        }
        // Simple fallback strategy: try synthetic first, then other enabled providers
        const fallbackOrder = ["synthetic", "minimax"];
        for (const provider of fallbackOrder) {
            if (provider !== primaryProvider &&
                this.configManager.isProviderEnabled(provider)) {
                const apiKey = this.configManager.getEffectiveApiKey(provider);
                if (apiKey) {
                    console.warn(`Falling back from ${primaryProvider} to ${provider}`);
                    return provider;
                }
            }
        }
        return null;
    }
    async checkClaudeInstallation() {
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)(this.claudePath, ["--version"], {
                stdio: "pipe",
            });
            child.on("spawn", () => {
                resolve(true);
            });
            child.on("error", () => {
                resolve(false);
            });
            // Force resolution after timeout
            setTimeout(() => resolve(false), 5000);
        });
    }
    async getClaudeVersion() {
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)(this.claudePath, ["--version"], {
                stdio: "pipe",
            });
            let output = "";
            child.stdout?.on("data", (data) => {
                output += data.toString();
            });
            child.on("close", (code) => {
                if (code === 0) {
                    resolve(output.trim());
                }
                else {
                    resolve(null);
                }
            });
            child.on("error", () => {
                resolve(null);
            });
            // Force resolution after timeout
            setTimeout(() => resolve(null), 5000);
        });
    }
    setClaudePath(path) {
        this.claudePath = path;
    }
    getClaudePath() {
        return this.claudePath;
    }
    /**
     * Cleanup resources including TensorZero proxy
     */
    async cleanup() {
        if (this.configManager?.config.liteLLM?.enabled) {
            try {
                const routerManager = (0, manager_1.getRouterManager)(this.configManager);
                await routerManager.cleanup();
            }
            catch (error) {
                console.warn(`Failed to cleanup router: ${error}`);
            }
        }
    }
}
exports.ClaudeLauncher = ClaudeLauncher;
//# sourceMappingURL=claude-launcher.js.map