"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelCache = void 0;
const promises_1 = require("fs/promises");
const info_1 = require("./info");
class ModelCache {
    cacheFile;
    cacheDurationMs;
    constructor(options) {
        this.cacheFile = options.cacheFile;
        this.cacheDurationMs = options.cacheDurationHours * 60 * 60 * 1000;
    }
    async isValid() {
        try {
            const stats = await (0, promises_1.stat)(this.cacheFile);
            const mtime = stats.mtime;
            const now = new Date();
            const age = now.getTime() - mtime.getTime();
            return age < this.cacheDurationMs;
        }
        catch (error) {
            // File doesn't exist or can't be accessed
            return false;
        }
    }
    async load() {
        if (!(await this.isValid())) {
            return [];
        }
        try {
            const data = await (0, promises_1.readFile)(this.cacheFile, "utf-8");
            const cacheData = JSON.parse(data);
            // Handle both old and new cache formats
            const modelsData = cacheData.models || cacheData.data || [];
            return modelsData.map((modelData) => new info_1.ModelInfoImpl(modelData));
        }
        catch (error) {
            console.error("Error loading cache:", error);
            return [];
        }
    }
    /**
     * Load cache with provider analytics
     */
    async loadWithAnalytics() {
        const models = await this.load();
        const info = await this.getInfoExtended();
        return { models, analytics: info };
    }
    async save(models) {
        return this.saveWithMetadata(models);
    }
    /**
     * Save models with detailed provider metadata
     */
    async saveWithMetadata(models, fetchSources) {
        try {
            // Ensure parent directory exists
            const parentDir = require("path").dirname(this.cacheFile);
            await (0, promises_1.mkdir)(parentDir, { recursive: true });
            // Calculate provider analytics
            const providerCounts = {};
            const providers = [];
            for (const model of models) {
                const provider = model.getProvider();
                providerCounts[provider] = (providerCounts[provider] || 0) + 1;
                if (!providers.includes(provider)) {
                    providers.push(provider);
                }
            }
            // Load existing cache to preserve fetch history if available
            let lastFetchSources = [];
            // Add current fetch sources with timestamp
            if (fetchSources) {
                lastFetchSources = fetchSources.map((source) => ({
                    ...source,
                    timestamp: new Date().toISOString(),
                }));
            }
            try {
                const existingData = await (0, promises_1.readFile)(this.cacheFile, "utf-8");
                const existingCache = JSON.parse(existingData);
                if (existingCache.lastFetchSources) {
                    // Keep recent fetch sources, add new ones at the beginning
                    lastFetchSources = [
                        ...lastFetchSources,
                        ...existingCache.lastFetchSources.slice(0, 9), // Keep last 10
                    ];
                }
            }
            catch {
                // Ignore if existing cache can't be read
            }
            const cacheData = {
                models: models.map((model) => model.toJSON()),
                timestamp: new Date().toISOString(),
                count: models.length,
                providers,
                providerCounts,
                lastFetchSources,
                cacheVersion: 2,
            };
            const data = JSON.stringify(cacheData, null, 2);
            await (0, promises_1.writeFile)(this.cacheFile, data, "utf-8");
            return true;
        }
        catch (error) {
            console.error("Error saving cache:", error);
            return false;
        }
    }
    async clear() {
        try {
            await (0, promises_1.unlink)(this.cacheFile);
            return true;
        }
        catch (error) {
            console.error("Error clearing cache:", error);
            return false;
        }
    }
    async getInfo() {
        try {
            const stats = await (0, promises_1.stat)(this.cacheFile);
            const models = await this.load();
            return {
                exists: true,
                filePath: this.cacheFile,
                modifiedTime: stats.mtime.toISOString(),
                sizeBytes: stats.size,
                modelCount: models.length,
                isValid: await this.isValid(),
            };
        }
        catch (error) {
            return {
                exists: false,
                error: error.message,
            };
        }
    }
    /**
     * Get extended cache information with provider analytics
     */
    async getInfoExtended() {
        try {
            const stats = await (0, promises_1.stat)(this.cacheFile);
            const data = await (0, promises_1.readFile)(this.cacheFile, "utf-8");
            const cacheData = JSON.parse(data);
            const baseInfo = {
                exists: true,
                filePath: this.cacheFile,
                modifiedTime: stats.mtime.toISOString(),
                sizeBytes: stats.size,
                modelCount: cacheData.count || cacheData.models?.length || 0,
                isValid: await this.isValid(),
            };
            // Extract multi-provider information if available
            let providers = [];
            let providerCounts = {};
            let lastFetchSources = [];
            let cacheVersion = 1;
            if (cacheData.providers && Array.isArray(cacheData.providers)) {
                providers = cacheData.providers;
                providerCounts = cacheData.providerCounts || {};
                lastFetchSources = cacheData.lastFetchSources || [];
                cacheVersion = cacheData.cacheVersion || 1;
            }
            else if (cacheData.models && Array.isArray(cacheData.models)) {
                // Analyze models to extract provider information (for older caches)
                const tempProviderCounts = {};
                for (const model of cacheData.models) {
                    const provider = model.provider || "unknown";
                    tempProviderCounts[provider] =
                        (tempProviderCounts[provider] || 0) + 1;
                    if (!providers.includes(provider)) {
                        providers.push(provider);
                    }
                }
                providerCounts = tempProviderCounts;
            }
            return {
                ...baseInfo,
                providers,
                providerCounts,
                lastFetchSources,
                multiProviderSupport: true,
                cacheVersion,
            };
        }
        catch (error) {
            return {
                exists: false,
                error: error.message,
                multiProviderSupport: true,
            };
        }
    }
    /**
     * Get cache analytics and performance metrics
     */
    async getAnalytics() {
        const info = await this.getInfoExtended();
        let fetchSuccessRate = 0;
        let averageModelsPerFetch = 0;
        let cacheEfficiency = 0;
        if (info.lastFetchSources && info.lastFetchSources.length > 0) {
            const successfulFetches = info.lastFetchSources.filter((source) => source.success);
            fetchSuccessRate =
                (successfulFetches.length / info.lastFetchSources.length) * 100;
            const totalModels = info.lastFetchSources.reduce((sum, source) => sum + source.modelCount, 0);
            averageModelsPerFetch = totalModels / info.lastFetchSources.length;
            if (info.modelCount && info.modelCount > 0) {
                const ageMs = Date.now() - new Date(info.modifiedTime || "").getTime();
                const ageHours = ageMs / (1000 * 60 * 60);
                cacheEfficiency =
                    info.modelCount > 10 ? Math.max(0, 100 - ageHours * 4) : 0; // Decay over time
            }
        }
        return {
            ...info,
            fetchSuccessRate,
            averageModelsPerFetch,
            cacheEfficiency,
        };
    }
    /**
     * Intelligent cache refresh based on provider activity and age
     */
    async needsRefresh() {
        if (!(await this.isValid())) {
            return true;
        }
        const analytics = await this.getAnalytics();
        // If efficiency is low, refresh
        if (analytics.cacheEfficiency < 30) {
            return true;
        }
        // If success rate is low, try refresh
        if (analytics.fetchSuccessRate < 50) {
            return true;
        }
        // Default age-based refresh
        return false;
    }
}
exports.ModelCache = ModelCache;
//# sourceMappingURL=cache.js.map