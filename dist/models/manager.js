"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelManager = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("./types");
const info_1 = require("./info");
const cache_1 = require("./cache");
const minimax_client_1 = require("../api/minimax-client");
const error_sanitizer_1 = require("../utils/error-sanitizer");
class ModelManager {
    configManager;
    cache;
    minimaxClient;
    constructor(options) {
        this.configManager = options.configManager;
        this.cache = new cache_1.ModelCache({
            cacheFile: options.cacheFile,
            cacheDurationHours: options.cacheDurationHours || 24,
        });
        this.minimaxClient = new minimax_client_1.MiniMaxClient();
    }
    async fetchModels(forceRefresh = false) {
        // Check if intelligent refresh is needed
        if (!forceRefresh && !(await this.cache.needsRefresh())) {
            return this.cache.load();
        }
        const models = await this.fetchAllProviders();
        if (models.length === 0) {
            console.warn("No models received from any enabled providers");
        }
        return models;
    }
    /**
     * Fetch models from a specific provider
     */
    async fetchFromProvider(provider, forceRefresh = false) {
        if (!this.configManager.isProviderEnabled(provider)) {
            console.warn(`${provider} provider is not enabled`);
            return [];
        }
        try {
            switch (provider) {
                case "synthetic":
                    return await this.fetchFromSyntheticApi();
                case "minimax":
                    return await this.fetchFromMiniMaxApi();
                case "auto":
                    // Auto mode fetches from all enabled providers
                    return await this.fetchAllProviders();
                default:
                    throw new Error(`Unsupported provider: ${provider}`);
            }
        }
        catch (error) {
            // Enhance error with provider information for better recovery
            const enhancedError = this.enhanceErrorWithProvider(error, provider);
            // console.error(`Failed to fetch models from ${provider} provider:`, enhancedError); // Hiding full error traces in v1.2.1
            throw enhancedError;
        }
    }
    /**
     * Enhance error with provider information for better error recovery
     */
    enhanceErrorWithProvider(error, provider) {
        const enhanced = error;
        const providerNames = {
            synthetic: 'Synthetic',
            minimax: 'MiniMax',
            auto: 'Auto'
        };
        const providerName = providerNames[provider] || provider;
        // If it's already an ApiError with provider info, return as-is
        if (enhanced.message && (enhanced.message.includes(providerName) || enhanced.message.includes(provider))) {
            return enhanced;
        }
        // Create new error message with provider context
        const originalMessage = enhanced.message || String(error);
        const newMessage = `${providerName} API error: ${originalMessage}`;
        // Create new error preserving original error properties
        const newError = new Error(newMessage);
        // Copy over any existing properties from the original error
        if ('status' in enhanced) {
            newError.status = enhanced.status;
        }
        if ('data' in enhanced) {
            newError.data = enhanced.data;
        }
        if ('code' in enhanced) {
            newError.code = enhanced.code;
        }
        // Add provider information
        newError.provider = provider;
        return newError;
    }
    /**
     * Fetch models from all enabled providers concurrently
     */
    async fetchAllProviders() {
        const enabledProviders = this.getEnabledProviders();
        if (enabledProviders.length === 0) {
            console.warn("No providers are enabled");
            return [];
        }
        const providerPromises = enabledProviders.map(async (provider) => {
            try {
                const models = await this.fetchFromProvider(provider);
                return {
                    provider,
                    models,
                    success: true,
                    error: null,
                };
            }
            catch (error) {
                // console.error(`Failed to fetch models from ${provider}: ${sanitizeApiError(error)}`); // Hiding full error traces in v1.2.1
                return {
                    provider,
                    models: [],
                    success: false,
                    error: error,
                };
            }
        });
        try {
            const providerResults = await Promise.all(providerPromises);
            const allModels = providerResults.flatMap((result) => result.models);
            // Remove duplicates based on model ID, preferring providers in order: synthetic > minimax
            const uniqueModels = this.deduplicateModels(allModels);
            // Prepare fetch source metadata for cache
            const fetchSources = providerResults.map((result) => ({
                provider: result.provider,
                modelCount: result.models.length,
                success: result.success,
            }));
            // Save with enhanced metadata
            if (uniqueModels.length > 0) {
                await this.cache.saveWithMetadata(uniqueModels, fetchSources);
            }
            return uniqueModels;
        }
        catch (error) {
            // console.error(`Failed to fetch models from providers: ${sanitizeApiError(error)}`); // Hiding full error traces in v1.2.1
            throw new types_1.ApiError(`Failed to fetch models from providers: ${(0, error_sanitizer_1.sanitizeApiError)(error)}`);
        }
    }
    /**
     * Get list of enabled providers
     */
    getEnabledProviders() {
        const providers = [];
        const providerState = this.configManager.getAtomicProviderState();
        if (providerState.synthetic.available) {
            providers.push("synthetic");
        }
        if (providerState.minimax.available) {
            providers.push("minimax");
        }
        return providers;
    }
    /**
     * Get count of enabled providers
     */
    getEnabledProvidersCount() {
        return this.getEnabledProviders().length;
    }
    /**
     * Fetch models from Synthetic API (existing implementation)
     */
    async fetchFromSyntheticApi() {
        const config = this.configManager.getProviderConfig("synthetic");
        const apiKey = this.configManager.getSyntheticApiKey();
        if (!apiKey) {
            console.warn("No Synthetic API key configured");
            return [];
        }
        if (!config) {
            console.warn("Synthetic provider configuration not available");
            return [];
        }
        try {
            const headers = {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            };
            const response = await axios_1.default.get(config.modelsApiUrl, {
                headers,
                timeout: 30000,
            });
            if (response.status === 200) {
                const modelsData = response.data.data || [];
                // Convert to ModelInfoImpl objects with provider tag
                const models = [];
                for (const modelData of modelsData) {
                    try {
                        const model = new info_1.ModelInfoImpl({
                            ...modelData,
                            provider: "synthetic",
                        });
                        models.push(model);
                    }
                    catch (error) {
                        console.warn(`Invalid Synthetic model data: ${modelData.id || "unknown"}:`, error);
                    }
                }
                return models;
            }
            else {
                throw new types_1.ApiError(`Synthetic API error: ${response.status} - ${response.statusText}`, response.status, response.data);
            }
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.response) {
                    throw new types_1.ApiError(`Synthetic API error: ${error.response.status} - ${error.response.statusText}`, error.response.status, error.response.data);
                }
                else if (error.request) {
                    throw new types_1.ApiError("Synthetic network error: No response received from API");
                }
                else {
                    throw new types_1.ApiError(`Synthetic network error: ${error.message}`);
                }
            }
            throw new types_1.ApiError(`Error fetching Synthetic models: ${(0, error_sanitizer_1.sanitizeApiError)(error)}`);
        }
    }
    /**
     * Fetch models from MiniMax API
     */
    async fetchFromMiniMaxApi() {
        const apiKey = this.configManager.getMinimaxApiKey();
        if (!apiKey) {
            console.warn("No MiniMax API key configured");
            return [];
        }
        // MiniMax Anthropic-compatible API doesn't have a models endpoint
        // They only support these predefined models: https://platform.minimax.io/docs/api-reference/text-anthropic-api
        const minimaxModels = [
            {
                id: "minimax:MiniMax-M2",
                object: "model",
                created: 1704067200,
                owned_by: "minimax",
                model: "MiniMax-M2",
                provider: "minimax",
                context_length: 200000, // Approximate context window
                max_tokens: 8192,
                description: "MiniMax M2 model for general tasks",
            },
            {
                id: "minimax:MiniMax-M1",
                object: "model",
                created: 1704067200,
                owned_by: "minimax",
                model: "MiniMax-M1",
                provider: "minimax",
                context_length: 200000, // Approximate context window
                max_tokens: 8192,
                description: "MiniMax M1 model for general tasks",
            }
        ];
        try {
            // Return the predefined models directly without validation
            // Validation will happen separately when actually launching Claude Code
            const models = [];
            for (const modelData of minimaxModels) {
                try {
                    const model = new info_1.ModelInfoImpl(modelData);
                    models.push(model);
                }
                catch (error) {
                    console.warn(`Invalid MiniMax model data: ${modelData.id || "unknown"}:`, error);
                }
            }
            return models;
        }
        catch (error) {
            throw new types_1.ApiError(`MiniMax API error: ${(0, error_sanitizer_1.sanitizeApiError)(error)}`);
        }
    }
    /**
     * Remove duplicate models, preferring providers in priority order
     * v1.3.1: Use provider priority from model cards or default to minimax > synthetic for MiniMax models
     */
    deduplicateModels(models) {
        const seen = new Map();
        for (const model of models) {
            const existing = seen.get(model.id);
            if (!existing) {
                seen.set(model.id, model);
            }
            else {
                // v1.3.1: Provider priority with MiniMax preference for MiniMax models
                const isMiniMaxModel = model.id.includes('MiniMax') || existing.id.includes('MiniMax');
                const providerPriority = isMiniMaxModel
                    ? { minimax: 2, synthetic: 1 } // MiniMax models prefer minimax provider
                    : { synthetic: 2, minimax: 1 }; // Other models prefer synthetic
                const existingPriority = providerPriority[existing.getProvider()] || 0;
                const newPriority = providerPriority[model.getProvider()] || 0;
                if (newPriority > existingPriority) {
                    seen.set(model.id, model);
                }
            }
        }
        return Array.from(seen.values());
    }
    /**
     * v1.3.1: Get model card for a model ID
     */
    async getModelCard(modelId) {
        try {
            const modelCards = await this.configManager.loadModelCards();
            if (!modelCards) {
                return null;
            }
            // Direct match
            let card = modelCards.cards.find(c => c.id === modelId);
            if (card) {
                return card;
            }
            // Check aliases
            card = modelCards.cards.find(c => c.aliases?.includes(modelId));
            if (card) {
                return card;
            }
            return null;
        }
        catch (error) {
            console.warn("Failed to get model card:", error);
            return null;
        }
    }
    /**
     * v1.3.1: Get provider priority from model cards
     */
    async getProviderPriority() {
        try {
            const modelCards = await this.configManager.loadModelCards();
            if (modelCards && modelCards.providerPriority) {
                return modelCards.providerPriority;
            }
        }
        catch (error) {
            // Ignore and use default
        }
        // Default priority: minimax first for M1/M2, then synthetic
        return ["minimax", "synthetic"];
    }
    getModels(models) {
        if (!models) {
            throw new Error("Models must be provided or fetched first");
        }
        // Sort models: minimax first, then by provider, then by ID
        return [...models].sort((a, b) => {
            const providerOrder = { minimax: 0, synthetic: 1 };
            const aOrder = providerOrder[a.getProvider()] ?? 2;
            const bOrder = providerOrder[b.getProvider()] ?? 2;
            if (aOrder !== bOrder)
                return aOrder - bOrder;
            return a.id.localeCompare(b.id);
        });
    }
    async searchModels(query, models) {
        if (!models) {
            models = await this.fetchModels();
        }
        if (!query) {
            return this.getModels(models);
        }
        const queryLower = query.toLowerCase();
        const matchingModels = [];
        for (const model of models) {
            // Search in model ID and components
            const searchText = [
                model.id.toLowerCase(),
                model.getProvider().toLowerCase(),
                model.getModelName().toLowerCase(),
            ].join(" ");
            if (searchText.includes(queryLower)) {
                matchingModels.push(model);
            }
        }
        // Sort results by ID
        return matchingModels.sort((a, b) => a.id.localeCompare(b.id));
    }
    async getModelById(modelId, models) {
        if (!models) {
            models = await this.fetchModels();
        }
        return models.find((model) => model.id === modelId) || null;
    }
    async clearCache() {
        return this.cache.clear();
    }
    async clearProviderCache(provider) {
        if (provider) {
            // In a future implementation, we could have per-provider cache files
            // For now, clear the entire cache when provider-specific clearing is requested
            return this.cache.clear();
        }
        return this.clearCache();
    }
    async getCacheInfo() {
        return this.cache.getAnalytics();
    }
    /**
     * Get cache info with full analytics
     */
    async getCacheAnalytics() {
        return this.cache.getAnalytics();
    }
    /**
     * Check if cache needs intelligent refresh
     */
    async shouldRefreshCache() {
        return this.cache.needsRefresh();
    }
    /**
     * Get comprehensive model statistics
     */
    async getModelStatistics(models) {
        if (!models) {
            models = await this.fetchModels();
        }
        const stats = {
            total: models.length,
            byProvider: {},
            claudeCompatible: 0,
            byCapability: {},
        };
        for (const model of models) {
            // Count by provider
            const provider = model.getProvider();
            stats.byProvider[provider] = (stats.byProvider[provider] || 0) + 1;
            // Count Claude-compatible models
            if (model.isClaudeCompatible()) {
                stats.claudeCompatible++;
            }
            // Count by capabilities
            const capabilities = model.getProviderCapabilities();
            for (const capability of capabilities) {
                stats.byCapability[capability] =
                    (stats.byCapability[capability] || 0) + 1;
            }
        }
        return stats;
    }
    /**
     * Search models with provider and capability filters
     */
    async searchModelsWithFilters(params, models) {
        if (!models) {
            models = await this.fetchModels();
        }
        let filteredModels = models;
        // Filter by provider
        if (params.provider) {
            filteredModels = filteredModels.filter((model) => model.getProvider() === params.provider);
        }
        // Filter by capability
        if (params.capability) {
            filteredModels = filteredModels.filter((model) => model.hasCapability(params.capability));
        }
        // Filter by Claude compatibility
        if (params.claudeCompatible !== undefined) {
            filteredModels = filteredModels.filter((model) => model.isClaudeCompatible() === params.claudeCompatible);
        }
        // Text search
        if (params.query) {
            const query = params.query.toLowerCase();
            filteredModels = filteredModels.filter((model) => {
                const searchText = [
                    model.id.toLowerCase(),
                    model.getProvider().toLowerCase(),
                    model.getModelName().toLowerCase(),
                    model.getDisplayName().toLowerCase(),
                    model.name?.toLowerCase() || "",
                ].join(" ");
                return searchText.includes(query);
            });
        }
        return filteredModels.sort((a, b) => a.id.localeCompare(b.id));
    }
    /**
     * Get models categorized by provider
     */
    getCategorizedModels(models) {
        if (!models || models.length === 0) {
            throw new Error("Models must be provided or fetched first");
        }
        const categorized = {};
        for (const model of models) {
            const provider = model.getProvider() || "unknown";
            if (!categorized[provider]) {
                categorized[provider] = [];
            }
            categorized[provider].push(model);
        }
        // Sort models within each category
        for (const provider in categorized) {
            const modelsForProvider = categorized[provider];
            if (modelsForProvider) {
                modelsForProvider.sort((a, b) => a.id.localeCompare(b.id));
            }
        }
        return categorized;
    }
    /**
     * Get models from specific provider
     */
    getModelsByProvider(provider, models) {
        if (!models) {
            throw new Error("Models must be provided or fetched first");
        }
        return models
            .filter((model) => model.getProvider() === provider)
            .sort((a, b) => a.id.localeCompare(b.id));
    }
    /**
     * Force refresh models from specific provider
     */
    async refreshProvider(provider) {
        return this.fetchFromProvider(provider, true);
    }
}
exports.ModelManager = ModelManager;
//# sourceMappingURL=manager.js.map