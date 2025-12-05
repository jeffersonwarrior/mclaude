import { readFile, writeFile, mkdir, stat, unlink } from "fs/promises";
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

export class ModelCache {
  private cacheFile: string;
  private cacheDurationMs: number;

  constructor(options: ModelCacheOptions) {
    this.cacheFile = options.cacheFile;
    this.cacheDurationMs = options.cacheDurationHours * 60 * 60 * 1000;
  }

  async isValid(): Promise<boolean> {
    try {
      const stats = await stat(this.cacheFile);
      const mtime = stats.mtime;
      const now = new Date();
      const age = now.getTime() - mtime.getTime();

      return age < this.cacheDurationMs;
    } catch (error) {
      // File doesn't exist or can't be accessed
      return false;
    }
  }

  async load(): Promise<ModelInfoImpl[]> {
    if (!(await this.isValid())) {
      return [];
    }

    try {
      const data = await readFile(this.cacheFile, "utf-8");
      const cacheData = JSON.parse(data);

      // Handle both old and new cache formats
      const modelsData = cacheData.models || cacheData.data || [];
      return modelsData.map((modelData: any) => new ModelInfoImpl(modelData));
    } catch (error) {
      console.error("Error loading cache:", error);
      return [];
    }
  }

  /**
   * Load cache with provider analytics
   */
  async loadWithAnalytics(): Promise<{
    models: ModelInfoImpl[];
    analytics: ExtendedCacheInfo;
  }> {
    const models = await this.load();
    const info = await this.getInfoExtended();
    return { models, analytics: info };
  }

  async save(models: ModelInfoImpl[]): Promise<boolean> {
    return this.saveWithMetadata(models);
  }

  /**
   * Save models with detailed provider metadata
   */
  async saveWithMetadata(
    models: ModelInfoImpl[],
    fetchSources?: Array<{
      provider: string;
      modelCount: number;
      success: boolean;
    }>,
  ): Promise<boolean> {
    try {
      // Ensure parent directory exists
      const parentDir = require("path").dirname(this.cacheFile);
      await mkdir(parentDir, { recursive: true });

      // Calculate provider analytics
      const providerCounts: Record<string, number> = {};
      const providers: string[] = [];

      for (const model of models) {
        const provider = model.getProvider();
        providerCounts[provider] = (providerCounts[provider] || 0) + 1;
        if (!providers.includes(provider)) {
          providers.push(provider);
        }
      }

      // Load existing cache to preserve fetch history if available
      let lastFetchSources: Array<{
        provider: string;
        timestamp: string;
        modelCount: number;
        success: boolean;
      }> = [];

      // Add current fetch sources with timestamp
      if (fetchSources) {
        lastFetchSources = fetchSources.map((source) => ({
          ...source,
          timestamp: new Date().toISOString(),
        }));
      }

      try {
        const existingData = await readFile(this.cacheFile, "utf-8");
        const existingCache = JSON.parse(existingData);
        if (existingCache.lastFetchSources) {
          // Keep recent fetch sources, add new ones at the beginning
          lastFetchSources = [
            ...lastFetchSources,
            ...existingCache.lastFetchSources.slice(0, 9), // Keep last 10
          ];
        }
      } catch {
        // Ignore if existing cache can't be read
      }

      const cacheData: MultiProviderCacheData = {
        models: models.map((model) => model.toJSON()),
        timestamp: new Date().toISOString(),
        count: models.length,
        providers,
        providerCounts,
        lastFetchSources,
        cacheVersion: 2,
      };

      const data = JSON.stringify(cacheData, null, 2);
      await writeFile(this.cacheFile, data, "utf-8");

      return true;
    } catch (error) {
      console.error("Error saving cache:", error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      await unlink(this.cacheFile);
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
  }

  async getInfo(): Promise<CacheInfo> {
    try {
      const stats = await stat(this.cacheFile);
      const models = await this.load();

      return {
        exists: true,
        filePath: this.cacheFile,
        modifiedTime: stats.mtime.toISOString(),
        sizeBytes: stats.size,
        modelCount: models.length,
        isValid: await this.isValid(),
      };
    } catch (error) {
      return {
        exists: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get extended cache information with provider analytics
   */
  async getInfoExtended(): Promise<ExtendedCacheInfo> {
    try {
      const stats = await stat(this.cacheFile);
      const data = await readFile(this.cacheFile, "utf-8");
      const cacheData = JSON.parse(data);

      const baseInfo: CacheInfo = {
        exists: true,
        filePath: this.cacheFile,
        modifiedTime: stats.mtime.toISOString(),
        sizeBytes: stats.size,
        modelCount: cacheData.count || cacheData.models?.length || 0,
        isValid: await this.isValid(),
      };

      // Extract multi-provider information if available
      let providers: string[] = [];
      let providerCounts: Record<string, number> = {};
      let lastFetchSources: Array<{
        provider: string;
        timestamp: string;
        modelCount: number;
        success: boolean;
      }> = [];
      let cacheVersion = 1;

      if (cacheData.providers && Array.isArray(cacheData.providers)) {
        providers = cacheData.providers;
        providerCounts = cacheData.providerCounts || {};
        lastFetchSources = cacheData.lastFetchSources || [];
        cacheVersion = cacheData.cacheVersion || 1;
      } else if (cacheData.models && Array.isArray(cacheData.models)) {
        // Analyze models to extract provider information (for older caches)
        const tempProviderCounts: Record<string, number> = {};
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
    } catch (error) {
      return {
        exists: false,
        error: (error as Error).message,
        multiProviderSupport: true,
      };
    }
  }

  /**
   * Get cache analytics and performance metrics
   */
  async getAnalytics(): Promise<
    ExtendedCacheInfo & {
      fetchSuccessRate: number;
      averageModelsPerFetch: number;
      cacheEfficiency: number;
    }
  > {
    const info = await this.getInfoExtended();

    let fetchSuccessRate = 0;
    let averageModelsPerFetch = 0;
    let cacheEfficiency = 0;

    if (info.lastFetchSources && info.lastFetchSources.length > 0) {
      const successfulFetches = info.lastFetchSources.filter(
        (source) => source.success,
      );
      fetchSuccessRate =
        (successfulFetches.length / info.lastFetchSources.length) * 100;

      const totalModels = info.lastFetchSources.reduce(
        (sum, source) => sum + source.modelCount,
        0,
      );
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
  async needsRefresh(): Promise<boolean> {
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
