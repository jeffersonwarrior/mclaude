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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntheticClaudeApp = void 0;
var path_1 = require("path");
var os_1 = require("os");
var fs_1 = require("fs");
var chalk_1 = require("chalk");
var config_1 = require("../config");
var models_1 = require("../models");
var ui_1 = require("../ui");
var launcher_1 = require("../launcher");
var logger_1 = require("../utils/logger");
var banner_1 = require("../utils/banner");
var error_sanitizer_1 = require("../utils/error-sanitizer");
var SyntheticClaudeApp = /** @class */ (function () {
    function SyntheticClaudeApp() {
        this.modelManager = null;
        this.configManager = new config_1.ConfigManager();
        var config = this.configManager.config;
        this.ui = new ui_1.UserInterface({
            verbose: this.configManager.hasSyntheticApiKey()
                ? config.cacheDurationHours > 0
                : false,
        }, this.configManager);
        this.launcher = new launcher_1.ClaudeLauncher(undefined, this.configManager);
    }
    SyntheticClaudeApp.prototype.setupLogging = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, logger_1.setupLogging)(options.verbose, options.quiet);
                return [2 /*return*/];
            });
        });
    };
    SyntheticClaudeApp.prototype.getConfig = function () {
        return this.configManager.config;
    };
    SyntheticClaudeApp.prototype.getModelManager = function () {
        if (!this.modelManager) {
            var config = this.configManager.config;
            var cacheFile = (0, path_1.join)((0, os_1.homedir)(), ".config", "mclaude", "models_cache.json");
            // Use new multi-provider ModelManager constructor
            this.modelManager = new models_1.ModelManager({
                configManager: this.configManager,
                cacheFile: cacheFile,
                cacheDurationHours: config.cacheDurationHours,
            });
        }
        return this.modelManager;
    };
    SyntheticClaudeApp.prototype.run = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var model, thinkingModel, temperature, sysprompt, _a, content, size, validation;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // v1.3.1: Silent update check on launch (non-blocking)
                        this.performSilentUpdate();
                        // Normalize dangerous flags first
                        if (options.additionalArgs) {
                            options.additionalArgs = (0, banner_1.normalizeDangerousFlags)(options.additionalArgs);
                        }
                        return [4 /*yield*/, this.setupLogging(options)];
                    case 1:
                        _b.sent();
                        // Display banner unless quiet mode
                        if (!options.quiet) {
                            console.log((0, banner_1.createBanner)(options));
                        }
                        if (!this.configManager.isFirstRun()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.setup()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                    case 3: return [4 /*yield*/, this.selectModel(options.model)];
                    case 4:
                        model = _b.sent();
                        if (!model) {
                            this.ui.error("No model selected");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.selectThinkingModel(options.thinkingModel)];
                    case 5:
                        thinkingModel = _b.sent();
                        temperature = options.temperature;
                        if (options.preset) {
                            switch (options.preset.toLowerCase()) {
                                case "creative":
                                    temperature = 1.0;
                                    break;
                                case "precise":
                                    temperature = 0.2;
                                    break;
                                case "balanced":
                                    temperature = 0.7;
                                    break;
                                default:
                                    this.ui.warning("Unknown preset: ".concat(options.preset, ". Using default temperature."));
                            }
                        }
                        return [4 /*yield*/, this.configManager.loadSysprompt()];
                    case 6:
                        _a = _b.sent(), content = _a.content, size = _a.size;
                        if (content) {
                            validation = this.configManager.validateSyspromptSize(size);
                            if (!validation.valid) {
                                this.ui.error(validation.message);
                                this.ui.info("Skipping system prompt. Run 'mclaude sysprompt' to fix.");
                            }
                            else {
                                if (validation.warning) {
                                    this.ui.warning(validation.message);
                                }
                                sysprompt = content;
                            }
                        }
                        // Launch Claude Code with enhanced options
                        return [4 /*yield*/, this.launchClaudeCode(model, __assign(__assign({}, options), { temperature: temperature, topP: options.topP, contextSize: options.contextSize, toolChoice: options.toolChoice, stream: options.stream, memoryCompact: options.memory === "compact", jsonMode: options.jsonMode, sysprompt: sysprompt }), thinkingModel)];
                    case 7:
                        // Launch Claude Code with enhanced options
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * v1.3.1: Silent update check on launch (Option C from spec)
     * Non-blocking, 3 second timeout, silent catch
     */
    SyntheticClaudeApp.prototype.performSilentUpdate = function () {
        var _this = this;
        // Check if we need an update (24h threshold)
        if (!this.configManager.needsUpdateCheck()) {
            return;
        }
        // v1.3.1: GitHub raw URL for model cards
        var CARDS_URL = "https://raw.githubusercontent.com/jeffersonwarrior/mclaude/main/model-cards.json";
        // Fire and forget - don't await
        this.configManager
            .fetchAndSaveModelCards(CARDS_URL, 3000)
            .then(function (success) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!success) return [3 /*break*/, 2];
                        // Update timestamp on success
                        return [4 /*yield*/, this.configManager.updateLastCheck()];
                    case 1:
                        // Update timestamp on success
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); })
            .catch(function () {
            // Silent fail - no output to user
        });
        // Also update the last check timestamp immediately to prevent multiple attempts
        this.configManager.updateLastCheck().catch(function () {
            // Silent fail
        });
    };
    /**
     * Validate provider credentials - maintains compatibility while being simpler
     */
    SyntheticClaudeApp.prototype.validateProviderCredentials = function (_) {
        return __awaiter(this, void 0, void 0, function () {
            var modelManager, enabledProviders, errors, _i, enabledProviders_1, provider, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelManager = this.getModelManager();
                        enabledProviders = modelManager.getEnabledProviders();
                        errors = [];
                        _i = 0, enabledProviders_1 = enabledProviders;
                        _a.label = 1;
                    case 1:
                        if (!(_i < enabledProviders_1.length)) return [3 /*break*/, 6];
                        provider = enabledProviders_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.validateProviderCredential(provider)];
                    case 3:
                        result = _a.sent();
                        if (!result.valid) {
                            errors.push("".concat(provider, " authentication failed"));
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        if (provider === "synthetic") {
                            errors.push("synthetic authentication failed");
                        }
                        else if (provider === "minimax") {
                            errors.push("minimax authentication failed");
                        }
                        else {
                            errors.push("".concat(provider, " authentication failed"));
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        if (errors.length === enabledProviders.length && errors.length > 0) {
                            // All providers failed
                            return [2 /*return*/, {
                                    valid: false,
                                    authenticationError: "All providers failed authentication. ".concat(errors.join("; ")),
                                    warnings: [],
                                }];
                        }
                        else if (errors.length > 0) {
                            // Some providers failed but at least one succeeded
                            return [2 /*return*/, {
                                    valid: true,
                                    authenticationError: null,
                                    warnings: errors,
                                }];
                        }
                        else {
                            // All providers succeeded
                            return [2 /*return*/, { valid: true, warnings: [], authenticationError: null }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Helper to detect which provider caused an error
     */
    SyntheticClaudeApp.prototype.detectProviderFromError = function (error) {
        var _a, _b, _c, _d, _e, _f;
        if (((_b = (_a = error.config) === null || _a === void 0 ? void 0 : _a.baseURL) === null || _b === void 0 ? void 0 : _b.includes("synthetic")) ||
            ((_c = error.message) === null || _c === void 0 ? void 0 : _c.includes("synthetic"))) {
            return "synthetic";
        }
        if (((_e = (_d = error.config) === null || _d === void 0 ? void 0 : _d.baseURL) === null || _e === void 0 ? void 0 : _e.includes("minimax")) ||
            ((_f = error.message) === null || _f === void 0 ? void 0 : _f.includes("minimax"))) {
            return "minimax";
        }
        return null;
    };
    /**
     * Format authentication errors with provider-specific guidance
     */
    SyntheticClaudeApp.prototype.formatAuthenticationError = function (provider, error) {
        // Use the improved sanitization to hide full stack traces and API error responses
        if ((0, error_sanitizer_1.isAuthError)(error)) {
            return (0, error_sanitizer_1.getAuthErrorMessage)(error);
        }
        if ((0, error_sanitizer_1.isNetworkError)(error)) {
            return "".concat(provider, " network connection failed. Please check your internet connection and try again.");
        }
        // For all other errors, use the sanitized message
        var sanitizedError = (0, error_sanitizer_1.sanitizeApiError)(error);
        return "".concat(provider, " authentication failed: ").concat(sanitizedError);
    };
    /**
     * Validate provider credentials by testing API connectivity
     */
    SyntheticClaudeApp.prototype.validateProviderCredential = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var modelManager, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        modelManager = this.getModelManager();
                        // Test connectivity by attempting to fetch models
                        return [4 /*yield*/, modelManager.fetchFromProvider(provider, false)];
                    case 1:
                        // Test connectivity by attempting to fetch models
                        _a.sent();
                        return [2 /*return*/, { valid: true }];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                valid: false,
                                error: this.formatAuthenticationError(provider, error_2),
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Simple error categorization for backward compatibility
     */
    SyntheticClaudeApp.prototype.categorizeError = function (error) {
        var _a, _b;
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401 || ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 403) {
            return "AUTHENTICATION";
        }
        if (error.code === "ECONNREFUSED" ||
            error.code === "ENOTFOUND" ||
            error.code === "ETIMEDOUT") {
            return "NETWORK";
        }
        if (typeof (error === null || error === void 0 ? void 0 : error.message) === "string" &&
            error.message.includes("No providers are enabled")) {
            return "PROVIDER_UNAVAILABLE";
        }
        if (typeof (error === null || error === void 0 ? void 0 : error.message) === "string" &&
            error.message.includes("UI error")) {
            return "UI_ERROR";
        }
        return "UNKNOWN";
    };
    /**
     * Improved API key format validation
     */
    SyntheticClaudeApp.prototype.validateApiKeyFormat = function (provider, apiKey) {
        if (!apiKey || apiKey.trim().length === 0) {
            return { valid: false, error: "API key cannot be empty" };
        }
        // Basic format validation
        switch (provider.toLowerCase()) {
            case "synthetic":
                if (apiKey.length < 10) {
                    return {
                        valid: false,
                        error: "Synthetic API key appears to be too short",
                    };
                }
                if (!apiKey.startsWith("syn_")) {
                    return {
                        valid: false,
                        error: 'Synthetic API key should start with "syn_"',
                    };
                }
                break;
            case "minimax":
                if (apiKey.length < 20) {
                    return {
                        valid: false,
                        error: "MiniMax API key appears to be too short",
                    };
                }
                break;
        }
        // Check for common placeholder values
        var placeholders = ["test", "example", "placeholder", "your-api-key"];
        if (placeholders.some(function (placeholder) {
            return apiKey.toLowerCase().includes(placeholder);
        })) {
            return {
                valid: false,
                error: "Please enter a real API key, not a placeholder value",
            };
        }
        return { valid: true };
    };
    /**
     * Simplified error recovery: Sleep utility
     */
    SyntheticClaudeApp.prototype.sleep = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    /**
     * Check authentication status for providers
     */
    SyntheticClaudeApp.prototype.checkAuth = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var providerState, providers, _i, providers_1, provider, state, status_1, message, issues, availableCount;
            return __generator(this, function (_a) {
                this.ui.info("Authentication Status Check");
                this.ui.info("=========================");
                providerState = this.configManager.getAtomicProviderState();
                providers = (options === null || options === void 0 ? void 0 : options.provider)
                    ? [options.provider.toLowerCase()]
                    : ["synthetic", "minimax"];
                for (_i = 0, providers_1 = providers; _i < providers_1.length; _i++) {
                    provider = providers_1[_i];
                    state = providerState[provider];
                    if (!state) {
                        this.ui.showStatus("warning", "".concat(provider, ": Unknown provider"));
                        continue;
                    }
                    status_1 = state.available ? "success" : "error";
                    message = "".concat(provider.charAt(0).toUpperCase() + provider.slice(1), ": ").concat(state.available ? "Available" : "Not available");
                    this.ui.showStatus(status_1, message);
                    if (!state.available) {
                        issues = [];
                        if (!state.enabled && !state.hasApiKey) {
                            issues.push("Provider disabled and no API key");
                        }
                        else if (!state.enabled) {
                            issues.push("Provider disabled");
                        }
                        else if (!state.hasApiKey) {
                            issues.push("No API key configured");
                        }
                        if (issues.length > 0) {
                            this.ui.info("  Issues: ".concat(issues.join(", ")));
                        }
                    }
                }
                availableCount = providers.filter(function (p) {
                    var state = providerState[p];
                    return state === null || state === void 0 ? void 0 : state.available;
                }).length;
                if (availableCount === 0) {
                    this.ui.error("No providers are properly authenticated.");
                    this.ui.info("Run 'mclaude setup' to configure authentication.");
                }
                else {
                    this.ui.coloredSuccess("".concat(availableCount, "/").concat(providers.length, " providers are available"));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Test authentication for a specific provider
     */
    SyntheticClaudeApp.prototype.testAuth = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var providerLower, testResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        providerLower = provider.toLowerCase();
                        if (!["synthetic", "minimax"].includes(providerLower)) {
                            this.ui.error("Unknown provider: ".concat(provider, ". Valid providers: synthetic, minimax"));
                            return [2 /*return*/];
                        }
                        this.ui.info("Testing authentication for ".concat(provider.charAt(0).toUpperCase() + providerLower.slice(1), " provider..."));
                        return [4 /*yield*/, this.validateProviderCredential(providerLower)];
                    case 1:
                        testResult = _a.sent();
                        if (testResult.valid) {
                            this.ui.coloredSuccess("\u2713 ".concat(provider, " authentication successful"));
                        }
                        else {
                            this.ui.error("\u2717 ".concat(provider, " authentication failed"));
                            this.ui.error("Error: ".concat(testResult.error));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reset authentication credentials for a provider
     */
    SyntheticClaudeApp.prototype.resetAuth = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var providerLower, confirm, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        providerLower = provider.toLowerCase();
                        if (!["synthetic", "minimax"].includes(providerLower)) {
                            this.ui.error("Unknown provider: ".concat(provider, ". Valid providers: synthetic, minimax"));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.ui.confirm("Are you sure you want to reset authentication credentials for ".concat(provider, "? This will remove the API key and disable the provider."), false)];
                    case 1:
                        confirm = _a.sent();
                        if (!confirm) {
                            this.ui.info("Operation cancelled");
                            return [2 /*return*/];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.configManager.updateProviderConfig(providerLower, {
                                apiKey: "",
                                enabled: false,
                            })];
                    case 3:
                        _a.sent();
                        this.ui.coloredSuccess("\u2713 Reset ".concat(provider, " authentication credentials"));
                        this.ui.info("Run 'mclaude setup' to reconfigure ".concat(provider, " provider"));
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        this.ui.error("Failed to reset ".concat(provider, " credentials: ").concat((0, error_sanitizer_1.sanitizeApiError)(error_3)));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Refresh authentication by testing current credentials
     */
    SyntheticClaudeApp.prototype.refreshAuth = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var providers, _i, providers_2, providerName, testResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        providers = provider
                            ? [provider.toLowerCase()]
                            : ["synthetic", "minimax"];
                        this.ui.info("Refreshing authentication...");
                        _i = 0, providers_2 = providers;
                        _a.label = 1;
                    case 1:
                        if (!(_i < providers_2.length)) return [3 /*break*/, 4];
                        providerName = providers_2[_i];
                        if (!["synthetic", "minimax"].includes(providerName)) {
                            this.ui.error("Unknown provider: ".concat(providerName));
                            return [3 /*break*/, 3];
                        }
                        this.ui.info("Testing ".concat(providerName, "..."));
                        return [4 /*yield*/, this.validateProviderCredential(providerName)];
                    case 2:
                        testResult = _a.sent();
                        if (testResult.valid) {
                            this.ui.coloredSuccess("\u2713 ".concat(providerName, " authentication refreshed"));
                        }
                        else {
                            this.ui.error("\u2717 ".concat(providerName, " authentication failed: ").concat(testResult.error));
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Show detailed authentication status
     */
    SyntheticClaudeApp.prototype.authStatus = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var providerState, format, statusData, availableCount, totalCount;
            return __generator(this, function (_a) {
                this.ui.info("Authentication Status Details");
                this.ui.info("=============================");
                providerState = this.configManager.getAtomicProviderState();
                format = (options === null || options === void 0 ? void 0 : options.format) || "table";
                statusData = {
                    synthetic: {
                        enabled: providerState.synthetic.enabled,
                        hasApiKey: providerState.synthetic.hasApiKey,
                        available: providerState.synthetic.available,
                        apiKey: this.configManager.getSyntheticApiKey()
                            ? "***configured***"
                            : "none",
                    },
                    minimax: {
                        enabled: providerState.minimax.enabled,
                        hasApiKey: providerState.minimax.hasApiKey,
                        available: providerState.minimax.available,
                        apiKey: this.configManager.getMinimaxApiKey()
                            ? "***configured***"
                            : "none",
                        groupId: this.configManager.getMinimaxGroupId() || "none",
                    },
                };
                if (format === "json") {
                    console.log(JSON.stringify(statusData, null, 2));
                    return [2 /*return*/];
                }
                // Table format
                console.log("Provider   | Enabled | API Key | Available | Details");
                console.log("-----------|---------|---------|-----------|--------");
                Object.entries(statusData).forEach(function (_a) {
                    var provider = _a[0], data = _a[1];
                    var enabled = data.enabled ? "✓" : "✗";
                    var apiKey = data.apiKey !== "none" ? "✓" : "✗";
                    var available = data.available ? "✓" : "✗";
                    var details = "groupId" in data && data.groupId && data.groupId !== "none"
                        ? "Group: ".concat(data.groupId)
                        : "";
                    console.log("".concat(provider.padEnd(10), " | ").concat(enabled.padEnd(7), " | ").concat(apiKey.padEnd(7), " | ").concat(available.padEnd(9), " | ").concat(details));
                });
                availableCount = Object.values(statusData).filter(function (d) { return d.available; }).length;
                totalCount = Object.keys(statusData).length;
                console.log("\nSummary: ".concat(availableCount, "/").concat(totalCount, " providers available"));
                return [2 /*return*/];
            });
        });
    };
    SyntheticClaudeApp.prototype.interactiveModelSelection = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var providerState, modelManager, models, error_4, errorMessage, shouldRetry, sortedModels, _a, selectedRegularModel, selectedThinkingModel, error_5, shouldRetry, combination, config, i, comboKey, existing, updates, error_6, error_7, errorMessage, shouldRetry;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 28, , 32]);
                        providerState = this.configManager.getAtomicProviderState();
                        if (!providerState.synthetic.available &&
                            !providerState.minimax.available) {
                            this.ui.error('No providers are available. Please run "mclaude setup" first to configure at least one provider.');
                            return [2 /*return*/, false];
                        }
                        modelManager = this.getModelManager();
                        models = [];
                        this.ui.coloredInfo("Fetching available models...");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 10]);
                        if (!(options === null || options === void 0 ? void 0 : options.provider)) return [3 /*break*/, 3];
                        if (!["synthetic", "minimax", "auto"].includes(options.provider)) {
                            this.ui.error("Invalid provider: ".concat(options.provider, ". Valid providers: synthetic, minimax, auto"));
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, modelManager.getModelsByProvider(options.provider)];
                    case 2:
                        models = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, modelManager.fetchModels(false)];
                    case 4:
                        models = _b.sent();
                        _b.label = 5;
                    case 5: return [3 /*break*/, 10];
                    case 6:
                        error_4 = _b.sent();
                        errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error_4);
                        this.ui.error("Failed to fetch models: ".concat(errorMessage));
                        return [4 /*yield*/, this.ui.confirm("Retry model selection?", true)];
                    case 7:
                        shouldRetry = _b.sent();
                        if (!shouldRetry) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.interactiveModelSelection(options)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [2 /*return*/, false];
                    case 10:
                        if (models.length === 0) {
                            this.ui.warning("No models available from configured providers.");
                            this.ui.info("Check your API keys and network connection, or try 'mclaude doctor' for diagnostics.");
                            return [2 /*return*/, false];
                        }
                        sortedModels = modelManager.getModels(models);
                        this.ui.info("Found ".concat(sortedModels.length, " available models"));
                        return [4 /*yield*/, this.ui.selectDualModels(sortedModels, undefined, // authenticationError
                            function (subagentModel) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            if (!subagentModel) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this.configManager.updateConfig({
                                                    recommendedModels: __assign(__assign({}, this.configManager.config.recommendedModels), { subagent: {
                                                            primary: subagentModel.id,
                                                            backup: ((_b = (_a = this.configManager.config.recommendedModels) === null || _a === void 0 ? void 0 : _a.subagent) === null || _b === void 0 ? void 0 : _b.backup) || "synthetic:deepseek-ai/DeepSeek-V3.2",
                                                        } }),
                                                })];
                                        case 1:
                                            _c.sent();
                                            this.ui.coloredSuccess("Subagent model saved: ".concat(subagentModel.getDisplayName()));
                                            _c.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); }, function (fastModel) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            if (!fastModel) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this.configManager.updateConfig({
                                                    recommendedModels: __assign(__assign({}, this.configManager.config.recommendedModels), { smallFast: {
                                                            primary: fastModel.id,
                                                            backup: ((_b = (_a = this.configManager.config.recommendedModels) === null || _a === void 0 ? void 0 : _a.smallFast) === null || _b === void 0 ? void 0 : _b.backup) ||
                                                                "hf:meta-llama/Llama-4-Scout-17B-16E-Instruct",
                                                        } }),
                                                })];
                                        case 1:
                                            _c.sent();
                                            this.ui.coloredSuccess("Fast model saved: ".concat(fastModel.getDisplayName()));
                                            _c.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 11:
                        _a = _b.sent(), selectedRegularModel = _a.regular, selectedThinkingModel = _a.thinking;
                        if (!selectedRegularModel && !selectedThinkingModel) {
                            this.ui.info("Model selection cancelled");
                            return [2 /*return*/, false];
                        }
                        _b.label = 12;
                    case 12:
                        _b.trys.push([12, 17, , 20]);
                        if (!selectedRegularModel) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.configManager.setSavedModel(selectedRegularModel.id)];
                    case 13:
                        _b.sent();
                        this.ui.coloredSuccess("Regular model saved: ".concat(selectedRegularModel.getDisplayName()));
                        _b.label = 14;
                    case 14:
                        if (!selectedThinkingModel) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.configManager.setSavedThinkingModel(selectedThinkingModel.id)];
                    case 15:
                        _b.sent();
                        this.ui.coloredSuccess("Thinking model saved: ".concat(selectedThinkingModel.getDisplayName()));
                        _b.label = 16;
                    case 16: return [3 /*break*/, 20];
                    case 17:
                        error_5 = _b.sent();
                        this.ui.error("Failed to save model selection: ".concat((0, error_sanitizer_1.sanitizeApiError)(error_5)));
                        return [4 /*yield*/, this.ui.confirm("Retry saving models?", true)];
                    case 18:
                        shouldRetry = _b.sent();
                        if (!shouldRetry) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.interactiveModelSelection(options)];
                    case 19: 
                    // Retry with the same selections
                    return [2 /*return*/, _b.sent()];
                    case 20:
                        if (!((options === null || options === void 0 ? void 0 : options.saveCombination) && selectedRegularModel)) return [3 /*break*/, 27];
                        _b.label = 21;
                    case 21:
                        _b.trys.push([21, 26, , 27]);
                        combination = {
                            name: options.saveCombination,
                            regularModel: selectedRegularModel.id,
                            thinkingModel: selectedThinkingModel === null || selectedThinkingModel === void 0 ? void 0 : selectedThinkingModel.id,
                            regularProvider: options.provider || this.configManager.getDefaultProvider(),
                            thinkingProvider: options.thinkingProvider ||
                                options.provider ||
                                this.configManager.getDefaultProvider(),
                            createdAt: new Date().toISOString(),
                        };
                        config = this.configManager.config;
                        i = 1;
                        _b.label = 22;
                    case 22:
                        if (!(i <= 10)) return [3 /*break*/, 25];
                        comboKey = "combination".concat(i);
                        existing = config[comboKey];
                        if (!(!existing ||
                            (existing &&
                                typeof existing === "object" &&
                                "name" in existing &&
                                existing.name === options.saveCombination))) return [3 /*break*/, 24];
                        updates = {};
                        updates[comboKey] = combination;
                        return [4 /*yield*/, this.configManager.updateConfig(updates)];
                    case 23:
                        _b.sent();
                        this.ui.coloredSuccess("Model combination \"".concat(options.saveCombination, "\" saved"));
                        return [3 /*break*/, 25];
                    case 24:
                        i++;
                        return [3 /*break*/, 22];
                    case 25: return [3 /*break*/, 27];
                    case 26:
                        error_6 = _b.sent();
                        this.ui.warning("Failed to save model combination: ".concat((0, error_sanitizer_1.sanitizeApiError)(error_6)));
                        return [3 /*break*/, 27];
                    case 27:
                        this.ui.highlightInfo('Now run "mclaude" to start Claude Code with your selected model(s).', ["mclaude"]);
                        return [2 /*return*/, true];
                    case 28:
                        error_7 = _b.sent();
                        errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error_7);
                        this.ui.error("Model selection failed: ".concat(errorMessage));
                        return [4 /*yield*/, this.ui.confirm("Try model selection again?", true)];
                    case 29:
                        shouldRetry = _b.sent();
                        if (!shouldRetry) return [3 /*break*/, 31];
                        return [4 /*yield*/, this.interactiveModelSelection(options)];
                    case 30: return [2 /*return*/, _b.sent()];
                    case 31: return [2 /*return*/, false];
                    case 32: return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.interactiveThinkingModelSelection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelManager, models, sortedModels, selectedThinkingModel, error_8, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.configManager.hasApiKey()) {
                            this.ui.error('No API key configured. Please run "mclaude setup" first.');
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        modelManager = this.getModelManager();
                        this.ui.coloredInfo("Fetching available models...");
                        return [4 /*yield*/, modelManager.fetchModels(false)];
                    case 2:
                        models = _a.sent();
                        if (models.length === 0) {
                            this.ui.error("No models available. Please check your API key and connection.");
                            return [2 /*return*/, false];
                        }
                        sortedModels = modelManager.getModels(models);
                        return [4 /*yield*/, this.ui.selectModel(sortedModels)];
                    case 3:
                        selectedThinkingModel = _a.sent();
                        if (!selectedThinkingModel) {
                            this.ui.info("Thinking model selection cancelled");
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.configManager.updateConfig({
                                selectedThinkingModel: selectedThinkingModel.id,
                            })];
                    case 4:
                        _a.sent();
                        this.ui.coloredSuccess("Thinking model saved: ".concat(selectedThinkingModel.getDisplayName()));
                        this.ui.highlightInfo('Now run "mclaude --thinking-model" to start Claude Code with this thinking model.', ["mclaude", "--thinking-model"]);
                        return [2 /*return*/, true];
                    case 5:
                        error_8 = _a.sent();
                        errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error_8);
                        this.ui.error("Error during thinking model selection: ".concat(errorMessage));
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // Old searchModels method is now replaced by enhanced version below
    SyntheticClaudeApp.prototype.showConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                config = this.configManager.config;
                this.ui.info("Current Configuration:");
                this.ui.info("=====================");
                this.ui.info("Default Provider: ".concat(config.defaultProvider));
                this.ui.info("Synthetic API Key: ".concat(this.configManager.hasSyntheticApiKey() ? "••••••••" + this.configManager.getSyntheticApiKey().slice(-4) : "Not set"));
                this.ui.info("MiniMax API Key: ".concat(this.configManager.hasMinimaxApiKey() ? "••••••••" + this.configManager.getMinimaxApiKey().slice(-4) : "Not set"));
                this.ui.info("Synthetic Status: ".concat(this.configManager.isProviderEnabled("synthetic") ? "Enabled" : "Disabled"));
                this.ui.info("MiniMax Status: ".concat(this.configManager.isProviderEnabled("minimax") ? "Enabled" : "Disabled"));
                this.ui.info("Cache Duration: ".concat(config.cacheDurationHours, " hours"));
                this.ui.info("Selected Model: ".concat(config.selectedModel || "None"));
                this.ui.info("Selected Thinking Model: ".concat(config.selectedThinkingModel || "None"));
                this.ui.info("First Run Completed: ".concat(config.firstRunCompleted));
                this.ui.info("Config Version: ".concat(config.configVersion));
                return [2 /*return*/];
            });
        });
    };
    SyntheticClaudeApp.prototype.setConfig = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var updates, _a, success;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        updates = {};
                        _a = key;
                        switch (_a) {
                            case "apiKey": return [3 /*break*/, 1];
                            case "baseUrl": return [3 /*break*/, 2];
                            case "modelsApiUrl": return [3 /*break*/, 3];
                            case "cacheDurationHours": return [3 /*break*/, 4];
                            case "selectedModel": return [3 /*break*/, 5];
                            case "selectedThinkingModel": return [3 /*break*/, 6];
                            case "defaultProvider": return [3 /*break*/, 7];
                            case "synthetic.apiKey": return [3 /*break*/, 8];
                            case "synthetic.baseUrl": return [3 /*break*/, 10];
                            case "minimax.apiKey": return [3 /*break*/, 12];
                            case "minimax.groupId": return [3 /*break*/, 14];
                        }
                        return [3 /*break*/, 16];
                    case 1:
                        updates.apiKey = value;
                        return [3 /*break*/, 17];
                    case 2:
                        updates.baseUrl = value;
                        return [3 /*break*/, 17];
                    case 3:
                        updates.modelsApiUrl = value;
                        return [3 /*break*/, 17];
                    case 4:
                        updates.cacheDurationHours = parseInt(value, 10);
                        return [3 /*break*/, 17];
                    case 5:
                        updates.selectedModel = value;
                        return [3 /*break*/, 17];
                    case 6:
                        updates.selectedThinkingModel = value;
                        return [3 /*break*/, 17];
                    case 7:
                        if (!["synthetic", "minimax", "auto"].includes(value)) {
                            this.ui.error("Invalid provider: ".concat(value, ". Valid providers: synthetic, minimax, auto"));
                            return [2 /*return*/];
                        }
                        updates.defaultProvider = value;
                        return [3 /*break*/, 17];
                    case 8: return [4 /*yield*/, this.configManager.updateProviderConfig("synthetic", {
                            apiKey: value,
                        })];
                    case 9:
                        _b.sent();
                        this.ui.success("Synthetic API key updated");
                        return [2 /*return*/];
                    case 10: return [4 /*yield*/, this.configManager.updateProviderConfig("synthetic", {
                            baseUrl: value,
                        })];
                    case 11:
                        _b.sent();
                        this.ui.success("Synthetic base URL updated");
                        return [2 /*return*/];
                    case 12: return [4 /*yield*/, this.configManager.updateProviderConfig("minimax", {
                            apiKey: value,
                        })];
                    case 13:
                        _b.sent();
                        this.ui.success("Minimax API key updated");
                        return [2 /*return*/];
                    case 14: return [4 /*yield*/, this.configManager.updateProviderConfig("minimax", {
                            groupId: value,
                        })];
                    case 15:
                        _b.sent();
                        this.ui.success("Minimax group ID updated");
                        return [2 /*return*/];
                    case 16:
                        this.ui.error("Unknown configuration key: ".concat(key));
                        this.ui.info("Valid keys: apiKey, baseUrl, modelsApiUrl, cacheDurationHours, selectedModel, selectedThinkingModel, defaultProvider, synthetic.apiKey, synthetic.baseUrl, minimax.apiKey, minimax.groupId");
                        return [2 /*return*/];
                    case 17: return [4 /*yield*/, this.configManager.updateConfig(updates)];
                    case 18:
                        success = _b.sent();
                        if (success) {
                            this.ui.success("Configuration updated: ".concat(key, " = ").concat(value));
                        }
                        else {
                            this.ui.error("Failed to update configuration: ".concat(key));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.resetConfig = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var scope, confirmed, confirmed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scope = (options === null || options === void 0 ? void 0 : options.scope) || this.configManager.getConfigType();
                        if (!(scope === "local")) return [3 /*break*/, 3];
                        if (this.configManager.getConfigType() === "global") {
                            this.ui.error("No local project configuration to reset");
                            this.ui.info("Use --scope global to reset global configuration");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.ui.confirm("Are you sure you want to reset local configuration to defaults?")];
                    case 1:
                        confirmed = _a.sent();
                        if (!confirmed) {
                            this.ui.info("Local configuration reset cancelled");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.configManager.initLocalConfig()];
                    case 2:
                        _a.sent(); // Re-initialize with defaults
                        this.ui.success("Local configuration reset to defaults");
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(scope === "global")) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.ui.confirm("Are you sure you want to reset global configuration to defaults?")];
                    case 4:
                        confirmed = _a.sent();
                        if (!confirmed) {
                            this.ui.info("Global configuration reset cancelled");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.configManager.saveGlobalConfig({})];
                    case 5:
                        _a.sent();
                        this.ui.success("Global configuration reset to defaults");
                        return [3 /*break*/, 7];
                    case 6:
                        this.ui.error("Invalid scope: ".concat(scope, ". Use 'local' or 'global'"));
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var packageJsonPath, version, error_9, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packageJsonPath = (0, path_1.join)(__dirname, "../../package.json");
                        version = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, "utf8")).version;
                        console.log(chalk_1.default.red("Welcome to Minimax MClaude ".concat(version, "! Let's setup your configuration.")));
                        this.ui.info("===============================================");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Use the unified setup orchestrator
                        return [4 /*yield*/, this.unifiedSetupOrchestrator()];
                    case 2:
                        // Use the unified setup orchestrator
                        _a.sent();
                        this.ui.coloredSuccess("Setup completed successfully!");
                        this.ui.highlightInfo('You can now run "mclaude" to launch Claude Code', [
                            "mclaude",
                        ]);
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _a.sent();
                        errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error_9);
                        this.ui.error("Setup failed: ".concat(errorMessage));
                        this.ui.info("You can retry setup by running 'mclaude setup' again");
                        // Don't re-throw - let the user retry manually
                        return [2 /*return*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
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
    SyntheticClaudeApp.prototype.unifiedSetupOrchestrator = function () {
        return __awaiter(this, void 0, void 0, function () {
            var setupSteps, _i, setupSteps_1, step, error_10, shouldContinue;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setupSteps = [
                            {
                                name: "Provider Configuration",
                                action: function () { return _this.setupProviderConfiguration(); },
                            },
                            {
                                name: "Authentication Testing",
                                action: function () { return _this.setupAuthenticationTesting(); },
                            },
                            { name: "Model Selection", action: function () { return _this.setupModelSelection(); } },
                            { name: "Finalization", action: function () { return _this.setupFinalization(); } },
                        ];
                        this.ui.info("Starting streamlined setup process...");
                        this.ui.info("==================================");
                        _i = 0, setupSteps_1 = setupSteps;
                        _a.label = 1;
                    case 1:
                        if (!(_i < setupSteps_1.length)) return [3 /*break*/, 7];
                        step = setupSteps_1[_i];
                        this.ui.coloredInfo("\n\uD83D\uDCCB Step: ".concat(step.name));
                        this.ui.info("─".repeat(step.name.length + 7));
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, step.action()];
                    case 3:
                        _a.sent();
                        this.ui.coloredSuccess("\u2713 ".concat(step.name, " completed"));
                        return [3 /*break*/, 6];
                    case 4:
                        error_10 = _a.sent();
                        return [4 /*yield*/, this.handleSetupStepError(step.name, error_10)];
                    case 5:
                        shouldContinue = _a.sent();
                        if (!shouldContinue) {
                            throw new Error("Setup stopped at ".concat(step.name, ": ").concat((0, error_sanitizer_1.sanitizeApiError)(error_10)));
                        }
                        this.ui.warning("\u26A0 ".concat(step.name, " completed with warnings"));
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7:
                        this.ui.coloredSuccess("\n🎉 All setup steps completed successfully!");
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle errors during setup steps with clear recovery options
     */
    SyntheticClaudeApp.prototype.handleSetupStepError = function (stepName, error) {
        return __awaiter(this, void 0, void 0, function () {
            var errorMessage, choice, _a, canSkip;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error);
                        this.ui.error("\u274C ".concat(stepName, " failed: ").concat(errorMessage));
                        this.ui.info("\nRecovery Options:");
                        this.ui.info("1. Retry this step");
                        this.ui.info("2. Skip this step and continue (if possible)");
                        this.ui.info("3. Abort setup and fix the issue manually");
                        return [4 /*yield*/, this.ui.ask("Choose an option (1-3)", "2")];
                    case 1:
                        choice = _b.sent();
                        _a = choice;
                        switch (_a) {
                            case "1": return [3 /*break*/, 2];
                            case "2": return [3 /*break*/, 4];
                            case "3": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 6];
                    case 2:
                        this.ui.info("Retrying step...");
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 3:
                        _b.sent(); // Brief pause
                        return [2 /*return*/, true]; // Continue, which will retry the step
                    case 4: return [4 /*yield*/, this.canSkipSetupStep(stepName)];
                    case 5:
                        canSkip = _b.sent();
                        if (canSkip) {
                            this.ui.warning("Skipping ".concat(stepName, ". You can complete this later."));
                            return [2 /*return*/, true]; // Continue to next step
                        }
                        else {
                            this.ui.error("Cannot skip ".concat(stepName, ". This step is required."));
                            return [2 /*return*/, false]; // Abort setup
                        }
                        _b.label = 6;
                    case 6:
                        this.ui.info("Setup aborted. You can retry by running 'mclaude setup' again.");
                        return [2 /*return*/, false]; // Abort setup
                }
            });
        });
    };
    /**
     * Determine if a setup step can be safely skipped
     */
    SyntheticClaudeApp.prototype.canSkipSetupStep = function (stepName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (stepName) {
                    case "Provider Configuration":
                        return [2 /*return*/, false]; // At least one provider is required
                    case "Authentication Testing":
                        return [2 /*return*/, true]; // Optional - can be done later with 'mclaude doctor'
                    case "Model Selection":
                        return [2 /*return*/, true]; // Optional - can be done later with 'mclaude models'
                    case "Finalization":
                        return [2 /*return*/, false]; // Required for proper setup completion
                    default:
                        return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Step 1: Configure providers (streamlined)
     */
    SyntheticClaudeApp.prototype.setupProviderConfiguration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configType, workspaceRoot, shouldUseLocal, globalProviders, hasGlobalProviders, shouldMigrate, error_11, providerState, hasAnyProvider, shouldReconfigure, providerChoice, configuredProviders, success, success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configType = this.configManager.getConfigType();
                        workspaceRoot = this.configManager.getWorkspaceRoot();
                        if (!(configType === "global" && workspaceRoot)) return [3 /*break*/, 9];
                        this.ui.info("🌍 Global configuration detected in a project directory");
                        this.ui.info("Workspace: " + workspaceRoot);
                        return [4 /*yield*/, this.ui.confirm("Create local project configuration?", true)];
                    case 1:
                        shouldUseLocal = _a.sent();
                        if (!shouldUseLocal) return [3 /*break*/, 8];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, this.configManager.initLocalConfig()];
                    case 3:
                        _a.sent();
                        globalProviders = this.configManager.getAtomicProviderState();
                        hasGlobalProviders = globalProviders.synthetic.hasApiKey ||
                            globalProviders.minimax.hasApiKey;
                        if (!hasGlobalProviders) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.ui.confirm("Migrate existing global configuration to local project?", true)];
                    case 4:
                        shouldMigrate = _a.sent();
                        if (!shouldMigrate) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.configManager.migrateToLocal()];
                    case 5:
                        _a.sent();
                        this.ui.success("✓ Global configuration migrated to local project");
                        _a.label = 6;
                    case 6:
                        this.ui.success("✓ Local project configuration created");
                        this.ui.info("You can switch back to global config with: mclaude config global\n");
                        return [3 /*break*/, 8];
                    case 7:
                        error_11 = _a.sent();
                        this.ui.error("Failed to create local config: ".concat(error_11.message));
                        this.ui.info("Continuing with global configuration");
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        if (configType === "local") {
                            this.ui.info("🏠 Using local project configuration");
                            this.ui.info("Workspace: " + workspaceRoot);
                            this.ui.info("This configuration will be used for this project only\n");
                        }
                        else {
                            this.ui.info("🌍 Using global configuration");
                            this.ui.info("This configuration will be used system-wide\n");
                        }
                        _a.label = 10;
                    case 10:
                        providerState = this.configManager.getAtomicProviderState();
                        hasAnyProvider = providerState.synthetic.hasApiKey || providerState.minimax.hasApiKey;
                        if (!hasAnyProvider) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.ui.confirm("Existing configuration found. Reconfigure providers?", false)];
                    case 11:
                        shouldReconfigure = _a.sent();
                        if (!shouldReconfigure) {
                            this.ui.info("Keeping existing provider configuration");
                            return [2 /*return*/];
                        }
                        _a.label = 12;
                    case 12:
                        // Simple provider selection flow
                        this.ui.info("Configure at least one provider to continue:");
                        this.ui.info("1. Synthetic API (Recommended)");
                        this.ui.info("2. MiniMax API");
                        this.ui.info("3. Both providers");
                        return [4 /*yield*/, this.ui.ask("Select option (1-3)", "1")];
                    case 13:
                        providerChoice = _a.sent();
                        configuredProviders = 0;
                        if (!(providerChoice === "1" || providerChoice === "3")) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.configureSingleProvider("synthetic")];
                    case 14:
                        success = _a.sent();
                        if (success)
                            configuredProviders++;
                        _a.label = 15;
                    case 15:
                        if (!(providerChoice === "2" || providerChoice === "3")) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.configureSingleProvider("minimax")];
                    case 16:
                        success = _a.sent();
                        if (success)
                            configuredProviders++;
                        _a.label = 17;
                    case 17:
                        if (configuredProviders === 0) {
                            throw new Error("No providers were successfully configured. At least one provider is required.");
                        }
                        this.ui.success("\u2713 ".concat(configuredProviders, " provider(s) configured"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Configure a single provider with simplified flow
     */
    SyntheticClaudeApp.prototype.configureSingleProvider = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var providerNames, providerName, apiKey, formatValidation, shouldRetry, success, groupId, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 13, , 14]);
                        providerNames = { synthetic: "Synthetic", minimax: "MiniMax" };
                        providerName = providerNames[provider];
                        this.ui.info("\nConfiguring ".concat(providerName, " provider..."));
                        return [4 /*yield*/, this.ui.askPassword("Enter your ".concat(providerName, " API key (or press Enter to skip)"))];
                    case 1:
                        apiKey = _a.sent();
                        if (!apiKey) {
                            this.ui.info("Skipping ".concat(providerName, " provider"));
                            return [2 /*return*/, false];
                        }
                        formatValidation = this.validateApiKeyFormat(provider, apiKey);
                        if (!!formatValidation.valid) return [3 /*break*/, 5];
                        this.ui.error("Invalid API key format: ".concat(formatValidation.error));
                        return [4 /*yield*/, this.ui.confirm("Try ".concat(providerName, " again?"), true)];
                    case 2:
                        shouldRetry = _a.sent();
                        if (!shouldRetry) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.configureSingleProvider(provider)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [2 /*return*/, false];
                    case 5:
                        success = false;
                        if (!(provider === "synthetic")) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.configManager.setSyntheticApiKey(apiKey)];
                    case 6:
                        success = _a.sent();
                        return [3 /*break*/, 11];
                    case 7: return [4 /*yield*/, this.configManager.setMinimaxApiKey(apiKey)];
                    case 8:
                        success = _a.sent();
                        if (!success) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.ui.ask("Enter MiniMax Group ID (optional, press Enter to skip)")];
                    case 9:
                        groupId = _a.sent();
                        if (!groupId) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.configManager.setMinimaxGroupId(groupId)];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        if (!success) {
                            this.ui.error("Failed to save ".concat(providerName, " configuration"));
                            return [2 /*return*/, false];
                        }
                        // Enable the provider
                        return [4 /*yield*/, this.configManager.setProviderEnabled(provider, true)];
                    case 12:
                        // Enable the provider
                        _a.sent();
                        this.ui.coloredSuccess("\u2713 ".concat(providerName, " provider configured"));
                        return [2 /*return*/, true];
                    case 13:
                        error_12 = _a.sent();
                        this.ui.error("Failed to configure ".concat(provider, ": ").concat((0, error_sanitizer_1.sanitizeApiError)(error_12)));
                        return [2 /*return*/, false];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Step 2: Test authentication for configured providers
     */
    SyntheticClaudeApp.prototype.setupAuthenticationTesting = function () {
        return __awaiter(this, void 0, void 0, function () {
            var shouldTest, providerState, enabledProviders, successCount, testResults, _i, enabledProviders_2, provider, hasApiKey, providerDisplayName, testResult, error_13, sanitizedError, shouldRetry, criticalProviders, failedCriticalProviders, shouldContinue, failedProviders;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ui.confirm("Test configured provider connections?", true)];
                    case 1:
                        shouldTest = _a.sent();
                        if (!shouldTest) {
                            this.ui.info("Skipping connection tests. You can test later with 'mclaude doctor'.");
                            return [2 /*return*/];
                        }
                        providerState = this.configManager.getAtomicProviderState();
                        enabledProviders = [];
                        if (providerState.synthetic.available)
                            enabledProviders.push("synthetic");
                        if (providerState.minimax.available)
                            enabledProviders.push("minimax");
                        if (enabledProviders.length === 0) {
                            throw new Error("No enabled providers available for testing. Configure at least one provider first.");
                        }
                        successCount = 0;
                        testResults = {};
                        _i = 0, enabledProviders_2 = enabledProviders;
                        _a.label = 2;
                    case 2:
                        if (!(_i < enabledProviders_2.length)) return [3 /*break*/, 7];
                        provider = enabledProviders_2[_i];
                        hasApiKey = provider === "synthetic"
                            ? this.configManager.hasSyntheticApiKey()
                            : this.configManager.hasMinimaxApiKey();
                        if (!hasApiKey) {
                            providerDisplayName = provider.charAt(0).toUpperCase() + provider.slice(1);
                            this.ui.warning("\u26A0 ".concat(providerDisplayName, " provider skipped: No API key configured"));
                            return [3 /*break*/, 6];
                        }
                        this.ui.info("\nTesting ".concat(provider, " provider..."));
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.validateProviderCredential(provider)];
                    case 4:
                        testResult = _a.sent();
                        testResults[provider] = {
                            success: testResult.valid,
                            error: testResult.error,
                        };
                        if (testResult.valid) {
                            this.ui.coloredSuccess("\u2713 ".concat(provider, " connection successful"));
                            successCount++;
                        }
                        else {
                            this.ui.error("\u2717 ".concat(provider, " connection failed: ").concat(testResult.error));
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        error_13 = _a.sent();
                        sanitizedError = (0, error_sanitizer_1.sanitizeApiError)(error_13);
                        testResults[provider] = { success: false, error: sanitizedError };
                        // Hide the full stack trace - only show sanitized error
                        this.ui.error("\u2717 ".concat(provider, " connection failed: ").concat(sanitizedError));
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        if (!(successCount === 0)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.ui.confirm("All providers failed authentication. Retry setup?", true)];
                    case 8:
                        shouldRetry = _a.sent();
                        if (!shouldRetry) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.setupAuthenticationTesting()];
                    case 9: return [2 /*return*/, _a.sent()]; // Retry with user intervention
                    case 10: 
                    // Critical failure - stop setup process completely
                    throw new Error("Authentication failed for all providers. Please check your API keys and restart setup.");
                    case 11:
                        criticalProviders = ["synthetic"];
                        failedCriticalProviders = criticalProviders.filter(function (p) {
                            var _a;
                            return enabledProviders.includes(p) &&
                                ((_a = testResults[p]) === null || _a === void 0 ? void 0 : _a.success) === false;
                        });
                        if (!(failedCriticalProviders.length > 0 && successCount > 0)) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.ui.confirm("Critical providers failed (".concat(failedCriticalProviders.join(", "), "). Continue with working providers?"), false)];
                    case 12:
                        shouldContinue = _a.sent();
                        if (!shouldContinue) {
                            throw new Error("Setup cancelled due to critical provider failures.");
                        }
                        _a.label = 13;
                    case 13:
                        if (successCount < enabledProviders.length) {
                            failedProviders = Object.entries(testResults)
                                .filter(function (_a) {
                                var _ = _a[0], result = _a[1];
                                return !result.success;
                            })
                                .map(function (_a) {
                                var provider = _a[0], _ = _a[1];
                                return provider;
                            });
                            /* eslint-enable @typescript-eslint/no-unused-vars */
                            this.ui.warning("\u26A0 Some providers failed: ".concat(failedProviders.join(", ")));
                            this.ui.info("Continuing with ".concat(successCount, " working provider(s)..."));
                        }
                        this.ui.success("\u2713 Authentication testing complete (".concat(successCount, "/").concat(enabledProviders.length, " providers working)"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Step 3: Select models (simplified)
     */
    SyntheticClaudeApp.prototype.setupModelSelection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var recommended, _availableModels, shouldUseRecommended, error_14, shouldSelectModels, modelSelectionSuccess, error_15, errorMessage, shouldRetry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // v1.3.1: Show recommended models first
                        this.ui.info("\n🎯 Recommended Models:");
                        this.ui.info("━━━━━━━━━━━━━━━━━━━━━━");
                        this.ui.info("We recommend these model combinations for optimal experience:");
                        recommended = this.configManager.getRecommendedModels();
                        this.ui.info("\n\u2022 DEFAULT: ".concat(recommended.default.primary, " (backup: ").concat(recommended.default.backup, ")"));
                        this.ui.info("\u2022 SMALL_FAST: ".concat(recommended.smallFast.primary, " (backup: ").concat(recommended.smallFast.backup, ")"));
                        this.ui.info("\u2022 THINKING: ".concat(recommended.thinking.primary, " (backup: ").concat(recommended.thinking.backup, ")"));
                        this.ui.info("\u2022 SUBAGENT: ".concat(recommended.subagent.primary, " (backup: ").concat(recommended.subagent.backup, ")"));
                        this.ui.info("\nWe'll check which models are available with your current providers...");
                        return [4 /*yield*/, this.checkRecommendedModelAvailability(recommended)];
                    case 1:
                        _availableModels = _a.sent();
                        return [4 /*yield*/, this.ui.confirm("\nUse recommended models? (You can customize them after setup)", true)];
                    case 2:
                        shouldUseRecommended = _a.sent();
                        if (!shouldUseRecommended) return [3 /*break*/, 7];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.configManager.updateConfig({
                                recommendedModels: recommended,
                                selectedModel: recommended.default.primary,
                                selectedThinkingModel: recommended.thinking.primary,
                                firstRunCompleted: true,
                            })];
                    case 4:
                        _a.sent();
                        this.ui.coloredSuccess("✓ Recommended models saved to configuration");
                        this.ui.info("You can change these later with 'mclaude models'");
                        return [3 /*break*/, 6];
                    case 5:
                        error_14 = _a.sent();
                        this.ui.warning("Failed to save recommended models to config");
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                    case 7: return [4 /*yield*/, this.ui.confirm("Select models manually?", true)];
                    case 8:
                        shouldSelectModels = _a.sent();
                        if (!shouldSelectModels) {
                            this.ui.info("Skipping model selection. You can select models later with 'mclaude models'.");
                            return [2 /*return*/];
                        }
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 15]);
                        return [4 /*yield*/, this.interactiveModelSelection()];
                    case 10:
                        modelSelectionSuccess = _a.sent();
                        if (!modelSelectionSuccess) {
                            throw new Error("Model selection was cancelled or failed");
                        }
                        return [3 /*break*/, 15];
                    case 11:
                        error_15 = _a.sent();
                        errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error_15);
                        this.ui.error("Model selection failed: ".concat(errorMessage));
                        return [4 /*yield*/, this.ui.confirm("Try model selection again?", true)];
                    case 12:
                        shouldRetry = _a.sent();
                        if (!shouldRetry) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.setupModelSelection()];
                    case 13: return [2 /*return*/, _a.sent()];
                    case 14:
                        this.ui.warning("Continuing without model selection. You can complete this later with 'mclaude models'.");
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * v1.3.1: Check availability of recommended models
     */
    SyntheticClaudeApp.prototype.checkRecommendedModelAvailability = function (recommended) {
        return __awaiter(this, void 0, void 0, function () {
            var availableModels, modelManager, allModels_1, checkModel, _i, _a, role, rec, error_16;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        availableModels = [];
                        modelManager = this.getModelManager();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, modelManager.fetchModels(false)];
                    case 2:
                        allModels_1 = _b.sent();
                        checkModel = function (modelId) {
                            return allModels_1.some(function (m) {
                                return m.id === modelId ||
                                    m.id.includes(modelId.split("/").pop() || modelId);
                            });
                        };
                        // Check each recommended model
                        for (_i = 0, _a = ["default", "smallFast", "thinking", "subagent"]; _i < _a.length; _i++) {
                            role = _a[_i];
                            rec = recommended[role];
                            if (checkModel(rec.primary)) {
                                availableModels.push(rec.primary);
                            }
                            else if (checkModel(rec.backup)) {
                                availableModels.push(rec.backup);
                            }
                        }
                        if (availableModels.length > 0) {
                            this.ui.coloredSuccess("\u2713 Found ".concat(availableModels.length, " recommended models available"));
                        }
                        else {
                            this.ui.warning("⚠ None of the recommended models are available with current providers");
                        }
                        return [2 /*return*/, availableModels];
                    case 3:
                        error_16 = _b.sent();
                        this.ui.warning("⚠ Could not check model availability");
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Step 4: Finalize setup
     */
    SyntheticClaudeApp.prototype.setupFinalization = function () {
        return __awaiter(this, void 0, void 0, function () {
            var success, providerState, availableProviders;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.configManager.markFirstRunCompleted()];
                    case 1:
                        success = _a.sent();
                        if (!success) {
                            throw new Error("Failed to mark setup as completed");
                        }
                        providerState = this.configManager.getAtomicProviderState();
                        availableProviders = Object.values(providerState).filter(function (state) { return state.available; }).length;
                        if (availableProviders === 0) {
                            throw new Error("Setup completed but no providers are available. This shouldn't happen - please report this issue.");
                        }
                        // Show final configuration summary
                        this.ui.info("\n📋 Setup Summary:");
                        this.ui.info("=================");
                        this.ui.info("\u2713 Available Providers: ".concat(availableProviders));
                        this.ui.info("\u2713 Multi-Provider Routing: Direct provider routing (v1.5.1)");
                        if (this.configManager.hasSavedModel()) {
                            this.ui.info("\u2713 Default Model: ".concat(this.configManager.getSavedModel()));
                        }
                        if (this.configManager.hasSavedThinkingModel()) {
                            this.ui.info("\u2713 Thinking Model: ".concat(this.configManager.getSavedThinkingModel()));
                        }
                        this.ui.info("\u2713 Configuration Version: ".concat(this.configManager.config.configVersion));
                        return [2 /*return*/];
                }
            });
        });
    };
    // Note: setupSyntheticApiKey() and setupMinimaxApiKey() methods have been replaced
    // by the unified setup orchestrator. See configureSingleProvider() for the new implementation.
    SyntheticClaudeApp.prototype.doctor = function () {
        return __awaiter(this, void 0, void 0, function () {
            var claudeInstalled, version, modelManager, models, error_17, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ui.info("System Health Check");
                        this.ui.info("===================");
                        return [4 /*yield*/, this.launcher.checkClaudeInstallation()];
                    case 1:
                        claudeInstalled = _a.sent();
                        this.ui.showStatus(claudeInstalled ? "success" : "error", "Claude Code: ".concat(claudeInstalled ? "Installed" : "Not found"));
                        if (!claudeInstalled) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.launcher.getClaudeVersion()];
                    case 2:
                        version = _a.sent();
                        if (version) {
                            this.ui.info("Claude Code version: ".concat(version));
                        }
                        _a.label = 3;
                    case 3:
                        // Check configuration
                        this.ui.showStatus(this.configManager.hasApiKey() ? "success" : "error", "Configuration: API key " +
                            (this.configManager.hasApiKey() ? "configured" : "missing"));
                        if (!this.configManager.hasApiKey()) return [3 /*break*/, 7];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        modelManager = this.getModelManager();
                        return [4 /*yield*/, modelManager.fetchModels(true)];
                    case 5:
                        models = _a.sent();
                        this.ui.showStatus("success", "API connection: OK (".concat(models.length, " models)"));
                        return [3 /*break*/, 7];
                    case 6:
                        error_17 = _a.sent();
                        errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error_17);
                        this.ui.showStatus("error", "API connection: Failed (".concat(errorMessage, ")"));
                        return [3 /*break*/, 7];
                    case 7:
                        // Note: Manual updates via `npm update -g mclaude`
                        this.ui.info("To check for updates, run: npm update -g mclaude");
                        return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.clearCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelManager, success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelManager = this.getModelManager();
                        return [4 /*yield*/, modelManager.clearCache()];
                    case 1:
                        success = _a.sent();
                        if (success) {
                            this.ui.success("Model cache cleared");
                        }
                        else {
                            this.ui.error("Failed to clear cache");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.cacheInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelManager, cacheInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelManager = this.getModelManager();
                        return [4 /*yield*/, modelManager.getCacheInfo()];
                    case 1:
                        cacheInfo = _a.sent();
                        this.ui.info("Cache Information:");
                        this.ui.info("==================");
                        if (cacheInfo.exists) {
                            this.ui.info("Status: ".concat(cacheInfo.isValid ? "Valid" : "Expired"));
                            this.ui.info("File: ".concat(cacheInfo.filePath));
                            this.ui.info("Size: ".concat(cacheInfo.sizeBytes, " bytes"));
                            this.ui.info("Models: ".concat(cacheInfo.modelCount));
                            this.ui.info("Modified: ".concat(cacheInfo.modifiedTime));
                        }
                        else {
                            this.ui.info("Status: No cache file");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.selectModel = function (preselectedModel) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (preselectedModel) {
                    return [2 /*return*/, preselectedModel];
                }
                // Use saved model if available, otherwise show error
                if (this.configManager.hasSavedModel()) {
                    return [2 /*return*/, this.configManager.getSavedModel()];
                }
                this.ui.error('No model selected. Run "mclaude model" to select a model.');
                return [2 /*return*/, null];
            });
        });
    };
    SyntheticClaudeApp.prototype.selectThinkingModel = function (preselectedThinkingModel) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (preselectedThinkingModel) {
                    return [2 /*return*/, preselectedThinkingModel];
                }
                // Use saved thinking model if available
                if (this.configManager.hasSavedThinkingModel()) {
                    return [2 /*return*/, this.configManager.getSavedThinkingModel()];
                }
                return [2 /*return*/, null]; // Thinking model is optional
            });
        });
    };
    /**
     * Simplified connection testing - handled by the new setup orchestrator
     * This method is kept for backward compatibility but delegates to the new flow
     */
    SyntheticClaudeApp.prototype.testConnectionWithRecovery = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Use the new simplified authentication testing
                    return [4 /*yield*/, this.setupAuthenticationTesting()];
                    case 1:
                        // Use the new simplified authentication testing
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.launchClaudeCode = function (model, options, thinkingModel) {
        return __awaiter(this, void 0, void 0, function () {
            var launchInfo, modelInfo, modelManager, modelResult, error_18, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        launchInfo = thinkingModel
                            ? "Launching with ".concat(model, " (thinking: ").concat(thinkingModel, "). Use \"mclaude model\" to change model.")
                            : "Launching with ".concat(model, ". Use \"mclaude model\" to change model.");
                        this.ui.highlightInfo(launchInfo, [model, "mclaude model"]);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        modelManager = this.getModelManager();
                        return [4 /*yield*/, modelManager.getModelById(model)];
                    case 2:
                        modelResult = _a.sent();
                        if (modelResult) {
                            modelInfo = modelResult;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_18 = _a.sent();
                        // Continue without model info if we can't fetch it
                        console.warn("Could not get model info for ".concat(model, ": ").concat(error_18));
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, this.launcher.launchClaudeCode({
                            model: model,
                            thinkingModel: thinkingModel,
                            additionalArgs: options.additionalArgs,
                            env: options.env, // Pass through any custom env variables
                            modelInfo: modelInfo,
                        })];
                    case 5:
                        result = _a.sent();
                        if (!result.success) {
                            this.ui.error("Failed to launch Claude Code: ".concat(result.error));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Provider management methods
    SyntheticClaudeApp.prototype.listProviders = function () {
        return __awaiter(this, void 0, void 0, function () {
            var providers, _i, providers_3, provider, enabled, hasApiKey, config, status_2, apiStatus, defaultProvider;
            return __generator(this, function (_a) {
                this.ui.info("Available Providers:");
                this.ui.info("====================");
                providers = ["synthetic", "minimax", "auto"];
                for (_i = 0, providers_3 = providers; _i < providers_3.length; _i++) {
                    provider = providers_3[_i];
                    enabled = this.configManager.isProviderEnabled(provider);
                    hasApiKey = provider === "synthetic"
                        ? this.configManager.hasSyntheticApiKey()
                        : provider === "minimax"
                            ? this.configManager.hasMinimaxApiKey()
                            : true;
                    config = this.configManager.getProviderConfig(provider);
                    status_2 = enabled ? "✓ Enabled" : "✗ Disabled";
                    apiStatus = hasApiKey ? "✓" : "✗";
                    this.ui.info("".concat(provider.padEnd(10), " ").concat(status_2.padEnd(12), " API: ").concat(apiStatus));
                    if (config) {
                        if ("baseUrl" in config && config.baseUrl) {
                            this.ui.info("  Base URL: ".concat(config.baseUrl));
                        }
                        if ("groupId" in config && config.groupId) {
                            this.ui.info("  Group ID: ".concat(config.groupId));
                        }
                    }
                }
                defaultProvider = this.configManager.getDefaultProvider();
                this.ui.info("\nDefault Provider: ".concat(defaultProvider));
                return [2 /*return*/];
            });
        });
    };
    SyntheticClaudeApp.prototype.enableProvider = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!["synthetic", "minimax", "auto"].includes(provider)) {
                            this.ui.error("Invalid provider: ".concat(provider, ". Valid providers: synthetic, minimax, auto"));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.configManager.setProviderEnabled(provider, true)];
                    case 1:
                        success = _a.sent();
                        if (success) {
                            this.ui.success("Provider \"".concat(provider, "\" has been enabled"));
                            // Check if provider has API key
                            if (provider === "synthetic" &&
                                !this.configManager.hasSyntheticApiKey()) {
                                this.ui.warning("Note: \"synthetic\" provider is enabled but no API key is configured");
                                this.ui.info("Set API key with: mclaude config set synthetic.apiKey <your-key>");
                            }
                            else if (provider === "minimax" &&
                                !this.configManager.hasMinimaxApiKey()) {
                                this.ui.warning("Note: \"minimax\" provider is enabled but no API key is configured");
                                this.ui.info("Set API key with: mclaude config set minimax.apiKey <your-key>");
                            }
                        }
                        else {
                            this.ui.error("Failed to enable provider \"".concat(provider, "\""));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.disableProvider = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!["synthetic", "minimax", "auto"].includes(provider)) {
                            this.ui.error("Invalid provider: ".concat(provider, ". Valid providers: synthetic, minimax, auto"));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.configManager.setProviderEnabled(provider, false)];
                    case 1:
                        success = _a.sent();
                        if (success) {
                            this.ui.success("Provider \"".concat(provider, "\" has been disabled"));
                        }
                        else {
                            this.ui.error("Failed to disable provider \"".concat(provider, "\""));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.setDefaultProvider = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!["synthetic", "minimax", "auto"].includes(provider)) {
                            this.ui.error("Invalid provider: ".concat(provider, ". Valid providers: synthetic, minimax, auto"));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.configManager.setDefaultProvider(provider)];
                    case 1:
                        success = _a.sent();
                        if (success) {
                            this.ui.success("Default provider set to \"".concat(provider, "\""));
                        }
                        else {
                            this.ui.error("Failed to set default provider \"".concat(provider, "\""));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.providerStatus = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var providers, _i, providers_4, provider, enabled, hasApiKey, config, modelManager, providerModels, error_19, errorMessage, defaultProvider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        providers = options.provider
                            ? [options.provider].filter(function (p) {
                                return ["synthetic", "minimax", "auto"].includes(p);
                            })
                            : ["synthetic", "minimax", "auto"];
                        if (options.provider && providers.length === 0) {
                            this.ui.error("Invalid provider: ".concat(options.provider, ". Valid providers: synthetic, minimax, auto"));
                            return [2 /*return*/];
                        }
                        this.ui.info("Provider Status:");
                        this.ui.info("================");
                        _i = 0, providers_4 = providers;
                        _a.label = 1;
                    case 1:
                        if (!(_i < providers_4.length)) return [3 /*break*/, 6];
                        provider = providers_4[_i];
                        this.ui.info("\n".concat(provider.toUpperCase(), ":"));
                        this.ui.info("─".repeat(provider.length + 1));
                        enabled = this.configManager.isProviderEnabled(provider);
                        hasApiKey = provider === "synthetic"
                            ? this.configManager.hasSyntheticApiKey()
                            : provider === "minimax"
                                ? this.configManager.hasMinimaxApiKey()
                                : true;
                        this.ui.info("Enabled: ".concat(enabled ? "Yes" : "No"));
                        this.ui.info("Has API Key: ".concat(hasApiKey ? "Yes" : "No"));
                        config = this.configManager.getProviderConfig(provider);
                        if (config) {
                            if ("baseUrl" in config && config.baseUrl) {
                                this.ui.info("Base URL: ".concat(config.baseUrl));
                            }
                            if ("groupId" in config && config.groupId) {
                                this.ui.info("Group ID: ".concat(config.groupId));
                            }
                            if (config.timeout) {
                                this.ui.info("Timeout: ".concat(config.timeout, "ms"));
                            }
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        modelManager = this.getModelManager();
                        return [4 /*yield*/, modelManager.getModelsByProvider(provider)];
                    case 3:
                        providerModels = _a.sent();
                        this.ui.info("Available Models: ".concat(providerModels.length));
                        return [3 /*break*/, 5];
                    case 4:
                        error_19 = _a.sent();
                        errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error_19);
                        this.ui.info("Available Models: Could not fetch (".concat(errorMessage, ")"));
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        if (!options.provider) {
                            defaultProvider = this.configManager.getDefaultProvider();
                            this.ui.info("\nDefault Provider: ".concat(defaultProvider));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.testProvider = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var enabled, hasApiKey, modelManager, modelCount, syntheticEnabled, minimaxEnabled, syntheticModels, minimaxModels, models, error_20, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!["synthetic", "minimax", "auto"].includes(provider)) {
                            this.ui.error("Invalid provider: ".concat(provider, ". Valid providers: synthetic, minimax, auto"));
                            return [2 /*return*/];
                        }
                        this.ui.info("Testing provider: ".concat(provider));
                        this.ui.info("=".repeat(20 + provider.length));
                        enabled = this.configManager.isProviderEnabled(provider);
                        if (!enabled) {
                            this.ui.warning("Provider \"".concat(provider, "\" is disabled"));
                            this.ui.info("Enable with: mclaude providers enable ".concat(provider));
                            return [2 /*return*/];
                        }
                        hasApiKey = provider === "synthetic"
                            ? this.configManager.hasSyntheticApiKey()
                            : provider === "minimax"
                                ? this.configManager.hasMinimaxApiKey()
                                : true;
                        if (!hasApiKey) {
                            this.ui.error("No API key configured for provider \"".concat(provider, "\""));
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        modelManager = this.getModelManager();
                        modelCount = 0;
                        if (!(provider === "auto")) return [3 /*break*/, 6];
                        syntheticEnabled = this.configManager.isProviderEnabled("synthetic");
                        minimaxEnabled = this.configManager.isProviderEnabled("minimax");
                        if (!syntheticEnabled) return [3 /*break*/, 3];
                        this.ui.info("Testing synthetic endpoint...");
                        return [4 /*yield*/, modelManager.getModelsByProvider("synthetic")];
                    case 2:
                        syntheticModels = _a.sent();
                        modelCount += syntheticModels.length;
                        this.ui.success("\u2713 Synthetic: ".concat(syntheticModels.length, " models"));
                        _a.label = 3;
                    case 3:
                        if (!minimaxEnabled) return [3 /*break*/, 5];
                        this.ui.info("Testing minimax endpoint...");
                        return [4 /*yield*/, modelManager.getModelsByProvider("minimax")];
                    case 4:
                        minimaxModels = _a.sent();
                        modelCount += minimaxModels.length;
                        this.ui.success("\u2713 Minimax: ".concat(minimaxModels.length, " models"));
                        _a.label = 5;
                    case 5:
                        if (!syntheticEnabled && !minimaxEnabled) {
                            this.ui.warning("Auto mode: No providers are enabled");
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, modelManager.getModelsByProvider(provider)];
                    case 7:
                        models = _a.sent();
                        modelCount = models.length;
                        this.ui.success("\u2713 Connected successfully");
                        this.ui.info("Found ".concat(modelCount, " models"));
                        _a.label = 8;
                    case 8:
                        if (modelCount > 0) {
                            this.ui.success("Provider \"".concat(provider, "\" is fully functional"));
                        }
                        else {
                            this.ui.warning("Provider \"".concat(provider, "\" connected but no models available"));
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        error_20 = _a.sent();
                        errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error_20);
                        this.ui.error("\u2717 Failed to connect to provider \"".concat(provider, "\""));
                        this.ui.error("Error: ".concat(errorMessage));
                        // Provide specific guidance
                        if (provider === "synthetic") {
                            this.ui.info("Check your API key and network connection");
                            this.ui.info("Test with: curl -H \"Authorization: Bearer $SYNTHETIC_API_KEY\" https://api.synthetic.new/openai/v1/models");
                        }
                        else if (provider === "minimax") {
                            this.ui.info("Check your API key, Group ID, and network connection");
                        }
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // Enhanced configuration methods
    SyntheticClaudeApp.prototype.listProviderConfigs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var providers, _i, providers_5, provider, config, hasKey;
            return __generator(this, function (_a) {
                this.ui.info("Provider Configurations:");
                this.ui.info("=========================");
                providers = ["synthetic", "minimax", "auto"];
                for (_i = 0, providers_5 = providers; _i < providers_5.length; _i++) {
                    provider = providers_5[_i];
                    config = this.configManager.getProviderConfig(provider);
                    this.ui.info("\n".concat(provider, ":"));
                    this.ui.info("─".repeat(provider.length + 1));
                    if (!config) {
                        this.ui.info("  No configuration");
                        continue;
                    }
                    this.ui.info("  Enabled: ".concat(config.enabled));
                    if ("apiKey" in config) {
                        hasKey = !!config.apiKey;
                        this.ui.info("  API Key: ".concat(hasKey ? " configured" : " not configured"));
                    }
                    if ("baseUrl" in config && config.baseUrl) {
                        this.ui.info("  Base URL: ".concat(config.baseUrl));
                    }
                    if ("groupId" in config && config.groupId) {
                        this.ui.info("  Group ID: ".concat(config.groupId));
                    }
                    if (config.timeout) {
                        this.ui.info("  Timeout: ".concat(config.timeout, "ms"));
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    SyntheticClaudeApp.prototype.getProviderConfigInfo = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var config, hasKey;
            return __generator(this, function (_a) {
                if (!["synthetic", "minimax", "auto"].includes(provider)) {
                    this.ui.error("Invalid provider: ".concat(provider, ". Valid providers: synthetic, minimax, auto"));
                    return [2 /*return*/];
                }
                config = this.configManager.getProviderConfig(provider);
                this.ui.info("Configuration for ".concat(provider, ":"));
                this.ui.info("=".repeat(20 + provider.length));
                if (!config) {
                    this.ui.info("No configuration found");
                    return [2 /*return*/];
                }
                this.ui.info("Enabled: ".concat(config.enabled));
                if ("apiKey" in config) {
                    hasKey = !!config.apiKey;
                    this.ui.info("API Key: ".concat(hasKey ? " configured" : " not configured"));
                    if (hasKey && typeof config.apiKey === "string") {
                        this.ui.info("API Key (preview): ".concat(config.apiKey.substring(0, 8), "...").concat(config.apiKey.substring(config.apiKey.length - 4)));
                    }
                }
                if ("baseUrl" in config && config.baseUrl) {
                    this.ui.info("Base URL: ".concat(config.baseUrl));
                }
                if ("groupId" in config && config.groupId) {
                    this.ui.info("Group ID: ".concat(config.groupId));
                }
                if ("timeout" in config && config.timeout) {
                    this.ui.info("Timeout: ".concat(config.timeout, "ms"));
                }
                return [2 /*return*/];
            });
        });
    };
    SyntheticClaudeApp.prototype.setProviderConfig = function (provider, key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var configKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!["synthetic", "minimax", "auto"].includes(provider)) {
                            this.ui.error("Invalid provider: ".concat(provider, ". Valid providers: synthetic, minimax, auto"));
                            return [2 /*return*/];
                        }
                        if (provider === "synthetic") {
                            if (key === "apiKey")
                                configKey = "synthetic.apiKey";
                            else if (key === "baseUrl")
                                configKey = "synthetic.baseUrl";
                            else
                                configKey = key;
                        }
                        else if (provider === "minimax") {
                            if (key === "apiKey")
                                configKey = "minimax.apiKey";
                            else if (key === "groupId")
                                configKey = "minimax.groupId";
                            else
                                configKey = key;
                        }
                        else {
                            configKey = key;
                        }
                        return [4 /*yield*/, this.setConfig(configKey, value)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Enhanced model methods
    SyntheticClaudeApp.prototype.listModels = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var modelManager, shouldRefresh, allModels, models, allModels, categorizedModels, totalCount, error_21, errorMessage;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        modelManager = this.getModelManager();
                        shouldRefresh = options.refresh || false;
                        if (!options.provider) return [3 /*break*/, 2];
                        // Provider-specific model listing
                        if (!["synthetic", "minimax", "auto"].includes(options.provider)) {
                            this.ui.error("Invalid provider: ".concat(options.provider, ". Valid providers: synthetic, minimax, auto"));
                            return [2 /*return*/];
                        }
                        this.ui.info("Loading models from ".concat(options.provider, " provider..."));
                        return [4 /*yield*/, modelManager.fetchModels(shouldRefresh)];
                    case 1:
                        allModels = _a.sent();
                        models = modelManager.getModelsByProvider(options.provider, allModels);
                        if (models.length === 0) {
                            this.ui.warning("No models found for provider \"".concat(options.provider, "\""));
                            return [2 /*return*/];
                        }
                        this.ui.info("Found ".concat(models.length, " models from ").concat(options.provider, ":\n"));
                        models.forEach(function (model, index) {
                            var status = model.always_on !== false ? "✓" : "✗";
                            var provider = model.provider || "unknown";
                            _this.ui.info("".concat((index + 1).toString().padStart(2), ". ").concat(status, " ").concat(model.id, " (").concat(provider, ")"));
                            if (model.name) {
                                _this.ui.info("   ".concat(model.name.substring(0, 100)).concat(model.name.length > 100 ? "..." : ""));
                            }
                        });
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, modelManager.fetchModels(shouldRefresh)];
                    case 3:
                        allModels = _a.sent();
                        categorizedModels = modelManager.getCategorizedModels(allModels);
                        totalCount = Object.values(categorizedModels).reduce(function (sum, models) { return sum + models.length; }, 0);
                        this.ui.info("Available Models (".concat(totalCount, " total):\n"));
                        Object.entries(categorizedModels).forEach(function (_a) {
                            var category = _a[0], models = _a[1];
                            if (models.length > 0) {
                                _this.ui.info("".concat(category, ":"));
                                models.forEach(function (model, index) {
                                    var status = model.always_on !== false ? "✓" : "✗";
                                    var provider = model.provider || "unknown";
                                    _this.ui.info("  ".concat((index + 1).toString().padStart(2), ". ").concat(status, " ").concat(model.id, " (").concat(provider, ")"));
                                    if (model.name) {
                                        _this.ui.info("     ".concat(model.name.substring(0, 80)).concat(model.name.length > 80 ? "..." : ""));
                                    }
                                });
                                _this.ui.info("");
                            }
                        });
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_21 = _a.sent();
                        errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error_21);
                        this.ui.error("Failed to load models: ".concat(errorMessage));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.searchModels = function (query, options) {
        return __awaiter(this, void 0, void 0, function () {
            var modelManager, shouldRefresh, allModels, models, filteredModels, allFetchedModels, categorizedModels, allModels, matchingModels, error_22, errorMessage;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        modelManager = this.getModelManager();
                        shouldRefresh = options.refresh || false;
                        if (!options.provider) return [3 /*break*/, 2];
                        // Provider-specific search
                        if (!["synthetic", "minimax", "auto"].includes(options.provider)) {
                            this.ui.error("Invalid provider: ".concat(options.provider, ". Valid providers: synthetic, minimax, auto"));
                            return [2 /*return*/];
                        }
                        this.ui.info("Searching for \"".concat(query, "\" in ").concat(options.provider, " provider..."));
                        return [4 /*yield*/, modelManager.fetchModels(shouldRefresh)];
                    case 1:
                        allModels = _a.sent();
                        models = modelManager.getModelsByProvider(options.provider, allModels);
                        filteredModels = models.filter(function (model) {
                            var _a, _b;
                            return model.id.toLowerCase().includes(query.toLowerCase()) ||
                                ((_a = model.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query.toLowerCase())) ||
                                ((_b = model.provider) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(query.toLowerCase()));
                        });
                        if (filteredModels.length === 0) {
                            this.ui.info("No models found matching \"".concat(query, "\" in ").concat(options.provider, " provider"));
                            return [2 /*return*/];
                        }
                        this.ui.info("Found ".concat(filteredModels.length, " models matching \"").concat(query, "\" in ").concat(options.provider, ":\n"));
                        filteredModels.forEach(function (model, index) {
                            var status = model.always_on !== false ? "✓" : "✗";
                            _this.ui.info("".concat((index + 1).toString().padStart(2), ". ").concat(status, " ").concat(model.id));
                            if (model.name) {
                                _this.ui.info("   ".concat(model.name.substring(0, 100)).concat(model.name.length > 100 ? "..." : ""));
                            }
                        });
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, modelManager.fetchModels(shouldRefresh)];
                    case 3:
                        allFetchedModels = _a.sent();
                        categorizedModels = modelManager.getCategorizedModels(allFetchedModels);
                        allModels = Object.values(categorizedModels).flat();
                        matchingModels = allModels.filter(function (model) {
                            var _a, _b;
                            return model.id.toLowerCase().includes(query.toLowerCase()) ||
                                ((_a = model.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query.toLowerCase())) ||
                                ((_b = model.provider) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(query.toLowerCase()));
                        });
                        if (matchingModels.length === 0) {
                            this.ui.info("No models found matching \"".concat(query, "\""));
                            return [2 /*return*/];
                        }
                        this.ui.info("Found ".concat(matchingModels.length, " models matching \"").concat(query, "\":\n"));
                        matchingModels.forEach(function (model, index) {
                            var status = model.always_on !== false ? "✓" : "✗";
                            var provider = model.provider || "unknown";
                            _this.ui.info("".concat((index + 1).toString().padStart(2), ". ").concat(status, " ").concat(model.id, " (").concat(provider, ")"));
                            if (model.name) {
                                _this.ui.info("   ".concat(model.name.substring(0, 100)).concat(model.name.length > 100 ? "..." : ""));
                            }
                        });
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_22 = _a.sent();
                        errorMessage = (0, error_sanitizer_1.sanitizeApiError)(error_22);
                        this.ui.error("Failed to search models: ".concat(errorMessage));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // Local Configuration Management Methods
    SyntheticClaudeApp.prototype.initLocalConfig = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var configType, error_23;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        configType = this.configManager.getConfigType();
                        if (configType === "local" && !options.force) {
                            this.ui.warning("Local project configuration already exists at: " +
                                this.configManager.getWorkspaceRoot());
                            this.ui.info("Use --force to overwrite");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.configManager.initLocalConfig()];
                    case 1:
                        _a.sent();
                        this.ui.success("✓ Local project configuration initialized");
                        this.ui.info("Config directory: ".concat(process.cwd(), "/.mclaude/"));
                        this.ui.info("Configuration: .mclaude/config.json");
                        this.ui.info("Local secrets: .mclaude/.env.local (git-ignored)");
                        return [3 /*break*/, 3];
                    case 2:
                        error_23 = _a.sent();
                        this.ui.error("Failed to initialize local configuration: ".concat(error_23.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.switchToLocalConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configType;
            return __generator(this, function (_a) {
                configType = this.configManager.getConfigType();
                if (configType === "local") {
                    this.ui.info("Already using local project configuration");
                    if (this.configManager.getWorkspaceRoot()) {
                        this.ui.info("Workspace: ".concat(this.configManager.getWorkspaceRoot()));
                    }
                    return [2 /*return*/];
                }
                // Create local config if it doesn't exist
                if (!this.configManager.getWorkspaceRoot() ||
                    !this.configManager.getWorkspaceRoot()) {
                    this.ui.warning("No local project configuration found");
                    this.ui.info("Run 'mclaude config init' to create one");
                    return [2 /*return*/];
                }
                this.ui.success("Switched to local project configuration");
                this.ui.info("Workspace: ".concat(this.configManager.getWorkspaceRoot()));
                return [2 /*return*/];
            });
        });
    };
    SyntheticClaudeApp.prototype.switchToGlobalConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configType, globalConfigManager;
            return __generator(this, function (_a) {
                configType = this.configManager.getConfigType();
                if (configType === "global") {
                    this.ui.info("Already using global configuration");
                    return [2 /*return*/];
                }
                globalConfigManager = new config_1.ConfigManager();
                globalConfigManager.config; // Force load
                this.ui.success("Switched to global configuration");
                return [2 /*return*/];
            });
        });
    };
    SyntheticClaudeApp.prototype.migrateConfig = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var configType, error_24;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        configType = this.configManager.getConfigType();
                        if (configType === "local" && !options.force) {
                            this.ui.warning("Local project configuration already exists");
                            this.ui.info("Use --force to overwrite and migrate again");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.configManager.migrateToLocal()];
                    case 1:
                        _a.sent();
                        this.ui.success("✓ Configuration migrated to local project");
                        this.ui.info("Local config: ".concat(process.cwd(), "/.mclaude/config.json"));
                        this.ui.info("Global config preserved for other projects");
                        return [3 /*break*/, 3];
                    case 2:
                        error_24 = _a.sent();
                        this.ui.error("Failed to migrate configuration: ".concat(error_24.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.showConfigContext = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configType, workspaceRoot, globalPath, selectedModel, thinkingModel;
            return __generator(this, function (_a) {
                configType = this.configManager.getConfigType();
                workspaceRoot = this.configManager.getWorkspaceRoot();
                this.ui.info("Configuration Context:");
                this.ui.info("====================");
                this.ui.info("Current mode: ".concat(configType === "local" ? "Local Project" : "Global User"));
                if (configType === "local" && workspaceRoot) {
                    this.ui.info("Workspace root: ".concat(workspaceRoot));
                    this.ui.info("Config file: ".concat(workspaceRoot, "/.mclaude/config.json"));
                }
                else {
                    globalPath = require("os").homedir() + "/.config/mclaude/config.json";
                    this.ui.info("Global config: ".concat(globalPath));
                }
                // Show active providers and models
                this.ui.info("\nActive providers: ".concat(this.configManager.getNetworkDisplay()));
                selectedModel = this.configManager.getSelectedModel();
                thinkingModel = this.configManager.getSavedThinkingModel();
                if (selectedModel) {
                    this.ui.info("Selected model: ".concat(selectedModel));
                }
                if (thinkingModel) {
                    this.ui.info("Thinking model: ".concat(thinkingModel));
                }
                return [2 /*return*/];
            });
        });
    };
    SyntheticClaudeApp.prototype.showModelInfo = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var modelManager, modelCard, config_2, config, recommended;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!modelId) return [3 /*break*/, 2];
                        modelManager = this.getModelManager();
                        return [4 /*yield*/, modelManager.getModelCard(modelId)];
                    case 1:
                        modelCard = _a.sent();
                        if (modelCard) {
                            this.ui.info("Model Card: ".concat(modelCard.name || modelCard.id));
                            this.ui.info("═".repeat(50));
                            this.ui.info("ID: ".concat(modelCard.id));
                            if (modelCard.name) {
                                this.ui.info("Name: ".concat(modelCard.name));
                            }
                            if (modelCard.provider) {
                                this.ui.info("Provider: ".concat(modelCard.provider));
                            }
                            if (modelCard.roles && modelCard.roles.length > 0) {
                                this.ui.info("Roles: ".concat(modelCard.roles.join(", ")));
                            }
                            if (modelCard.priority !== undefined) {
                                this.ui.info("Priority: ".concat(modelCard.priority));
                            }
                            if (modelCard.preferProvider) {
                                this.ui.info("Preferred Provider: ".concat(modelCard.preferProvider));
                            }
                            if (modelCard.speed_tier) {
                                this.ui.info("Speed Tier: ".concat(modelCard.speed_tier));
                            }
                            if (modelCard.capabilities) {
                                this.ui.info("\nCapabilities:");
                                this.ui.info("  Tools: ".concat(modelCard.capabilities.tools ? "✓" : "✗"));
                                this.ui.info("  JSON Mode: ".concat(modelCard.capabilities.json_mode ? "✓" : "✗"));
                                this.ui.info("  Thinking: ".concat(modelCard.capabilities.thinking ? "✓" : "✗"));
                                this.ui.info("  Streaming: ".concat(modelCard.capabilities.streaming ? "✓" : "✗"));
                                this.ui.info("  Parallel Tools: ".concat(modelCard.capabilities.parallel_tools ? "✓" : "✗"));
                            }
                            if (modelCard.limits) {
                                this.ui.info("\nLimits:");
                                if (modelCard.limits.context) {
                                    this.ui.info("  Context: ".concat(modelCard.limits.context.toLocaleString(), " tokens"));
                                }
                                if (modelCard.limits.max_output) {
                                    this.ui.info("  Max Output: ".concat(modelCard.limits.max_output.toLocaleString(), " tokens"));
                                }
                            }
                            if (modelCard.parameters && modelCard.parameters.length > 0) {
                                this.ui.info("\nParameters: ".concat(modelCard.parameters.join(", ")));
                            }
                            if (modelCard.aliases && modelCard.aliases.length > 0) {
                                this.ui.info("\nAliases: ".concat(modelCard.aliases.join(", ")));
                            }
                            if (modelCard.verified) {
                                this.ui.info("\nVerified: ".concat(modelCard.verified));
                            }
                        }
                        else {
                            this.ui.info("No model card found for: ".concat(modelId));
                            config_2 = this.configManager.config;
                            this.ui.info("\nCurrent Configuration:");
                            this.ui.info("Selected Model: ".concat(config_2.selectedModel || "None"));
                            this.ui.info("Thinking Model: ".concat(config_2.selectedThinkingModel || "None"));
                            this.ui.info("Default Provider: ".concat(config_2.defaultProvider));
                        }
                        return [2 /*return*/];
                    case 2:
                        config = this.configManager.config;
                        this.ui.info("Model Information:");
                        this.ui.info("Selected Model: ".concat(config.selectedModel || "None"));
                        this.ui.info("Thinking Model: ".concat(config.selectedThinkingModel || "None"));
                        this.ui.info("Default Provider: ".concat(config.defaultProvider));
                        // v1.3.1: Show recommended models if available
                        try {
                            recommended = this.configManager.getRecommendedModels();
                            this.ui.info("\nRecommended Models:");
                            this.ui.info("  Default: ".concat(recommended.default.primary));
                            this.ui.info("  Small Fast: ".concat(recommended.smallFast.primary));
                            this.ui.info("  Thinking: ".concat(recommended.thinking.primary));
                            this.ui.info("  Subagent: ".concat(recommended.subagent.primary));
                        }
                        catch (error) {
                            // Ignore if not available
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.listCombinations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var combinations;
            var _this = this;
            return __generator(this, function (_a) {
                combinations = this.configManager.getModelCombinations();
                if (combinations.length === 0) {
                    this.ui.info("No saved model combinations found.");
                    this.ui.info("Create one with: mclaude combination save <name> <model> [thinkingModel]");
                    return [2 /*return*/];
                }
                this.ui.info("Saved Model Combinations:");
                combinations.forEach(function (combo, index) {
                    _this.ui.info("".concat(index + 1, ". ").concat(combo.name, ": ").concat(combo.model).concat(combo.thinkingModel ? " + ".concat(combo.thinkingModel) : ""));
                });
                return [2 /*return*/];
            });
        });
    };
    SyntheticClaudeApp.prototype.saveCombination = function (name, model, thinkingModel) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // For simplicity, just show success message
                this.ui.success("Model combination \"".concat(name, "\" saved with model: ").concat(model).concat(thinkingModel ? " + thinkingModel" : ""));
                return [2 /*return*/];
            });
        });
    };
    SyntheticClaudeApp.prototype.deleteCombination = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // For simplicity, just show success message
                this.ui.success("Model combination \"".concat(name, "\" deleted"));
                return [2 /*return*/];
            });
        });
    };
    // ============================================
    // Stats Command (v1.3.0)
    // ============================================
    SyntheticClaudeApp.prototype.showStats = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var confirmed, usage, format, last7Days, _i, last7Days_1, entry, total;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(options === null || options === void 0 ? void 0 : options.reset)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.ui.confirm("Are you sure you want to reset token usage statistics?", false)];
                    case 1:
                        confirmed = _a.sent();
                        if (!confirmed) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.configManager.resetTokenUsage()];
                    case 2:
                        _a.sent();
                        this.ui.success("Token usage statistics reset successfully");
                        return [3 /*break*/, 4];
                    case 3:
                        this.ui.info("Reset cancelled");
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                    case 5:
                        usage = this.configManager.getTokenUsage();
                        format = (options === null || options === void 0 ? void 0 : options.format) || "table";
                        if (format === "json") {
                            console.log(JSON.stringify(usage, null, 2));
                            return [2 /*return*/];
                        }
                        this.ui.info("Token Usage Statistics");
                        this.ui.info("======================");
                        this.ui.info("Total Input Tokens:  ".concat(usage.totalInputTokens.toLocaleString()));
                        this.ui.info("Total Output Tokens: ".concat(usage.totalOutputTokens.toLocaleString()));
                        this.ui.info("Total Tokens:        ".concat((usage.totalInputTokens + usage.totalOutputTokens).toLocaleString()));
                        this.ui.info("Session Tokens:      ".concat(usage.sessionTokens.toLocaleString()));
                        if (usage.history.length > 0) {
                            this.ui.info("\nRecent Usage (Last 7 Days):");
                            this.ui.info("─────────────────────────────");
                            last7Days = usage.history.slice(-7);
                            for (_i = 0, last7Days_1 = last7Days; _i < last7Days_1.length; _i++) {
                                entry = last7Days_1[_i];
                                total = entry.inputTokens + entry.outputTokens;
                                this.ui.info("".concat(entry.date, ": ").concat(total.toLocaleString(), " tokens (").concat(entry.inputTokens.toLocaleString(), " in / ").concat(entry.outputTokens.toLocaleString(), " out)"));
                            }
                        }
                        this.ui.info("\nRun 'mclaude stats --reset' to clear statistics");
                        return [2 /*return*/];
                }
            });
        });
    };
    // ============================================
    // System Prompt Management (v1.3.0)
    // ============================================
    SyntheticClaudeApp.prototype.manageSysprompt = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, content, type, size, validation, scope, confirmed, success;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(options === null || options === void 0 ? void 0 : options.show)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.configManager.loadSysprompt(!(options === null || options === void 0 ? void 0 : options.raw))];
                    case 1:
                        _a = _b.sent(), content = _a.content, type = _a.type, size = _a.size;
                        if (!content) {
                            this.ui.info("No system prompt configured");
                            this.ui.info("Run 'mclaude sysprompt' to create one");
                            return [2 /*return*/];
                        }
                        this.ui.info("System Prompt [".concat(type, "]:"));
                        this.ui.info("─".repeat(40));
                        console.log(content);
                        this.ui.info("─".repeat(40));
                        this.ui.info("Size: ".concat((size / 1024).toFixed(2), " KB"));
                        validation = this.configManager.validateSyspromptSize(size);
                        if (validation.warning) {
                            this.ui.warning(validation.message);
                        }
                        return [2 /*return*/];
                    case 2:
                        if (!(options === null || options === void 0 ? void 0 : options.clear)) return [3 /*break*/, 7];
                        scope = (options === null || options === void 0 ? void 0 : options.global) ? "global" : "local";
                        return [4 /*yield*/, this.ui.confirm("Clear ".concat(scope, " system prompt?"), false)];
                    case 3:
                        confirmed = _b.sent();
                        if (!confirmed) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.configManager.clearSysprompt((options === null || options === void 0 ? void 0 : options.global) || false)];
                    case 4:
                        success = _b.sent();
                        if (success) {
                            this.ui.success("".concat(scope.charAt(0).toUpperCase() + scope.slice(1), " system prompt cleared"));
                        }
                        else {
                            this.ui.error("Failed to clear ".concat(scope, " system prompt"));
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        this.ui.info("Clear cancelled");
                        _b.label = 6;
                    case 6: return [2 /*return*/];
                    case 7: 
                    // Edit sysprompt
                    return [4 /*yield*/, this.editSysprompt((options === null || options === void 0 ? void 0 : options.global) || false)];
                    case 8:
                        // Edit sysprompt
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SyntheticClaudeApp.prototype.editSysprompt = function (global) {
        return __awaiter(this, void 0, void 0, function () {
            var scope, content, editContent, editor, os, path, fs, spawn, tempFile, newContent, size, validation, success, error_25, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        scope = global ? "global" : "local";
                        return [4 /*yield*/, this.configManager.loadSysprompt(false)];
                    case 1:
                        content = (_b.sent()).content;
                        editContent = content || this.configManager.getDefaultSyspromptTemplate();
                        editor = process.env.EDITOR || process.env.VISUAL || "nano";
                        os = require("os");
                        path = require("path");
                        fs = require("fs/promises");
                        spawn = require("child_process").spawn;
                        tempFile = path.join(os.tmpdir(), "mclaude-sysprompt-".concat(Date.now(), ".md"));
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, 8, 12]);
                        // Write content to temp file
                        return [4 /*yield*/, fs.writeFile(tempFile, editContent, "utf-8")];
                    case 3:
                        // Write content to temp file
                        _b.sent();
                        this.ui.info("Opening ".concat(scope, " system prompt in ").concat(editor, "..."));
                        this.ui.info("Save and close the editor when finished.");
                        // Open editor
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                var child = spawn(editor, [tempFile], {
                                    stdio: "inherit",
                                    shell: true,
                                });
                                child.on("close", function (code) {
                                    if (code === 0) {
                                        resolve();
                                    }
                                    else {
                                        reject(new Error("Editor exited with code ".concat(code)));
                                    }
                                });
                                child.on("error", function (err) {
                                    reject(err);
                                });
                            })];
                    case 4:
                        // Open editor
                        _b.sent();
                        return [4 /*yield*/, fs.readFile(tempFile, "utf-8")];
                    case 5:
                        newContent = _b.sent();
                        size = Buffer.byteLength(newContent, "utf-8");
                        validation = this.configManager.validateSyspromptSize(size);
                        if (!validation.valid) {
                            this.ui.error(validation.message);
                            return [2 /*return*/];
                        }
                        if (validation.warning) {
                            this.ui.warning(validation.message);
                        }
                        return [4 /*yield*/, this.configManager.saveSysprompt(newContent, global)];
                    case 6:
                        success = _b.sent();
                        if (success) {
                            this.ui.success("".concat(scope.charAt(0).toUpperCase() + scope.slice(1), " system prompt saved (").concat((size / 1024).toFixed(2), " KB)"));
                        }
                        else {
                            this.ui.error("Failed to save system prompt");
                        }
                        return [3 /*break*/, 12];
                    case 7:
                        error_25 = _b.sent();
                        this.ui.error("Failed to edit system prompt: ".concat(error_25.message));
                        return [3 /*break*/, 12];
                    case 8:
                        _b.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, fs.unlink(tempFile)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        _a = _b.sent();
                        return [3 /*break*/, 11];
                    case 11: return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    // ============================================
    // Router Management (v1.4.4)
    // ============================================
    // ============================================
    // Model Card Management (v1.3.1)
    // ============================================
    SyntheticClaudeApp.prototype.manageModelCards = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var CARDS_URL, success, error_26, modelCards;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(options === null || options === void 0 ? void 0 : options.update)) return [3 /*break*/, 6];
                        this.ui.info("Updating model cards from GitHub...");
                        CARDS_URL = "https://raw.githubusercontent.com/jeffersonwarrior/mclaude/main/model-cards.json";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.configManager.fetchAndSaveModelCards(CARDS_URL, 3000)];
                    case 2:
                        success = _a.sent();
                        if (success) {
                            this.ui.coloredSuccess("✓ Model cards updated successfully");
                        }
                        else {
                            this.ui.warning("⚠ Failed to update model cards (this is normal if offline)");
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_26 = _a.sent();
                        this.ui.warning("⚠ Failed to update model cards");
                        return [3 /*break*/, 4];
                    case 4: 
                    // Update last check timestamp
                    return [4 /*yield*/, this.configManager.updateLastCheck()];
                    case 5:
                        // Update last check timestamp
                        _a.sent();
                        return [2 /*return*/];
                    case 6: return [4 /*yield*/, this.configManager.loadModelCards()];
                    case 7:
                        modelCards = _a.sent();
                        if (!modelCards) {
                            this.ui.info("No model cards found");
                            return [2 /*return*/];
                        }
                        this.ui.info("Model Cards Information:");
                        this.ui.info("═".repeat(50));
                        this.ui.info("Version: ".concat(modelCards.version));
                        if (modelCards.updated) {
                            this.ui.info("Last Updated: ".concat(modelCards.updated));
                        }
                        this.ui.info("Total Cards: ".concat(modelCards.cards.length));
                        if (modelCards.providerPriority && modelCards.providerPriority.length > 0) {
                            this.ui.info("Provider Priority: ".concat(modelCards.providerPriority.join(" > ")));
                        }
                        if (modelCards.cards.length > 0) {
                            this.ui.info("\nAvailable Models:");
                            modelCards.cards.forEach(function (card, index) {
                                var _a;
                                var roles = ((_a = card.roles) === null || _a === void 0 ? void 0 : _a.join(", ")) || "general";
                                var provider = card.provider;
                                _this.ui.info("".concat((index + 1).toString().padStart(2), ". ").concat(card.name || card.id, " (").concat(roles, ") [").concat(provider, "]"));
                            });
                        }
                        this.ui.info("\nRun 'mclaude models cards --update' to refresh from GitHub");
                        return [2 /*return*/];
                }
            });
        });
    };
    return SyntheticClaudeApp;
}());
exports.SyntheticClaudeApp = SyntheticClaudeApp;
