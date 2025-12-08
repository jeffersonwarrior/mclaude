import { ConfigManager } from "../config";
import { UserInterface } from "../ui";
import { LaunchOptions } from "../launcher";
import { AuthManager } from "./managers/auth-manager";
import { ConfigCliManager } from "./managers/config-cli-manager";
import { ConfigMigrationManager } from "./managers/config-migration-manager";
import { ProviderManager } from "./managers/provider-manager";
import { ModelInteractionManager } from "./managers/model-interaction-manager";
import { SetupManager } from "./managers/setup-manager";
import { SystemManager } from "./managers/system-manager";
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
    private modelManager;
    private configManager;
    private ui;
    private launcher;
    private routerManager;
    private authManager;
    private configCliManager;
    private configMigrationManager;
    private providerManager;
    private modelInteractionManager;
    private setupManager;
    private systemManager;
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
        defaultProvider: "synthetic" | "auto" | "minimax";
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
        tensorzero: {
            enabled: boolean;
            timeout: number;
            port: number;
            host: string;
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
    get managers(): {
        configManager: ConfigManager;
        ui: UserInterface;
        authManager: AuthManager;
        configCliManager: ConfigCliManager;
        configMigrationManager: ConfigMigrationManager;
        providerManager: ProviderManager;
        modelInteractionManager: ModelInteractionManager;
        setupManager: SetupManager;
        systemManager: SystemManager;
    };
    private getModelManager;
    run(options: AppOptions & LaunchOptions): Promise<void>;
    /**
     * Validate provider credentials - maintains compatibility while being simpler
     */
    validateProviderCredentials(): Promise<{
        valid: boolean;
        authenticationError?: string | null;
        warnings?: string[];
    }>;
    /**
     * Helper to detect which provider caused an error
     */
    private detectProviderFromError;
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
    interactiveThinkingModelSelection(): Promise<boolean>;
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
    private checkRecommendedModelAvailability;
    /**
     * Step 4: Finalize setup
     */
    private setupFinalization;
    private selectModel;
    private selectThinkingModel;
    /**
     * Simplified connection testing - handled by the new setup orchestrator
     * This method is kept for backward compatibility but delegates to the new flow
     */
    private testConnectionWithRecovery;
    private launchClaudeCode;
}
//# sourceMappingURL=app.d.ts.map