import { ConfigManager } from "../config";
export interface CCRProvider {
    name: string;
    api_base_url: string;
    api_key: string;
    models: string[];
    transformer?: {
        use: string[];
    };
}
export interface CCRRouterConfig {
    default: string;
    background: string;
    think: string;
    subagent: string;
    longContext?: string;
    longContextThreshold?: number;
}
export interface CCRConfig {
    LOG: boolean;
    API_TIMEOUT_MS: number;
    Providers: CCRProvider[];
    Router: CCRRouterConfig;
}
export declare class CCRConfigGenerator {
    private configManager;
    private ccrConfigDir;
    private ccrConfigPath;
    constructor(configManager?: ConfigManager);
    /**
     * Generate CCR configuration from mclaude config
     */
    generateConfig(): Promise<void>;
    /**
     * Build router configuration from mclaude config
     */
    private buildRouterConfig;
    /**
     * Format model for router (provider,model)
     */
    private formatRouterModel;
    /**
     * Get list of Synthetic models
     */
    private getSyntheticModels;
    /**
     * Get list of MiniMax models
     */
    private getMinimaxModels;
    /**
     * Get environment variable name for a config value
     */
    private getEnvVarName;
    /**
     * Get effective API key (environment overrides config)
     */
    private getEffectiveApiKey;
    /**
     * Get the path to the CCR config file
     */
    getConfigPath(): string;
    /**
     * Read the generated CCR config
     */
    readConfig(): Promise<CCRConfig | null>;
}
//# sourceMappingURL=ccr-config.d.ts.map