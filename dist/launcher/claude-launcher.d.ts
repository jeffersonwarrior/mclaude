import { ConfigManager, ProviderType } from "../config";
import { ModelInfoImpl } from "../models/info";
export interface LaunchOptions {
    model: string;
    claudePath?: string;
    additionalArgs?: string[];
    env?: Record<string, string>;
    thinkingModel?: string | null;
    provider?: ProviderType;
    modelInfo?: ModelInfoImpl;
    temperature?: number;
    topP?: number;
    contextSize?: number;
    toolChoice?: string;
    stream?: boolean;
    memoryCompact?: boolean;
    jsonMode?: boolean;
    sysprompt?: string;
}
export interface LaunchResult {
    success: boolean;
    pid?: number;
    error?: string;
}
export declare class ClaudeLauncher {
    private claudePath;
    private configManager?;
    constructor(claudePath?: string, configManager?: ConfigManager);
    launchClaudeCode(options: LaunchOptions): Promise<LaunchResult>;
    /**
     * Launch Claude Code with validated options
     */
    private launchWithOptions;
    private createClaudeEnvironment;
    /**
     * Resolve the provider for the given model/options
     */
    private resolveProvider;
    /**
     * Resolve provider for thinking model (might be different from main model)
     */
    private resolveThinkingProvider;
    /**
     * Get provider configuration
     */
    private getProviderConfig;
    /**
     * Get API key for provider
     */
    private getProviderApiKey;
    /**
     * Apply provider-specific optimizations
     */
    private applyProviderOptimizations;
    /**
     * Validate environment setup before launch
     */
    private validateEnvironment;
    /**
     * Get fallback provider if primary provider fails
     */
    private getFallbackProvider;
    checkClaudeInstallation(): Promise<boolean>;
    getClaudeVersion(): Promise<string | null>;
    setClaudePath(path: string): void;
    getClaudePath(): string;
    /**
     * Cleanup resources including LiteLLM proxy
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=claude-launcher.d.ts.map