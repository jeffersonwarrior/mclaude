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
exports.ClaudeLauncher = void 0;
var child_process_1 = require("child_process");
var manager_1 = require("../router/manager");
var ClaudeLauncher = /** @class */ (function () {
    function ClaudeLauncher(claudePath, configManager) {
        this.claudePath = claudePath || "claude";
        this.configManager = configManager;
    }
    ClaudeLauncher.prototype.launchClaudeCode = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var routerManager, routerStatus, error_1, validation, primaryProvider, fallbackProvider, fallbackOptions, fallbackValidation, error_2, errorMessage;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 9, , 10]);
                        if (!((_b = (_a = this.configManager) === null || _a === void 0 ? void 0 : _a.config.liteLLM) === null || _b === void 0 ? void 0 : _b.enabled)) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        routerManager = (0, manager_1.getRouterManager)(this.configManager);
                        return [4 /*yield*/, routerManager.initializeRouter()];
                    case 2:
                        routerStatus = _c.sent();
                        if (routerStatus.running) {
                            console.info("LiteLLM proxy started successfully at ".concat(routerStatus.url));
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _c.sent();
                        console.warn("Failed to start LiteLLM proxy, will use direct connections: ".concat(error_1));
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, this.validateEnvironment(options)];
                    case 5:
                        validation = _c.sent();
                        if (!!validation.valid) return [3 /*break*/, 8];
                        console.error("Environment validation failed:");
                        validation.errors.forEach(function (error) { return console.error("  - ".concat(error)); });
                        primaryProvider = this.resolveProvider(options);
                        fallbackProvider = this.getFallbackProvider(primaryProvider);
                        if (!fallbackProvider) return [3 /*break*/, 7];
                        console.info("Attempting fallback to ".concat(fallbackProvider, " provider"));
                        fallbackOptions = __assign(__assign({}, options), { provider: fallbackProvider });
                        return [4 /*yield*/, this.validateEnvironment(fallbackOptions)];
                    case 6:
                        fallbackValidation = _c.sent();
                        if (fallbackValidation.valid) {
                            return [2 /*return*/, this.launchWithOptions(fallbackOptions)];
                        }
                        else {
                            console.error("Fallback provider validation also failed:");
                            fallbackValidation.errors.forEach(function (error) {
                                return console.error("  - ".concat(error));
                            });
                        }
                        _c.label = 7;
                    case 7: return [2 /*return*/, {
                            success: false,
                            error: "Environment validation failed: ".concat(validation.errors.join(", ")),
                        }];
                    case 8: return [2 /*return*/, this.launchWithOptions(options)];
                    case 9:
                        error_2 = _c.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : "Unknown error";
                        console.error("Error launching Claude Code: ".concat(errorMessage));
                        return [2 /*return*/, {
                                success: false,
                                error: errorMessage,
                            }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Launch Claude Code with validated options
     */
    ClaudeLauncher.prototype.launchWithOptions = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var env_1, provider, thinkingProvider, args_1, errorMessage;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    env_1 = __assign(__assign(__assign({}, process.env), this.createClaudeEnvironment(options)), options.env);
                    provider = this.resolveProvider(options);
                    console.info("Launching Claude Code with ".concat(provider, " provider using model: ").concat(options.model));
                    if (options.thinkingModel) {
                        thinkingProvider = this.resolveThinkingProvider(options.thinkingModel, provider);
                        if (thinkingProvider !== provider) {
                            console.info("Hybrid setup: Regular model from ".concat(provider, ", thinking model from ").concat(thinkingProvider));
                        }
                        console.info("Thinking model: ".concat(options.thinkingModel));
                    }
                    args_1 = __spreadArray([], (options.additionalArgs || []), true);
                    // Add system prompt if provided (v1.3.0)
                    if (options.sysprompt) {
                        args_1.push("--append-system-prompt", options.sysprompt);
                    }
                    return [2 /*return*/, new Promise(function (resolve) {
                            var child = (0, child_process_1.spawn)(_this.claudePath, args_1, {
                                stdio: "inherit",
                                env: env_1,
                                // Remove detached mode to maintain proper terminal interactivity
                            });
                            child.on("spawn", function () {
                                resolve({
                                    success: true,
                                    pid: child.pid || undefined,
                                });
                            });
                            child.on("error", function (error) {
                                console.error("Failed to launch Claude Code: ".concat(error.message));
                                resolve({
                                    success: false,
                                    error: error.message,
                                });
                            });
                            // Don't unref the process - let it maintain control of the terminal
                        })];
                }
                catch (error) {
                    errorMessage = error instanceof Error ? error.message : "Unknown error";
                    console.error("Error launching Claude Code: ".concat(errorMessage));
                    return [2 /*return*/, {
                            success: false,
                            error: errorMessage,
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    ClaudeLauncher.prototype.createClaudeEnvironment = function (options) {
        var _a, _b, _c, _d, _e;
        var env = {};
        var provider = this.resolveProvider(options);
        var providerConfig = this.getProviderConfig(provider);
        if (!providerConfig) {
            throw new Error("No configuration found for provider: ".concat(provider));
        }
        // Use LiteLLM proxy if enabled and running, otherwise use direct connection
        var baseUrl = providerConfig.anthropicBaseUrl;
        if ((_b = (_a = this.configManager) === null || _a === void 0 ? void 0 : _a.config.liteLLM) === null || _b === void 0 ? void 0 : _b.enabled) {
            try {
                var routerManager = (0, manager_1.getRouterManager)(this.configManager);
                var routerStatus = routerManager.getRouterStatus();
                if (routerStatus === null || routerStatus === void 0 ? void 0 : routerStatus.running) {
                    baseUrl = "".concat(routerStatus.url, "/v1");
                    console.info("Routing through LiteLLM proxy: ".concat(baseUrl));
                }
            }
            catch (error) {
                console.warn("Failed to get router status, using direct connection: ".concat(error));
            }
        }
        // Set Anthropic base URL
        env.ANTHROPIC_BASE_URL = baseUrl;
        // Set the provider's API key
        var apiKey = this.getProviderApiKey(provider);
        env.ANTHROPIC_AUTH_TOKEN = apiKey;
        // The model will be routed directly to the provider
        var model = options.model;
        // Set all the model environment variables to the full model identifier
        // This ensures Claude Code uses the correct model regardless of which tier it requests
        env.ANTHROPIC_DEFAULT_OPUS_MODEL = model;
        env.ANTHROPIC_DEFAULT_SONNET_MODEL = model;
        env.ANTHROPIC_DEFAULT_HAIKU_MODEL = model;
        env.ANTHROPIC_DEFAULT_HF_MODEL = model;
        env.ANTHROPIC_DEFAULT_MODEL = model;
        // Get subagent model from config (use same provider)
        var subagentModel = ((_e = (_d = (_c = this.configManager) === null || _c === void 0 ? void 0 : _c.config.recommendedModels) === null || _d === void 0 ? void 0 : _d.subagent) === null || _e === void 0 ? void 0 : _e.primary) || model;
        env.CLAUDE_CODE_SUBAGENT_MODEL = subagentModel;
        // Set thinking model if provided
        if (options.thinkingModel) {
            env.ANTHROPIC_THINKING_MODEL = options.thinkingModel;
        }
        // Apply provider-specific optimizations
        this.applyProviderOptimizations(env, provider, options);
        // Disable non-essential traffic
        env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = "1";
        return env;
    };
    /**
     * Resolve the provider for the given model/options
     */
    ClaudeLauncher.prototype.resolveProvider = function (options) {
        // If provider is explicitly specified, use it
        if (options.provider) {
            return options.provider;
        }
        // If modelInfo is available, get provider from there
        if (options.modelInfo) {
            return options.modelInfo.getProvider();
        }
        // Try to infer provider from model ID
        if (options.model.includes(":")) {
            var modelProvider = options.model.split(":", 1)[0];
            if (modelProvider === "synthetic" || modelProvider === "minimax") {
                return modelProvider;
            }
        }
        // Fallback to synthetic (default provider)
        console.warn("Could not determine provider for model ".concat(options.model, ", defaulting to synthetic"));
        return "synthetic";
    };
    /**
     * Resolve provider for thinking model (might be different from main model)
     */
    ClaudeLauncher.prototype.resolveThinkingProvider = function (thinkingModel, defaultProvider) {
        // Try to infer provider from thinking model ID
        if (thinkingModel.includes(":")) {
            var thinkingProvider = thinkingModel.split(":", 1)[0];
            if (thinkingProvider === "synthetic" || thinkingProvider === "minimax") {
                return thinkingProvider;
            }
        }
        // If no specific provider info, use same as main model
        return defaultProvider;
    };
    /**
     * Get provider configuration
     */
    ClaudeLauncher.prototype.getProviderConfig = function (provider) {
        if (!this.configManager) {
            // Fallback to default configurations if no config manager
            var defaultConfigs = {
                synthetic: {
                    anthropicBaseUrl: "https://api.synthetic.new/anthropic",
                    modelsApiUrl: "https://api.synthetic.new/openai/v1/models",
                },
                minimax: {
                    anthropicBaseUrl: "https://api.minimax.io/anthropic",
                    modelsApiUrl: "https://api.minimax.io/v1/models",
                },
            };
            if (provider === "auto") {
                // For 'auto' provider, fallback to synthetic
                return defaultConfigs.synthetic;
            }
            return defaultConfigs[provider];
        }
        if (provider === "auto") {
            // For 'auto' provider, get the first enabled provider's config
            if (!this.configManager) {
                throw new Error("ConfigManager required for auto provider");
            }
            var configManager_1 = this.configManager;
            var enabledProviders = ["synthetic", "minimax"].filter(function (p) {
                return configManager_1.isProviderEnabled(p);
            });
            if (enabledProviders.length > 0) {
                return configManager_1.getProviderConfig(enabledProviders[0]);
            }
            // Fallback to synthetic if no providers enabled
            return configManager_1.getProviderConfig("synthetic");
        }
        if (!this.configManager) {
            throw new Error("ConfigManager required");
        }
        return this.configManager.getProviderConfig(provider);
    };
    /**
     * Get API key for provider
     */
    ClaudeLauncher.prototype.getProviderApiKey = function (provider) {
        if (!this.configManager) {
            throw new Error("ConfigManager required to get API key for provider: ".concat(provider));
        }
        if (provider === "auto") {
            // For 'auto' provider, get the first available API key
            if (!this.configManager) {
                throw new Error("ConfigManager required for auto provider");
            }
            var configManager_2 = this.configManager;
            var enabledProviders = ["synthetic", "minimax"].filter(function (p) {
                return configManager_2.isProviderEnabled(p);
            });
            for (var _i = 0, enabledProviders_1 = enabledProviders; _i < enabledProviders_1.length; _i++) {
                var p = enabledProviders_1[_i];
                var apiKey = configManager_2.getEffectiveApiKey(p);
                if (apiKey) {
                    return apiKey;
                }
            }
            // Fallback to synthetic if no API keys available
            return configManager_2.getEffectiveApiKey("synthetic");
        }
        if (!this.configManager) {
            throw new Error("ConfigManager required");
        }
        return this.configManager.getEffectiveApiKey(provider);
    };
    /**
     * Apply provider-specific optimizations
     */
    ClaudeLauncher.prototype.applyProviderOptimizations = function (env, provider, options) {
        var _a, _b, _c, _d, _e, _f, _g;
        switch (provider) {
            case "minimax": {
                // MiniMax-specific optimizations
                // Extended timeout for MiniMax M2
                if (options.model.includes("MiniMax-M2") ||
                    options.model.includes("M2")) {
                    env.CLAUDE_CODE_REQUEST_TIMEOUT = "3000000"; // 50 minutes
                }
                // MiniMax may benefit from smaller batch sizes
                env.CLAUDE_CODE_BATCH_SIZE = "1";
                // MiniMax M2 enhancements (v1.3.0)
                // Get minimax config for default values
                var minimaxConfig = (_a = this.configManager) === null || _a === void 0 ? void 0 : _a.getProviderConfig("minimax");
                // Temperature
                var temperature = (_b = options.temperature) !== null && _b !== void 0 ? _b : minimaxConfig === null || minimaxConfig === void 0 ? void 0 : minimaxConfig.temperature;
                if (temperature !== undefined) {
                    env.CLAUDE_CODE_TEMPERATURE = String(temperature);
                }
                // Top-P
                var topP = (_c = options.topP) !== null && _c !== void 0 ? _c : minimaxConfig === null || minimaxConfig === void 0 ? void 0 : minimaxConfig.topP;
                if (topP !== undefined) {
                    env.CLAUDE_CODE_TOP_P = String(topP);
                }
                // Context size (MiniMax M2 supports up to 1M tokens)
                var contextSize = (_d = options.contextSize) !== null && _d !== void 0 ? _d : minimaxConfig === null || minimaxConfig === void 0 ? void 0 : minimaxConfig.contextSize;
                if (contextSize !== undefined) {
                    env.CLAUDE_CODE_CONTEXT_SIZE = String(contextSize);
                }
                // Tool choice
                var toolChoice = (_e = options.toolChoice) !== null && _e !== void 0 ? _e : minimaxConfig === null || minimaxConfig === void 0 ? void 0 : minimaxConfig.toolChoice;
                if (toolChoice !== undefined) {
                    env.CLAUDE_CODE_TOOL_CHOICE = toolChoice;
                }
                // Parallel tool calls (default true for MiniMax M2)
                var parallelToolCalls = (_f = minimaxConfig === null || minimaxConfig === void 0 ? void 0 : minimaxConfig.parallelToolCalls) !== null && _f !== void 0 ? _f : true;
                if (parallelToolCalls) {
                    env.CLAUDE_CODE_PARALLEL_TOOL_CALLS = "1";
                }
                // Response format (JSON mode)
                var responseFormat = options.jsonMode
                    ? "json_object"
                    : minimaxConfig === null || minimaxConfig === void 0 ? void 0 : minimaxConfig.responseFormat;
                if (responseFormat === "json_object") {
                    env.CLAUDE_CODE_RESPONSE_FORMAT = "json_object";
                }
                // Memory compact mode
                var memoryCompact = (_g = options.memoryCompact) !== null && _g !== void 0 ? _g : minimaxConfig === null || minimaxConfig === void 0 ? void 0 : minimaxConfig.memoryCompact;
                if (memoryCompact) {
                    env.CLAUDE_CODE_MEMORY_COMPACT = "1";
                }
                break;
            }
            case "synthetic":
                // Synthetic-specific optimizations
                env.CLAUDE_CODE_REQUEST_TIMEOUT = "600000"; // 10 minutes default
                break;
        }
        // Common optimizations
        // Streaming (can be disabled with --no-stream)
        if (options.stream === false) {
            env.CLAUDE_CODE_ENABLE_STREAMING = "0";
        }
        else {
            env.CLAUDE_CODE_ENABLE_STREAMING = "1";
        }
        env.CLAUDE_CODE_ENABLE_THINKING = options.thinkingModel ? "1" : "0";
    };
    /**
     * Validate environment setup before launch
     */
    ClaudeLauncher.prototype.validateEnvironment = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, provider, apiKey, thinkingProvider, thinkingApiKey;
            return __generator(this, function (_a) {
                errors = [];
                try {
                    provider = this.resolveProvider(options);
                    // Check if provider is enabled
                    if (this.configManager &&
                        !this.configManager.isProviderEnabled(provider)) {
                        errors.push("Provider '".concat(provider, "' is not enabled"));
                    }
                    // Check if API key is available
                    try {
                        apiKey = this.getProviderApiKey(provider);
                        if (!apiKey) {
                            errors.push("No API key configured for provider '".concat(provider, "'"));
                        }
                    }
                    catch (error) {
                        errors.push("Failed to get API key for provider '".concat(provider, "': ").concat(error));
                    }
                    // Validate thinking model setup if provided
                    if (options.thinkingModel) {
                        thinkingProvider = this.resolveThinkingProvider(options.thinkingModel, provider);
                        if (this.configManager &&
                            !this.configManager.isProviderEnabled(thinkingProvider)) {
                            errors.push("Thinking model provider '".concat(thinkingProvider, "' is not enabled"));
                        }
                        try {
                            thinkingApiKey = this.getProviderApiKey(thinkingProvider);
                            if (!thinkingApiKey) {
                                errors.push("No API key configured for thinking model provider '".concat(thinkingProvider, "'"));
                            }
                        }
                        catch (error) {
                            errors.push("Failed to get API key for thinking model provider '".concat(thinkingProvider, "': ").concat(error));
                        }
                    }
                }
                catch (error) {
                    errors.push("Environment validation failed: ".concat(error));
                }
                return [2 /*return*/, {
                        valid: errors.length === 0,
                        errors: errors,
                    }];
            });
        });
    };
    /**
     * Get fallback provider if primary provider fails
     */
    ClaudeLauncher.prototype.getFallbackProvider = function (primaryProvider) {
        if (!this.configManager) {
            return null;
        }
        // Simple fallback strategy: try synthetic first, then other enabled providers
        var fallbackOrder = ["synthetic", "minimax"];
        for (var _i = 0, fallbackOrder_1 = fallbackOrder; _i < fallbackOrder_1.length; _i++) {
            var provider = fallbackOrder_1[_i];
            if (provider !== primaryProvider &&
                this.configManager.isProviderEnabled(provider)) {
                var apiKey = this.configManager.getEffectiveApiKey(provider);
                if (apiKey) {
                    console.warn("Falling back from ".concat(primaryProvider, " to ").concat(provider));
                    return provider;
                }
            }
        }
        return null;
    };
    ClaudeLauncher.prototype.checkClaudeInstallation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var child = (0, child_process_1.spawn)(_this.claudePath, ["--version"], {
                            stdio: "pipe",
                        });
                        child.on("spawn", function () {
                            resolve(true);
                        });
                        child.on("error", function () {
                            resolve(false);
                        });
                        // Force resolution after timeout
                        setTimeout(function () { return resolve(false); }, 5000);
                    })];
            });
        });
    };
    ClaudeLauncher.prototype.getClaudeVersion = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var _a;
                        var child = (0, child_process_1.spawn)(_this.claudePath, ["--version"], {
                            stdio: "pipe",
                        });
                        var output = "";
                        (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (data) {
                            output += data.toString();
                        });
                        child.on("close", function (code) {
                            if (code === 0) {
                                resolve(output.trim());
                            }
                            else {
                                resolve(null);
                            }
                        });
                        child.on("error", function () {
                            resolve(null);
                        });
                        // Force resolution after timeout
                        setTimeout(function () { return resolve(null); }, 5000);
                    })];
            });
        });
    };
    ClaudeLauncher.prototype.setClaudePath = function (path) {
        this.claudePath = path;
    };
    ClaudeLauncher.prototype.getClaudePath = function () {
        return this.claudePath;
    };
    /**
     * Cleanup resources including LiteLLM proxy
     */
    ClaudeLauncher.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var routerManager, error_3;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!((_b = (_a = this.configManager) === null || _a === void 0 ? void 0 : _a.config.liteLLM) === null || _b === void 0 ? void 0 : _b.enabled)) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        routerManager = (0, manager_1.getRouterManager)(this.configManager);
                        return [4 /*yield*/, routerManager.cleanup()];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _c.sent();
                        console.warn("Failed to cleanup router: ".concat(error_3));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ClaudeLauncher;
}());
exports.ClaudeLauncher = ClaudeLauncher;
