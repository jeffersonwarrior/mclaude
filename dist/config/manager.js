"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const os_1 = require("os");
const fs_1 = require("fs");
const types_1 = require("./types");
const env_1 = require("./env");
class ConfigManager {
    globalConfigDir;
    globalConfigPath;
    localProjectDir;
    localConfigPath;
    _config = null;
    _configHierarchy = null;
    workspaceRoot = null;
    constructor(configDir) {
        this.globalConfigDir = configDir || (0, path_1.join)((0, os_1.homedir)(), ".config", "mclaude");
        this.globalConfigPath = (0, path_1.join)(this.globalConfigDir, "config.json");
        this.localProjectDir = this.findLocalProjectConfig();
        this.localConfigPath = this.localProjectDir ? (0, path_1.join)(this.localProjectDir, "config.json") : "";
    }
    /**
     * Find the local project config directory by walking up from current directory
     * Returns null if no .mclaude directory is found
     */
    findLocalProjectConfig() {
        const cwd = process.cwd();
        let currentDir = cwd;
        while (currentDir !== '/') {
            const mclaudeDir = (0, path_1.join)(currentDir, '.mclaude');
            if ((0, fs_1.existsSync)(mclaudeDir)) {
                this.workspaceRoot = currentDir;
                return mclaudeDir;
            }
            currentDir = (0, path_1.join)(currentDir, '..');
        }
        return null;
    }
    /**
     * Get the type of config currently being used
     */
    getConfigType() {
        return !!this._configHierarchy?.localProjectConfig ? 'local' : 'global';
    }
    /**
     * Get the workspace root if local config is available
     */
    getWorkspaceRoot() {
        return this.workspaceRoot;
    }
    /**
     * Initialize a local project configuration
     */
    async initLocalConfig() {
        if (this.localProjectDir) {
            throw new types_1.ConfigLoadError("Local project config already exists at " + this.localProjectDir);
        }
        const cwd = process.cwd();
        const projectDir = (0, path_1.join)(cwd, '.mclaude');
        try {
            await (0, promises_1.mkdir)(projectDir, { recursive: true });
            // Start with defaults
            const defaultConfig = types_1.AppConfigSchema.parse({
                configVersion: 2,
                providers: {
                    synthetic: { enabled: true },
                    minimax: { enabled: true }
                }
            });
            const configPath = (0, path_1.join)(projectDir, 'config.json');
            await (0, promises_1.writeFile)(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
            await (0, promises_1.chmod)(configPath, 0o644); // More permissive for repo sharing
            // Create .env.local template (git-ignored)
            const envLocalPath = (0, path_1.join)(projectDir, '.env.local');
            const envTemplate = `# Local environment overrides (do not commit to git)
# SYNTHETIC_API_KEY=
# MINIMAX_API_KEY=
# MINIMAX_GROUP_ID=
`;
            await (0, promises_1.writeFile)(envLocalPath, envTemplate, 'utf-8');
            await (0, promises_1.chmod)(envLocalPath, 0o600); // Restrictive for security
            // Create .gitignore template for .mclaude directory
            const gitignorePath = (0, path_1.join)(projectDir, '.gitignore');
            const gitignoreTemplate = `.env.local
# Local secrets
# Template - uncomment if you want to add secrets to git ignore
# Add other sensitive files here
`;
            await (0, promises_1.writeFile)(gitignorePath, gitignoreTemplate, 'utf-8');
            await (0, promises_1.chmod)(gitignorePath, 0o644);
            // Reset cached config to reload with new local config
            this._config = null;
            this._configHierarchy = null;
            this.localProjectDir = projectDir;
            this.localConfigPath = configPath;
            this.workspaceRoot = cwd;
            return true;
        }
        catch (error) {
            throw new types_1.ConfigSaveError(`Failed to initialize local config at ${projectDir}`, error);
        }
    }
    /**
     * Migrate global config to local project config
     */
    async migrateToLocal() {
        if (this.localProjectDir) {
            throw new types_1.ConfigLoadError("Local config already exists at " + this.localProjectDir);
        }
        const globalConfig = this.loadGlobalConfig();
        if (!globalConfig) {
            throw new types_1.ConfigLoadError("No global configuration to migrate");
        }
        // Create local config
        await this.initLocalConfig();
        // Copy global config to local
        await this.saveLocalConfig(globalConfig);
        return true;
    }
    /**
     * Save configuration to local config file
     */
    async saveLocalConfig(config) {
        if (!this.localProjectDir) {
            throw new types_1.ConfigLoadError("No local project configuration directory found");
        }
        try {
            const configJson = JSON.stringify(config, null, 2);
            await (0, promises_1.writeFile)(this.localConfigPath, configJson, 'utf-8');
            await (0, promises_1.chmod)(this.localConfigPath, 0o644); // More permissive for repo sharing
            // Reset cached config
            this._config = null;
            this._configHierarchy = null;
            return true;
        }
        catch (error) {
            throw new types_1.ConfigSaveError(`Failed to save local config to ${this.localConfigPath}`, error);
        }
    }
    get config() {
        if (this._config === null) {
            this._configHierarchy = this.loadConfigHierarchy();
            this._config = this.mergeConfigHierarchy(this._configHierarchy);
        }
        // Apply environment variable overrides every time config is accessed
        // This ensures tests can modify environment variables and see the changes
        this._config = this.applyEnvironmentOverrides(this._config);
        return this._config;
    }
    /**
     * Load the complete configuration hierarchy
     */
    loadConfigHierarchy() {
        const hierarchy = {};
        // 1. Local Project: .mclaude/config.json
        if (this.localProjectDir && (0, fs_1.existsSync)(this.localConfigPath)) {
            hierarchy.localProjectConfig = this.loadConfigFile(this.localConfigPath);
        }
        // 2. Local Project: .env (current directory)
        hierarchy.LocalProjectEnv = this.loadLocalEnvConfig();
        // 3. Global User: ~/.config/mclaude/config.json
        hierarchy.globalUserConfig = this.loadGlobalConfig();
        // 4. System Environment is handled in applyEnvironmentOverrides
        return hierarchy;
    }
    /**
     * Load configuration from a specific file path
     */
    loadConfigFile(filePath) {
        try {
            const fs = require("fs");
            // Check if file exists before trying to read it
            if (!fs.existsSync(filePath)) {
                return null;
            }
            const rawConfigData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            // Check if this is a legacy configuration
            if (!rawConfigData.configVersion || rawConfigData.configVersion < 2) {
                return this.migrateLegacyConfig(rawConfigData);
            }
            const result = types_1.AppConfigSchema.safeParse(rawConfigData);
            if (!result.success) {
                console.warn(`Configuration validation failed for ${filePath}:`, result.error.message);
                return null;
            }
            return result.data;
        }
        catch (error) {
            console.warn(`Failed to load configuration from ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Load configuration from local .env file
     */
    loadLocalEnvConfig() {
        // Implementation would parse .env files and convert to AppConfig format
        // For now, this is handled by applyEnvironmentOverrides from system environment
        return null;
    }
    /**
     * Load global configuration
     */
    loadGlobalConfig() {
        return this.loadConfigFile(this.globalConfigPath);
    }
    /**
     * Merge configuration hierarchy with proper priority
     * Priority: Local Project > Local .env > Global > Defaults
     */
    mergeConfigHierarchy(hierarchy) {
        const defaultConfig = types_1.AppConfigSchema.parse({
            configVersion: 2,
            providers: {
                synthetic: { enabled: true },
                minimax: { enabled: true }
            }
        });
        // Deep merge with priority order
        let merged = { ...defaultConfig };
        // Apply global config first
        if (hierarchy.globalUserConfig) {
            merged = this.deepMerge(merged, hierarchy.globalUserConfig);
        }
        // Apply local project config (higher priority)
        if (hierarchy.localProjectConfig) {
            merged = this.deepMerge(merged, hierarchy.localProjectConfig);
        }
        // Apply local env config (highest priority)
        if (hierarchy.LocalProjectEnv) {
            merged = this.deepMerge(merged, hierarchy.LocalProjectEnv);
        }
        return merged;
    }
    /**
     * Deep merge two objects
     */
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            const sourceValue = source[key];
            const targetValue = result[key];
            if (sourceValue !== undefined) {
                if (typeof sourceValue === "object" &&
                    sourceValue !== null &&
                    !Array.isArray(sourceValue) &&
                    typeof targetValue === "object" &&
                    targetValue !== null &&
                    !Array.isArray(targetValue)) {
                    result[key] = this.deepMerge(targetValue, sourceValue);
                }
                else {
                    result[key] = sourceValue;
                }
            }
        }
        return result;
    }
    applyEnvironmentOverrides(config) {
        // Get fresh environment variables
        const envVars = env_1.envManager.getEnvironmentVariables();
        const updatedConfig = { ...config };
        // Apply environment variable overrides
        if (envVars.SYNTHETIC_API_KEY) {
            if (!updatedConfig.envOverrides.synthetic) {
                updatedConfig.envOverrides.synthetic = {};
            }
            updatedConfig.envOverrides.synthetic.apiKey = envVars.SYNTHETIC_API_KEY;
        }
        if (envVars.MINIMAX_API_KEY) {
            if (!updatedConfig.envOverrides.minimax) {
                updatedConfig.envOverrides.minimax = {};
            }
            updatedConfig.envOverrides.minimax.apiKey = envVars.MINIMAX_API_KEY;
        }
        return updatedConfig;
    }
    async ensureConfigDir() {
        try {
            await (0, promises_1.mkdir)(this.globalConfigDir, { recursive: true });
        }
        catch (error) {
            throw new types_1.ConfigSaveError(`Failed to create config directory: ${this.globalConfigDir}`, error);
        }
    }
    loadConfig() {
        try {
            // Use fs.readFileSync instead of require to avoid module loading errors
            const fs = require("fs");
            if (!fs.existsSync(this.globalConfigPath)) {
                // Config file doesn't exist, return defaults
                const defaultConfig = types_1.AppConfigSchema.parse({});
                return defaultConfig;
            }
            const rawConfigData = JSON.parse(fs.readFileSync(this.globalConfigPath, "utf-8"));
            // Check if this is a legacy configuration (no configVersion or version < 2)
            if (!rawConfigData.configVersion || rawConfigData.configVersion < 2) {
                return this.migrateLegacyConfig(rawConfigData);
            }
            // New multi-provider configuration
            const result = types_1.AppConfigSchema.safeParse(rawConfigData);
            if (!result.success) {
                console.warn("Configuration validation failed, attempting recovery:", result.error.message);
                // Try to preserve firstRunCompleted flag even if other config is invalid
                const preservedConfig = {
                    firstRunCompleted: rawConfigData.firstRunCompleted || false,
                    configVersion: 2, // Ensure version is set
                };
                const fallbackResult = types_1.AppConfigSchema.safeParse(preservedConfig);
                if (fallbackResult.success) {
                    return fallbackResult.data;
                }
                return types_1.AppConfigSchema.parse({ configVersion: 2 });
            }
            return result.data;
        }
        catch (error) {
            console.warn("Failed to load configuration, using defaults:", error);
            // Try to recover firstRunCompleted from partial config data
            const fs = require("fs");
            if (fs.existsSync(this.globalConfigPath)) {
                try {
                    const partialConfig = JSON.parse(fs.readFileSync(this.globalConfigPath, "utf-8"));
                    if (partialConfig.firstRunCompleted === true) {
                        return types_1.AppConfigSchema.parse({
                            firstRunCompleted: true,
                            configVersion: 2,
                        });
                    }
                }
                catch {
                    // Recovery failed, use defaults
                }
            }
            return types_1.AppConfigSchema.parse({ configVersion: 2 });
        }
    }
    migrateLegacyConfig(legacyConfig) {
        // Try to parse as legacy config first
        const legacyResult = types_1.LegacyAppConfigSchema.safeParse(legacyConfig);
        if (legacyResult.success) {
            const migratedConfig = {
                providers: {
                    synthetic: {
                        apiKey: legacyResult.data.apiKey || "",
                        baseUrl: legacyResult.data.baseUrl || "https://api.synthetic.new",
                        anthropicBaseUrl: legacyResult.data.anthropicBaseUrl ||
                            "https://api.synthetic.new/anthropic",
                        modelsApiUrl: legacyResult.data.modelsApiUrl ||
                            "https://api.synthetic.new/openai/v1/models",
                        enabled: true,
                    },
                    minimax: {
                        // Try to load MiniMax from environment variables or .env file
                        apiKey: env_1.envManager.getApiKey("minimax"),
                        baseUrl: env_1.envManager.getApiUrl("minimax", "base"),
                        anthropicBaseUrl: env_1.envManager.getApiUrl("minimax", "anthropic"),
                        modelsApiUrl: env_1.envManager.getApiUrl("minimax", "openai"),
                        enabled: true,
                        defaultModel: env_1.envManager.getDefaultModel("minimax"),
                    },
                },
                defaultProvider: "synthetic", // Preserve existing behavior
                cacheDurationHours: legacyConfig.cacheDurationHours || 24,
                selectedModel: legacyConfig.selectedModel || "",
                selectedThinkingModel: legacyConfig.selectedThinkingModel || "",
                firstRunCompleted: legacyConfig.firstRunCompleted || false,
                envOverrides: {},
                configVersion: 2,
            };
            return migratedConfig;
        }
        // Fallback to defaults but preserve what we can
        return types_1.AppConfigSchema.parse({
            selectedModel: legacyConfig.selectedModel || "",
            selectedThinkingModel: legacyConfig.selectedThinkingModel || "",
            firstRunCompleted: legacyConfig.firstRunCompleted || false,
            configVersion: 2,
        });
    }
    async saveConfig(config) {
        const configToSave = config || this._config;
        if (!configToSave) {
            throw new types_1.ConfigSaveError("No configuration to save");
        }
        // Save to local config if available, otherwise use global
        if (this.localProjectDir) {
            return await this.saveLocalConfig(configToSave);
        }
        else {
            return await this.saveGlobalConfig(configToSave);
        }
    }
    /**
     * Save configuration to global config file
     */
    async saveGlobalConfig(config) {
        try {
            await this.ensureConfigDir();
            // Create backup of existing config
            try {
                const fs = require("fs/promises");
                const fsSync = require("fs");
                if (fsSync.existsSync(this.globalConfigPath)) {
                    const backupPath = `${this.globalConfigPath}.backup`;
                    const existingData = await (0, promises_1.readFile)(this.globalConfigPath, "utf-8");
                    await (0, promises_1.writeFile)(backupPath, existingData, "utf-8");
                }
            }
            catch (backupError) {
                // Backup failed, but continue with saving
                console.warn("Failed to create global config backup:", backupError);
            }
            // Write new configuration
            const configJson = JSON.stringify(config, null, 2);
            await (0, promises_1.writeFile)(this.globalConfigPath, configJson, "utf-8");
            // Set secure permissions
            try {
                await (0, promises_1.chmod)(this.globalConfigPath, 0o600);
            }
            catch (chmodError) {
                console.warn("Failed to set secure permissions on global config file:", chmodError);
            }
            this._config = config;
            this._configHierarchy = null; // Reset hierarchy
            return true;
        }
        catch (error) {
            throw new types_1.ConfigSaveError(`Failed to save global configuration to ${this.globalConfigPath}`, error);
        }
    }
    async updateConfig(updates) {
        try {
            const currentData = this.config;
            const updatedData = { ...currentData, ...updates };
            const result = types_1.AppConfigSchema.safeParse(updatedData);
            if (!result.success) {
                throw new types_1.ConfigValidationError(`Invalid configuration update: ${result.error.message}`);
            }
            return await this.saveConfig(result.data);
        }
        catch (error) {
            if (error instanceof types_1.ConfigValidationError ||
                error instanceof types_1.ConfigSaveError) {
                throw error;
            }
            throw new types_1.ConfigSaveError("Failed to update configuration", error);
        }
    }
    // Legacy methods for backward compatibility
    hasApiKey() {
        return this.hasSyntheticApiKey();
    }
    getApiKey() {
        return this.getSyntheticApiKey();
    }
    async setApiKey(apiKey) {
        return this.setSyntheticApiKey(apiKey);
    }
    // New provider-specific methods
    hasSyntheticApiKey() {
        const config = this.config;
        const apiKey = config.envOverrides.synthetic?.apiKey ||
            config.providers.synthetic.apiKey;
        return Boolean(apiKey);
    }
    getSyntheticApiKey() {
        const config = this.config;
        return (config.envOverrides.synthetic?.apiKey || config.providers.synthetic.apiKey);
    }
    async setSyntheticApiKey(apiKey) {
        return this.updateProviderConfig("synthetic", { apiKey });
    }
    hasMinimaxApiKey() {
        const config = this.config;
        const apiKey = config.envOverrides.minimax?.apiKey || config.providers.minimax.apiKey;
        return Boolean(apiKey);
    }
    getMinimaxApiKey() {
        const config = this.config;
        return (config.envOverrides.minimax?.apiKey || config.providers.minimax.apiKey);
    }
    async setMinimaxApiKey(apiKey) {
        return this.updateProviderConfig("minimax", { apiKey });
    }
    hasMinimaxGroupId() {
        const config = this.config;
        return Boolean(config.providers.minimax.groupId);
    }
    getMinimaxGroupId() {
        const config = this.config;
        return config.providers.minimax.groupId;
    }
    async setMinimaxGroupId(groupId) {
        return this.updateProviderConfig("minimax", { groupId });
    }
    // Provider management methods
    isProviderEnabled(provider) {
        const config = this.config;
        switch (provider) {
            case "synthetic":
                return config.providers.synthetic.enabled;
            case "minimax":
                return config.providers.minimax.enabled;
            case "auto":
                return true; // Auto is always enabled
            default:
                return false;
        }
    }
    async setProviderEnabled(provider, enabled) {
        if (provider === "auto") {
            throw new types_1.ConfigValidationError("Cannot enable/disable auto provider");
        }
        return this.updateProviderConfig(provider, { enabled });
    }
    getDefaultProvider() {
        return this.config.defaultProvider;
    }
    async setDefaultProvider(provider) {
        return this.updateConfig({ defaultProvider: provider });
    }
    getProviderConfig(provider) {
        const config = this.config;
        switch (provider) {
            case "synthetic":
                return config.providers.synthetic;
            case "minimax":
                return config.providers.minimax;
            case "auto":
                return null; // Auto doesn't have specific config
            default:
                return null;
        }
    }
    async updateProviderConfig(provider, updates) {
        try {
            const currentConfig = this.config;
            const updatedConfig = { ...currentConfig };
            if (provider === "synthetic") {
                updatedConfig.providers.synthetic = {
                    ...updatedConfig.providers.synthetic,
                    ...updates,
                };
            }
            else if (provider === "minimax") {
                updatedConfig.providers.minimax = {
                    ...updatedConfig.providers.minimax,
                    ...updates,
                };
            }
            else {
                throw new types_1.ConfigValidationError(`Cannot update config for provider: ${provider}`);
            }
            const result = types_1.AppConfigSchema.safeParse(updatedConfig);
            if (!result.success) {
                throw new types_1.ConfigValidationError(`Invalid provider configuration update: ${result.error.message}`);
            }
            return await this.saveConfig(result.data);
        }
        catch (error) {
            if (error instanceof types_1.ConfigValidationError ||
                error instanceof types_1.ConfigSaveError) {
                throw error;
            }
            throw new types_1.ConfigSaveError("Failed to update provider configuration", error);
        }
    }
    // Get effective API keys (environment overrides take precedence)
    getEffectiveApiKey(provider) {
        const config = this.config;
        switch (provider) {
            case "synthetic":
                return (config.envOverrides.synthetic?.apiKey ||
                    config.providers.synthetic.apiKey);
            case "minimax":
                return (config.envOverrides.minimax?.apiKey || config.providers.minimax.apiKey);
            case "auto":
                return ""; // Auto doesn't have a specific API key
            default:
                return "";
        }
    }
    /**
     * Get atomic provider state to ensure consistency across calls
     * This prevents race conditions where different parts of the code see different provider states
     */
    getAtomicProviderState() {
        // Get a single, consistent snapshot of the configuration
        const config = this.config;
        return {
            synthetic: {
                enabled: config.providers.synthetic.enabled,
                hasApiKey: Boolean(config.envOverrides.synthetic?.apiKey || config.providers.synthetic.apiKey),
                available: config.providers.synthetic.enabled && Boolean(config.envOverrides.synthetic?.apiKey || config.providers.synthetic.apiKey)
            },
            minimax: {
                enabled: config.providers.minimax.enabled,
                hasApiKey: Boolean(config.envOverrides.minimax?.apiKey || config.providers.minimax.apiKey),
                available: config.providers.minimax.enabled && Boolean(config.envOverrides.minimax?.apiKey || config.providers.minimax.apiKey)
            }
        };
    }
    /**
     * Get consistent network display string
     * Uses atomic provider state to ensure consistency
     */
    getNetworkDisplay() {
        const providerState = this.getAtomicProviderState();
        const networkProviders = [];
        if (providerState.synthetic.available) {
            networkProviders.push("Synthetic.New");
        }
        if (providerState.minimax.available) {
            networkProviders.push("MiniMax");
        }
        return networkProviders.length > 0 ? networkProviders.join(" + ") : "None";
    }
    getSelectedModel() {
        return this.config.selectedModel;
    }
    async setSelectedModel(model) {
        return this.updateConfig({ selectedModel: model });
    }
    getCacheDuration() {
        return this.config.cacheDurationHours;
    }
    async setCacheDuration(hours) {
        try {
            return await this.updateConfig({ cacheDurationHours: hours });
        }
        catch (error) {
            if (error instanceof types_1.ConfigValidationError) {
                return false;
            }
            throw error;
        }
    }
    async isCacheValid(cacheFile) {
        try {
            const { stat } = require("fs/promises");
            const stats = await stat(cacheFile);
            const cacheAge = Date.now() - stats.mtime.getTime();
            const maxAge = this.config.cacheDurationHours * 60 * 60 * 1000;
            return cacheAge < maxAge;
        }
        catch (error) {
            return false;
        }
    }
    isFirstRun() {
        return !this.config.firstRunCompleted;
    }
    async markFirstRunCompleted() {
        return this.updateConfig({ firstRunCompleted: true });
    }
    hasSavedModel() {
        return Boolean(this.config.selectedModel && this.config.firstRunCompleted);
    }
    getSavedModel() {
        if (this.hasSavedModel()) {
            return this.config.selectedModel;
        }
        return "";
    }
    async setSavedModel(model) {
        return this.updateConfig({ selectedModel: model, firstRunCompleted: true });
    }
    hasSavedThinkingModel() {
        return Boolean(this.config.selectedThinkingModel && this.config.firstRunCompleted);
    }
    getSavedThinkingModel() {
        if (this.hasSavedThinkingModel()) {
            return this.config.selectedThinkingModel;
        }
        return "";
    }
    async setSavedThinkingModel(model) {
        return this.updateConfig({
            selectedThinkingModel: model,
            firstRunCompleted: true,
        });
    }
    hasProviderApiKey(provider) {
        const config = this.config;
        const providerKey = provider;
        return !!(config.providers[providerKey]?.apiKey && config.providers[providerKey]?.apiKey.length > 0);
    }
    getModelCombinations() {
        const config = this.config;
        const combinations = config.combinations || {};
        return Object.values(combinations);
    }
    async resetConfig() {
        this._config = null;
        await this.updateConfig({
            selectedModel: '',
            selectedThinkingModel: '',
            defaultProvider: 'synthetic',
            providers: {
                synthetic: {
                    apiKey: '',
                    baseUrl: 'https://api.synthetic.new',
                    anthropicBaseUrl: 'https://api.synthetic.new/anthropic',
                    modelsApiUrl: 'https://api.synthetic.new/openai/v1/models',
                    enabled: true
                },
                minimax: {
                    apiKey: '',
                    baseUrl: 'https://api.minimax.io',
                    anthropicBaseUrl: 'https://api.minimax.io/anthropic',
                    modelsApiUrl: 'https://api.minimax.io/v1/models',
                    enabled: false,
                    defaultModel: '',
                    groupId: ''
                }
            }
        });
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=manager.js.map