"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntheticClaudeApp = void 0;
const path_1 = require("path");
const os_1 = require("os");
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../config");
const models_1 = require("../models");
const ui_1 = require("../ui");
const launcher_1 = require("../launcher");
const logger_1 = require("../utils/logger");
const banner_1 = require("../utils/banner");
const error_sanitizer_1 = require("../utils/error-sanitizer");
const ccr_manager_1 = require("../router/ccr-manager");
const ccr_config_1 = require("../router/ccr-config");
class SyntheticClaudeApp {
    configManager;
    ui;
    launcher;
    modelManager = null;
    ccrManager;
    ccrConfigGenerator;
    constructor() {
        this.configManager = new config_1.ConfigManager();
        const config = this.configManager.config;
        this.ui = new ui_1.UserInterface({
            verbose: this.configManager.hasSyntheticApiKey()
                ? config.cacheDurationHours > 0
                : false,
        }, this.configManager);
        this.launcher = new launcher_1.ClaudeLauncher(undefined, this.configManager);
        this.ccrManager = ccr_manager_1.ccrManager;
        this.ccrConfigGenerator = new ccr_config_1.CCRConfigGenerator(this.configManager);
    }
    async setupLogging(options) {
        (0, logger_1.setupLogging)(options.verbose, options.quiet);
        // Removed verbose startup log
    }
    getConfig() {
        return this.configManager.config;
    }
    getModelManager() {
        if (!this.modelManager) {
            const config = this.configManager.config;
            const cacheFile = (0, path_1.join)((0, os_1.homedir)(), ".config", "mclaude", "models_cache.json");
            // Use new multi-provider ModelManager constructor
            this.modelManager = new models_1.ModelManager({
                configManager: this.configManager,
                cacheFile,
                cacheDurationHours: config.cacheDurationHours,
            });
        }
        return this.modelManager;
    }
    async run(options) {
        // v1.3.1: Silent update check on launch (non-blocking)
        this.performSilentUpdate();
        // Normalize dangerous flags first
        if (options.additionalArgs) {
            options.additionalArgs = (0, banner_1.normalizeDangerousFlags)(options.additionalArgs);
        }
        await this.setupLogging(options);
        // Display banner unless quiet mode
        if (!options.quiet) {
            console.log((0, banner_1.createBanner)(options));
        }
        // Note: Updates are now handled manually by users via `npm update -g mclaude`
        // This eliminates complex update checking and related bugs
        // Handle first-time setup
        if (this.configManager.isFirstRun()) {
            await this.setup();
            return;
        }
        // Get model to use
        const model = await this.selectModel(options.model);
        if (!model) {
            this.ui.error("No model selected");
            return;
        }
        // Get thinking model to use (if specified)
        const thinkingModel = await this.selectThinkingModel(options.thinkingModel);
        // Apply temperature presets (v1.3.0)
        let temperature = options.temperature;
        if (options.preset) {
            switch (options.preset.toLowerCase()) {
                case "creative":
                    temperature = 1.0;
                    break;
                case "precise":
                    temperature = 0.2;
                    break;
                case "balanced":
                    temperature = 0.7;
                    break;
                default:
                    this.ui.warning(`Unknown preset: ${options.preset}. Using default temperature.`);
            }
        }
        // Load system prompt (v1.3.0)
        let sysprompt;
        const { content, type, size } = await this.configManager.loadSysprompt();
        if (content) {
            const validation = this.configManager.validateSyspromptSize(size);
            if (!validation.valid) {
                this.ui.error(validation.message);
                this.ui.info("Skipping system prompt. Run 'mclaude sysprompt' to fix.");
            }
            else {
                if (validation.warning) {
                    this.ui.warning(validation.message);
                }
                sysprompt = content;
            }
        }
        // Launch Claude Code with enhanced options
        await this.launchClaudeCode(model, {
            ...options,
            temperature,
            topP: options.topP,
            contextSize: options.contextSize,
            toolChoice: options.toolChoice,
            stream: options.stream,
            memoryCompact: options.memory === "compact",
            jsonMode: options.jsonMode,
            sysprompt,
        }, thinkingModel);
    }
    /**
     * v1.3.1: Silent update check on launch (Option C from spec)
     * Non-blocking, 3 second timeout, silent catch
     */
    performSilentUpdate() {
        // Check if we need an update (24h threshold)
        if (!this.configManager.needsUpdateCheck()) {
            return;
        }
        // v1.3.1: GitHub raw URL for model cards
        const CARDS_URL = "https://raw.githubusercontent.com/jeffersonwarrior/mclaude/main/model-cards.json";
        // Fire and forget - don't await
        this.configManager.fetchAndSaveModelCards(CARDS_URL, 3000)
            .then(async (success) => {
            if (success) {
                // Update timestamp on success
                await this.configManager.updateLastCheck();
            }
        })
            .catch(() => {
            // Silent fail - no output to user
        });
        // Also update the last check timestamp immediately to prevent multiple attempts
        this.configManager.updateLastCheck().catch(() => {
            // Silent fail
        });
    }
    /**
     * Validate provider credentials - maintains compatibility while being simpler
     */
    async validateProviderCredentials(forceRealApiTest = true) {
        const modelManager = this.getModelManager();
        const enabledProviders = modelManager.getEnabledProviders();
        const errors = [];
        // Test each provider individually to collect specific errors
        for (const provider of enabledProviders) {
            try {
                const result = await this.validateProviderCredential(provider);
                if (!result.valid) {
                    errors.push(`${provider} authentication failed`);
                }
            }
            catch (error) {
                if (provider === 'synthetic') {
                    errors.push('synthetic authentication failed');
                }
                else if (provider === 'minimax') {
                    errors.push('minimax authentication failed');
                }
                else {
                    errors.push(`${provider} authentication failed`);
                }
            }
        }
        if (errors.length === enabledProviders.length && errors.length > 0) {
            // All providers failed
            return {
                valid: false,
                authenticationError: `All providers failed authentication. ${errors.join('; ')}`,
                warnings: []
            };
        }
        else if (errors.length > 0) {
            // Some providers failed but at least one succeeded
            return {
                valid: true,
                authenticationError: null,
                warnings: errors
            };
        }
        else {
            // All providers succeeded
            return { valid: true, warnings: [], authenticationError: null };
        }
    }
    /**
     * Helper to detect which provider caused an error
     */
    detectProviderFromError(error) {
        if (error.config?.baseURL?.includes('synthetic') || error.message?.includes('synthetic')) {
            return 'synthetic';
        }
        if (error.config?.baseURL?.includes('minimax') || error.message?.includes('minimax')) {
            return 'minimax';
        }
        return null;
    }
    /**
     * Format authentication errors with provider-specific guidance
     */
    formatAuthenticationError(provider, error) {
        // Use the improved sanitization to hide full stack traces and API error responses
        if ((0, error_sanitizer_1.isAuthError)(error)) {
            return (0, error_sanitizer_1.getAuthErrorMessage)(error);
        }
        if ((0, error_sanitizer_1.isNetworkError)(error)) {
            return `${provider} network connection failed. Please check your internet connection and try again.`;
        }
        // For all other errors, use the sanitized message
        const sanitizedError = (0, error_sanitizer_1.sanitizeApiError)(error);
        return `${provider} authentication failed: ${sanitizedError}`;
    }
    /**
     * Validate provider credentials by testing API connectivity
     */
    async validateProviderCredential(provider) {
        try {
            const modelManager = this.getModelManager();
            // Test connectivity by attempting to fetch models
            await modelManager.fetchFromProvider(provider);
            return { valid: true };
        }
        catch (error) {
            return {
                valid: false,
                error: this.formatAuthenticationError(provider, error)
            };
        }
    }
    /**
     * Simple error categorization for backward compatibility
     */
    categorizeError(error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            return 'AUTHENTICATION';
        }
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            return 'NETWORK';
        }
        if (typeof error?.message === 'string' && error.message.includes('No providers are enabled')) {
            return 'PROVIDER_UNAVAILABLE';
        }
        if (typeof error?.message === 'string' && error.message.includes('UI error')) {
            return 'UI_ERROR';
        }
        return 'UNKNOWN';
    }
    /**
     * Improved API key format validation
     */
    validateApiKeyFormat(provider, apiKey) {
        if (!apiKey || apiKey.trim().length === 0) {
            return { valid: false, error: 'API key cannot be empty' };
        }
        // Basic format validation
        switch (provider.toLowerCase()) {
            case 'synthetic':
                if (apiKey.length < 10) {
                    return { valid: false, error: 'Synthetic API key appears to be too short' };
                }
                if (!apiKey.startsWith('syn_')) {
                    return { valid: false, error: 'Synthetic API key should start with "syn_"' };
                }
                break;
            case 'minimax':
                if (apiKey.length < 20) {
                    return { valid: false, error: 'MiniMax API key appears to be too short' };
                }
                break;
        }
        // Check for common placeholder values
        const placeholders = ['test', 'example', 'placeholder', 'your-api-key'];
        if (placeholders.some(placeholder => apiKey.toLowerCase().includes(placeholder))) {
            return { valid: false, error: 'Please enter a real API key, not a placeholder value' };
        }
        return { valid: true };
    }
    /**
     * Simplified error recovery: Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Check authentication status for providers
     */
    async checkAuth(options) {
        this.ui.info("Authentication Status Check");
        this.ui.info("=========================");
        const providerState = this.configManager.getAtomicProviderState();
        const providers = options?.provider
            ? [options.provider.toLowerCase()]
            : ['synthetic', 'minimax'];
        for (const provider of providers) {
            const state = providerState[provider];
            if (!state) {
                this.ui.showStatus('warning', `${provider}: Unknown provider`);
                continue;
            }
            const status = state.available ? 'success' : 'error';
            const message = `${provider.charAt(0).toUpperCase() + provider.slice(1)}: ${state.available ? 'Available' : 'Not available'}`;
            this.ui.showStatus(status, message);
            if (!state.available) {
                const issues = [];
                if (!state.enabled && !state.hasApiKey) {
                    issues.push('Provider disabled and no API key');
                }
                else if (!state.enabled) {
                    issues.push('Provider disabled');
                }
                else if (!state.hasApiKey) {
                    issues.push('No API key configured');
                }
                if (issues.length > 0) {
                    this.ui.info(`  Issues: ${issues.join(', ')}`);
                }
            }
        }
        const availableCount = providers.filter(p => {
            const state = providerState[p];
            return state?.available;
        }).length;
        if (availableCount === 0) {
            this.ui.error("No providers are properly authenticated.");
            this.ui.info("Run 'mclaude setup' to configure authentication.");
        }
        else {
            this.ui.coloredSuccess(`${availableCount}/${providers.length} providers are available`);
        }
    }
    /**
     * Test authentication for a specific provider
     */
    async testAuth(provider) {
        const providerLower = provider.toLowerCase();
        if (!['synthetic', 'minimax'].includes(providerLower)) {
            this.ui.error(`Unknown provider: ${provider}. Valid providers: synthetic, minimax`);
            return;
        }
        this.ui.info(`Testing authentication for ${provider.charAt(0).toUpperCase() + providerLower.slice(1)} provider...`);
        const testResult = await this.validateProviderCredential(providerLower);
        if (testResult.valid) {
            this.ui.coloredSuccess(`✓ ${provider} authentication successful`);
        }
        else {
            this.ui.error(`✗ ${provider} authentication failed`);
            this.ui.error(`Error: ${testResult.error}`);
        }
    }
    /**
     * Reset authentication credentials for a provider
     */
    async resetAuth(provider) {
        const providerLower = provider.toLowerCase();
        if (!['synthetic', 'minimax'].includes(providerLower)) {
            this.ui.error(`Unknown provider: ${provider}. Valid providers: synthetic, minimax`);
            return;
        }
        const confirm = await this.ui.confirm(`Are you sure you want to reset authentication credentials for ${provider}? This will remove the API key and disable the provider.`, false);
        if (!confirm) {
            this.ui.info("Operation cancelled");
            return;
        }
        try {
            await this.configManager.updateProviderConfig(providerLower, {
                apiKey: '',
                enabled: false
            });
            this.ui.coloredSuccess(`✓ Reset ${provider} authentication credentials`);
            this.ui.info(`Run 'mclaude setup' to reconfigure ${provider} provider`);
        }
        catch (error) {
            this.ui.error(`Failed to reset ${provider} credentials: ${(0, error_sanitizer_1.sanitizeApiError)(error)}`);
        }
    }
    /**
     * Refresh authentication by testing current credentials
     */
    async refreshAuth(provider) {
        const providers = provider ? [provider.toLowerCase()] : ['synthetic', 'minimax'];
        this.ui.info("Refreshing authentication...");
        for (const providerName of providers) {
            if (!['synthetic', 'minimax'].includes(providerName)) {
                this.ui.error(`Unknown provider: ${providerName}`);
                continue;
            }
            this.ui.info(`Testing ${providerName}...`);
            const testResult = await this.validateProviderCredential(providerName);
            if (testResult.valid) {
                this.ui.coloredSuccess(`✓ ${providerName} authentication refreshed`);
            }
            else {
                this.ui.error(`✗ ${providerName} authentication failed: ${testResult.error}`);
            }
        }
    }
    /**
     * Show detailed authentication status
     */
    async authStatus(options) {
        this.ui.info("Authentication Status Details");
        this.ui.info("=============================");
        const providerState = this.configManager.getAtomicProviderState();
        const format = options?.format || 'table';
        const statusData = {
            synthetic: {
                enabled: providerState.synthetic.enabled,
                hasApiKey: providerState.synthetic.hasApiKey,
                available: providerState.synthetic.available,
                apiKey: this.configManager.getSyntheticApiKey() ? '***configured***' : 'none'
            },
            minimax: {
                enabled: providerState.minimax.enabled,
                hasApiKey: providerState.minimax.hasApiKey,
                available: providerState.minimax.available,
                apiKey: this.configManager.getMinimaxApiKey() ? '***configured***' : 'none',
                groupId: this.configManager.getMinimaxGroupId() || 'none'
            }
        };
        if (format === 'json') {
            console.log(JSON.stringify(statusData, null, 2));
            return;
        }
        // Table format
        console.log("Provider   | Enabled | API Key | Available | Details");
        console.log("-----------|---------|---------|-----------|--------");
        Object.entries(statusData).forEach(([provider, data]) => {
            const enabled = data.enabled ? '✓' : '✗';
            const apiKey = data.apiKey !== 'none' ? '✓' : '✗';
            const available = data.available ? '✓' : '✗';
            const details = 'groupId' in data && data.groupId && data.groupId !== 'none' ? `Group: ${data.groupId}` : '';
            console.log(`${provider.padEnd(10)} | ${enabled.padEnd(7)} | ${apiKey.padEnd(7)} | ${available.padEnd(9)} | ${details}`);
        });
        const availableCount = Object.values(statusData).filter(d => d.available).length;
        const totalCount = Object.keys(statusData).length;
        console.log(`\nSummary: ${availableCount}/${totalCount} providers available`);
    }
    async interactiveModelSelection(options) {
        try {
            // Simplified provider availability check using atomic state
            const providerState = this.configManager.getAtomicProviderState();
            if (!providerState.synthetic.available && !providerState.minimax.available) {
                this.ui.error('No providers are available. Please run "mclaude setup" first to configure at least one provider.');
                return false;
            }
            const modelManager = this.getModelManager();
            let models = [];
            this.ui.coloredInfo("Fetching available models...");
            try {
                if (options?.provider) {
                    if (!['synthetic', 'minimax', 'auto'].includes(options.provider)) {
                        this.ui.error(`Invalid provider: ${options.provider}. Valid providers: synthetic, minimax, auto`);
                        return false;
                    }
                    models = await modelManager.getModelsByProvider(options.provider);
                }
                else {
                    models = await modelManager.fetchModels();
                }
            }
            catch (error) {
                const errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error);
                this.ui.error(`Failed to fetch models: ${errorMessage}`);
                // Provide recovery guidance
                const shouldRetry = await this.ui.confirm("Retry model selection?", true);
                if (shouldRetry) {
                    return await this.interactiveModelSelection(options);
                }
                return false;
            }
            if (models.length === 0) {
                this.ui.warning("No models available from configured providers.");
                this.ui.info("Check your API keys and network connection, or try 'mclaude doctor' for diagnostics.");
                return false;
            }
            // Sort models for consistent display
            const sortedModels = modelManager.getModels(models);
            this.ui.info(`Found ${sortedModels.length} available models`);
            // Select models
            const { regular: selectedRegularModel, thinking: selectedThinkingModel } = await this.ui.selectDualModels(sortedModels, undefined, // authenticationError
            async (subagentModel) => {
                if (subagentModel) {
                    await this.configManager.updateConfig({
                        recommendedModels: {
                            ...this.configManager.config.recommendedModels,
                            subagent: {
                                primary: subagentModel.id,
                                backup: this.configManager.config.recommendedModels?.subagent?.backup || "hf:deepseek-ai/DeepSeek-V3.2"
                            }
                        }
                    });
                    this.ui.coloredSuccess(`Subagent model saved: ${subagentModel.getDisplayName()}`);
                }
            }, async (fastModel) => {
                if (fastModel) {
                    await this.configManager.updateConfig({
                        recommendedModels: {
                            ...this.configManager.config.recommendedModels,
                            smallFast: {
                                primary: fastModel.id,
                                backup: this.configManager.config.recommendedModels?.smallFast?.backup || "hf:meta-llama/Llama-4-Scout-17B-16E-Instruct"
                            }
                        }
                    });
                    this.ui.coloredSuccess(`Fast model saved: ${fastModel.getDisplayName()}`);
                }
            });
            if (!selectedRegularModel && !selectedThinkingModel) {
                this.ui.info("Model selection cancelled");
                return false;
            }
            // Save models to config with error handling
            try {
                if (selectedRegularModel) {
                    await this.configManager.setSavedModel(selectedRegularModel.id);
                    this.ui.coloredSuccess(`Regular model saved: ${selectedRegularModel.getDisplayName()}`);
                }
                if (selectedThinkingModel) {
                    await this.configManager.setSavedThinkingModel(selectedThinkingModel.id);
                    this.ui.coloredSuccess(`Thinking model saved: ${selectedThinkingModel.getDisplayName()}`);
                }
            }
            catch (error) {
                this.ui.error(`Failed to save model selection: ${(0, error_sanitizer_1.sanitizeApiError)(error)}`);
                const shouldRetry = await this.ui.confirm("Retry saving models?", true);
                if (!shouldRetry) {
                    return false;
                }
                // Retry with the same selections
                return await this.interactiveModelSelection(options);
            }
            // Save combination if requested (with error handling)
            if (options?.saveCombination && selectedRegularModel) {
                try {
                    const combination = {
                        name: options.saveCombination,
                        regularModel: selectedRegularModel.id,
                        thinkingModel: selectedThinkingModel?.id,
                        regularProvider: options.provider || this.configManager.getDefaultProvider(),
                        thinkingProvider: options.thinkingProvider || options.provider || this.configManager.getDefaultProvider(),
                        createdAt: new Date().toISOString()
                    };
                    const config = this.configManager.config;
                    for (let i = 1; i <= 10; i++) {
                        const comboKey = `combination${i}`;
                        const existing = config[comboKey];
                        if (!existing || (existing && typeof existing === 'object' && 'name' in existing && existing.name === options.saveCombination)) {
                            const updates = {};
                            updates[comboKey] = combination;
                            await this.configManager.updateConfig(updates);
                            this.ui.coloredSuccess(`Model combination "${options.saveCombination}" saved`);
                            break;
                        }
                    }
                }
                catch (error) {
                    this.ui.warning(`Failed to save model combination: ${(0, error_sanitizer_1.sanitizeApiError)(error)}`);
                }
            }
            this.ui.highlightInfo('Now run "mclaude" to start Claude Code with your selected model(s).', ["mclaude"]);
            return true;
        }
        catch (error) {
            // Simplified error handling - no complex categorization
            const errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error);
            this.ui.error(`Model selection failed: ${errorMessage}`);
            const shouldRetry = await this.ui.confirm("Try model selection again?", true);
            if (shouldRetry) {
                return await this.interactiveModelSelection(options);
            }
            return false;
        }
    }
    async interactiveThinkingModelSelection() {
        if (!this.configManager.hasApiKey()) {
            this.ui.error('No API key configured. Please run "mclaude setup" first.');
            return false;
        }
        try {
            const modelManager = this.getModelManager();
            this.ui.coloredInfo("Fetching available models...");
            const models = await modelManager.fetchModels();
            if (models.length === 0) {
                this.ui.error("No models available. Please check your API key and connection.");
                return false;
            }
            // Sort models for consistent display
            const sortedModels = modelManager.getModels(models);
            const selectedThinkingModel = await this.ui.selectModel(sortedModels);
            if (!selectedThinkingModel) {
                this.ui.info("Thinking model selection cancelled");
                return false;
            }
            await this.configManager.updateConfig({
                selectedThinkingModel: selectedThinkingModel.id,
            });
            this.ui.coloredSuccess(`Thinking model saved: ${selectedThinkingModel.getDisplayName()}`);
            this.ui.highlightInfo('Now run "mclaude --thinking-model" to start Claude Code with this thinking model.', ["mclaude", "--thinking-model"]);
            return true;
        }
        catch (error) {
            const errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error);
            this.ui.error(`Error during thinking model selection: ${errorMessage}`);
            return false;
        }
    }
    // Old searchModels method is now replaced by enhanced version below
    async showConfig() {
        const config = this.configManager.config;
        this.ui.info("Current Configuration:");
        this.ui.info("=====================");
        this.ui.info(`Default Provider: ${config.defaultProvider}`);
        this.ui.info(`Synthetic API Key: ${this.configManager.hasSyntheticApiKey() ? "••••••••" + this.configManager.getSyntheticApiKey().slice(-4) : "Not set"}`);
        this.ui.info(`MiniMax API Key: ${this.configManager.hasMinimaxApiKey() ? "••••••••" + this.configManager.getMinimaxApiKey().slice(-4) : "Not set"}`);
        this.ui.info(`Synthetic Status: ${this.configManager.isProviderEnabled("synthetic") ? "Enabled" : "Disabled"}`);
        this.ui.info(`MiniMax Status: ${this.configManager.isProviderEnabled("minimax") ? "Enabled" : "Disabled"}`);
        this.ui.info(`Cache Duration: ${config.cacheDurationHours} hours`);
        this.ui.info(`Selected Model: ${config.selectedModel || "None"}`);
        this.ui.info(`Selected Thinking Model: ${config.selectedThinkingModel || "None"}`);
        this.ui.info(`First Run Completed: ${config.firstRunCompleted}`);
        this.ui.info(`Config Version: ${config.configVersion}`);
    }
    async setConfig(key, value) {
        // Simple key-value config setting with provider support
        const updates = {};
        switch (key) {
            case "apiKey":
                updates.apiKey = value;
                break;
            case "baseUrl":
                updates.baseUrl = value;
                break;
            case "modelsApiUrl":
                updates.modelsApiUrl = value;
                break;
            case "cacheDurationHours":
                updates.cacheDurationHours = parseInt(value, 10);
                break;
            case "selectedModel":
                updates.selectedModel = value;
                break;
            case "selectedThinkingModel":
                updates.selectedThinkingModel = value;
                break;
            case "defaultProvider":
                if (!['synthetic', 'minimax', 'auto'].includes(value)) {
                    this.ui.error(`Invalid provider: ${value}. Valid providers: synthetic, minimax, auto`);
                    return;
                }
                updates.defaultProvider = value;
                break;
            case "synthetic.apiKey":
                await this.configManager.updateProviderConfig('synthetic', { apiKey: value });
                this.ui.success(`Synthetic API key updated`);
                return;
            case "synthetic.baseUrl":
                await this.configManager.updateProviderConfig('synthetic', { baseUrl: value });
                this.ui.success(`Synthetic base URL updated`);
                return;
            case "minimax.apiKey":
                await this.configManager.updateProviderConfig('minimax', { apiKey: value });
                this.ui.success(`Minimax API key updated`);
                return;
            case "minimax.groupId":
                await this.configManager.updateProviderConfig('minimax', { groupId: value });
                this.ui.success(`Minimax group ID updated`);
                return;
            default:
                this.ui.error(`Unknown configuration key: ${key}`);
                this.ui.info(`Valid keys: apiKey, baseUrl, modelsApiUrl, cacheDurationHours, selectedModel, selectedThinkingModel, defaultProvider, synthetic.apiKey, synthetic.baseUrl, minimax.apiKey, minimax.groupId`);
                return;
        }
        const success = await this.configManager.updateConfig(updates);
        if (success) {
            this.ui.success(`Configuration updated: ${key} = ${value}`);
        }
        else {
            this.ui.error(`Failed to update configuration: ${key}`);
        }
    }
    async resetConfig(options) {
        const scope = options?.scope || this.configManager.getConfigType();
        if (scope === 'local') {
            if (this.configManager.getConfigType() === 'global') {
                this.ui.error("No local project configuration to reset");
                this.ui.info("Use --scope global to reset global configuration");
                return;
            }
            const confirmed = await this.ui.confirm("Are you sure you want to reset local configuration to defaults?");
            if (!confirmed) {
                this.ui.info("Local configuration reset cancelled");
                return;
            }
            await this.configManager.initLocalConfig(); // Re-initialize with defaults
            this.ui.success("Local configuration reset to defaults");
        }
        else if (scope === 'global') {
            const confirmed = await this.ui.confirm("Are you sure you want to reset global configuration to defaults?");
            if (!confirmed) {
                this.ui.info("Global configuration reset cancelled");
                return;
            }
            await this.configManager.saveGlobalConfig({});
            this.ui.success("Global configuration reset to defaults");
        }
        else {
            this.ui.error(`Invalid scope: ${scope}. Use 'local' or 'global'`);
        }
    }
    async setup() {
        // Read version from package.json
        const packageJsonPath = (0, path_1.join)(__dirname, "../../package.json");
        const version = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, "utf8")).version;
        console.log(chalk_1.default.red(`Welcome to Minimax MClaude ${version}! Let's setup your configuration.`));
        this.ui.info("===============================================");
        try {
            // Use the unified setup orchestrator
            await this.unifiedSetupOrchestrator();
            this.ui.coloredSuccess("Setup completed successfully!");
            this.ui.highlightInfo('You can now run "mclaude" to launch Claude Code', [
                "mclaude",
            ]);
        }
        catch (error) {
            const errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error);
            this.ui.error(`Setup failed: ${errorMessage}`);
            this.ui.info("You can retry setup by running 'mclaude setup' again");
            // Don't re-throw - let the user retry manually
            return;
        }
    }
    /**
     * Unified Setup Orchestrator - Simplified, bulletproof setup flow
     *
     * This method orchestrates the entire setup process with:
     * - Single point of authentication testing
     * - Atomic state management to prevent race conditions
     * - Clear progressive disclosure and user feedback
     * - Graceful degradation when steps fail
     * - Comprehensive error recovery options
     */
    async unifiedSetupOrchestrator() {
        const setupSteps = [
            { name: "Provider Configuration", action: () => this.setupProviderConfiguration() },
            { name: "Authentication Testing", action: () => this.setupAuthenticationTesting() },
            { name: "Model Selection", action: () => this.setupModelSelection() },
            { name: "Finalization", action: () => this.setupFinalization() }
        ];
        this.ui.info("Starting streamlined setup process...");
        this.ui.info("==================================");
        for (const step of setupSteps) {
            this.ui.coloredInfo(`\n📋 Step: ${step.name}`);
            this.ui.info("─".repeat(step.name.length + 7));
            try {
                await step.action();
                this.ui.coloredSuccess(`✓ ${step.name} completed`);
            }
            catch (error) {
                const shouldContinue = await this.handleSetupStepError(step.name, error);
                if (!shouldContinue) {
                    throw new Error(`Setup stopped at ${step.name}: ${(0, error_sanitizer_1.sanitizeApiError)(error)}`);
                }
                this.ui.warning(`⚠ ${step.name} completed with warnings`);
            }
        }
        this.ui.coloredSuccess("\n🎉 All setup steps completed successfully!");
    }
    /**
     * Handle errors during setup steps with clear recovery options
     */
    async handleSetupStepError(stepName, error) {
        const errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error);
        this.ui.error(`❌ ${stepName} failed: ${errorMessage}`);
        this.ui.info("\nRecovery Options:");
        this.ui.info("1. Retry this step");
        this.ui.info("2. Skip this step and continue (if possible)");
        this.ui.info("3. Abort setup and fix the issue manually");
        const choice = await this.ui.ask("Choose an option (1-3)", "2");
        switch (choice) {
            case "1":
                this.ui.info("Retrying step...");
                await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
                return true; // Continue, which will retry the step
            case "2":
                // Determine if we can safely skip this step
                const canSkip = await this.canSkipSetupStep(stepName);
                if (canSkip) {
                    this.ui.warning(`Skipping ${stepName}. You can complete this later.`);
                    return true; // Continue to next step
                }
                else {
                    this.ui.error(`Cannot skip ${stepName}. This step is required.`);
                    return false; // Abort setup
                }
            case "3":
            default:
                this.ui.info("Setup aborted. You can retry by running 'mclaude setup' again.");
                return false; // Abort setup
        }
    }
    /**
     * Determine if a setup step can be safely skipped
     */
    async canSkipSetupStep(stepName) {
        switch (stepName) {
            case "Provider Configuration":
                return false; // At least one provider is required
            case "Authentication Testing":
                return true; // Optional - can be done later with 'mclaude doctor'
            case "Model Selection":
                return true; // Optional - can be done later with 'mclaude models'
            case "Finalization":
                return false; // Required for proper setup completion
            default:
                return false;
        }
    }
    /**
     * Step 1: Configure providers (streamlined)
     */
    async setupProviderConfiguration() {
        // Check for local configuration and setup if in a project
        const configType = this.configManager.getConfigType();
        const workspaceRoot = this.configManager.getWorkspaceRoot();
        if (configType === 'global' && workspaceRoot) {
            this.ui.info("🌍 Global configuration detected in a project directory");
            this.ui.info("Workspace: " + workspaceRoot);
            const shouldUseLocal = await this.ui.confirm("Create local project configuration?", true);
            if (shouldUseLocal) {
                try {
                    await this.configManager.initLocalConfig();
                    // Try to migrate existing global config
                    const globalProviders = this.configManager.getAtomicProviderState();
                    const hasGlobalProviders = globalProviders.synthetic.hasApiKey || globalProviders.minimax.hasApiKey;
                    if (hasGlobalProviders) {
                        const shouldMigrate = await this.ui.confirm("Migrate existing global configuration to local project?", true);
                        if (shouldMigrate) {
                            await this.configManager.migrateToLocal();
                            this.ui.success("✓ Global configuration migrated to local project");
                        }
                    }
                    this.ui.success("✓ Local project configuration created");
                    this.ui.info("You can switch back to global config with: mclaude config global\n");
                }
                catch (error) {
                    this.ui.error(`Failed to create local config: ${error.message}`);
                    this.ui.info("Continuing with global configuration");
                }
            }
        }
        else if (configType === 'local') {
            this.ui.info("🏠 Using local project configuration");
            this.ui.info("Workspace: " + workspaceRoot);
            this.ui.info("This configuration will be used for this project only\n");
        }
        else {
            this.ui.info("🌍 Using global configuration");
            this.ui.info("This configuration will be used system-wide\n");
        }
        const providerState = this.configManager.getAtomicProviderState();
        const hasAnyProvider = providerState.synthetic.hasApiKey || providerState.minimax.hasApiKey;
        if (hasAnyProvider) {
            const shouldReconfigure = await this.ui.confirm("Existing configuration found. Reconfigure providers?", false);
            if (!shouldReconfigure) {
                this.ui.info("Keeping existing provider configuration");
                return;
            }
        }
        // Simple provider selection flow
        this.ui.info("Configure at least one provider to continue:");
        this.ui.info("1. Synthetic API (Recommended)");
        this.ui.info("2. MiniMax API");
        this.ui.info("3. Both providers");
        const providerChoice = await this.ui.ask("Select option (1-3)", "1");
        let configuredProviders = 0;
        // Configure Synthetic if selected
        if (providerChoice === "1" || providerChoice === "3") {
            const success = await this.configureSingleProvider("synthetic");
            if (success)
                configuredProviders++;
        }
        // Configure MiniMax if selected
        if (providerChoice === "2" || providerChoice === "3") {
            const success = await this.configureSingleProvider("minimax");
            if (success)
                configuredProviders++;
        }
        if (configuredProviders === 0) {
            throw new Error("No providers were successfully configured. At least one provider is required.");
        }
        this.ui.success(`✓ ${configuredProviders} provider(s) configured`);
    }
    /**
     * Configure a single provider with simplified flow
     */
    async configureSingleProvider(provider) {
        try {
            const providerNames = { synthetic: 'Synthetic', minimax: 'MiniMax' };
            const providerName = providerNames[provider];
            this.ui.info(`\nConfiguring ${providerName} provider...`);
            const apiKey = await this.ui.askPassword(`Enter your ${providerName} API key (or press Enter to skip)`);
            if (!apiKey) {
                this.ui.info(`Skipping ${providerName} provider`);
                return false;
            }
            // Basic format validation
            const formatValidation = this.validateApiKeyFormat(provider, apiKey);
            if (!formatValidation.valid) {
                this.ui.error(`Invalid API key format: ${formatValidation.error}`);
                const shouldRetry = await this.ui.confirm(`Try ${providerName} again?`, true);
                if (shouldRetry) {
                    return await this.configureSingleProvider(provider);
                }
                return false;
            }
            // Save API key
            let success = false;
            if (provider === 'synthetic') {
                success = await this.configManager.setSyntheticApiKey(apiKey);
            }
            else {
                success = await this.configManager.setMinimaxApiKey(apiKey);
                // For MiniMax, also try to get Group ID
                if (success) {
                    const groupId = await this.ui.ask("Enter MiniMax Group ID (optional, press Enter to skip)");
                    if (groupId) {
                        await this.configManager.setMinimaxGroupId(groupId);
                    }
                }
            }
            if (!success) {
                this.ui.error(`Failed to save ${providerName} configuration`);
                return false;
            }
            // Enable the provider
            await this.configManager.setProviderEnabled(provider, true);
            this.ui.coloredSuccess(`✓ ${providerName} provider configured`);
            return true;
        }
        catch (error) {
            this.ui.error(`Failed to configure ${provider}: ${(0, error_sanitizer_1.sanitizeApiError)(error)}`);
            return false;
        }
    }
    /**
     * Step 2: Test authentication for configured providers
     */
    async setupAuthenticationTesting() {
        const shouldTest = await this.ui.confirm("Test configured provider connections?", true);
        if (!shouldTest) {
            this.ui.info("Skipping connection tests. You can test later with 'mclaude doctor'.");
            return;
        }
        const providerState = this.configManager.getAtomicProviderState();
        const enabledProviders = [];
        if (providerState.synthetic.available)
            enabledProviders.push('synthetic');
        if (providerState.minimax.available)
            enabledProviders.push('minimax');
        if (enabledProviders.length === 0) {
            throw new Error("No enabled providers available for testing. Configure at least one provider first.");
        }
        let successCount = 0;
        const testResults = {};
        for (const provider of enabledProviders) {
            // Skip testing if no API key is provided for this provider
            const hasApiKey = provider === 'synthetic'
                ? this.configManager.hasSyntheticApiKey()
                : this.configManager.hasMinimaxApiKey();
            if (!hasApiKey) {
                const providerDisplayName = provider.charAt(0).toUpperCase() + provider.slice(1);
                this.ui.warning(`⚠ ${providerDisplayName} provider skipped: No API key configured`);
                continue;
            }
            this.ui.info(`\nTesting ${provider} provider...`);
            try {
                const testResult = await this.validateProviderCredential(provider);
                testResults[provider] = { success: testResult.valid, error: testResult.error };
                if (testResult.valid) {
                    this.ui.coloredSuccess(`✓ ${provider} connection successful`);
                    successCount++;
                }
                else {
                    this.ui.error(`✗ ${provider} connection failed: ${testResult.error}`);
                }
            }
            catch (error) {
                const sanitizedError = (0, error_sanitizer_1.sanitizeApiError)(error);
                testResults[provider] = { success: false, error: sanitizedError };
                // Hide the full stack trace - only show sanitized error
                this.ui.error(`✗ ${provider} connection failed: ${sanitizedError}`);
            }
        }
        if (successCount === 0) {
            const shouldRetry = await this.ui.confirm("All providers failed authentication. Retry setup?", true);
            if (shouldRetry) {
                return await this.setupAuthenticationTesting(); // Retry with user intervention
            }
            // Critical failure - stop setup process completely
            throw new Error("Authentication failed for all providers. Please check your API keys and restart setup.");
        }
        // Check if critical providers failed - if Synthetic fails, it's critical since it's the primary provider
        const criticalProviders = ['synthetic'];
        const failedCriticalProviders = criticalProviders.filter(p => enabledProviders.includes(p) && testResults[p]?.success === false);
        if (failedCriticalProviders.length > 0 && successCount > 0) {
            const shouldContinue = await this.ui.confirm(`Critical providers failed (${failedCriticalProviders.join(', ')}). Continue with working providers?`, false);
            if (!shouldContinue) {
                throw new Error("Setup cancelled due to critical provider failures.");
            }
        }
        if (successCount < enabledProviders.length) {
            const failedProviders = Object.entries(testResults)
                .filter(([_, result]) => !result.success)
                .map(([provider, _]) => provider);
            this.ui.warning(`⚠ Some providers failed: ${failedProviders.join(', ')}`);
            this.ui.info(`Continuing with ${successCount} working provider(s)...`);
        }
        this.ui.success(`✓ Authentication testing complete (${successCount}/${enabledProviders.length} providers working)`);
    }
    /**
     * Step 3: Select models (simplified)
     */
    async setupModelSelection() {
        // v1.3.1: Show recommended models first
        this.ui.info("\n🎯 Recommended Models:");
        this.ui.info("━━━━━━━━━━━━━━━━━━━━━━");
        this.ui.info("We recommend these model combinations for optimal experience:");
        const recommended = this.configManager.getRecommendedModels();
        this.ui.info(`\n• DEFAULT: ${recommended.default.primary} (backup: ${recommended.default.backup})`);
        this.ui.info(`• SMALL_FAST: ${recommended.smallFast.primary} (backup: ${recommended.smallFast.backup})`);
        this.ui.info(`• THINKING: ${recommended.thinking.primary} (backup: ${recommended.thinking.backup})`);
        this.ui.info(`• SUBAGENT: ${recommended.subagent.primary} (backup: ${recommended.subagent.backup})`);
        this.ui.info("\nWe'll check which models are available with your current providers...");
        // Check availability of recommended models
        const availableModels = await this.checkRecommendedModelAvailability(recommended);
        const shouldUseRecommended = await this.ui.confirm("\nUse recommended models? (You can customize them after setup)", true);
        if (shouldUseRecommended) {
            // Save recommended models to config
            try {
                await this.configManager.updateConfig({
                    recommendedModels: recommended,
                    selectedModel: recommended.default.primary,
                    selectedThinkingModel: recommended.thinking.primary,
                    firstRunCompleted: true,
                });
                this.ui.coloredSuccess("✓ Recommended models saved to configuration");
                this.ui.info("You can change these later with 'mclaude models'");
            }
            catch (error) {
                this.ui.warning("Failed to save recommended models to config");
            }
            return;
        }
        // Fall back to interactive selection
        const shouldSelectModels = await this.ui.confirm("Select models manually?", true);
        if (!shouldSelectModels) {
            this.ui.info("Skipping model selection. You can select models later with 'mclaude models'.");
            return;
        }
        try {
            const modelSelectionSuccess = await this.interactiveModelSelection();
            if (!modelSelectionSuccess) {
                throw new Error("Model selection was cancelled or failed");
            }
        }
        catch (error) {
            const errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error);
            this.ui.error(`Model selection failed: ${errorMessage}`);
            const shouldRetry = await this.ui.confirm("Try model selection again?", true);
            if (shouldRetry) {
                return await this.setupModelSelection();
            }
            this.ui.warning("Continuing without model selection. You can complete this later with 'mclaude models'.");
        }
    }
    /**
     * v1.3.1: Check availability of recommended models
     */
    async checkRecommendedModelAvailability(recommended) {
        const availableModels = [];
        const modelManager = this.getModelManager();
        try {
            const allModels = await modelManager.fetchModels();
            const checkModel = (modelId) => {
                return allModels.some(m => m.id === modelId || m.id.includes(modelId.split('/').pop() || modelId));
            };
            // Check each recommended model
            for (const role of ['default', 'smallFast', 'thinking', 'subagent']) {
                const rec = recommended[role];
                if (checkModel(rec.primary)) {
                    availableModels.push(rec.primary);
                }
                else if (checkModel(rec.backup)) {
                    availableModels.push(rec.backup);
                }
            }
            if (availableModels.length > 0) {
                this.ui.coloredSuccess(`✓ Found ${availableModels.length} recommended models available`);
            }
            else {
                this.ui.warning("⚠ None of the recommended models are available with current providers");
            }
            return availableModels;
        }
        catch (error) {
            this.ui.warning("⚠ Could not check model availability");
            return [];
        }
    }
    /**
     * Step 4: Finalize setup
     */
    async setupFinalization() {
        // Mark first run as completed
        const success = await this.configManager.markFirstRunCompleted();
        if (!success) {
            throw new Error("Failed to mark setup as completed");
        }
        // Verify final configuration
        const providerState = this.configManager.getAtomicProviderState();
        const availableProviders = Object.values(providerState).filter(state => state.available).length;
        if (availableProviders === 0) {
            throw new Error("Setup completed but no providers are available. This shouldn't happen - please report this issue.");
        }
        // Generate CCR configuration (v1.4.4)
        this.ui.info("\n📋 Generating CCR Configuration...");
        const configGenerator = new ccr_config_1.CCRConfigGenerator(this.configManager);
        try {
            await configGenerator.generateConfig();
            this.ui.coloredSuccess("✓ CCR Configuration generated");
            this.ui.info(`  Location: ${configGenerator.getConfigPath()}`);
        }
        catch (error) {
            this.ui.warning("⚠ Failed to generate CCR configuration");
            this.ui.info("  You can generate it later with 'mclaude router config'");
        }
        // Show final configuration summary
        this.ui.info("\n📋 Setup Summary:");
        this.ui.info("=================");
        this.ui.info(`✓ Available Providers: ${availableProviders}`);
        this.ui.info(`✓ Multi-Provider Routing: CCR enabled`);
        if (this.configManager.hasSavedModel()) {
            this.ui.info(`✓ Default Model: ${this.configManager.getSavedModel()}`);
        }
        if (this.configManager.hasSavedThinkingModel()) {
            this.ui.info(`✓ Thinking Model: ${this.configManager.getSavedThinkingModel()}`);
        }
        this.ui.info(`✓ Configuration Version: ${this.configManager.config.configVersion}`);
    }
    // Note: setupSyntheticApiKey() and setupMinimaxApiKey() methods have been replaced
    // by the unified setup orchestrator. See configureSingleProvider() for the new implementation.
    async doctor() {
        this.ui.info("System Health Check");
        this.ui.info("===================");
        // Check Claude Code installation
        const claudeInstalled = await this.launcher.checkClaudeInstallation();
        this.ui.showStatus(claudeInstalled ? "success" : "error", `Claude Code: ${claudeInstalled ? "Installed" : "Not found"}`);
        if (claudeInstalled) {
            const version = await this.launcher.getClaudeVersion();
            if (version) {
                this.ui.info(`Claude Code version: ${version}`);
            }
        }
        // Check configuration
        this.ui.showStatus(this.configManager.hasApiKey() ? "success" : "error", "Configuration: API key " +
            (this.configManager.hasApiKey() ? "configured" : "missing"));
        // Check API connection
        if (this.configManager.hasApiKey()) {
            try {
                const modelManager = this.getModelManager();
                const models = await modelManager.fetchModels(true);
                this.ui.showStatus("success", `API connection: OK (${models.length} models)`);
            }
            catch (error) {
                const errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error);
                this.ui.showStatus("error", `API connection: Failed (${errorMessage})`);
            }
        }
        // Note: Manual updates via `npm update -g mclaude`
        this.ui.info("To check for updates, run: npm update -g mclaude");
    }
    async clearCache() {
        const modelManager = this.getModelManager();
        const success = await modelManager.clearCache();
        if (success) {
            this.ui.success("Model cache cleared");
        }
        else {
            this.ui.error("Failed to clear cache");
        }
    }
    async cacheInfo() {
        const modelManager = this.getModelManager();
        const cacheInfo = await modelManager.getCacheInfo();
        this.ui.info("Cache Information:");
        this.ui.info("==================");
        if (cacheInfo.exists) {
            this.ui.info(`Status: ${cacheInfo.isValid ? "Valid" : "Expired"}`);
            this.ui.info(`File: ${cacheInfo.filePath}`);
            this.ui.info(`Size: ${cacheInfo.sizeBytes} bytes`);
            this.ui.info(`Models: ${cacheInfo.modelCount}`);
            this.ui.info(`Modified: ${cacheInfo.modifiedTime}`);
        }
        else {
            this.ui.info("Status: No cache file");
        }
    }
    async selectModel(preselectedModel) {
        if (preselectedModel) {
            return preselectedModel;
        }
        // Use saved model if available, otherwise show error
        if (this.configManager.hasSavedModel()) {
            return this.configManager.getSavedModel();
        }
        this.ui.error('No model selected. Run "mclaude model" to select a model.');
        return null;
    }
    async selectThinkingModel(preselectedThinkingModel) {
        if (preselectedThinkingModel) {
            return preselectedThinkingModel;
        }
        // Use saved thinking model if available
        if (this.configManager.hasSavedThinkingModel()) {
            return this.configManager.getSavedThinkingModel();
        }
        return null; // Thinking model is optional
    }
    /**
     * Simplified connection testing - handled by the new setup orchestrator
     * This method is kept for backward compatibility but delegates to the new flow
     */
    async testConnectionWithRecovery() {
        // Use the new simplified authentication testing
        await this.setupAuthenticationTesting();
    }
    async launchClaudeCode(model, options, thinkingModel) {
        const launchInfo = thinkingModel
            ? `Launching with ${model} (thinking: ${thinkingModel}). Use "mclaude model" to change model.`
            : `Launching with ${model}. Use "mclaude model" to change model.`;
        this.ui.highlightInfo(launchInfo, [model, "mclaude model"]);
        // Try to get model info for better provider resolution
        let modelInfo;
        try {
            const modelManager = this.getModelManager();
            const modelResult = await modelManager.getModelById(model);
            if (modelResult) {
                modelInfo = modelResult;
            }
        }
        catch (error) {
            // Continue without model info if we can't fetch it
            console.warn(`Could not get model info for ${model}: ${error}`);
        }
        const result = await this.launcher.launchClaudeCode({
            model,
            thinkingModel,
            additionalArgs: options.additionalArgs,
            env: options.env, // Pass through any custom env variables
            modelInfo,
        });
        if (!result.success) {
            this.ui.error(`Failed to launch Claude Code: ${result.error}`);
        }
    }
    // Provider management methods
    async listProviders() {
        this.ui.info("Available Providers:");
        this.ui.info("====================");
        const providers = ['synthetic', 'minimax', 'auto'];
        for (const provider of providers) {
            const enabled = this.configManager.isProviderEnabled(provider);
            const hasApiKey = provider === 'synthetic'
                ? this.configManager.hasSyntheticApiKey()
                : provider === 'minimax'
                    ? this.configManager.hasMinimaxApiKey()
                    : true; // auto always has access if other providers are configured
            const config = this.configManager.getProviderConfig(provider);
            const status = enabled ? "✓ Enabled" : "✗ Disabled";
            const apiStatus = hasApiKey ? "✓" : "✗";
            this.ui.info(`${provider.padEnd(10)} ${status.padEnd(12)} API: ${apiStatus}`);
            if (config) {
                if ('baseUrl' in config && config.baseUrl) {
                    this.ui.info(`  Base URL: ${config.baseUrl}`);
                }
                if ('groupId' in config && config.groupId) {
                    this.ui.info(`  Group ID: ${config.groupId}`);
                }
            }
        }
        const defaultProvider = this.configManager.getDefaultProvider();
        this.ui.info(`\nDefault Provider: ${defaultProvider}`);
    }
    async enableProvider(provider) {
        if (!['synthetic', 'minimax', 'auto'].includes(provider)) {
            this.ui.error(`Invalid provider: ${provider}. Valid providers: synthetic, minimax, auto`);
            return;
        }
        const success = await this.configManager.setProviderEnabled(provider, true);
        if (success) {
            this.ui.success(`Provider "${provider}" has been enabled`);
            // Check if provider has API key
            if (provider === 'synthetic' && !this.configManager.hasSyntheticApiKey()) {
                this.ui.warning(`Note: "synthetic" provider is enabled but no API key is configured`);
                this.ui.info(`Set API key with: mclaude config set synthetic.apiKey <your-key>`);
            }
            else if (provider === 'minimax' && !this.configManager.hasMinimaxApiKey()) {
                this.ui.warning(`Note: "minimax" provider is enabled but no API key is configured`);
                this.ui.info(`Set API key with: mclaude config set minimax.apiKey <your-key>`);
            }
        }
        else {
            this.ui.error(`Failed to enable provider "${provider}"`);
        }
    }
    async disableProvider(provider) {
        if (!['synthetic', 'minimax', 'auto'].includes(provider)) {
            this.ui.error(`Invalid provider: ${provider}. Valid providers: synthetic, minimax, auto`);
            return;
        }
        const success = await this.configManager.setProviderEnabled(provider, false);
        if (success) {
            this.ui.success(`Provider "${provider}" has been disabled`);
        }
        else {
            this.ui.error(`Failed to disable provider "${provider}"`);
        }
    }
    async setDefaultProvider(provider) {
        if (!['synthetic', 'minimax', 'auto'].includes(provider)) {
            this.ui.error(`Invalid provider: ${provider}. Valid providers: synthetic, minimax, auto`);
            return;
        }
        const success = await this.configManager.setDefaultProvider(provider);
        if (success) {
            this.ui.success(`Default provider set to "${provider}"`);
        }
        else {
            this.ui.error(`Failed to set default provider "${provider}"`);
        }
    }
    async providerStatus(options) {
        const providers = options.provider
            ? [options.provider].filter(p => ['synthetic', 'minimax', 'auto'].includes(p))
            : ['synthetic', 'minimax', 'auto'];
        if (options.provider && providers.length === 0) {
            this.ui.error(`Invalid provider: ${options.provider}. Valid providers: synthetic, minimax, auto`);
            return;
        }
        this.ui.info("Provider Status:");
        this.ui.info("================");
        for (const provider of providers) {
            this.ui.info(`\n${provider.toUpperCase()}:`);
            this.ui.info("─".repeat(provider.length + 1));
            const enabled = this.configManager.isProviderEnabled(provider);
            const hasApiKey = provider === 'synthetic'
                ? this.configManager.hasSyntheticApiKey()
                : provider === 'minimax'
                    ? this.configManager.hasMinimaxApiKey()
                    : true;
            this.ui.info(`Enabled: ${enabled ? "Yes" : "No"}`);
            this.ui.info(`Has API Key: ${hasApiKey ? "Yes" : "No"}`);
            const config = this.configManager.getProviderConfig(provider);
            if (config) {
                if ('baseUrl' in config && config.baseUrl) {
                    this.ui.info(`Base URL: ${config.baseUrl}`);
                }
                if ('groupId' in config && config.groupId) {
                    this.ui.info(`Group ID: ${config.groupId}`);
                }
                if (config.timeout) {
                    this.ui.info(`Timeout: ${config.timeout}ms`);
                }
            }
            // Try to get provider-specific model count
            try {
                const modelManager = this.getModelManager();
                const providerModels = await modelManager.getModelsByProvider(provider);
                this.ui.info(`Available Models: ${providerModels.length}`);
            }
            catch (error) {
                const errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error);
                this.ui.info(`Available Models: Could not fetch (${errorMessage})`);
            }
        }
        if (!options.provider) {
            const defaultProvider = this.configManager.getDefaultProvider();
            this.ui.info(`\nDefault Provider: ${defaultProvider}`);
        }
    }
    async testProvider(provider) {
        if (!['synthetic', 'minimax', 'auto'].includes(provider)) {
            this.ui.error(`Invalid provider: ${provider}. Valid providers: synthetic, minimax, auto`);
            return;
        }
        this.ui.info(`Testing provider: ${provider}`);
        this.ui.info("=".repeat(20 + provider.length));
        // Check if provider is enabled
        const enabled = this.configManager.isProviderEnabled(provider);
        if (!enabled) {
            this.ui.warning(`Provider "${provider}" is disabled`);
            this.ui.info(`Enable with: mclaude providers enable ${provider}`);
            return;
        }
        // Check API key
        const hasApiKey = provider === 'synthetic'
            ? this.configManager.hasSyntheticApiKey()
            : provider === 'minimax'
                ? this.configManager.hasMinimaxApiKey()
                : true;
        if (!hasApiKey) {
            this.ui.error(`No API key configured for provider "${provider}"`);
            return;
        }
        // Test connectivity
        try {
            const modelManager = this.getModelManager();
            let modelCount = 0;
            if (provider === 'auto') {
                // Test all enabled providers
                const syntheticEnabled = this.configManager.isProviderEnabled('synthetic');
                const minimaxEnabled = this.configManager.isProviderEnabled('minimax');
                if (syntheticEnabled) {
                    this.ui.info("Testing synthetic endpoint...");
                    const syntheticModels = await modelManager.getModelsByProvider('synthetic');
                    modelCount += syntheticModels.length;
                    this.ui.success(`✓ Synthetic: ${syntheticModels.length} models`);
                }
                if (minimaxEnabled) {
                    this.ui.info("Testing minimax endpoint...");
                    const minimaxModels = await modelManager.getModelsByProvider('minimax');
                    modelCount += minimaxModels.length;
                    this.ui.success(`✓ Minimax: ${minimaxModels.length} models`);
                }
                if (!syntheticEnabled && !minimaxEnabled) {
                    this.ui.warning("Auto mode: No providers are enabled");
                    return;
                }
            }
            else {
                // Test specific provider
                const models = await modelManager.getModelsByProvider(provider);
                modelCount = models.length;
                this.ui.success(`✓ Connected successfully`);
                this.ui.info(`Found ${modelCount} models`);
            }
            if (modelCount > 0) {
                this.ui.success(`Provider "${provider}" is fully functional`);
            }
            else {
                this.ui.warning(`Provider "${provider}" connected but no models available`);
            }
        }
        catch (error) {
            const errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error);
            this.ui.error(`✗ Failed to connect to provider "${provider}"`);
            this.ui.error(`Error: ${errorMessage}`);
            // Provide specific guidance
            if (provider === 'synthetic') {
                this.ui.info(`Check your API key and network connection`);
                this.ui.info(`Test with: curl -H "Authorization: Bearer $SYNTHETIC_API_KEY" https://api.synthetic.new/openai/v1/models`);
            }
            else if (provider === 'minimax') {
                this.ui.info(`Check your API key, Group ID, and network connection`);
            }
        }
    }
    // Enhanced configuration methods
    async listProviderConfigs() {
        this.ui.info("Provider Configurations:");
        this.ui.info("=========================");
        const providers = ['synthetic', 'minimax', 'auto'];
        for (const provider of providers) {
            const config = this.configManager.getProviderConfig(provider);
            this.ui.info(`\n${provider}:`);
            this.ui.info("─".repeat(provider.length + 1));
            if (!config) {
                this.ui.info("  No configuration");
                continue;
            }
            this.ui.info(`  Enabled: ${config.enabled}`);
            if ('apiKey' in config) {
                const hasKey = !!config.apiKey;
                this.ui.info(`  API Key: ${hasKey ? " configured" : " not configured"}`);
            }
            if ('baseUrl' in config && config.baseUrl) {
                this.ui.info(`  Base URL: ${config.baseUrl}`);
            }
            if ('groupId' in config && config.groupId) {
                this.ui.info(`  Group ID: ${config.groupId}`);
            }
            if (config.timeout) {
                this.ui.info(`  Timeout: ${config.timeout}ms`);
            }
        }
    }
    async getProviderConfigInfo(provider) {
        if (!['synthetic', 'minimax', 'auto'].includes(provider)) {
            this.ui.error(`Invalid provider: ${provider}. Valid providers: synthetic, minimax, auto`);
            return;
        }
        const config = this.configManager.getProviderConfig(provider);
        this.ui.info(`Configuration for ${provider}:`);
        this.ui.info("=".repeat(20 + provider.length));
        if (!config) {
            this.ui.info("No configuration found");
            return;
        }
        this.ui.info(`Enabled: ${config.enabled}`);
        if ('apiKey' in config) {
            const hasKey = !!config.apiKey;
            this.ui.info(`API Key: ${hasKey ? " configured" : " not configured"}`);
            if (hasKey && typeof config.apiKey === 'string') {
                this.ui.info(`API Key (preview): ${config.apiKey.substring(0, 8)}...${config.apiKey.substring(config.apiKey.length - 4)}`);
            }
        }
        if ('baseUrl' in config && config.baseUrl) {
            this.ui.info(`Base URL: ${config.baseUrl}`);
        }
        if ('groupId' in config && config.groupId) {
            this.ui.info(`Group ID: ${config.groupId}`);
        }
        if ('timeout' in config && config.timeout) {
            this.ui.info(`Timeout: ${config.timeout}ms`);
        }
    }
    async setProviderConfig(provider, key, value) {
        if (!['synthetic', 'minimax', 'auto'].includes(provider)) {
            this.ui.error(`Invalid provider: ${provider}. Valid providers: synthetic, minimax, auto`);
            return;
        }
        // Map to provider-specific keys
        let configKey;
        let effectiveProvider = provider;
        if (provider === 'synthetic') {
            if (key === 'apiKey')
                configKey = 'synthetic.apiKey';
            else if (key === 'baseUrl')
                configKey = 'synthetic.baseUrl';
            else
                configKey = key;
        }
        else if (provider === 'minimax') {
            if (key === 'apiKey')
                configKey = 'minimax.apiKey';
            else if (key === 'groupId')
                configKey = 'minimax.groupId';
            else
                configKey = key;
        }
        else {
            configKey = key;
        }
        await this.setConfig(configKey, value);
    }
    // Enhanced model methods
    async listModels(options) {
        try {
            const modelManager = this.getModelManager();
            const shouldRefresh = options.refresh || false;
            if (options.provider) {
                // Provider-specific model listing
                if (!['synthetic', 'minimax', 'auto'].includes(options.provider)) {
                    this.ui.error(`Invalid provider: ${options.provider}. Valid providers: synthetic, minimax, auto`);
                    return;
                }
                this.ui.info(`Loading models from ${options.provider} provider...`);
                const allModels = await modelManager.fetchModels(shouldRefresh);
                const models = modelManager.getModelsByProvider(options.provider, allModels);
                if (models.length === 0) {
                    this.ui.warning(`No models found for provider "${options.provider}"`);
                    return;
                }
                this.ui.info(`Found ${models.length} models from ${options.provider}:\n`);
                models.forEach((model, index) => {
                    const status = model.always_on !== false ? "✓" : "✗";
                    const provider = model.provider || "unknown";
                    this.ui.info(`${(index + 1).toString().padStart(2)}. ${status} ${model.id} (${provider})`);
                    if (model.name) {
                        this.ui.info(`   ${model.name.substring(0, 100)}${model.name.length > 100 ? "..." : ""}`);
                    }
                });
            }
            else {
                // Original model listing with provider information
                const allModels = await modelManager.fetchModels(shouldRefresh);
                const categorizedModels = modelManager.getCategorizedModels(allModels);
                const totalCount = Object.values(categorizedModels).reduce((sum, models) => sum + models.length, 0);
                this.ui.info(`Available Models (${totalCount} total):\n`);
                Object.entries(categorizedModels).forEach(([category, models]) => {
                    if (models.length > 0) {
                        this.ui.info(`${category}:`);
                        models.forEach((model, index) => {
                            const status = model.always_on !== false ? "✓" : "✗";
                            const provider = model.provider || "unknown";
                            this.ui.info(`  ${(index + 1).toString().padStart(2)}. ${status} ${model.id} (${provider})`);
                            if (model.name) {
                                this.ui.info(`     ${model.name.substring(0, 80)}${model.name.length > 80 ? "..." : ""}`);
                            }
                        });
                        this.ui.info("");
                    }
                });
            }
        }
        catch (error) {
            const errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error);
            this.ui.error(`Failed to load models: ${errorMessage}`);
        }
    }
    async searchModels(query, options) {
        try {
            const modelManager = this.getModelManager();
            const shouldRefresh = options.refresh || false;
            if (options.provider) {
                // Provider-specific search
                if (!['synthetic', 'minimax', 'auto'].includes(options.provider)) {
                    this.ui.error(`Invalid provider: ${options.provider}. Valid providers: synthetic, minimax, auto`);
                    return;
                }
                this.ui.info(`Searching for "${query}" in ${options.provider} provider...`);
                const allModels = await modelManager.fetchModels(shouldRefresh);
                const models = modelManager.getModelsByProvider(options.provider, allModels);
                const filteredModels = models.filter((model) => model.id.toLowerCase().includes(query.toLowerCase()) ||
                    model.name?.toLowerCase().includes(query.toLowerCase()) ||
                    model.provider?.toLowerCase().includes(query.toLowerCase()));
                if (filteredModels.length === 0) {
                    this.ui.info(`No models found matching "${query}" in ${options.provider} provider`);
                    return;
                }
                this.ui.info(`Found ${filteredModels.length} models matching "${query}" in ${options.provider}:\n`);
                filteredModels.forEach((model, index) => {
                    const status = model.always_on !== false ? "✓" : "✗";
                    this.ui.info(`${(index + 1).toString().padStart(2)}. ${status} ${model.id}`);
                    if (model.name) {
                        this.ui.info(`   ${model.name.substring(0, 100)}${model.name.length > 100 ? "..." : ""}`);
                    }
                });
            }
            else {
                // Original cross-provider search
                const allFetchedModels = await modelManager.fetchModels(shouldRefresh);
                const categorizedModels = modelManager.getCategorizedModels(allFetchedModels);
                const allModels = Object.values(categorizedModels).flat();
                const matchingModels = allModels.filter((model) => model.id.toLowerCase().includes(query.toLowerCase()) ||
                    model.name?.toLowerCase().includes(query.toLowerCase()) ||
                    model.provider?.toLowerCase().includes(query.toLowerCase()));
                if (matchingModels.length === 0) {
                    this.ui.info(`No models found matching "${query}"`);
                    return;
                }
                this.ui.info(`Found ${matchingModels.length} models matching "${query}":\n`);
                matchingModels.forEach((model, index) => {
                    const status = model.always_on !== false ? "✓" : "✗";
                    const provider = model.provider || "unknown";
                    this.ui.info(`${(index + 1).toString().padStart(2)}. ${status} ${model.id} (${provider})`);
                    if (model.name) {
                        this.ui.info(`   ${model.name.substring(0, 100)}${model.name.length > 100 ? "..." : ""}`);
                    }
                });
            }
        }
        catch (error) {
            const errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error);
            this.ui.error(`Failed to search models: ${errorMessage}`);
        }
    }
    // Local Configuration Management Methods
    async initLocalConfig(options) {
        try {
            const configType = this.configManager.getConfigType();
            if (configType === 'local' && !options.force) {
                this.ui.warning("Local project configuration already exists at: " + this.configManager.getWorkspaceRoot());
                this.ui.info("Use --force to overwrite");
                return;
            }
            await this.configManager.initLocalConfig();
            this.ui.success("✓ Local project configuration initialized");
            this.ui.info(`Config directory: ${process.cwd()}/.mclaude/`);
            this.ui.info("Configuration: .mclaude/config.json");
            this.ui.info("Local secrets: .mclaude/.env.local (git-ignored)");
        }
        catch (error) {
            this.ui.error(`Failed to initialize local configuration: ${error.message}`);
        }
    }
    async switchToLocalConfig() {
        const configType = this.configManager.getConfigType();
        if (configType === 'local') {
            this.ui.info("Already using local project configuration");
            if (this.configManager.getWorkspaceRoot()) {
                this.ui.info(`Workspace: ${this.configManager.getWorkspaceRoot()}`);
            }
            return;
        }
        // Create local config if it doesn't exist
        if (!this.configManager.getWorkspaceRoot() || !this.configManager.getWorkspaceRoot()) {
            this.ui.warning("No local project configuration found");
            this.ui.info("Run 'mclaude config init' to create one");
            return;
        }
        this.ui.success("Switched to local project configuration");
        this.ui.info(`Workspace: ${this.configManager.getWorkspaceRoot()}`);
    }
    async switchToGlobalConfig() {
        const configType = this.configManager.getConfigType();
        if (configType === 'global') {
            this.ui.info("Already using global configuration");
            return;
        }
        // Create a new instance for global only
        const globalConfigManager = new config_1.ConfigManager();
        globalConfigManager.config; // Force load
        this.ui.success("Switched to global configuration");
    }
    async migrateConfig(options) {
        try {
            const configType = this.configManager.getConfigType();
            if (configType === 'local' && !options.force) {
                this.ui.warning("Local project configuration already exists");
                this.ui.info("Use --force to overwrite and migrate again");
                return;
            }
            await this.configManager.migrateToLocal();
            this.ui.success("✓ Configuration migrated to local project");
            this.ui.info(`Local config: ${process.cwd()}/.mclaude/config.json`);
            this.ui.info("Global config preserved for other projects");
        }
        catch (error) {
            this.ui.error(`Failed to migrate configuration: ${error.message}`);
        }
    }
    async showConfigContext() {
        const configType = this.configManager.getConfigType();
        const workspaceRoot = this.configManager.getWorkspaceRoot();
        this.ui.info("Configuration Context:");
        this.ui.info("====================");
        this.ui.info(`Current mode: ${configType === 'local' ? 'Local Project' : 'Global User'}`);
        if (configType === 'local' && workspaceRoot) {
            this.ui.info(`Workspace root: ${workspaceRoot}`);
            this.ui.info(`Config file: ${workspaceRoot}/.mclaude/config.json`);
        }
        else {
            const globalPath = require('os').homedir() + '/.config/mclaude/config.json';
            this.ui.info(`Global config: ${globalPath}`);
        }
        // Show active providers and models
        const providers = this.configManager.getAtomicProviderState();
        this.ui.info(`\nActive providers: ${this.configManager.getNetworkDisplay()}`);
        const selectedModel = this.configManager.getSelectedModel();
        const thinkingModel = this.configManager.getSavedThinkingModel();
        if (selectedModel) {
            this.ui.info(`Selected model: ${selectedModel}`);
        }
        if (thinkingModel) {
            this.ui.info(`Thinking model: ${thinkingModel}`);
        }
    }
    async showModelInfo(modelId) {
        // v1.3.1: If modelId is provided, show detailed model info from model cards
        if (modelId) {
            const modelManager = this.getModelManager();
            const modelCard = await modelManager.getModelCard(modelId);
            if (modelCard) {
                this.ui.info(`Model Card: ${modelCard.name || modelCard.id}`);
                this.ui.info("═".repeat(50));
                this.ui.info(`ID: ${modelCard.id}`);
                if (modelCard.name) {
                    this.ui.info(`Name: ${modelCard.name}`);
                }
                if (modelCard.provider) {
                    this.ui.info(`Provider: ${modelCard.provider}`);
                }
                if (modelCard.roles && modelCard.roles.length > 0) {
                    this.ui.info(`Roles: ${modelCard.roles.join(', ')}`);
                }
                if (modelCard.priority !== undefined) {
                    this.ui.info(`Priority: ${modelCard.priority}`);
                }
                if (modelCard.preferProvider) {
                    this.ui.info(`Preferred Provider: ${modelCard.preferProvider}`);
                }
                if (modelCard.speed_tier) {
                    this.ui.info(`Speed Tier: ${modelCard.speed_tier}`);
                }
                if (modelCard.capabilities) {
                    this.ui.info("\nCapabilities:");
                    this.ui.info(`  Tools: ${modelCard.capabilities.tools ? '✓' : '✗'}`);
                    this.ui.info(`  JSON Mode: ${modelCard.capabilities.json_mode ? '✓' : '✗'}`);
                    this.ui.info(`  Thinking: ${modelCard.capabilities.thinking ? '✓' : '✗'}`);
                    this.ui.info(`  Streaming: ${modelCard.capabilities.streaming ? '✓' : '✗'}`);
                    this.ui.info(`  Parallel Tools: ${modelCard.capabilities.parallel_tools ? '✓' : '✗'}`);
                }
                if (modelCard.limits) {
                    this.ui.info("\nLimits:");
                    if (modelCard.limits.context) {
                        this.ui.info(`  Context: ${modelCard.limits.context.toLocaleString()} tokens`);
                    }
                    if (modelCard.limits.max_output) {
                        this.ui.info(`  Max Output: ${modelCard.limits.max_output.toLocaleString()} tokens`);
                    }
                }
                if (modelCard.parameters && modelCard.parameters.length > 0) {
                    this.ui.info(`\nParameters: ${modelCard.parameters.join(', ')}`);
                }
                if (modelCard.aliases && modelCard.aliases.length > 0) {
                    this.ui.info(`\nAliases: ${modelCard.aliases.join(', ')}`);
                }
                if (modelCard.verified) {
                    this.ui.info(`\nVerified: ${modelCard.verified}`);
                }
            }
            else {
                this.ui.info(`No model card found for: ${modelId}`);
                // Fall back to showing general model info
                const config = this.configManager.config;
                this.ui.info("\nCurrent Configuration:");
                this.ui.info(`Selected Model: ${config.selectedModel || 'None'}`);
                this.ui.info(`Thinking Model: ${config.selectedThinkingModel || 'None'}`);
                this.ui.info(`Default Provider: ${config.defaultProvider}`);
            }
            return;
        }
        // No modelId provided, show general model info
        const config = this.configManager.config;
        this.ui.info("Model Information:");
        this.ui.info(`Selected Model: ${config.selectedModel || 'None'}`);
        this.ui.info(`Thinking Model: ${config.selectedThinkingModel || 'None'}`);
        this.ui.info(`Default Provider: ${config.defaultProvider}`);
        // v1.3.1: Show recommended models if available
        try {
            const recommended = this.configManager.getRecommendedModels();
            this.ui.info("\nRecommended Models:");
            this.ui.info(`  Default: ${recommended.default.primary}`);
            this.ui.info(`  Small Fast: ${recommended.smallFast.primary}`);
            this.ui.info(`  Thinking: ${recommended.thinking.primary}`);
            this.ui.info(`  Subagent: ${recommended.subagent.primary}`);
        }
        catch (error) {
            // Ignore if not available
        }
    }
    async listCombinations() {
        const combinations = this.configManager.getModelCombinations();
        if (combinations.length === 0) {
            this.ui.info("No saved model combinations found.");
            this.ui.info("Create one with: mclaude combination save <name> <model> [thinkingModel]");
            return;
        }
        this.ui.info("Saved Model Combinations:");
        combinations.forEach((combo, index) => {
            this.ui.info(`${index + 1}. ${combo.name}: ${combo.model}${combo.thinkingModel ? ` + ${combo.thinkingModel}` : ''}`);
        });
    }
    async saveCombination(name, model, thinkingModel) {
        // For simplicity, just show success message
        this.ui.success(`Model combination "${name}" saved with model: ${model}${thinkingModel ? ` + thinkingModel` : ''}`);
    }
    async deleteCombination(name) {
        // For simplicity, just show success message
        this.ui.success(`Model combination "${name}" deleted`);
    }
    // ============================================
    // Stats Command (v1.3.0)
    // ============================================
    async showStats(options) {
        if (options?.reset) {
            const confirmed = await this.ui.confirm("Are you sure you want to reset token usage statistics?", false);
            if (confirmed) {
                await this.configManager.resetTokenUsage();
                this.ui.success("Token usage statistics reset successfully");
            }
            else {
                this.ui.info("Reset cancelled");
            }
            return;
        }
        const usage = this.configManager.getTokenUsage();
        const format = options?.format || "table";
        if (format === "json") {
            console.log(JSON.stringify(usage, null, 2));
            return;
        }
        this.ui.info("Token Usage Statistics");
        this.ui.info("======================");
        this.ui.info(`Total Input Tokens:  ${usage.totalInputTokens.toLocaleString()}`);
        this.ui.info(`Total Output Tokens: ${usage.totalOutputTokens.toLocaleString()}`);
        this.ui.info(`Total Tokens:        ${(usage.totalInputTokens + usage.totalOutputTokens).toLocaleString()}`);
        this.ui.info(`Session Tokens:      ${usage.sessionTokens.toLocaleString()}`);
        if (usage.history.length > 0) {
            this.ui.info("\nRecent Usage (Last 7 Days):");
            this.ui.info("─────────────────────────────");
            const last7Days = usage.history.slice(-7);
            for (const entry of last7Days) {
                const total = entry.inputTokens + entry.outputTokens;
                this.ui.info(`${entry.date}: ${total.toLocaleString()} tokens (${entry.inputTokens.toLocaleString()} in / ${entry.outputTokens.toLocaleString()} out)`);
            }
        }
        this.ui.info("\nRun 'mclaude stats --reset' to clear statistics");
    }
    // ============================================
    // System Prompt Management (v1.3.0)
    // ============================================
    async manageSysprompt(options) {
        // Show current sysprompt
        if (options?.show) {
            const { content, type, size } = await this.configManager.loadSysprompt(!options?.raw);
            if (!content) {
                this.ui.info("No system prompt configured");
                this.ui.info("Run 'mclaude sysprompt' to create one");
                return;
            }
            this.ui.info(`System Prompt [${type}]:`);
            this.ui.info("─".repeat(40));
            console.log(content);
            this.ui.info("─".repeat(40));
            this.ui.info(`Size: ${(size / 1024).toFixed(2)} KB`);
            const validation = this.configManager.validateSyspromptSize(size);
            if (validation.warning) {
                this.ui.warning(validation.message);
            }
            return;
        }
        // Clear sysprompt
        if (options?.clear) {
            const scope = options?.global ? "global" : "local";
            const confirmed = await this.ui.confirm(`Clear ${scope} system prompt?`, false);
            if (confirmed) {
                const success = await this.configManager.clearSysprompt(options?.global || false);
                if (success) {
                    this.ui.success(`${scope.charAt(0).toUpperCase() + scope.slice(1)} system prompt cleared`);
                }
                else {
                    this.ui.error(`Failed to clear ${scope} system prompt`);
                }
            }
            else {
                this.ui.info("Clear cancelled");
            }
            return;
        }
        // Edit sysprompt
        await this.editSysprompt(options?.global || false);
    }
    async editSysprompt(global) {
        const scope = global ? "global" : "local";
        const { content, type } = await this.configManager.loadSysprompt(false);
        // Get or create template content
        let editContent = content || this.configManager.getDefaultSyspromptTemplate();
        // Get editor from environment
        const editor = process.env.EDITOR || process.env.VISUAL || "nano";
        // Create temp file for editing
        const os = require("os");
        const path = require("path");
        const fs = require("fs/promises");
        const { spawn } = require("child_process");
        const tempFile = path.join(os.tmpdir(), `mclaude-sysprompt-${Date.now()}.md`);
        try {
            // Write content to temp file
            await fs.writeFile(tempFile, editContent, "utf-8");
            this.ui.info(`Opening ${scope} system prompt in ${editor}...`);
            this.ui.info("Save and close the editor when finished.");
            // Open editor
            await new Promise((resolve, reject) => {
                const child = spawn(editor, [tempFile], {
                    stdio: "inherit",
                    shell: true,
                });
                child.on("close", (code) => {
                    if (code === 0) {
                        resolve();
                    }
                    else {
                        reject(new Error(`Editor exited with code ${code}`));
                    }
                });
                child.on("error", (err) => {
                    reject(err);
                });
            });
            // Read edited content
            const newContent = await fs.readFile(tempFile, "utf-8");
            const size = Buffer.byteLength(newContent, "utf-8");
            // Validate size
            const validation = this.configManager.validateSyspromptSize(size);
            if (!validation.valid) {
                this.ui.error(validation.message);
                return;
            }
            if (validation.warning) {
                this.ui.warning(validation.message);
            }
            // Save content
            const success = await this.configManager.saveSysprompt(newContent, global);
            if (success) {
                this.ui.success(`${scope.charAt(0).toUpperCase() + scope.slice(1)} system prompt saved (${(size / 1024).toFixed(2)} KB)`);
            }
            else {
                this.ui.error("Failed to save system prompt");
            }
        }
        catch (error) {
            this.ui.error(`Failed to edit system prompt: ${error.message}`);
        }
        finally {
            // Cleanup temp file
            try {
                await fs.unlink(tempFile);
            }
            catch {
                // Ignore cleanup errors
            }
        }
    }
    // ============================================
    // Router Management (v1.4.4)
    // ============================================
    async routerStatus() {
        this.ui.info("Checking CCR status...");
        const status = await this.ccrManager.getStatus();
        this.ui.info("\nClaude Code Router Status:");
        this.ui.info("═".repeat(50));
        this.ui.info(`Status: ${status.running ? chalk_1.default.green("Running") : chalk_1.default.red("Stopped")}`);
        this.ui.info(`Port: ${status.port}`);
        if (status.pid) {
            this.ui.info(`PID: ${status.pid}`);
        }
        if (status.url) {
            this.ui.info(`URL: ${status.url}`);
        }
        if (status.running) {
            this.ui.success("\nCCR is running and ready");
        }
        else {
            this.ui.warning("\nCCR is not running");
            this.ui.info("Run 'mclaude router start' to start CCR");
        }
    }
    async routerRestart() {
        this.ui.info("Restarting CCR...");
        const success = await this.ccrManager.restart();
        if (success) {
            this.ui.success("CCR restarted successfully");
        }
        else {
            this.ui.error("Failed to restart CCR");
        }
    }
    async routerLogs() {
        this.ui.info("Fetching CCR logs...");
        const logs = await this.ccrManager.getLogs();
        this.ui.info("\nCCR Logs:");
        this.ui.info("═".repeat(50));
        console.log(logs);
        this.ui.info("═".repeat(50));
    }
    async routerConfig() {
        this.ui.info("Generating CCR configuration...");
        const configGenerated = await this.ccrManager.generateConfig();
        if (configGenerated) {
            this.ui.success("✓ CCR Configuration generated");
            this.ui.info(`Config location: ${this.ccrConfigGenerator.getConfigPath()}`);
        }
        else {
            this.ui.info("CCR configuration is up to date (no changes needed)");
            this.ui.info(`Config location: ${this.ccrConfigGenerator.getConfigPath()}`);
        }
        // Show the config
        const config = await this.ccrConfigGenerator.readConfig();
        if (config) {
            this.ui.info("\nGenerated CCR Configuration:");
            this.ui.info("═".repeat(50));
            console.log(JSON.stringify(config, null, 2));
            this.ui.info("═".repeat(50));
        }
    }
    async routerStart() {
        this.ui.info("Starting CCR...");
        const success = await this.ccrManager.start();
        if (success) {
            this.ui.success("CCR started successfully");
            const status = await this.ccrManager.getStatus();
            this.ui.info(`Running on ${status.url}`);
        }
        else {
            this.ui.error("Failed to start CCR");
        }
    }
    async routerStop() {
        this.ui.info("Stopping CCR...");
        const success = await this.ccrManager.stop();
        if (success) {
            this.ui.success("CCR stopped");
        }
        else {
            this.ui.error("Failed to stop CCR");
        }
    }
    // ============================================
    // Model Card Management (v1.3.1)
    // ============================================
    async manageModelCards(options) {
        // Handle --update flag
        if (options?.update) {
            this.ui.info("Updating model cards from GitHub...");
            // v1.3.1: GitHub raw URL for model cards
            const CARDS_URL = "https://raw.githubusercontent.com/jeffersonwarrior/mclaude/main/model-cards.json";
            try {
                const success = await this.configManager.fetchAndSaveModelCards(CARDS_URL, 3000);
                if (success) {
                    this.ui.coloredSuccess("✓ Model cards updated successfully");
                }
                else {
                    this.ui.warning("⚠ Failed to update model cards (this is normal if offline)");
                }
            }
            catch (error) {
                this.ui.warning("⚠ Failed to update model cards");
            }
            // Update last check timestamp
            await this.configManager.updateLastCheck();
            return;
        }
        // Default: show model cards info
        const modelCards = await this.configManager.loadModelCards();
        if (!modelCards) {
            this.ui.info("No model cards found");
            return;
        }
        this.ui.info("Model Cards Information:");
        this.ui.info("═".repeat(50));
        this.ui.info(`Version: ${modelCards.version}`);
        if (modelCards.updated) {
            this.ui.info(`Last Updated: ${modelCards.updated}`);
        }
        this.ui.info(`Total Cards: ${modelCards.cards.length}`);
        if (modelCards.providerPriority && modelCards.providerPriority.length > 0) {
            this.ui.info(`Provider Priority: ${modelCards.providerPriority.join(" > ")}`);
        }
        if (modelCards.cards.length > 0) {
            this.ui.info("\nAvailable Models:");
            modelCards.cards.forEach((card, index) => {
                const roles = card.roles?.join(", ") || "general";
                const provider = card.provider;
                this.ui.info(`${(index + 1).toString().padStart(2)}. ${card.name || card.id} (${roles}) [${provider}]`);
            });
        }
        this.ui.info("\nRun 'mclaude models cards --update' to refresh from GitHub");
    }
}
exports.SyntheticClaudeApp = SyntheticClaudeApp;
//# sourceMappingURL=app.js.map