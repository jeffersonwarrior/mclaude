import { ModelInfo, CacheInfo } from "./types";
import { ModelInfoImpl } from "./info";
export interface ModelCacheOptions {
    cacheFile: string;
    cacheDurationHours: number;
}
export interface MultiProviderCacheData {
    models: ModelInfo[];
    timestamp: string;
    count: number;
    providers: string[];
    providerCounts: Record<string, number>;
    lastFetchSources: Array<{
        provider: string;
        timestamp: string;
        modelCount: number;
        success: boolean;
    }>;
    cacheVersion: number;
}
export interface ExtendedCacheInfo extends CacheInfo {
    providers?: string[];
    providerCounts?: Record<string, number>;
    lastFetchSources?: Array<{
        provider: string;
        timestamp: string;
        modelCount: number;
        success: boolean;
    }>;
    multiProviderSupport?: boolean;
    cacheVersion?: number;
}
export declare class ModelCache {
    private cacheFile;
    private cacheDurationMs;
    constructor(options: ModelCacheOptions);
    isValid(): Promise<boolean>;
    load(): Promise<ModelInfoImpl[]>;
    /**
     * Load cache with provider analytics
     */
    loadWithAnalytics(): Promise<{
        models: ModelInfoImpl[];
        analytics: ExtendedCacheInfo;
    }>;
    save(models: ModelInfoImpl[]): Promise<boolean>;
    /**
     * Save models with detailed provider metadata
     */
    saveWithMetadata(models: ModelInfoImpl[], fetchSources?: Array<{
        provider: string;
        modelCount: number;
        success: boolean;
    }>): Promise<boolean>;
    clear(): Promise<boolean>;
    getInfo(): Promise<CacheInfo>;
    /**
     * Get extended cache information with provider analytics
     */
    getInfoExtended(): Promise<ExtendedCacheInfo>;
    /**
     * Get cache analytics and performance metrics
     */
    getAnalytics(): Promise<ExtendedCacheInfo & {
        fetchSuccessRate: number;
        averageModelsPerFetch: number;
        cacheEfficiency: number;
    }>;
    /**
     * Intelligent cache refresh based on provider activity and age
     */
    needsRefresh(): Promise<boolean>;
}
//# sourceMappingURL=cache.d.ts.map