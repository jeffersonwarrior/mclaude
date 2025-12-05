import { AppConfig, Provider, SyntheticProviderConfig, MinimaxProviderConfig, ModelCards } from "./types";
export interface ConfigHierarchy {
    localProjectConfig?: AppConfig | null;
    LocalProjectEnv?: AppConfig | null;
    globalUserConfig?: AppConfig | null;
    systemEnv?: AppConfig | null;
}
export declare class ConfigManager {
    private globalConfigDir;
    private globalConfigPath;
    private localProjectDir;
    private localConfigPath;
    private _config;
    private _configHierarchy;
    private workspaceRoot;
    constructor(configDir?: string);
    /**
     * Find the local project config directory by walking up from current directory
     * Returns null if no .mclaude directory is found
     */
    private findLocalProjectConfig;
    /**
     * Get the type of config currently being used
     */
    getConfigType(): "local" | "global";
    /**
     * Get the workspace root if local config is available
     */
    getWorkspaceRoot(): string | null;
    /**
     * Initialize a local project configuration
     */
    initLocalConfig(): Promise<boolean>;
    /**
     * Migrate global config to local project config
     */
    migrateToLocal(): Promise<boolean>;
    /**
     * Save configuration to local config file
     */
    saveLocalConfig(config: AppConfig): Promise<boolean>;
    get config(): AppConfig;
    /**
     * Load the complete configuration hierarchy
     */
    private loadConfigHierarchy;
    /**
     * Load configuration from a specific file path
     */
    private loadConfigFile;
    /**
     * Load configuration from local .env file
     */
    private loadLocalEnvConfig;
    /**
     * Load global configuration
     */
    private loadGlobalConfig;
    /**
     * Merge configuration hierarchy with proper priority
     * Priority: Local Project > Local .env > Global > Defaults
     */
    private mergeConfigHierarchy;
    /**
     * Deep merge two objects
     */
    private deepMerge;
    private applyEnvironmentOverrides;
    private ensureConfigDir;
    private loadConfig;
    private migrateLegacyConfig;
    saveConfig(config?: AppConfig): Promise<boolean>;
    /**
     * Save configuration to global config file
     */
    saveGlobalConfig(config: AppConfig): Promise<boolean>;
    updateConfig(updates: Partial<AppConfig>): Promise<boolean>;
    hasApiKey(): boolean;
    getApiKey(): string;
    setApiKey(apiKey: string): Promise<boolean>;
    hasSyntheticApiKey(): boolean;
    getSyntheticApiKey(): string;
    setSyntheticApiKey(apiKey: string): Promise<boolean>;
    hasMinimaxApiKey(): boolean;
    getMinimaxApiKey(): string;
    setMinimaxApiKey(apiKey: string): Promise<boolean>;
    hasMinimaxGroupId(): boolean;
    getMinimaxGroupId(): string | undefined;
    setMinimaxGroupId(groupId: string): Promise<boolean>;
    isProviderEnabled(provider: Provider): boolean;
    setProviderEnabled(provider: Provider, enabled: boolean): Promise<boolean>;
    getDefaultProvider(): Provider;
    setDefaultProvider(provider: Provider): Promise<boolean>;
    getProviderConfig(provider: Provider): SyntheticProviderConfig | MinimaxProviderConfig | null;
    updateProviderConfig(provider: Provider, updates: Partial<SyntheticProviderConfig | MinimaxProviderConfig>): Promise<boolean>;
    getEffectiveApiKey(provider: Provider): string;
    /**
     * Get atomic provider state to ensure consistency across calls
     * This prevents race conditions where different parts of the code see different provider states
     */
    getAtomicProviderState(): {
        synthetic: {
            enabled: boolean;
            hasApiKey: boolean;
            available: boolean;
        };
        minimax: {
            enabled: boolean;
            hasApiKey: boolean;
            available: boolean;
        };
    };
    /**
     * Get consistent network display string
     * Uses atomic provider state to ensure consistency
     */
    getNetworkDisplay(): string;
    getSelectedModel(): string;
    setSelectedModel(model: string): Promise<boolean>;
    getCacheDuration(): number;
    setCacheDuration(hours: number): Promise<boolean>;
    isCacheValid(cacheFile: string): Promise<boolean>;
    isFirstRun(): boolean;
    markFirstRunCompleted(): Promise<boolean>;
    hasSavedModel(): boolean;
    getSavedModel(): string;
    setSavedModel(model: string): Promise<boolean>;
    hasSavedThinkingModel(): boolean;
    getSavedThinkingModel(): string;
    setSavedThinkingModel(model: string): Promise<boolean>;
    hasProviderApiKey(provider: string): boolean;
    getModelCombinations(): any[];
    resetConfig(): Promise<void>;
    private getSyspromptPaths;
    /**
     * Get the active system prompt path (local overrides global)
     */
    getActiveSyspromptPath(): {
        path: string | null;
        type: "local" | "global" | null;
    };
    /**
     * Load and resolve system prompt with template variables
     */
    loadSysprompt(resolveVariables?: boolean): Promise<{
        content: string | null;
        type: "local" | "global" | null;
        size: number;
    }>;
    /**
     * Resolve template variables in system prompt
     */
    private resolveSyspromptVariables;
    /**
     * Validate system prompt size
     */
    validateSyspromptSize(size: number): {
        valid: boolean;
        warning: boolean;
        message: string;
    };
    /**
     * Save system prompt content
     */
    saveSysprompt(content: string, global?: boolean): Promise<boolean>;
    /**
     * Clear system prompt
     */
    clearSysprompt(global?: boolean): Promise<boolean>;
    /**
     * Get default system prompt template
     */
    getDefaultSyspromptTemplate(): string;
    /**
     * Get current token usage statistics
     */
    getTokenUsage(): {
        totalInputTokens: number;
        totalOutputTokens: number;
        sessionTokens: number;
        history: any[];
    };
    /**
     * Update token usage
     */
    updateTokenUsage(inputTokens: number, outputTokens: number): Promise<boolean>;
    /**
     * Reset token usage statistics
     */
    resetTokenUsage(): Promise<boolean>;
    /**
     * Get the path for model cards file
     */
    private getModelCardsPath;
    /**
     * Load model cards from file
     */
    loadModelCards(): Promise<ModelCards | null>;
    /**
     * Save model cards to file
     */
    saveModelCards(modelCards: ModelCards): Promise<boolean>;
    /**
     * Fetch model cards from remote URL and save them
     */
    fetchAndSaveModelCards(cardsUrl: string, timeout?: number): Promise<boolean>;
    /**
     * Update the last update check timestamp
     */
    updateLastCheck(): Promise<boolean>;
    /**
     * Check if an update check is needed (24h threshold)
     */
    needsUpdateCheck(): boolean;
    /**
     * Get recommended models from config
     */
    getRecommendedModels(): {
        default?: {
            primary?: string;
            backup?: string;
        };
        smallFast?: {
            primary?: string;
            backup?: string;
        };
        thinking?: {
            primary?: string;
            backup?: string;
        };
        subagent?: {
            primary?: string;
            backup?: string;
        };
    };
}
