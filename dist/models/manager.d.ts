import { ModelInfoImpl } from "./info";
import { ConfigManager } from "../config/manager";
import { ProviderType } from "../config/types";
export interface ModelManagerOptions {
    configManager: ConfigManager;
    cacheFile: string;
    cacheDurationHours?: number;
}
export declare class ModelManager {
    private configManager;
    private cache;
    private minimaxClient;
    constructor(options: ModelManagerOptions);
    fetchModels(_: boolean): Promise<ModelInfoImpl[]>;
    /**
     * Fetch models from a specific provider
     */
    fetchFromProvider(provider: ProviderType, _: boolean): Promise<ModelInfoImpl[]>;
    /**
     * Enhance error with provider information for better error recovery
     */
    private enhanceErrorWithProvider;
    /**
     * Fetch models from all enabled providers concurrently
     */
    fetchAllProviders(): Promise<ModelInfoImpl[]>;
    /**
     * Get list of enabled providers
     */
    getEnabledProviders(): ProviderType[];
    /**
     * Get count of enabled providers
     */
    private getEnabledProvidersCount;
    /**
     * Fetch models from Synthetic API (existing implementation)
     */
    private fetchFromSyntheticApi;
    /**
     * Fetch models from MiniMax API
     */
    private fetchFromMiniMaxApi;
    /**
     * Remove duplicate models, preferring providers in priority order
     * v1.3.1: Use provider priority from model cards or default to minimax > synthetic for MiniMax models
     */
    private deduplicateModels;
    /**
     * v1.3.1: Get model card for a model ID
     */
    getModelCard(modelId: string): Promise<any>;
    /**
     * v1.3.1: Get provider priority from model cards
     */
    getProviderPriority(): Promise<string[]>;
    getModels(models?: ModelInfoImpl[]): ModelInfoImpl[];
    searchModels(query: string, models?: ModelInfoImpl[]): Promise<ModelInfoImpl[]>;
    getModelById(modelId: string, models?: ModelInfoImpl[]): Promise<ModelInfoImpl | null>;
    clearCache(): Promise<boolean>;
    clearProviderCache(provider?: ProviderType): Promise<boolean>;
    getCacheInfo(): Promise<Record<string, any>>;
    /**
     * Get cache info with full analytics
     */
    getCacheAnalytics(): Promise<import("./cache").ExtendedCacheInfo & {
        fetchSuccessRate: number;
        averageModelsPerFetch: number;
        cacheEfficiency: number;
    }>;
    /**
     * Check if cache needs intelligent refresh
     */
    shouldRefreshCache(): Promise<boolean>;
    /**
     * Get comprehensive model statistics
     */
    getModelStatistics(models?: ModelInfoImpl[]): Promise<{
        total: number;
        byProvider: Record<string, number>;
        claudeCompatible: number;
        byCapability: Record<string, number>;
    }>;
    /**
     * Search models with provider and capability filters
     */
    searchModelsWithFilters(params: {
        query?: string;
        provider?: string;
        capability?: string;
        claudeCompatible?: boolean;
    }, models?: ModelInfoImpl[]): Promise<ModelInfoImpl[]>;
    /**
     * Get models categorized by provider
     */
    getCategorizedModels(models?: ModelInfoImpl[]): Record<string, ModelInfoImpl[]>;
    /**
     * Get models from specific provider
     */
    getModelsByProvider(provider: string, models?: ModelInfoImpl[]): ModelInfoImpl[];
    /**
     * Force refresh models from specific provider
     */
    refreshProvider(provider: ProviderType): Promise<ModelInfoImpl[]>;
}
//# sourceMappingURL=manager.d.ts.map