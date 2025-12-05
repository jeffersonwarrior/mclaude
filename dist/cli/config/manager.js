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
exports.ConfigManager = void 0;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var os_1 = require("os");
var fs_1 = require("fs");
var types_1 = require("./types");
var env_1 = require("./env");
var ConfigManager = /** @class */ (function () {
    function ConfigManager(configDir) {
        this._config = null;
        this._configHierarchy = null;
        this.workspaceRoot = null;
        this.globalConfigDir = configDir || (0, path_1.join)((0, os_1.homedir)(), ".config", "mclaude");
        this.globalConfigPath = (0, path_1.join)(this.globalConfigDir, "config.json");
        this.localProjectDir = this.findLocalProjectConfig();
        this.localConfigPath = this.localProjectDir
            ? (0, path_1.join)(this.localProjectDir, "config.json")
            : "";
    }
    /**
     * Find the local project config directory by walking up from current directory
     * Returns null if no .mclaude directory is found
     */
    ConfigManager.prototype.findLocalProjectConfig = function () {
        var cwd = process.cwd();
        var currentDir = cwd;
        while (currentDir !== "/") {
            var mclaudeDir = (0, path_1.join)(currentDir, ".mclaude");
            if ((0, fs_1.existsSync)(mclaudeDir)) {
                this.workspaceRoot = currentDir;
                return mclaudeDir;
            }
            currentDir = (0, path_1.join)(currentDir, "..");
        }
        return null;
    };
    /**
     * Get the type of config currently being used
     */
    ConfigManager.prototype.getConfigType = function () {
        var _a;
        return ((_a = this._configHierarchy) === null || _a === void 0 ? void 0 : _a.localProjectConfig) ? "local" : "global";
    };
    /**
     * Get the workspace root if local config is available
     */
    ConfigManager.prototype.getWorkspaceRoot = function () {
        return this.workspaceRoot;
    };
    /**
     * Initialize a local project configuration
     */
    ConfigManager.prototype.initLocalConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cwd, projectDir, defaultConfig, configPath, configJson, tempPath, fs, writeError_1, fsSync, fsPromises, _a, envLocalPath, envTemplate, envError_1, gitignorePath, gitignoreTemplate, gitignoreError_1, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.localProjectDir) {
                            throw new types_1.ConfigLoadError("Local project config already exists at " + this.localProjectDir);
                        }
                        cwd = process.cwd();
                        projectDir = (0, path_1.join)(cwd, ".mclaude");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 24, , 25]);
                        return [4 /*yield*/, (0, promises_1.mkdir)(projectDir, { recursive: true })];
                    case 2:
                        _b.sent();
                        defaultConfig = types_1.AppConfigSchema.parse({
                            configVersion: 2,
                            providers: {
                                synthetic: { enabled: true },
                                minimax: { enabled: true },
                            },
                            recommendedModels: {
                                default: {
                                    primary: "hf:deepseek-ai/DeepSeek-V3.2",
                                    backup: "hf:MiniMaxAI/MiniMax-M2",
                                },
                                smallFast: {
                                    primary: "hf:meta-llama/Llama-4-Scout-17B-16E-Instruct",
                                    backup: "hf:meta-llama/Llama-3.1-8B-Instruct",
                                },
                                thinking: {
                                    primary: "hf:MiniMaxAI/MiniMax-M2",
                                    backup: "hf:deepseek-ai/DeepSeek-R1",
                                },
                                subagent: {
                                    primary: "synthetic:deepseek-ai/DeepSeek-V3.2",
                                    backup: "minimax:MiniMax-M2",
                                },
                            },
                        });
                        configPath = (0, path_1.join)(projectDir, "config.json");
                        configJson = JSON.stringify(defaultConfig, null, 2);
                        tempPath = (0, path_1.join)(projectDir, "config.json.tmp");
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 13]);
                        return [4 /*yield*/, (0, promises_1.writeFile)(tempPath, configJson, "utf-8")];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, (0, promises_1.chmod)(tempPath, 420)];
                    case 5:
                        _b.sent(); // More permissive for repo sharing
                        fs = require("fs/promises");
                        return [4 /*yield*/, fs.rename(tempPath, configPath)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 7:
                        writeError_1 = _b.sent();
                        _b.label = 8;
                    case 8:
                        _b.trys.push([8, 11, , 12]);
                        fsSync = require("fs");
                        fsPromises = require("fs/promises");
                        if (!fsSync.existsSync(tempPath)) return [3 /*break*/, 10];
                        return [4 /*yield*/, fsPromises.unlink(tempPath)];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        _a = _b.sent();
                        return [3 /*break*/, 12];
                    case 12:
                        // Handle permission errors gracefully
                        if (writeError_1.code === "EACCES" || writeError_1.code === "EPERM") {
                            throw new types_1.ConfigSaveError("Permission denied when creating local config at ".concat(configPath, ". ") +
                                "Check directory permissions.", writeError_1);
                        }
                        throw writeError_1;
                    case 13:
                        envLocalPath = (0, path_1.join)(projectDir, ".env.local");
                        envTemplate = "# Local environment overrides (do not commit to git)\n# SYNTHETIC_API_KEY=\n# MINIMAX_API_KEY=\n# MINIMAX_GROUP_ID=\n";
                        _b.label = 14;
                    case 14:
                        _b.trys.push([14, 17, , 18]);
                        return [4 /*yield*/, (0, promises_1.writeFile)(envLocalPath, envTemplate, "utf-8")];
                    case 15:
                        _b.sent();
                        return [4 /*yield*/, (0, promises_1.chmod)(envLocalPath, 384)];
                    case 16:
                        _b.sent(); // Restrictive for security
                        return [3 /*break*/, 18];
                    case 17:
                        envError_1 = _b.sent();
                        if (envError_1.code === "EACCES" || envError_1.code === "EPERM") {
                            console.warn("Permission denied when creating ".concat(envLocalPath, ". ") +
                                "You may need to create this file manually.", envError_1);
                            // Continue anyway - this file is optional
                        }
                        else {
                            throw envError_1;
                        }
                        return [3 /*break*/, 18];
                    case 18:
                        gitignorePath = (0, path_1.join)(projectDir, ".gitignore");
                        gitignoreTemplate = ".env.local\n# Local secrets\n# Template - uncomment if you want to add secrets to git ignore\n# Add other sensitive files here\n";
                        _b.label = 19;
                    case 19:
                        _b.trys.push([19, 22, , 23]);
                        return [4 /*yield*/, (0, promises_1.writeFile)(gitignorePath, gitignoreTemplate, "utf-8")];
                    case 20:
                        _b.sent();
                        return [4 /*yield*/, (0, promises_1.chmod)(gitignorePath, 420)];
                    case 21:
                        _b.sent();
                        return [3 /*break*/, 23];
                    case 22:
                        gitignoreError_1 = _b.sent();
                        if (gitignoreError_1.code === "EACCES" ||
                            gitignoreError_1.code === "EPERM") {
                            console.warn("Permission denied when creating ".concat(gitignorePath, ". ") +
                                "You may need to create this file manually.", gitignoreError_1);
                            // Continue anyway - this file is optional
                        }
                        else {
                            throw gitignoreError_1;
                        }
                        return [3 /*break*/, 23];
                    case 23:
                        // Reset cached config to reload with new local config
                        this._config = null;
                        this._configHierarchy = null;
                        this.localProjectDir = projectDir;
                        this.localConfigPath = configPath;
                        this.workspaceRoot = cwd;
                        return [2 /*return*/, true];
                    case 24:
                        error_1 = _b.sent();
                        throw new types_1.ConfigSaveError("Failed to initialize local config at ".concat(projectDir), error_1);
                    case 25: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Migrate global config to local project config
     */
    ConfigManager.prototype.migrateToLocal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var globalConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.localProjectDir) {
                            throw new types_1.ConfigLoadError("Local config already exists at " + this.localProjectDir);
                        }
                        globalConfig = this.loadGlobalConfig();
                        if (!globalConfig) {
                            throw new types_1.ConfigLoadError("No global configuration to migrate");
                        }
                        // Create local config
                        return [4 /*yield*/, this.initLocalConfig()];
                    case 1:
                        // Create local config
                        _a.sent();
                        // Copy global config to local
                        return [4 /*yield*/, this.saveLocalConfig(globalConfig)];
                    case 2:
                        // Copy global config to local
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Save configuration to local config file
     */
    ConfigManager.prototype.saveLocalConfig = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var fs, fsSync, permissions, stats, tempPath, configJson, chmodError_1, timestamp, backupPath, existingData, backupError_1, writeError_2, _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.localProjectDir) {
                            throw new types_1.ConfigLoadError("No local project configuration directory found");
                        }
                        fs = require("fs/promises");
                        fsSync = require("fs");
                        permissions = null;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 24, , 25]);
                        // Try to preserve existing file permissions
                        if (fsSync.existsSync(this.localConfigPath)) {
                            try {
                                stats = fsSync.statSync(this.localConfigPath);
                                permissions = stats.mode;
                            }
                            catch (_c) {
                                // If we can't read permissions, default to repo-sharing mode
                                permissions = 420;
                            }
                        }
                        tempPath = "".concat(this.localConfigPath, ".tmp");
                        configJson = JSON.stringify(config, null, 2);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 17, , 23]);
                        // Write to temporary file first
                        return [4 /*yield*/, (0, promises_1.writeFile)(tempPath, configJson, "utf-8")];
                    case 3:
                        // Write to temporary file first
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 9, , 10]);
                        if (!permissions) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, promises_1.chmod)(tempPath, permissions)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, (0, promises_1.chmod)(tempPath, 420)];
                    case 7:
                        _b.sent(); // More permissive for repo sharing
                        _b.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        chmodError_1 = _b.sent();
                        console.warn("Failed to set permissions on local config file:", chmodError_1);
                        return [3 /*break*/, 10];
                    case 10:
                        if (!fsSync.existsSync(this.localConfigPath)) return [3 /*break*/, 15];
                        timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                        backupPath = "".concat(this.localConfigPath, ".backup.").concat(timestamp);
                        _b.label = 11;
                    case 11:
                        _b.trys.push([11, 14, , 15]);
                        return [4 /*yield*/, (0, promises_1.readFile)(this.localConfigPath, "utf-8")];
                    case 12:
                        existingData = _b.sent();
                        return [4 /*yield*/, (0, promises_1.writeFile)(backupPath, existingData, "utf-8")];
                    case 13:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        backupError_1 = _b.sent();
                        // Backup failed, but continue with saving
                        console.warn("Failed to create local config backup:", backupError_1);
                        return [3 /*break*/, 15];
                    case 15: 
                    // Rename temp file to final location (atomic operation)
                    return [4 /*yield*/, fs.rename(tempPath, this.localConfigPath)];
                    case 16:
                        // Rename temp file to final location (atomic operation)
                        _b.sent();
                        return [3 /*break*/, 23];
                    case 17:
                        writeError_2 = _b.sent();
                        _b.label = 18;
                    case 18:
                        _b.trys.push([18, 21, , 22]);
                        if (!fsSync.existsSync(tempPath)) return [3 /*break*/, 20];
                        return [4 /*yield*/, fs.unlink(tempPath)];
                    case 19:
                        _b.sent();
                        _b.label = 20;
                    case 20: return [3 /*break*/, 22];
                    case 21:
                        _a = _b.sent();
                        return [3 /*break*/, 22];
                    case 22:
                        // Handle permission errors gracefully
                        if (writeError_2.code === "EACCES" || writeError_2.code === "EPERM") {
                            console.warn("Permission denied when writing to ".concat(this.localConfigPath, ". ") +
                                "Configuration will not be persisted.", writeError_2);
                            // Don't throw - allow the application to continue with in-memory config
                            this._config = config;
                            this._configHierarchy = null;
                            return [2 /*return*/, false];
                        }
                        throw writeError_2;
                    case 23:
                        // Reset cached config
                        this._config = null;
                        this._configHierarchy = null;
                        return [2 /*return*/, true];
                    case 24:
                        error_2 = _b.sent();
                        throw new types_1.ConfigSaveError("Failed to save local config to ".concat(this.localConfigPath), error_2);
                    case 25: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(ConfigManager.prototype, "config", {
        get: function () {
            if (this._config === null) {
                this._configHierarchy = this.loadConfigHierarchy();
                this._config = this.mergeConfigHierarchy(this._configHierarchy);
            }
            // Apply environment variable overrides every time config is accessed
            // This ensures tests can modify environment variables and see the changes
            this._config = this.applyEnvironmentOverrides(this._config);
            return this._config;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Load the complete configuration hierarchy
     */
    ConfigManager.prototype.loadConfigHierarchy = function () {
        var hierarchy = {};
        // 1. Local Project: .mclaude/config.json
        if (this.localProjectDir && (0, fs_1.existsSync)(this.localConfigPath)) {
            hierarchy.localProjectConfig = this.loadConfigFile(this.localConfigPath);
        }
        // 2. Local Project: .env (current directory)
        hierarchy.LocalProjectEnv = this.loadLocalEnvConfig();
        // 3. Global User: ~/.config/mclaude/config.json
        hierarchy.globalUserConfig = this.loadGlobalConfig();
        // 4. System Environment is handled in applyEnvironmentOverrides
        return hierarchy;
    };
    /**
     * Load configuration from a specific file path
     */
    ConfigManager.prototype.loadConfigFile = function (filePath) {
        var _a, _b;
        try {
            var fs = require("fs");
            // Check if file exists before trying to read it
            if (!fs.existsSync(filePath)) {
                return null;
            }
            var rawConfigData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            // Check if this is a legacy configuration
            if (!rawConfigData.configVersion || rawConfigData.configVersion < 2) {
                return this.migrateLegacyConfig(rawConfigData);
            }
            var result = types_1.AppConfigSchema.safeParse(rawConfigData);
            if (!result.success) {
                console.warn("Configuration validation failed for ".concat(filePath, ":"), result.error.message);
                return null;
            }
            // v1.4.4: Migration - if recommendedModels exist but selectedModel doesn't, migrate them
            var config = result.data;
            if (config.recommendedModels &&
                !config.selectedModel &&
                config.firstRunCompleted) {
                console.log("Migrating recommended models to selected model fields...");
                config.selectedModel = ((_a = config.recommendedModels.default) === null || _a === void 0 ? void 0 : _a.primary) || "";
                config.selectedThinkingModel =
                    ((_b = config.recommendedModels.thinking) === null || _b === void 0 ? void 0 : _b.primary) || "";
                // Save the migrated config
                this.saveConfig(config);
            }
            return config;
        }
        catch (error) {
            console.warn("Failed to load configuration from ".concat(filePath, ":"), error);
            return null;
        }
    };
    /**
     * Load configuration from local .env file
     */
    ConfigManager.prototype.loadLocalEnvConfig = function () {
        // Implementation would parse .env files and convert to AppConfig format
        // For now, this is handled by applyEnvironmentOverrides from system environment
        return null;
    };
    /**
     * Load global configuration
     */
    ConfigManager.prototype.loadGlobalConfig = function () {
        return this.loadConfigFile(this.globalConfigPath);
    };
    /**
     * Merge configuration hierarchy with proper priority
     * Priority: Local Project > Local .env > Global > Defaults
     */
    ConfigManager.prototype.mergeConfigHierarchy = function (hierarchy) {
        var defaultConfig = types_1.AppConfigSchema.parse({
            configVersion: 2,
            providers: {
                synthetic: { enabled: true },
                minimax: { enabled: true },
            },
            recommendedModels: {
                default: {
                    primary: "hf:deepseek-ai/DeepSeek-V3.2",
                    backup: "minimax:MiniMax-M2",
                },
                smallFast: {
                    primary: "hf:meta-llama/Llama-4-Scout-17B-16E-Instruct",
                    backup: "hf:meta-llama/Llama-3.1-8B-Instruct",
                },
                thinking: {
                    primary: "minimax:MiniMax-M2",
                    backup: "hf:deepseek-ai/DeepSeek-R1",
                },
                subagent: {
                    primary: "synthetic:deepseek-ai/DeepSeek-V3.2",
                    backup: "minimax:MiniMax-M2",
                },
            },
        });
        // Deep merge with priority order
        var merged = __assign({}, defaultConfig);
        // Apply global config first
        if (hierarchy.globalUserConfig) {
            merged = this.deepMerge(merged, hierarchy.globalUserConfig);
        }
        // Apply local project config (higher priority)
        if (hierarchy.localProjectConfig) {
            merged = this.deepMerge(merged, hierarchy.localProjectConfig);
        }
        // Apply local env config (highest priority)
        if (hierarchy.LocalProjectEnv) {
            merged = this.deepMerge(merged, hierarchy.LocalProjectEnv);
        }
        return merged;
    };
    /**
     * Deep merge two objects
     */
    ConfigManager.prototype.deepMerge = function (target, source) {
        var result = __assign({}, target);
        for (var key in source) {
            var sourceValue = source[key];
            var targetValue = result[key];
            if (sourceValue !== undefined) {
                if (typeof sourceValue === "object" &&
                    sourceValue !== null &&
                    !Array.isArray(sourceValue) &&
                    typeof targetValue === "object" &&
                    targetValue !== null &&
                    !Array.isArray(targetValue)) {
                    result[key] = this.deepMerge(targetValue, sourceValue);
                }
                else {
                    result[key] = sourceValue;
                }
            }
        }
        return result;
    };
    ConfigManager.prototype.applyEnvironmentOverrides = function (config) {
        // Get fresh environment variables
        var envVars = env_1.envManager.getEnvironmentVariables();
        var updatedConfig = __assign({}, config);
        // Apply environment variable overrides
        if (envVars.SYNTHETIC_API_KEY) {
            if (!updatedConfig.envOverrides.synthetic) {
                updatedConfig.envOverrides.synthetic = {};
            }
            updatedConfig.envOverrides.synthetic.apiKey = envVars.SYNTHETIC_API_KEY;
        }
        if (envVars.MINIMAX_API_KEY) {
            if (!updatedConfig.envOverrides.minimax) {
                updatedConfig.envOverrides.minimax = {};
            }
            updatedConfig.envOverrides.minimax.apiKey = envVars.MINIMAX_API_KEY;
        }
        return updatedConfig;
    };
    ConfigManager.prototype.ensureConfigDir = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, promises_1.mkdir)(this.globalConfigDir, { recursive: true })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        throw new types_1.ConfigSaveError("Failed to create config directory: ".concat(this.globalConfigDir), error_3);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConfigManager.prototype.loadConfig = function () {
        var _a, _b;
        try {
            // Use fs.readFileSync instead of require to avoid module loading errors
            var fs = require("fs");
            if (!fs.existsSync(this.globalConfigPath)) {
                // Config file doesn't exist, return defaults
                var defaultConfig = types_1.AppConfigSchema.parse({});
                return defaultConfig;
            }
            var rawConfigData = JSON.parse(fs.readFileSync(this.globalConfigPath, "utf-8"));
            // Check if this is a legacy configuration (no configVersion or version < 2)
            if (!rawConfigData.configVersion || rawConfigData.configVersion < 2) {
                return this.migrateLegacyConfig(rawConfigData);
            }
            // New multi-provider configuration
            var result = types_1.AppConfigSchema.safeParse(rawConfigData);
            if (!result.success) {
                console.warn("Configuration validation failed, attempting recovery:", result.error.message);
                // Try to preserve firstRunCompleted flag even if other config is invalid
                var preservedConfig = {
                    firstRunCompleted: rawConfigData.firstRunCompleted || false,
                    configVersion: 2, // Ensure version is set
                };
                var fallbackResult = types_1.AppConfigSchema.safeParse(preservedConfig);
                if (fallbackResult.success) {
                    return fallbackResult.data;
                }
                return types_1.AppConfigSchema.parse({ configVersion: 2 });
            }
            // v1.4.4: Migration - if recommendedModels exist but selectedModel doesn't, migrate them
            var config = result.data;
            if (config.recommendedModels &&
                !config.selectedModel &&
                config.firstRunCompleted) {
                console.log("Migrating recommended models to selected model fields...");
                config.selectedModel = ((_a = config.recommendedModels.default) === null || _a === void 0 ? void 0 : _a.primary) || "";
                config.selectedThinkingModel =
                    ((_b = config.recommendedModels.thinking) === null || _b === void 0 ? void 0 : _b.primary) || "";
                // Save the migrated config
                this.saveConfig(config);
            }
            return config;
        }
        catch (error) {
            console.warn("Failed to load configuration, using defaults:", error);
            // Try to recover firstRunCompleted from partial config data
            var fs = require("fs");
            if (fs.existsSync(this.globalConfigPath)) {
                try {
                    var partialConfig = JSON.parse(fs.readFileSync(this.globalConfigPath, "utf-8"));
                    if (partialConfig.firstRunCompleted === true) {
                        return types_1.AppConfigSchema.parse({
                            firstRunCompleted: true,
                            configVersion: 2,
                        });
                    }
                }
                catch (_c) {
                    // Recovery failed, use defaults
                }
            }
            return types_1.AppConfigSchema.parse({ configVersion: 2 });
        }
    };
    ConfigManager.prototype.migrateLegacyConfig = function (legacyConfig) {
        // Try to parse as legacy config first
        var legacyResult = types_1.LegacyAppConfigSchema.safeParse(legacyConfig);
        if (legacyResult.success) {
            var migratedConfig = {
                providers: {
                    synthetic: {
                        apiKey: legacyResult.data.apiKey || "",
                        baseUrl: legacyResult.data.baseUrl || "https://api.synthetic.new",
                        anthropicBaseUrl: legacyResult.data.anthropicBaseUrl ||
                            "https://api.synthetic.new/anthropic",
                        modelsApiUrl: legacyResult.data.modelsApiUrl ||
                            "https://api.synthetic.new/openai/v1/models",
                        enabled: true,
                    },
                    minimax: {
                        // Try to load MiniMax from environment variables or .env file
                        apiKey: env_1.envManager.getApiKey("minimax"),
                        baseUrl: env_1.envManager.getApiUrl("minimax", "base"),
                        anthropicBaseUrl: env_1.envManager.getApiUrl("minimax", "anthropic"),
                        modelsApiUrl: env_1.envManager.getApiUrl("minimax", "openai"),
                        enabled: true,
                        defaultModel: env_1.envManager.getDefaultModel("minimax"),
                        parallelToolCalls: true,
                        streaming: true,
                        memoryCompact: false,
                    },
                },
                defaultProvider: "synthetic", // Preserve existing behavior
                cacheDurationHours: legacyConfig.cacheDurationHours || 24,
                selectedModel: legacyConfig.selectedModel || "",
                selectedThinkingModel: legacyConfig.selectedThinkingModel || "",
                firstRunCompleted: legacyConfig.firstRunCompleted || false,
                envOverrides: {},
                tokenUsage: {
                    totalInputTokens: 0,
                    totalOutputTokens: 0,
                    sessionTokens: 0,
                    history: [],
                },
                responseCache: {
                    enabled: false,
                    ttlMinutes: 60,
                    maxEntries: 100,
                },
                liteLLM: {
                    enabled: false,
                    port: 9313,
                    host: "127.0.0.1",
                    timeout: 300000,
                },
                configVersion: 2,
                recommendedModels: {
                    default: {
                        primary: "hf:deepseek-ai/DeepSeek-V3.2",
                        backup: "hf:MiniMaxAI/MiniMax-M2",
                    },
                    smallFast: {
                        primary: "hf:meta-llama/Llama-4-Scout-17B-16E-Instruct",
                        backup: "hf:meta-llama/Llama-3.1-8B-Instruct",
                    },
                    thinking: {
                        primary: "hf:MiniMaxAI/MiniMax-M2",
                        backup: "hf:deepseek-ai/DeepSeek-R1",
                    },
                    subagent: {
                        primary: "synthetic:deepseek-ai/DeepSeek-V3.2",
                        backup: "minimax:MiniMax-M2",
                    },
                },
            };
            return migratedConfig;
        }
        // Fallback to defaults but preserve what we can
        return types_1.AppConfigSchema.parse({
            selectedModel: legacyConfig.selectedModel || "",
            selectedThinkingModel: legacyConfig.selectedThinkingModel || "",
            firstRunCompleted: legacyConfig.firstRunCompleted || false,
            configVersion: 2,
            recommendedModels: {
                default: {
                    primary: "hf:deepseek-ai/DeepSeek-V3.2",
                    backup: "minimax:MiniMax-M2",
                },
                smallFast: {
                    primary: "hf:meta-llama/Llama-4-Scout-17B-16E-Instruct",
                    backup: "hf:meta-llama/Llama-3.1-8B-Instruct",
                },
                thinking: {
                    primary: "minimax:MiniMax-M2",
                    backup: "hf:deepseek-ai/DeepSeek-R1",
                },
                subagent: {
                    primary: "synthetic:deepseek-ai/DeepSeek-V3.2",
                    backup: "minimax:MiniMax-M2",
                },
            },
        });
    };
    ConfigManager.prototype.saveConfig = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var configToSave;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configToSave = config || this._config;
                        if (!configToSave) {
                            throw new types_1.ConfigSaveError("No configuration to save");
                        }
                        if (!this.localProjectDir) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.saveLocalConfig(configToSave)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, this.saveGlobalConfig(configToSave)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Save configuration to global config file
     */
    ConfigManager.prototype.saveGlobalConfig = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var fs, fsSync, permissions, stats, timestamp, backupPath, existingData, backupError_2, tempPath, configJson, chmodError_2, writeError_3, _a, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 24, , 25]);
                        return [4 /*yield*/, this.ensureConfigDir()];
                    case 1:
                        _b.sent();
                        fs = require("fs/promises");
                        fsSync = require("fs");
                        permissions = null;
                        if (!fsSync.existsSync(this.globalConfigPath)) return [3 /*break*/, 6];
                        try {
                            stats = fsSync.statSync(this.globalConfigPath);
                            permissions = stats.mode;
                        }
                        catch (_c) {
                            // If we can't read permissions, default to secure mode
                            permissions = 384;
                        }
                        timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                        backupPath = "".concat(this.globalConfigPath, ".backup.").concat(timestamp);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, (0, promises_1.readFile)(this.globalConfigPath, "utf-8")];
                    case 3:
                        existingData = _b.sent();
                        return [4 /*yield*/, (0, promises_1.writeFile)(backupPath, existingData, "utf-8")];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        backupError_2 = _b.sent();
                        // Backup failed, but continue with saving
                        console.warn("Failed to create global config backup:", backupError_2);
                        return [3 /*break*/, 6];
                    case 6:
                        tempPath = "".concat(this.globalConfigPath, ".tmp");
                        configJson = JSON.stringify(config, null, 2);
                        _b.label = 7;
                    case 7:
                        _b.trys.push([7, 17, , 23]);
                        // Write to temporary file first
                        return [4 /*yield*/, (0, promises_1.writeFile)(tempPath, configJson, "utf-8")];
                    case 8:
                        // Write to temporary file first
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        _b.trys.push([9, 14, , 15]);
                        if (!permissions) return [3 /*break*/, 11];
                        return [4 /*yield*/, (0, promises_1.chmod)(tempPath, permissions)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 11: return [4 /*yield*/, (0, promises_1.chmod)(tempPath, 384)];
                    case 12:
                        _b.sent();
                        _b.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        chmodError_2 = _b.sent();
                        console.warn("Failed to set permissions on temporary config file:", chmodError_2);
                        return [3 /*break*/, 15];
                    case 15: 
                    // Rename temp file to final location (atomic operation on most systems)
                    return [4 /*yield*/, fs.rename(tempPath, this.globalConfigPath)];
                    case 16:
                        // Rename temp file to final location (atomic operation on most systems)
                        _b.sent();
                        return [3 /*break*/, 23];
                    case 17:
                        writeError_3 = _b.sent();
                        _b.label = 18;
                    case 18:
                        _b.trys.push([18, 21, , 22]);
                        if (!fsSync.existsSync(tempPath)) return [3 /*break*/, 20];
                        return [4 /*yield*/, fs.unlink(tempPath)];
                    case 19:
                        _b.sent();
                        _b.label = 20;
                    case 20: return [3 /*break*/, 22];
                    case 21:
                        _a = _b.sent();
                        return [3 /*break*/, 22];
                    case 22:
                        // Handle permission errors gracefully
                        if (writeError_3.code === "EACCES" || writeError_3.code === "EPERM") {
                            console.warn("Permission denied when writing to ".concat(this.globalConfigPath, ". ") +
                                "Configuration will not be persisted.", writeError_3);
                            // Don't throw - allow the application to continue with in-memory config
                            this._config = config;
                            this._configHierarchy = null;
                            return [2 /*return*/, false];
                        }
                        throw writeError_3;
                    case 23:
                        this._config = config;
                        this._configHierarchy = null; // Reset hierarchy
                        return [2 /*return*/, true];
                    case 24:
                        error_4 = _b.sent();
                        throw new types_1.ConfigSaveError("Failed to save global configuration to ".concat(this.globalConfigPath), error_4);
                    case 25: return [2 /*return*/];
                }
            });
        });
    };
    ConfigManager.prototype.updateConfig = function (updates) {
        return __awaiter(this, void 0, void 0, function () {
            var currentData, updatedData, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        currentData = this.config;
                        updatedData = __assign(__assign({}, currentData), updates);
                        result = types_1.AppConfigSchema.safeParse(updatedData);
                        if (!result.success) {
                            throw new types_1.ConfigValidationError("Invalid configuration update: ".concat(result.error.message));
                        }
                        return [4 /*yield*/, this.saveConfig(result.data)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_5 = _a.sent();
                        if (error_5 instanceof types_1.ConfigValidationError ||
                            error_5 instanceof types_1.ConfigSaveError) {
                            throw error_5;
                        }
                        throw new types_1.ConfigSaveError("Failed to update configuration", error_5);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Legacy methods for backward compatibility
    ConfigManager.prototype.hasApiKey = function () {
        return this.hasSyntheticApiKey();
    };
    ConfigManager.prototype.getApiKey = function () {
        return this.getSyntheticApiKey();
    };
    ConfigManager.prototype.setApiKey = function (apiKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.setSyntheticApiKey(apiKey)];
            });
        });
    };
    // New provider-specific methods
    ConfigManager.prototype.hasSyntheticApiKey = function () {
        var _a;
        var config = this.config;
        var apiKey = ((_a = config.envOverrides.synthetic) === null || _a === void 0 ? void 0 : _a.apiKey) ||
            config.providers.synthetic.apiKey;
        return Boolean(apiKey);
    };
    ConfigManager.prototype.getSyntheticApiKey = function () {
        var _a;
        var config = this.config;
        return (((_a = config.envOverrides.synthetic) === null || _a === void 0 ? void 0 : _a.apiKey) || config.providers.synthetic.apiKey);
    };
    ConfigManager.prototype.setSyntheticApiKey = function (apiKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateProviderConfig("synthetic", { apiKey: apiKey })];
            });
        });
    };
    ConfigManager.prototype.hasMinimaxApiKey = function () {
        var _a;
        var config = this.config;
        var apiKey = ((_a = config.envOverrides.minimax) === null || _a === void 0 ? void 0 : _a.apiKey) || config.providers.minimax.apiKey;
        return Boolean(apiKey);
    };
    ConfigManager.prototype.getMinimaxApiKey = function () {
        var _a;
        var config = this.config;
        return (((_a = config.envOverrides.minimax) === null || _a === void 0 ? void 0 : _a.apiKey) || config.providers.minimax.apiKey);
    };
    ConfigManager.prototype.setMinimaxApiKey = function (apiKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateProviderConfig("minimax", { apiKey: apiKey })];
            });
        });
    };
    ConfigManager.prototype.hasMinimaxGroupId = function () {
        var config = this.config;
        return Boolean(config.providers.minimax.groupId);
    };
    ConfigManager.prototype.getMinimaxGroupId = function () {
        var config = this.config;
        return config.providers.minimax.groupId;
    };
    ConfigManager.prototype.setMinimaxGroupId = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateProviderConfig("minimax", { groupId: groupId })];
            });
        });
    };
    // Provider management methods
    ConfigManager.prototype.isProviderEnabled = function (provider) {
        var config = this.config;
        switch (provider) {
            case "synthetic":
                return config.providers.synthetic.enabled;
            case "minimax":
                return config.providers.minimax.enabled;
            case "auto":
                return true; // Auto is always enabled
            default:
                return false;
        }
    };
    ConfigManager.prototype.setProviderEnabled = function (provider, enabled) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (provider === "auto") {
                    throw new types_1.ConfigValidationError("Cannot enable/disable auto provider");
                }
                return [2 /*return*/, this.updateProviderConfig(provider, { enabled: enabled })];
            });
        });
    };
    ConfigManager.prototype.getDefaultProvider = function () {
        return this.config.defaultProvider;
    };
    ConfigManager.prototype.setDefaultProvider = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateConfig({ defaultProvider: provider })];
            });
        });
    };
    ConfigManager.prototype.getProviderConfig = function (provider) {
        var config = this.config;
        switch (provider) {
            case "synthetic":
                return config.providers.synthetic;
            case "minimax":
                return config.providers.minimax;
            case "auto":
                return null; // Auto doesn't have specific config
            default:
                return null;
        }
    };
    ConfigManager.prototype.updateProviderConfig = function (provider, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var currentConfig, updatedConfig, result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        currentConfig = this.config;
                        updatedConfig = __assign({}, currentConfig);
                        if (provider === "synthetic") {
                            updatedConfig.providers.synthetic = __assign(__assign({}, updatedConfig.providers.synthetic), updates);
                        }
                        else if (provider === "minimax") {
                            updatedConfig.providers.minimax = __assign(__assign({}, updatedConfig.providers.minimax), updates);
                        }
                        else {
                            throw new types_1.ConfigValidationError("Cannot update config for provider: ".concat(provider));
                        }
                        result = types_1.AppConfigSchema.safeParse(updatedConfig);
                        if (!result.success) {
                            throw new types_1.ConfigValidationError("Invalid provider configuration update: ".concat(result.error.message));
                        }
                        return [4 /*yield*/, this.saveConfig(result.data)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_6 = _a.sent();
                        if (error_6 instanceof types_1.ConfigValidationError ||
                            error_6 instanceof types_1.ConfigSaveError) {
                            throw error_6;
                        }
                        throw new types_1.ConfigSaveError("Failed to update provider configuration", error_6);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get effective API keys (environment overrides take precedence)
    ConfigManager.prototype.getEffectiveApiKey = function (provider) {
        var _a, _b;
        var config = this.config;
        switch (provider) {
            case "synthetic":
                return (((_a = config.envOverrides.synthetic) === null || _a === void 0 ? void 0 : _a.apiKey) ||
                    config.providers.synthetic.apiKey);
            case "minimax":
                return (((_b = config.envOverrides.minimax) === null || _b === void 0 ? void 0 : _b.apiKey) || config.providers.minimax.apiKey);
            case "auto":
                return ""; // Auto doesn't have a specific API key
            default:
                return "";
        }
    };
    /**
     * Get atomic provider state to ensure consistency across calls
     * This prevents race conditions where different parts of the code see different provider states
     */
    ConfigManager.prototype.getAtomicProviderState = function () {
        var _a, _b, _c, _d;
        // Get a single, consistent snapshot of the configuration
        var config = this.config;
        return {
            synthetic: {
                enabled: config.providers.synthetic.enabled,
                hasApiKey: Boolean(((_a = config.envOverrides.synthetic) === null || _a === void 0 ? void 0 : _a.apiKey) ||
                    config.providers.synthetic.apiKey),
                available: config.providers.synthetic.enabled &&
                    Boolean(((_b = config.envOverrides.synthetic) === null || _b === void 0 ? void 0 : _b.apiKey) ||
                        config.providers.synthetic.apiKey),
            },
            minimax: {
                enabled: config.providers.minimax.enabled,
                hasApiKey: Boolean(((_c = config.envOverrides.minimax) === null || _c === void 0 ? void 0 : _c.apiKey) ||
                    config.providers.minimax.apiKey),
                available: config.providers.minimax.enabled &&
                    Boolean(((_d = config.envOverrides.minimax) === null || _d === void 0 ? void 0 : _d.apiKey) ||
                        config.providers.minimax.apiKey),
            },
        };
    };
    /**
     * Get consistent network display string
     * Uses atomic provider state to ensure consistency
     */
    ConfigManager.prototype.getNetworkDisplay = function () {
        var providerState = this.getAtomicProviderState();
        var networkProviders = [];
        if (providerState.synthetic.available) {
            networkProviders.push("Synthetic.New");
        }
        if (providerState.minimax.available) {
            networkProviders.push("MiniMax");
        }
        return networkProviders.length > 0 ? networkProviders.join(" + ") : "None";
    };
    ConfigManager.prototype.getSelectedModel = function () {
        return this.config.selectedModel;
    };
    ConfigManager.prototype.setSelectedModel = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateConfig({ selectedModel: model })];
            });
        });
    };
    ConfigManager.prototype.getCacheDuration = function () {
        return this.config.cacheDurationHours;
    };
    ConfigManager.prototype.setCacheDuration = function (hours) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.updateConfig({ cacheDurationHours: hours })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_7 = _a.sent();
                        if (error_7 instanceof types_1.ConfigValidationError) {
                            return [2 /*return*/, false];
                        }
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConfigManager.prototype.isCacheValid = function (cacheFile) {
        return __awaiter(this, void 0, void 0, function () {
            var stat, stats, cacheAge, maxAge, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        stat = require("fs/promises").stat;
                        return [4 /*yield*/, stat(cacheFile)];
                    case 1:
                        stats = _a.sent();
                        cacheAge = Date.now() - stats.mtime.getTime();
                        maxAge = this.config.cacheDurationHours * 60 * 60 * 1000;
                        return [2 /*return*/, cacheAge < maxAge];
                    case 2:
                        error_8 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConfigManager.prototype.isFirstRun = function () {
        return !this.config.firstRunCompleted;
    };
    ConfigManager.prototype.markFirstRunCompleted = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateConfig({ firstRunCompleted: true })];
            });
        });
    };
    ConfigManager.prototype.hasSavedModel = function () {
        return Boolean(this.config.selectedModel && this.config.firstRunCompleted);
    };
    ConfigManager.prototype.getSavedModel = function () {
        if (this.hasSavedModel()) {
            return this.config.selectedModel;
        }
        return "";
    };
    ConfigManager.prototype.setSavedModel = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateConfig({ selectedModel: model, firstRunCompleted: true })];
            });
        });
    };
    ConfigManager.prototype.hasSavedThinkingModel = function () {
        return Boolean(this.config.selectedThinkingModel && this.config.firstRunCompleted);
    };
    ConfigManager.prototype.getSavedThinkingModel = function () {
        if (this.hasSavedThinkingModel()) {
            return this.config.selectedThinkingModel;
        }
        return "";
    };
    ConfigManager.prototype.setSavedThinkingModel = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateConfig({
                        selectedThinkingModel: model,
                        firstRunCompleted: true,
                    })];
            });
        });
    };
    ConfigManager.prototype.hasProviderApiKey = function (provider) {
        var _a, _b;
        var config = this.config;
        var providerKey = provider;
        return !!(((_a = config.providers[providerKey]) === null || _a === void 0 ? void 0 : _a.apiKey) &&
            ((_b = config.providers[providerKey]) === null || _b === void 0 ? void 0 : _b.apiKey.length) > 0);
    };
    ConfigManager.prototype.getModelCombinations = function () {
        var config = this.config;
        var combinations = config.combinations || {};
        return Object.values(combinations);
    };
    ConfigManager.prototype.resetConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._config = null;
                        return [4 /*yield*/, this.updateConfig({
                                selectedModel: "",
                                selectedThinkingModel: "",
                                defaultProvider: "synthetic",
                                providers: {
                                    synthetic: {
                                        apiKey: "",
                                        baseUrl: "https://api.synthetic.new",
                                        anthropicBaseUrl: "https://api.synthetic.new/anthropic",
                                        modelsApiUrl: "https://api.synthetic.new/openai/v1/models",
                                        enabled: true,
                                    },
                                    minimax: {
                                        apiKey: "",
                                        baseUrl: "https://api.minimax.io",
                                        anthropicBaseUrl: "https://api.minimax.io/anthropic",
                                        modelsApiUrl: "https://api.minimax.io/v1/models",
                                        enabled: false,
                                        defaultModel: "",
                                        groupId: "",
                                        parallelToolCalls: true,
                                        streaming: true,
                                        memoryCompact: false,
                                    },
                                },
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // ============================================
    // System Prompt Management (v1.3.0)
    // ============================================
    ConfigManager.prototype.getSyspromptPaths = function () {
        var globalPath = (0, path_1.join)(this.globalConfigDir, "sysprompt.md");
        var localPath = this.localProjectDir
            ? (0, path_1.join)(this.localProjectDir, "sysprompt.md")
            : null;
        return { global: globalPath, local: localPath };
    };
    /**
     * Get the active system prompt path (local overrides global)
     */
    ConfigManager.prototype.getActiveSyspromptPath = function () {
        var paths = this.getSyspromptPaths();
        // Check local first (higher priority)
        if (paths.local && (0, fs_1.existsSync)(paths.local)) {
            return { path: paths.local, type: "local" };
        }
        // Fall back to global
        if ((0, fs_1.existsSync)(paths.global)) {
            return { path: paths.global, type: "global" };
        }
        return { path: null, type: null };
    };
    /**
     * Load and resolve system prompt with template variables
     */
    ConfigManager.prototype.loadSysprompt = function () {
        return __awaiter(this, arguments, void 0, function (resolveVariables) {
            var _a, path, type, fs, rawContent, size, resolvedContent;
            if (resolveVariables === void 0) { resolveVariables = true; }
            return __generator(this, function (_b) {
                _a = this.getActiveSyspromptPath(), path = _a.path, type = _a.type;
                if (!path) {
                    return [2 /*return*/, { content: null, type: null, size: 0 }];
                }
                try {
                    fs = require("fs");
                    rawContent = fs.readFileSync(path, "utf-8");
                    size = Buffer.byteLength(rawContent, "utf-8");
                    if (!resolveVariables) {
                        return [2 /*return*/, { content: rawContent, type: type, size: size }];
                    }
                    resolvedContent = this.resolveSyspromptVariables(rawContent);
                    return [2 /*return*/, { content: resolvedContent, type: type, size: size }];
                }
                catch (error) {
                    console.warn("Failed to load system prompt from ".concat(path, ":"), error);
                    return [2 /*return*/, { content: null, type: null, size: 0 }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Resolve template variables in system prompt
     */
    ConfigManager.prototype.resolveSyspromptVariables = function (content) {
        var config = this.config;
        var os = require("os");
        var path = require("path");
        // Get project name from package.json or folder name
        var projectName = path.basename(process.cwd());
        try {
            var packageJsonPath = (0, path_1.join)(process.cwd(), "package.json");
            if ((0, fs_1.existsSync)(packageJsonPath)) {
                var packageJson = JSON.parse(require("fs").readFileSync(packageJsonPath, "utf-8"));
                projectName = packageJson.name || projectName;
            }
        }
        catch (_a) {
            // Use folder name as fallback
        }
        var variables = {
            "{{model}}": config.selectedModel || "not selected",
            "{{provider}}": config.defaultProvider || "auto",
            "{{date}}": new Date().toISOString().split("T")[0] ||
                new Date().toISOString().substring(0, 10),
            "{{time}}": new Date().toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
            }),
            "{{cwd}}": process.cwd(),
            "{{project}}": projectName,
            "{{user}}": os.userInfo().username,
            "{{os}}": process.platform,
        };
        var resolved = content;
        for (var _i = 0, _b = Object.entries(variables); _i < _b.length; _i++) {
            var _c = _b[_i], variable = _c[0], value = _c[1];
            resolved = resolved.replace(new RegExp(variable.replace(/[{}]/g, "\\$&"), "g"), value);
        }
        return resolved;
    };
    /**
     * Validate system prompt size
     */
    ConfigManager.prototype.validateSyspromptSize = function (size) {
        var WARN_SIZE = 4 * 1024; // 4KB
        var ERROR_SIZE = 8 * 1024; // 8KB
        if (size > ERROR_SIZE) {
            return {
                valid: false,
                warning: false,
                message: "System prompt exceeds 8KB limit (".concat((size / 1024).toFixed(1), "KB)"),
            };
        }
        if (size > WARN_SIZE) {
            return {
                valid: true,
                warning: true,
                message: "System prompt is large (".concat((size / 1024).toFixed(1), "KB). Consider reducing size."),
            };
        }
        return { valid: true, warning: false, message: "" };
    };
    /**
     * Save system prompt content
     */
    ConfigManager.prototype.saveSysprompt = function (content_1) {
        return __awaiter(this, arguments, void 0, function (content, global) {
            var paths, targetPath, fs, fsSync, dir, error_9;
            if (global === void 0) { global = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        paths = this.getSyspromptPaths();
                        targetPath = global ? paths.global : paths.local || paths.global;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        fs = require("fs/promises");
                        fsSync = require("fs");
                        dir = require("path").dirname(targetPath);
                        if (!!fsSync.existsSync(dir)) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs.mkdir(dir, { recursive: true })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, fs.writeFile(targetPath, content, "utf-8")];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 5:
                        error_9 = _a.sent();
                        console.error("Failed to save system prompt to ".concat(targetPath, ":"), error_9);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear system prompt
     */
    ConfigManager.prototype.clearSysprompt = function () {
        return __awaiter(this, arguments, void 0, function (global) {
            var paths, targetPath, unlink, existsSync_1, error_10;
            if (global === void 0) { global = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        paths = this.getSyspromptPaths();
                        targetPath = global ? paths.global : paths.local;
                        if (!targetPath) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        unlink = require("fs/promises").unlink;
                        existsSync_1 = require("fs").existsSync;
                        if (!existsSync_1(targetPath)) return [3 /*break*/, 3];
                        return [4 /*yield*/, unlink(targetPath)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, true];
                    case 4:
                        error_10 = _a.sent();
                        console.error("Failed to clear system prompt at ".concat(targetPath, ":"), error_10);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get default system prompt template
     */
    ConfigManager.prototype.getDefaultSyspromptTemplate = function () {
        return "# MClaude System Prompt\n# Available variables:\n# {{model}}     - Current model ID (e.g., minimax-m2)\n# {{provider}}  - Provider name (minimax, synthetic)\n# {{date}}      - Current date (YYYY-MM-DD)\n# {{time}}      - Current time (HH:MM)\n# {{cwd}}       - Current working directory\n# {{project}}   - Project name from package.json or folder name\n# {{user}}      - System username\n# {{os}}        - Operating system (linux, darwin, win32)\n\n# Your custom instructions below:\n\n";
    };
    // ============================================
    // Token Usage Tracking (v1.3.0)
    // ============================================
    /**
     * Get current token usage statistics
     */
    ConfigManager.prototype.getTokenUsage = function () {
        var _a, _b, _c, _d;
        var config = this.config;
        return {
            totalInputTokens: ((_a = config.tokenUsage) === null || _a === void 0 ? void 0 : _a.totalInputTokens) || 0,
            totalOutputTokens: ((_b = config.tokenUsage) === null || _b === void 0 ? void 0 : _b.totalOutputTokens) || 0,
            sessionTokens: ((_c = config.tokenUsage) === null || _c === void 0 ? void 0 : _c.sessionTokens) || 0,
            history: ((_d = config.tokenUsage) === null || _d === void 0 ? void 0 : _d.history) || [],
        };
    };
    /**
     * Update token usage
     */
    ConfigManager.prototype.updateTokenUsage = function (inputTokens, outputTokens) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUsage, today, history, todayIndex, thirtyDaysAgo, filteredHistory;
            return __generator(this, function (_a) {
                currentUsage = this.getTokenUsage();
                today = new Date().toISOString().split("T")[0];
                history = __spreadArray([], currentUsage.history, true);
                todayIndex = history.findIndex(function (h) { return h.date === today; });
                if (todayIndex >= 0) {
                    history[todayIndex].inputTokens += inputTokens;
                    history[todayIndex].outputTokens += outputTokens;
                }
                else {
                    history.push({ date: today, inputTokens: inputTokens, outputTokens: outputTokens });
                }
                thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                filteredHistory = history.filter(function (h) { return new Date(h.date) >= thirtyDaysAgo; });
                return [2 /*return*/, this.updateConfig({
                        tokenUsage: {
                            totalInputTokens: currentUsage.totalInputTokens + inputTokens,
                            totalOutputTokens: currentUsage.totalOutputTokens + outputTokens,
                            sessionTokens: currentUsage.sessionTokens + inputTokens + outputTokens,
                            lastUpdated: new Date().toISOString(),
                            history: filteredHistory,
                        },
                    })];
            });
        });
    };
    /**
     * Reset token usage statistics
     */
    ConfigManager.prototype.resetTokenUsage = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateConfig({
                        tokenUsage: {
                            totalInputTokens: 0,
                            totalOutputTokens: 0,
                            sessionTokens: 0,
                            lastUpdated: new Date().toISOString(),
                            history: [],
                        },
                    })];
            });
        });
    };
    // ============================================
    // Model Card Management (v1.3.1)
    // ============================================
    /**
     * Get the path for model cards file
     */
    ConfigManager.prototype.getModelCardsPath = function () {
        return (0, path_1.join)(this.globalConfigDir, "model-cards.json");
    };
    /**
     * Load model cards from file
     */
    ConfigManager.prototype.loadModelCards = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cardsPath, fs, rawData, data, result;
            return __generator(this, function (_a) {
                try {
                    cardsPath = this.getModelCardsPath();
                    if (!(0, fs_1.existsSync)(cardsPath)) {
                        // Return default model cards structure if file doesn't exist
                        return [2 /*return*/, types_1.ModelCardsSchema.parse({})];
                    }
                    fs = require("fs");
                    rawData = fs.readFileSync(cardsPath, "utf-8");
                    data = JSON.parse(rawData);
                    result = types_1.ModelCardsSchema.safeParse(data);
                    if (!result.success) {
                        console.warn("Model cards validation failed:", result.error.message);
                        return [2 /*return*/, types_1.ModelCardsSchema.parse({})];
                    }
                    return [2 /*return*/, result.data];
                }
                catch (error) {
                    console.warn("Failed to load model cards:", error);
                    return [2 /*return*/, types_1.ModelCardsSchema.parse({})];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Save model cards to file
     */
    ConfigManager.prototype.saveModelCards = function (modelCards) {
        return __awaiter(this, void 0, void 0, function () {
            var cardsPath, data, tempPath, fs, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        cardsPath = this.getModelCardsPath();
                        // Ensure directory exists
                        return [4 /*yield*/, this.ensureConfigDir()];
                    case 1:
                        // Ensure directory exists
                        _a.sent();
                        data = JSON.stringify(modelCards, null, 2);
                        tempPath = "".concat(cardsPath, ".tmp");
                        fs = require("fs/promises");
                        return [4 /*yield*/, fs.writeFile(tempPath, data, "utf-8")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, fs.rename(tempPath, cardsPath)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 4:
                        error_11 = _a.sent();
                        console.error("Failed to save model cards:", error_11);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch model cards from remote URL and save them
     */
    ConfigManager.prototype.fetchAndSaveModelCards = function (cardsUrl_1) {
        return __awaiter(this, arguments, void 0, function (cardsUrl, timeout) {
            var axios, response, data, result, error_12;
            if (timeout === void 0) { timeout = 3000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        axios = require("axios");
                        return [4 /*yield*/, axios.get(cardsUrl, { timeout: timeout })];
                    case 1:
                        response = _a.sent();
                        data = response.data;
                        result = types_1.ModelCardsSchema.safeParse(data);
                        if (!result.success) {
                            console.warn("Remote model cards validation failed:", result.error.message);
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.saveModelCards(result.data)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_12 = _a.sent();
                        // Silent fail for update checks
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update the last update check timestamp
     */
    ConfigManager.prototype.updateLastCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, this.updateConfig({
                            lastUpdateCheck: Date.now(),
                        })];
                }
                catch (error) {
                    console.warn("Failed to update last check timestamp:", error);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Check if an update check is needed (24h threshold)
     */
    ConfigManager.prototype.needsUpdateCheck = function () {
        var config = this.config;
        var lastCheck = config.lastUpdateCheck || 0;
        var now = Date.now();
        var oneDayMs = 24 * 60 * 60 * 1000;
        return now - lastCheck > oneDayMs;
    };
    /**
     * Get recommended models from config
     */
    ConfigManager.prototype.getRecommendedModels = function () {
        var config = this.config;
        return (config.recommendedModels || {
            default: {
                primary: "hf:deepseek-ai/DeepSeek-V3.2",
                backup: "minimax:MiniMax-M2",
            },
            smallFast: {
                primary: "hf:meta-llama/Llama-4-Scout-17B-16E-Instruct",
                backup: "hf:meta-llama/Llama-3.1-8B-Instruct",
            },
            thinking: {
                primary: "minimax:MiniMax-M2",
                backup: "hf:deepseek-ai/DeepSeek-R1",
            },
            subagent: {
                primary: "synthetic:deepseek-ai/DeepSeek-V3.2",
                backup: "minimax:MiniMax-M2",
            },
        });
    };
    return ConfigManager;
}());
exports.ConfigManager = ConfigManager;
