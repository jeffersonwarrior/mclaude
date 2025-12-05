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
exports.ModelCache = void 0;
var promises_1 = require("fs/promises");
var info_1 = require("./info");
var ModelCache = /** @class */ (function () {
    function ModelCache(options) {
        this.cacheFile = options.cacheFile;
        this.cacheDurationMs = options.cacheDurationHours * 60 * 60 * 1000;
    }
    ModelCache.prototype.isValid = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats, mtime, now, age, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, promises_1.stat)(this.cacheFile)];
                    case 1:
                        stats = _a.sent();
                        mtime = stats.mtime;
                        now = new Date();
                        age = now.getTime() - mtime.getTime();
                        return [2 /*return*/, age < this.cacheDurationMs];
                    case 2:
                        error_1 = _a.sent();
                        // File doesn't exist or can't be accessed
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelCache.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, cacheData, modelsData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isValid()];
                    case 1:
                        if (!(_a.sent())) {
                            return [2 /*return*/, []];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, promises_1.readFile)(this.cacheFile, "utf-8")];
                    case 3:
                        data = _a.sent();
                        cacheData = JSON.parse(data);
                        modelsData = cacheData.models || cacheData.data || [];
                        return [2 /*return*/, modelsData.map(function (modelData) { return new info_1.ModelInfoImpl(modelData); })];
                    case 4:
                        error_2 = _a.sent();
                        console.error("Error loading cache:", error_2);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load cache with provider analytics
     */
    ModelCache.prototype.loadWithAnalytics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var models, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1:
                        models = _a.sent();
                        return [4 /*yield*/, this.getInfoExtended()];
                    case 2:
                        info = _a.sent();
                        return [2 /*return*/, { models: models, analytics: info }];
                }
            });
        });
    };
    ModelCache.prototype.save = function (models) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.saveWithMetadata(models)];
            });
        });
    };
    /**
     * Save models with detailed provider metadata
     */
    ModelCache.prototype.saveWithMetadata = function (models, fetchSources) {
        return __awaiter(this, void 0, void 0, function () {
            var parentDir, providerCounts, providers, _i, models_1, model, provider, lastFetchSources, existingData, existingCache, _a, cacheData, data, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        parentDir = require("path").dirname(this.cacheFile);
                        return [4 /*yield*/, (0, promises_1.mkdir)(parentDir, { recursive: true })];
                    case 1:
                        _b.sent();
                        providerCounts = {};
                        providers = [];
                        for (_i = 0, models_1 = models; _i < models_1.length; _i++) {
                            model = models_1[_i];
                            provider = model.getProvider();
                            providerCounts[provider] = (providerCounts[provider] || 0) + 1;
                            if (!providers.includes(provider)) {
                                providers.push(provider);
                            }
                        }
                        lastFetchSources = [];
                        // Add current fetch sources with timestamp
                        if (fetchSources) {
                            lastFetchSources = fetchSources.map(function (source) { return (__assign(__assign({}, source), { timestamp: new Date().toISOString() })); });
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, promises_1.readFile)(this.cacheFile, "utf-8")];
                    case 3:
                        existingData = _b.sent();
                        existingCache = JSON.parse(existingData);
                        if (existingCache.lastFetchSources) {
                            // Keep recent fetch sources, add new ones at the beginning
                            lastFetchSources = __spreadArray(__spreadArray([], lastFetchSources, true), existingCache.lastFetchSources.slice(0, 9), true);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        cacheData = {
                            models: models.map(function (model) { return model.toJSON(); }),
                            timestamp: new Date().toISOString(),
                            count: models.length,
                            providers: providers,
                            providerCounts: providerCounts,
                            lastFetchSources: lastFetchSources,
                            cacheVersion: 2,
                        };
                        data = JSON.stringify(cacheData, null, 2);
                        return [4 /*yield*/, (0, promises_1.writeFile)(this.cacheFile, data, "utf-8")];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 7:
                        error_3 = _b.sent();
                        console.error("Error saving cache:", error_3);
                        return [2 /*return*/, false];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ModelCache.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, promises_1.unlink)(this.cacheFile)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_4 = _a.sent();
                        console.error("Error clearing cache:", error_4);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelCache.prototype.getInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats, models, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, (0, promises_1.stat)(this.cacheFile)];
                    case 1:
                        stats = _b.sent();
                        return [4 /*yield*/, this.load()];
                    case 2:
                        models = _b.sent();
                        _a = {
                            exists: true,
                            filePath: this.cacheFile,
                            modifiedTime: stats.mtime.toISOString(),
                            sizeBytes: stats.size,
                            modelCount: models.length
                        };
                        return [4 /*yield*/, this.isValid()];
                    case 3: return [2 /*return*/, (_a.isValid = _b.sent(),
                            _a)];
                    case 4:
                        error_5 = _b.sent();
                        return [2 /*return*/, {
                                exists: false,
                                error: error_5.message,
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get extended cache information with provider analytics
     */
    ModelCache.prototype.getInfoExtended = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats, data, cacheData, baseInfo, providers, providerCounts, lastFetchSources, cacheVersion, tempProviderCounts, _i, _a, model, provider, error_6;
            var _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, (0, promises_1.stat)(this.cacheFile)];
                    case 1:
                        stats = _d.sent();
                        return [4 /*yield*/, (0, promises_1.readFile)(this.cacheFile, "utf-8")];
                    case 2:
                        data = _d.sent();
                        cacheData = JSON.parse(data);
                        _b = {
                            exists: true,
                            filePath: this.cacheFile,
                            modifiedTime: stats.mtime.toISOString(),
                            sizeBytes: stats.size,
                            modelCount: cacheData.count || ((_c = cacheData.models) === null || _c === void 0 ? void 0 : _c.length) || 0
                        };
                        return [4 /*yield*/, this.isValid()];
                    case 3:
                        baseInfo = (_b.isValid = _d.sent(),
                            _b);
                        providers = [];
                        providerCounts = {};
                        lastFetchSources = [];
                        cacheVersion = 1;
                        if (cacheData.providers && Array.isArray(cacheData.providers)) {
                            providers = cacheData.providers;
                            providerCounts = cacheData.providerCounts || {};
                            lastFetchSources = cacheData.lastFetchSources || [];
                            cacheVersion = cacheData.cacheVersion || 1;
                        }
                        else if (cacheData.models && Array.isArray(cacheData.models)) {
                            tempProviderCounts = {};
                            for (_i = 0, _a = cacheData.models; _i < _a.length; _i++) {
                                model = _a[_i];
                                provider = model.provider || "unknown";
                                tempProviderCounts[provider] =
                                    (tempProviderCounts[provider] || 0) + 1;
                                if (!providers.includes(provider)) {
                                    providers.push(provider);
                                }
                            }
                            providerCounts = tempProviderCounts;
                        }
                        return [2 /*return*/, __assign(__assign({}, baseInfo), { providers: providers, providerCounts: providerCounts, lastFetchSources: lastFetchSources, multiProviderSupport: true, cacheVersion: cacheVersion })];
                    case 4:
                        error_6 = _d.sent();
                        return [2 /*return*/, {
                                exists: false,
                                error: error_6.message,
                                multiProviderSupport: true,
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get cache analytics and performance metrics
     */
    ModelCache.prototype.getAnalytics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var info, fetchSuccessRate, averageModelsPerFetch, cacheEfficiency, successfulFetches, totalModels, ageMs, ageHours;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getInfoExtended()];
                    case 1:
                        info = _a.sent();
                        fetchSuccessRate = 0;
                        averageModelsPerFetch = 0;
                        cacheEfficiency = 0;
                        if (info.lastFetchSources && info.lastFetchSources.length > 0) {
                            successfulFetches = info.lastFetchSources.filter(function (source) { return source.success; });
                            fetchSuccessRate =
                                (successfulFetches.length / info.lastFetchSources.length) * 100;
                            totalModels = info.lastFetchSources.reduce(function (sum, source) { return sum + source.modelCount; }, 0);
                            averageModelsPerFetch = totalModels / info.lastFetchSources.length;
                            if (info.modelCount && info.modelCount > 0) {
                                ageMs = Date.now() - new Date(info.modifiedTime || "").getTime();
                                ageHours = ageMs / (1000 * 60 * 60);
                                cacheEfficiency =
                                    info.modelCount > 10 ? Math.max(0, 100 - ageHours * 4) : 0; // Decay over time
                            }
                        }
                        return [2 /*return*/, __assign(__assign({}, info), { fetchSuccessRate: fetchSuccessRate, averageModelsPerFetch: averageModelsPerFetch, cacheEfficiency: cacheEfficiency })];
                }
            });
        });
    };
    /**
     * Intelligent cache refresh based on provider activity and age
     */
    ModelCache.prototype.needsRefresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var analytics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isValid()];
                    case 1:
                        if (!(_a.sent())) {
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, this.getAnalytics()];
                    case 2:
                        analytics = _a.sent();
                        // If efficiency is low, refresh
                        if (analytics.cacheEfficiency < 30) {
                            return [2 /*return*/, true];
                        }
                        // If success rate is low, try refresh
                        if (analytics.fetchSuccessRate < 50) {
                            return [2 /*return*/, true];
                        }
                        // Default age-based refresh
                        return [2 /*return*/, false];
                }
            });
        });
    };
    return ModelCache;
}());
exports.ModelCache = ModelCache;
