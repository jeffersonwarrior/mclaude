import { LaunchOptions } from "../launcher";
export interface AppOptions {
    verbose?: boolean;
    quiet?: boolean;
    additionalArgs?: string[];
    thinkingModel?: string;
    temperature?: number;
    topP?: number;
    preset?: string;
    contextSize?: number;
    toolChoice?: string;
    stream?: boolean;
    memory?: string;
    jsonMode?: boolean;
}
export declare class SyntheticClaudeApp {
    private configManager;
    private ui;
    private launcher;
    private modelManager;
    constructor();
    setupLogging(options: AppOptions): Promise<void>;
    getConfig(): {
        providers: {
            synthetic: {
                apiKey: string;
                baseUrl: string;
                anthropicBaseUrl: string;
                modelsApiUrl: string;
                enabled: boolean;
                timeout?: number | undefined;
            };
            minimax: {
                apiKey: string;
                baseUrl: string;
                anthropicBaseUrl: string;
                modelsApiUrl: string;
                enabled: boolean;
                defaultModel: string;
                parallelToolCalls: boolean;
                streaming: boolean;
                memoryCompact: boolean;
                timeout?: number | undefined;
                groupId?: string | undefined;
                temperature?: number | undefined;
                topP?: number | undefined;
                topK?: number | undefined;
                contextSize?: number | undefined;
                toolChoice?: "auto" | "none" | "required" | undefined;
                responseFormat?: "text" | "json_object" | undefined;
            };
        };
        defaultProvider: "synthetic" | "minimax" | "auto";
        cacheDurationHours: number;
        selectedModel: string;
        selectedThinkingModel: string;
        firstRunCompleted: boolean;
        tokenUsage: {
            totalInputTokens: number;
            totalOutputTokens: number;
            sessionTokens: number;
            history: {
                date: string;
                inputTokens: number;
                outputTokens: number;
            }[];
            lastUpdated?: string | undefined;
        };
        responseCache: {
            enabled: boolean;
            ttlMinutes: number;
            maxEntries: number;
        };
        liteLLM: {
            enabled: boolean;
            timeout: number;
            port: number;
            host: string;
        };
        envOverrides: {
            synthetic?: {
                apiKey?: string | undefined;
            } | undefined;
            minimax?: {
                apiKey?: string | undefined;
            } | undefined;
        };
        configVersion: number;
        recommendedModels: {
            default: {
                primary: string;
                backup: string;
            };
            smallFast: {
                primary: string;
                backup: string;
            };
            thinking: {
                primary: string;
                backup: string;
            };
            subagent: {
                primary: string;
                backup: string;
            };
        };
        combination1?: {
            name?: string | undefined;
            regularModel?: string | undefined;
            thinkingModel?: string | undefined;
            regularProvider?: string | undefined;
            thinkingProvider?: string | undefined;
            createdAt?: string | undefined;
        } | undefined;
        combination2?: {
            name?: string | undefined;
            regularModel?: string | undefined;
            thinkingModel?: string | undefined;
            regularProvider?: string | undefined;
            thinkingProvider?: string | undefined;
            createdAt?: string | undefined;
        } | undefined;
        combination3?: {
            name?: string | undefined;
            regularModel?: string | undefined;
            thinkingModel?: string | undefined;
            regularProvider?: string | undefined;
            thinkingProvider?: string | undefined;
            createdAt?: string | undefined;
        } | undefined;
        combination4?: {
            name?: string | undefined;
            regularModel?: string | undefined;
            thinkingModel?: string | undefined;
            regularProvider?: string | undefined;
            thinkingProvider?: string | undefined;
            createdAt?: string | undefined;
        } | undefined;
        combination5?: {
            name?: string | undefined;
            regularModel?: string | undefined;
            thinkingModel?: string | undefined;
            regularProvider?: string | undefined;
            thinkingProvider?: string | undefined;
            createdAt?: string | undefined;
        } | undefined;
        combination6?: {
            name?: string | undefined;
            regularModel?: string | undefined;
            thinkingModel?: string | undefined;
            regularProvider?: string | undefined;
            thinkingProvider?: string | undefined;
            createdAt?: string | undefined;
        } | undefined;
        combination7?: {
            name?: string | undefined;
            regularModel?: string | undefined;
            thinkingModel?: string | undefined;
            regularProvider?: string | undefined;
            thinkingProvider?: string | undefined;
            createdAt?: string | undefined;
        } | undefined;
        combination8?: {
            name?: string | undefined;
            regularModel?: string | undefined;
            thinkingModel?: string | undefined;
            regularProvider?: string | undefined;
            thinkingProvider?: string | undefined;
            createdAt?: string | undefined;
        } | undefined;
        combination9?: {
            name?: string | undefined;
            regularModel?: string | undefined;
            thinkingModel?: string | undefined;
            regularProvider?: string | undefined;
            thinkingProvider?: string | undefined;
            createdAt?: string | undefined;
        } | undefined;
        combination10?: {
            name?: string | undefined;
            regularModel?: string | undefined;
            thinkingModel?: string | undefined;
            regularProvider?: string | undefined;
            thinkingProvider?: string | undefined;
            createdAt?: string | undefined;
        } | undefined;
        lastUpdateCheck?: number | undefined;
    };
    private getModelManager;
    run(options: AppOptions & LaunchOptions): Promise<void>;
    /**
     * v1.3.1: Silent update check on launch (Option C from spec)
     * Non-blocking, 3 second timeout, silent catch
     */
    private performSilentUpdate;
    /**
     * Validate provider credentials - maintains compatibility while being simpler
     */
    validateProviderCredentials(_: boolean): Promise<{
        valid: boolean;
        authenticationError?: string | null;
        warnings?: string[];
    }>;
    /**
     * Helper to detect which provider caused an error
     */
    private detectProviderFromError;
    /**
     * Format authentication errors with provider-specific guidance
     */
    private formatAuthenticationError;
    /**
     * Validate provider credentials by testing API connectivity
     */
    validateProviderCredential(provider: string): Promise<{
        valid: boolean;
        error?: string;
    }>;
    /**
     * Simple error categorization for backward compatibility
     */
    categorizeError(error: any): string;
    /**
     * Improved API key format validation
     */
    validateApiKeyFormat(provider: string, apiKey: string): {
        valid: boolean;
        error?: string;
    };
    /**
     * Simplified error recovery: Sleep utility
     */
    private sleep;
    /**
     * Check authentication status for providers
     */
    checkAuth(options?: {
        provider?: string;
    }): Promise<void>;
    /**
     * Test authentication for a specific provider
     */
    testAuth(provider: string): Promise<void>;
    /**
     * Reset authentication credentials for a provider
     */
    resetAuth(provider: string): Promise<void>;
    /**
     * Refresh authentication by testing current credentials
     */
    refreshAuth(provider?: string): Promise<void>;
    /**
     * Show detailed authentication status
     */
    authStatus(options?: {
        format?: string;
    }): Promise<void>;
    interactiveModelSelection(options?: {
        provider?: string;
        thinkingProvider?: string;
        saveCombination?: string;
    }): Promise<boolean>;
    interactiveThinkingModelSelection(): Promise<boolean>;
    showConfig(): Promise<void>;
    setConfig(key: string, value: string): Promise<void>;
    resetConfig(options?: {
        scope?: string;
    }): Promise<void>;
    setup(): Promise<void>;
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
    private unifiedSetupOrchestrator;
    /**
     * Handle errors during setup steps with clear recovery options
     */
    private handleSetupStepError;
    /**
     * Determine if a setup step can be safely skipped
     */
    private canSkipSetupStep;
    /**
     * Step 1: Configure providers (streamlined)
     */
    private setupProviderConfiguration;
    /**
     * Configure a single provider with simplified flow
     */
    private configureSingleProvider;
    /**
     * Step 2: Test authentication for configured providers
     */
    private setupAuthenticationTesting;
    /**
     * Step 3: Select models (simplified)
     */
    private setupModelSelection;
    /**
     * v1.3.1: Check availability of recommended models
     */
    private checkRecommendedModelAvailability;
    /**
     * Step 4: Finalize setup
     */
    private setupFinalization;
    doctor(): Promise<void>;
    clearCache(): Promise<void>;
    cacheInfo(): Promise<void>;
    private selectModel;
    private selectThinkingModel;
    /**
     * Simplified connection testing - handled by the new setup orchestrator
     * This method is kept for backward compatibility but delegates to the new flow
     */
    private testConnectionWithRecovery;
    private launchClaudeCode;
    listProviders(): Promise<void>;
    enableProvider(provider: string): Promise<void>;
    disableProvider(provider: string): Promise<void>;
    setDefaultProvider(provider: string): Promise<void>;
    providerStatus(options: {
        provider?: string;
    }): Promise<void>;
    testProvider(provider: string): Promise<void>;
    listProviderConfigs(): Promise<void>;
    getProviderConfigInfo(provider: string): Promise<void>;
    setProviderConfig(provider: string, key: string, value: string): Promise<void>;
    listModels(options: {
        refresh?: boolean;
        provider?: string;
    }): Promise<void>;
    searchModels(query: string, options: {
        refresh?: boolean;
        provider?: string;
    }): Promise<void>;
    initLocalConfig(options: {
        force?: boolean;
    }): Promise<void>;
    switchToLocalConfig(): Promise<void>;
    switchToGlobalConfig(): Promise<void>;
    migrateConfig(options: {
        force?: boolean;
    }): Promise<void>;
    showConfigContext(): Promise<void>;
    showModelInfo(modelId?: string): Promise<void>;
    listCombinations(): Promise<void>;
    saveCombination(name: string, model: string, thinkingModel?: string): Promise<void>;
    deleteCombination(name: string): Promise<void>;
    showStats(options?: {
        reset?: boolean;
        format?: string;
    }): Promise<void>;
    manageSysprompt(options?: {
        global?: boolean;
        show?: boolean;
        clear?: boolean;
        raw?: boolean;
    }): Promise<void>;
    private editSysprompt;
    manageModelCards(options?: {
        update?: boolean;
    }): Promise<void>;
}
//# sourceMappingURL=app.d.ts.map