"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelManager = void 0;
var axios_1 = require("axios");
var types_1 = require("./types");
var info_1 = require("./info");
var cache_1 = require("./cache");
var minimax_client_1 = require("../api/minimax-client");
var error_sanitizer_1 = require("../utils/error-sanitizer");
var ModelManager = /** @class */ (function () {
    function ModelManager(options) {
        this.configManager = options.configManager;
        this.cache = new cache_1.ModelCache({
            cacheFile: options.cacheFile,
            cacheDurationHours: options.cacheDurationHours || 24,
        });
        this.minimaxClient = new minimax_client_1.MiniMaxClient();
    }
    ModelManager.prototype.fetchModels = function (_) {
        return __awaiter(this, void 0, void 0, function () {
            var models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cache.needsRefresh()];
                    case 1:
                        // Check if intelligent refresh is needed
                        if (!(_a.sent())) {
                            return [2 /*return*/, this.cache.load()];
                        }
                        return [4 /*yield*/, this.fetchAllProviders()];
                    case 2:
                        models = _a.sent();
                        if (models.length === 0) {
                            console.warn("No models received from any enabled providers");
                        }
                        return [2 /*return*/, models];
                }
            });
        });
    };
    /**
     * Fetch models from a specific provider
     */
    ModelManager.prototype.fetchFromProvider = function (provider, _) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1, enhancedError;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.configManager.isProviderEnabled(provider)) {
                            console.warn("".concat(provider, " provider is not enabled"));
                            return [2 /*return*/, []];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 10, , 11]);
                        _a = provider;
                        switch (_a) {
                            case "synthetic": return [3 /*break*/, 2];
                            case "minimax": return [3 /*break*/, 4];
                            case "auto": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2: return [4 /*yield*/, this.fetchFromSyntheticApi()];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, this.fetchFromMiniMaxApi()];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, this.fetchAllProviders()];
                    case 7: 
                    // Auto mode fetches from all enabled providers
                    return [2 /*return*/, _b.sent()];
                    case 8: throw new Error("Unsupported provider: ".concat(provider));
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_1 = _b.sent();
                        enhancedError = this.enhanceErrorWithProvider(error_1, provider);
                        // console.error(`Failed to fetch models from ${provider} provider:`, enhancedError); // Hiding full error traces in v1.2.1
                        throw enhancedError;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enhance error with provider information for better error recovery
     */
    ModelManager.prototype.enhanceErrorWithProvider = function (error, provider) {
        var enhanced = error;
        var providerNames = {
            synthetic: "Synthetic",
            minimax: "MiniMax",
            auto: "Auto",
        };
        var providerName = providerNames[provider] || provider;
        // If it's already an ApiError with provider info, return as-is
        if (enhanced.message &&
            (enhanced.message.includes(providerName) ||
                enhanced.message.includes(provider))) {
            return enhanced;
        }
        // Create new error message with provider context
        var originalMessage = enhanced.message || String(error);
        var newMessage = "".concat(providerName, " API error: ").concat(originalMessage);
        // Create new error preserving original error properties
        var newError = new Error(newMessage);
        // Copy over any existing properties from the original error
        if ("status" in enhanced) {
            newError.status = enhanced.status;
        }
        if ("data" in enhanced) {
            newError.data = enhanced.data;
        }
        if ("code" in enhanced) {
            newError.code = enhanced.code;
        }
        // Add provider information
        newError.provider = provider;
        return newError;
    };
    /**
     * Fetch models from all enabled providers concurrently
     */
    ModelManager.prototype.fetchAllProviders = function () {
        return __awaiter(this, void 0, void 0, function () {
            var enabledProviders, providerPromises, providerResults, allModels, uniqueModels, fetchSources, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        enabledProviders = this.getEnabledProviders();
                        if (enabledProviders.length === 0) {
                            console.warn("No providers are enabled");
                            return [2 /*return*/, []];
                        }
                        providerPromises = enabledProviders.map(function (provider) { return __awaiter(_this, void 0, void 0, function () {
                            var models, error_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.fetchFromProvider(provider, false)];
                                    case 1:
                                        models = _a.sent();
                                        return [2 /*return*/, {
                                                provider: provider,
                                                models: models,
                                                success: true,
                                                error: null,
                                            }];
                                    case 2:
                                        error_3 = _a.sent();
                                        // console.error(`Failed to fetch models from ${provider}: ${sanitizeApiError(error)}`); // Hiding full error traces in v1.2.1
                                        return [2 /*return*/, {
                                                provider: provider,
                                                models: [],
                                                success: false,
                                                error: error_3,
                                            }];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, Promise.all(providerPromises)];
                    case 2:
                        providerResults = _a.sent();
                        allModels = providerResults.flatMap(function (result) { return result.models; });
                        uniqueModels = this.deduplicateModels(allModels);
                        fetchSources = providerResults.map(function (result) { return ({
                            provider: result.provider,
                            modelCount: result.models.length,
                            success: result.success,
                        }); });
                        if (!(uniqueModels.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.cache.saveWithMetadata(uniqueModels, fetchSources)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, uniqueModels];
                    case 5:
                        error_2 = _a.sent();
                        // console.error(`Failed to fetch models from providers: ${sanitizeApiError(error)}`); // Hiding full error traces in v1.2.1
                        throw new types_1.ApiError("Failed to fetch models from providers: ".concat((0, error_sanitizer_1.sanitizeApiError)(error_2)));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get list of enabled providers
     */
    ModelManager.prototype.getEnabledProviders = function () {
        var providers = [];
        var providerState = this.configManager.getAtomicProviderState();
        if (providerState.synthetic.available) {
            providers.push("synthetic");
        }
        if (providerState.minimax.available) {
            providers.push("minimax");
        }
        return providers;
    };
    /**
     * Get count of enabled providers
     */
    ModelManager.prototype.getEnabledProvidersCount = function () {
        return this.getEnabledProviders().length;
    };
    /**
     * Fetch models from Synthetic API (existing implementation)
     */
    ModelManager.prototype.fetchFromSyntheticApi = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, apiKey, headers, response, modelsData, models, _i, modelsData_1, modelData, model, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = this.configManager.getProviderConfig("synthetic");
                        apiKey = this.configManager.getSyntheticApiKey();
                        if (!apiKey) {
                            console.warn("No Synthetic API key configured");
                            return [2 /*return*/, []];
                        }
                        if (!config) {
                            console.warn("Synthetic provider configuration not available");
                            return [2 /*return*/, []];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        headers = {
                            Authorization: "Bearer ".concat(apiKey),
                            "Content-Type": "application/json",
                        };
                        return [4 /*yield*/, axios_1.default.get(config.modelsApiUrl, {
                                headers: headers,
                                timeout: 30000,
                            })];
                    case 2:
                        response = _a.sent();
                        if (response.status === 200) {
                            modelsData = response.data.data || [];
                            models = [];
                            for (_i = 0, modelsData_1 = modelsData; _i < modelsData_1.length; _i++) {
                                modelData = modelsData_1[_i];
                                try {
                                    model = new info_1.ModelInfoImpl(__assign(__assign({}, modelData), { provider: "synthetic" }));
                                    models.push(model);
                                }
                                catch (error) {
                                    console.warn("Invalid Synthetic model data: ".concat(modelData.id || "unknown", ":"), error);
                                }
                            }
                            return [2 /*return*/, models];
                        }
                        else {
                            throw new types_1.ApiError("Synthetic API error: ".concat(response.status, " - ").concat(response.statusText), response.status, response.data);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        if (axios_1.default.isAxiosError(error_4)) {
                            if (error_4.response) {
                                throw new types_1.ApiError("Synthetic API error: ".concat(error_4.response.status, " - ").concat(error_4.response.statusText), error_4.response.status, error_4.response.data);
                            }
                            else if (error_4.request) {
                                throw new types_1.ApiError("Synthetic network error: No response received from API");
                            }
                            else {
                                throw new types_1.ApiError("Synthetic network error: ".concat(error_4.message));
                            }
                        }
                        throw new types_1.ApiError("Error fetching Synthetic models: ".concat((0, error_sanitizer_1.sanitizeApiError)(error_4)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch models from MiniMax API
     */
    ModelManager.prototype.fetchFromMiniMaxApi = function () {
        return __awaiter(this, void 0, void 0, function () {
            var apiKey, minimaxModels, models, _i, minimaxModels_1, modelData, model;
            return __generator(this, function (_a) {
                apiKey = this.configManager.getMinimaxApiKey();
                if (!apiKey) {
                    console.warn("No MiniMax API key configured");
                    return [2 /*return*/, []];
                }
                minimaxModels = [
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
                    },
                ];
                try {
                    models = [];
                    for (_i = 0, minimaxModels_1 = minimaxModels; _i < minimaxModels_1.length; _i++) {
                        modelData = minimaxModels_1[_i];
                        try {
                            model = new info_1.ModelInfoImpl(modelData);
                            models.push(model);
                        }
                        catch (error) {
                            console.warn("Invalid MiniMax model data: ".concat(modelData.id || "unknown", ":"), error);
                        }
                    }
                    return [2 /*return*/, models];
                }
                catch (error) {
                    throw new types_1.ApiError("MiniMax API error: ".concat((0, error_sanitizer_1.sanitizeApiError)(error)));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Remove duplicate models, preferring providers in priority order
     * v1.3.1: Use provider priority from model cards or default to minimax > synthetic for MiniMax models
     */
    ModelManager.prototype.deduplicateModels = function (models) {
        var seen = new Map();
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var model = models_1[_i];
            var existing = seen.get(model.id);
            if (!existing) {
                seen.set(model.id, model);
            }
            else {
                // v1.3.1: Provider priority with MiniMax preference for MiniMax models
                var isMiniMaxModel = model.id.includes("MiniMax") || existing.id.includes("MiniMax");
                var providerPriority = isMiniMaxModel
                    ? { minimax: 2, synthetic: 1 } // MiniMax models prefer minimax provider
                    : { synthetic: 2, minimax: 1 }; // Other models prefer synthetic
                var existingPriority = providerPriority[existing.getProvider()] || 0;
                var newPriority = providerPriority[model.getProvider()] || 0;
                if (newPriority > existingPriority) {
                    seen.set(model.id, model);
                }
            }
        }
        return Array.from(seen.values());
    };
    /**
     * v1.3.1: Get model card for a model ID
     */
    ModelManager.prototype.getModelCard = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var modelCards, card, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.configManager.loadModelCards()];
                    case 1:
                        modelCards = _a.sent();
                        if (!modelCards) {
                            return [2 /*return*/, null];
                        }
                        card = modelCards.cards.find(function (c) { return c.id === modelId; });
                        if (card) {
                            return [2 /*return*/, card];
                        }
                        // Check aliases
                        card = modelCards.cards.find(function (c) { var _a; return (_a = c.aliases) === null || _a === void 0 ? void 0 : _a.includes(modelId); });
                        if (card) {
                            return [2 /*return*/, card];
                        }
                        return [2 /*return*/, null];
                    case 2:
                        error_5 = _a.sent();
                        console.warn("Failed to get model card:", error_5);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * v1.3.1: Get provider priority from model cards
     */
    ModelManager.prototype.getProviderPriority = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelCards, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.configManager.loadModelCards()];
                    case 1:
                        modelCards = _a.sent();
                        if (modelCards && modelCards.providerPriority) {
                            return [2 /*return*/, modelCards.providerPriority];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3: 
                    // Default priority: minimax first for M1/M2, then synthetic
                    return [2 /*return*/, ["minimax", "synthetic"]];
                }
            });
        });
    };
    ModelManager.prototype.getModels = function (models) {
        if (!models) {
            throw new Error("Models must be provided or fetched first");
        }
        // Sort models: minimax first, then by provider, then by ID
        return __spreadArray([], models, true).sort(function (a, b) {
            var _a, _b;
            var providerOrder = {
                minimax: 0,
                synthetic: 1,
            };
            var aOrder = (_a = providerOrder[a.getProvider()]) !== null && _a !== void 0 ? _a : 2;
            var bOrder = (_b = providerOrder[b.getProvider()]) !== null && _b !== void 0 ? _b : 2;
            if (aOrder !== bOrder)
                return aOrder - bOrder;
            return a.id.localeCompare(b.id);
        });
    };
    ModelManager.prototype.searchModels = function (query, models) {
        return __awaiter(this, void 0, void 0, function () {
            var queryLower, matchingModels, _i, models_2, model, searchText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!models) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fetchModels(false)];
                    case 1:
                        models = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!query) {
                            return [2 /*return*/, this.getModels(models)];
                        }
                        queryLower = query.toLowerCase();
                        matchingModels = [];
                        for (_i = 0, models_2 = models; _i < models_2.length; _i++) {
                            model = models_2[_i];
                            searchText = [
                                model.id.toLowerCase(),
                                model.getProvider().toLowerCase(),
                                model.getModelName().toLowerCase(),
                            ].join(" ");
                            if (searchText.includes(queryLower)) {
                                matchingModels.push(model);
                            }
                        }
                        // Sort results by ID
                        return [2 /*return*/, matchingModels.sort(function (a, b) { return a.id.localeCompare(b.id); })];
                }
            });
        });
    };
    ModelManager.prototype.getModelById = function (modelId, models) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!models) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fetchModels(false)];
                    case 1:
                        models = _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, models.find(function (model) { return model.id === modelId; }) || null];
                }
            });
        });
    };
    ModelManager.prototype.clearCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.cache.clear()];
            });
        });
    };
    ModelManager.prototype.clearProviderCache = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (provider) {
                    // In a future implementation, we could have per-provider cache files
                    // For now, clear the entire cache when provider-specific clearing is requested
                    return [2 /*return*/, this.cache.clear()];
                }
                return [2 /*return*/, this.clearCache()];
            });
        });
    };
    ModelManager.prototype.getCacheInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.cache.getAnalytics()];
            });
        });
    };
    /**
     * Get cache info with full analytics
     */
    ModelManager.prototype.getCacheAnalytics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.cache.getAnalytics()];
            });
        });
    };
    /**
     * Check if cache needs intelligent refresh
     */
    ModelManager.prototype.shouldRefreshCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.cache.needsRefresh()];
            });
        });
    };
    /**
     * Get comprehensive model statistics
     */
    ModelManager.prototype.getModelStatistics = function (models) {
        return __awaiter(this, void 0, void 0, function () {
            var stats, _i, models_3, model, provider, capabilities, _a, capabilities_1, capability;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!models) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fetchModels(false)];
                    case 1:
                        models = _b.sent();
                        _b.label = 2;
                    case 2:
                        stats = {
                            total: models.length,
                            byProvider: {},
                            claudeCompatible: 0,
                            byCapability: {},
                        };
                        for (_i = 0, models_3 = models; _i < models_3.length; _i++) {
                            model = models_3[_i];
                            provider = model.getProvider();
                            stats.byProvider[provider] = (stats.byProvider[provider] || 0) + 1;
                            // Count Claude-compatible models
                            if (model.isClaudeCompatible()) {
                                stats.claudeCompatible++;
                            }
                            capabilities = model.getProviderCapabilities();
                            for (_a = 0, capabilities_1 = capabilities; _a < capabilities_1.length; _a++) {
                                capability = capabilities_1[_a];
                                stats.byCapability[capability] =
                                    (stats.byCapability[capability] || 0) + 1;
                            }
                        }
                        return [2 /*return*/, stats];
                }
            });
        });
    };
    /**
     * Search models with provider and capability filters
     */
    ModelManager.prototype.searchModelsWithFilters = function (params, models) {
        return __awaiter(this, void 0, void 0, function () {
            var filteredModels, capability, query_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!models) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fetchModels(false)];
                    case 1:
                        models = _a.sent();
                        _a.label = 2;
                    case 2:
                        filteredModels = models;
                        // Filter by provider
                        if (params.provider) {
                            filteredModels = filteredModels.filter(function (model) { return model.getProvider() === params.provider; });
                        }
                        capability = params.capability;
                        if (capability) {
                            filteredModels = filteredModels.filter(function (model) {
                                return model.hasCapability(capability);
                            });
                        }
                        // Filter by Claude compatibility
                        if (params.claudeCompatible !== undefined) {
                            filteredModels = filteredModels.filter(function (model) { return model.isClaudeCompatible() === params.claudeCompatible; });
                        }
                        // Text search
                        if (params.query) {
                            query_1 = params.query.toLowerCase();
                            filteredModels = filteredModels.filter(function (model) {
                                var _a;
                                var searchText = [
                                    model.id.toLowerCase(),
                                    model.getProvider().toLowerCase(),
                                    model.getModelName().toLowerCase(),
                                    model.getDisplayName().toLowerCase(),
                                    ((_a = model.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "",
                                ].join(" ");
                                return searchText.includes(query_1);
                            });
                        }
                        return [2 /*return*/, filteredModels.sort(function (a, b) { return a.id.localeCompare(b.id); })];
                }
            });
        });
    };
    /**
     * Get models categorized by provider
     */
    ModelManager.prototype.getCategorizedModels = function (models) {
        if (!models || models.length === 0) {
            throw new Error("Models must be provided or fetched first");
        }
        // At this point, models is guaranteed to be non-null and non-empty
        var validatedModels = models;
        var categorized = {};
        for (var _i = 0, validatedModels_1 = validatedModels; _i < validatedModels_1.length; _i++) {
            var model = validatedModels_1[_i];
            var provider = model.getProvider() || "unknown";
            if (!categorized[provider]) {
                categorized[provider] = [];
            }
            categorized[provider].push(model);
        }
        // Sort models within each category
        for (var provider in categorized) {
            var modelsForProvider = categorized[provider];
            if (modelsForProvider) {
                modelsForProvider.sort(function (a, b) { return a.id.localeCompare(b.id); });
            }
        }
        return categorized;
    };
    /**
     * Get models from specific provider
     */
    ModelManager.prototype.getModelsByProvider = function (provider, models) {
        if (!models) {
            throw new Error("Models must be provided or fetched first");
        }
        return models
            .filter(function (model) { return model.getProvider() === provider; })
            .sort(function (a, b) { return a.id.localeCompare(b.id); });
    };
    /**
     * Force refresh models from specific provider
     */
    ModelManager.prototype.refreshProvider = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.fetchFromProvider(provider, true)];
            });
        });
    };
    return ModelManager;
}());
exports.ModelManager = ModelManager;
