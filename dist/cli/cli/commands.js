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
exports.createProgram = createProgram;
var commander_1 = require("commander");
var app_1 = require("../core/app");
var fs_1 = require("fs");
var path_1 = require("path");
var banner_1 = require("../utils/banner");
function createProgram() {
    var _this = this;
    var program = new commander_1.Command();
    // Read version from package.json
    var packageJsonPath = (0, path_1.join)(__dirname, "../../package.json");
    var packageVersion = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, "utf8")).version;
    program
        .name("mclaude")
        .description("Interactive model selection tool for Claude Code with Synthetic AI models\n\nAdditional Claude Code flags (e.g., --dangerously-skip-permissions) are passed through to Claude Code.")
        .version(packageVersion);
    program
        .option("-m, --model <model>", "Use specific model (skip selection)")
        .option("-t, --thinking-model <model>", "Use specific thinking model (for Claude thinking mode)")
        .option("-v, --verbose", "Enable verbose logging")
        .option("-q, --quiet", "Suppress non-error output")
        // MiniMax M2 enhancements
        .option("--temperature <value>", "Sampling temperature (0.0-2.0)")
        .option("--top-p <value>", "Top-p sampling parameter (0.0-1.0)")
        .option("--preset <preset>", "Temperature preset: creative, precise, balanced")
        .option("--context-size <size>", "Context window size (up to 1M for MiniMax M2)")
        .option("--tool-choice <mode>", "Tool choice mode: auto, none, required")
        .option("--no-stream", "Disable streaming responses")
        .option("--memory <mode>", "Memory mode: compact")
        .option("--json-mode", "Enable JSON structured output mode")
        .allowUnknownOption(true)
        .passThroughOptions(true);
    // Main command (launch Claude Code)
    program.action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var rawArgs, additionalArgs, knownFlags, validCommands, potentialCommand, i, arg, baseOption, isKnownSubcommand, i, arg, flagName, nextArg, app, normalizedArgs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rawArgs = process.argv.slice(2);
                    additionalArgs = [];
                    knownFlags = new Set([
                        "--model",
                        "--thinking-model",
                        "--verbose",
                        "--quiet",
                        "--help",
                        "--version",
                        "--temperature",
                        "--top-p",
                        "--preset",
                        "--context-size",
                        "--tool-choice",
                        "--no-stream",
                        "--memory",
                        "--json-mode",
                        "-m",
                        "-t",
                        "-v",
                        "-q",
                        "-h",
                        "-V",
                    ]);
                    validCommands = new Set(["help", "/help"]);
                    for (i = 0; i < rawArgs.length; i++) {
                        arg = rawArgs[i];
                        if (!arg)
                            continue;
                        // If it starts with -, it's an option, skip
                        if (arg.startsWith("-")) {
                            baseOption = arg.split("=")[0];
                            if (baseOption &&
                                ["--model", "--thinking-model", "-m", "-t"].includes(baseOption) &&
                                !arg.includes("=")) {
                                i++; // Skip the value
                            }
                            continue;
                        }
                        // This is a non-flag argument - check if it could be a command
                        // Only consider it a command if it appears at the beginning or after options that have been fully processed
                        potentialCommand = arg;
                        break;
                    }
                    // Only process help/invalid commands if we found a potential command
                    if (potentialCommand) {
                        // Check if this is a help request
                        if (validCommands.has(potentialCommand)) {
                            program.help();
                            return [2 /*return*/];
                        }
                        isKnownSubcommand = [
                            "model",
                            "thinking-model",
                            "providers",
                            "models",
                            "search",
                            "config",
                            "setup",
                            "doctor",
                            "dangerously",
                            "dangerous",
                            "danger",
                            "cache",
                            "combination",
                            "list",
                            "info",
                            "clear-cache",
                            "enable",
                            "disable",
                            "status",
                            "test",
                            "show",
                            "set",
                            "provider",
                            "init",
                            "local",
                            "global",
                            "migrate",
                            "whoami",
                            "reset",
                            "set-default-provider",
                            "save",
                            "delete",
                            "stats",
                            "sysprompt",
                            "auth",
                        ].includes(potentialCommand);
                        if (!isKnownSubcommand) {
                            console.error("Unknown command: ".concat(potentialCommand));
                            console.log("\nShowing available commands:");
                            program.help();
                            return [2 /*return*/];
                        }
                    }
                    for (i = 0; i < rawArgs.length; i++) {
                        arg = rawArgs[i];
                        if (arg && arg.startsWith("--")) {
                            flagName = arg.split("=")[0];
                            if (!knownFlags.has(flagName) && !knownFlags.has(arg)) {
                                additionalArgs.push(arg);
                                nextArg = rawArgs[i + 1];
                                if (!arg.includes("=") &&
                                    nextArg &&
                                    !nextArg.startsWith("-")) {
                                    additionalArgs.push(nextArg);
                                    i++; // Skip the next argument as it's a value
                                }
                            }
                        }
                    }
                    app = new app_1.SyntheticClaudeApp();
                    normalizedArgs = (0, banner_1.normalizeDangerousFlags)(additionalArgs);
                    return [4 /*yield*/, app.run(__assign(__assign({}, options), { additionalArgs: normalizedArgs }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Model selection command (launches after selection)
    program
        .command("model")
        .description("Interactive model selection and launch Claude Code")
        .option("-v, --verbose", "Enable verbose logging")
        .option("-q, --quiet", "Suppress non-error output")
        .option("--provider <name>", "Select from specific provider only (synthetic, minimax, auto)")
        .option("--thinking-provider <name>", "Use different provider for thinking model")
        .option("--save-combination <name>", "Save this provider combination for future use")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app, success, config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.interactiveModelSelection(options)];
                case 1:
                    success = _a.sent();
                    if (!success) return [3 /*break*/, 3];
                    config = app.getConfig();
                    if (!(config.selectedModel || config.selectedThinkingModel)) return [3 /*break*/, 3];
                    return [4 /*yield*/, app.run({
                            verbose: options.verbose,
                            quiet: options.quiet,
                            model: "", // Will use saved models from config
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Thinking model selection command
    program
        .command("thinking-model")
        .description("Interactive thinking model selection and save to config")
        .option("-v, --verbose", "Enable verbose logging")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.interactiveThinkingModelSelection()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Provider management commands
    var providersCmd = program
        .command("providers")
        .description("Manage AI providers");
    providersCmd
        .command("list")
        .description("List all providers with their status")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.listProviders()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    providersCmd
        .command("enable <provider>")
        .description("Enable a specific provider")
        .action(function (provider) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.enableProvider(provider)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    providersCmd
        .command("disable <provider>")
        .description("Disable a specific provider")
        .action(function (provider) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.disableProvider(provider)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    providersCmd
        .command("status")
        .description("Show detailed provider information")
        .option("--provider <name>", "Show status for specific provider only")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.providerStatus(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    providersCmd
        .command("test <provider>")
        .description("Test connectivity to a specific provider")
        .action(function (provider) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.testProvider(provider)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Models command group
    var modelsCmd = program
        .command("models")
        .description("List available models")
        .option("--refresh", "Force refresh model cache")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.listModels(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    modelsCmd
        .command("list")
        .description("List available models")
        .option("--refresh", "Force refresh model cache")
        .option("--provider <name>", "Filter models by provider (synthetic, minimax, auto)")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.listModels(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    modelsCmd
        .command("info")
        .description("Show model information")
        .argument("[modelId]", "Model ID to show info for")
        .action(function (modelId) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.showModelInfo(modelId)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    modelsCmd
        .command("clear-cache")
        .description("Clear model cache")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.clearCache()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    modelsCmd
        .command("cards")
        .description("Manage model cards")
        .option("--update", "Force update model cards from GitHub")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.manageModelCards(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    modelsCmd
        .command("search <query>")
        .description("Search models by name or provider")
        .option("--provider <name>", "Filter search by provider")
        .action(function (query, options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.searchModels(query, options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Default models command (alias for list)
    modelsCmd.action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.listModels(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Search models command (top-level for backward compatibility)
    program
        .command("search <query>")
        .description("Search models by name or provider")
        .option("--refresh", "Force refresh model cache")
        .option("--provider <name>", "Search within specific provider (synthetic, minimax, auto)")
        .action(function (query, options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.searchModels(query, options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Configuration commands
    var configCmd = program
        .command("config")
        .description("Manage configuration");
    configCmd
        .command("show")
        .description("Show current configuration")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.showConfig()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    configCmd
        .command("set <key> <value>")
        .description("Set configuration value (keys: apiKey, baseUrl, modelsApiUrl, cacheDurationHours, selectedModel, selectedThinkingModel, defaultProvider, synthetic.apiKey, synthetic.baseUrl, minimax.apiKey, minimax.groupId)")
        .action(function (key, value) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.setConfig(key, value)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Provider-specific configuration subcommands
    var providerConfigCmd = configCmd
        .command("provider")
        .description("Manage provider-specific configuration");
    providerConfigCmd
        .command("list")
        .description("List all provider configurations")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.listProviderConfigs()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    providerConfigCmd
        .command("get <provider>")
        .description("Get configuration for a specific provider")
        .action(function (provider) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.getProviderConfigInfo(provider)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    providerConfigCmd
        .command("set <provider> <key> <value>")
        .description("Set provider-specific configuration")
        .action(function (provider, key, value) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.setProviderConfig(provider, key, value)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    configCmd
        .command("init")
        .description("Initialize a local project configuration")
        .option("--force", "Overwrite existing local configuration")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.initLocalConfig(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    configCmd
        .command("local")
        .description("Switch to local project configuration mode")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.switchToLocalConfig()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    configCmd
        .command("global")
        .description("Switch to global configuration mode")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.switchToGlobalConfig()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    configCmd
        .command("migrate")
        .description("Migrate global configuration to local project configuration")
        .option("--force", "Overwrite existing local configuration")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.migrateConfig(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    configCmd
        .command("whoami")
        .description("Show current configuration context and workspace")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.showConfigContext()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    configCmd
        .command("reset")
        .description("Reset configuration to defaults")
        .option("--scope <scope>", "Reset scope: 'local' or 'global' (falls back to current mode)")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.resetConfig(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    configCmd
        .command("set-default-provider <provider>")
        .description("Set the default provider (synthetic, minimax, auto)")
        .action(function (provider) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.setDefaultProvider(provider)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Combination management commands
    var combinationCmd = program
        .command("combination")
        .description("Manage model combinations");
    combinationCmd
        .command("list")
        .description("List saved model combinations")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.listCombinations()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    combinationCmd
        .command("save <name> <model> [thinkingModel]")
        .description("Save a model combination")
        .action(function (name, model, thinkingModel) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.saveCombination(name, model, thinkingModel)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    combinationCmd
        .command("delete <name>")
        .description("Delete a saved model combination")
        .action(function (name) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.deleteCombination(name)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Default combination command (alias for list)
    combinationCmd.action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.listCombinations()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Setup command
    program
        .command("setup")
        .description("Run initial setup")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.setup()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Doctor command - check system health
    program
        .command("doctor")
        .description("Check system health and configuration")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.doctor()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Dangerous command - launch Claude Code with --dangerously-skip-permissions
    program
        .command("dangerously")
        .alias("dangerous")
        .alias("dang")
        .alias("danger")
        .description("Launch with --dangerously-skip-permissions using last used provider(s)")
        .option("-v, --verbose", "Enable verbose logging")
        .option("-q, --quiet", "Suppress non-error output")
        .option("-f, --force", "Force model selection even if last used provider is available")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app, config, updatedConfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    config = app.getConfig();
                    if (!(!options.force &&
                        (config.selectedModel || config.selectedThinkingModel))) return [3 /*break*/, 2];
                    // Use existing saved models
                    return [4 /*yield*/, app.run({
                            verbose: options.verbose,
                            quiet: options.quiet,
                            model: "", // Will use saved models from config
                            additionalArgs: ["--dangerously-skip-permissions"],
                        })];
                case 1:
                    // Use existing saved models
                    _a.sent();
                    return [3 /*break*/, 5];
                case 2: 
                // Need to select models first
                return [4 /*yield*/, app.interactiveModelSelection()];
                case 3:
                    // Need to select models first
                    _a.sent();
                    updatedConfig = app.getConfig();
                    if (!(updatedConfig.selectedModel ||
                        updatedConfig.selectedThinkingModel)) return [3 /*break*/, 5];
                    return [4 /*yield*/, app.run({
                            verbose: options.verbose,
                            quiet: options.quiet,
                            model: "", // Will use saved models from config
                            additionalArgs: ["--dangerously-skip-permissions"],
                        })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    // Cache management
    var cacheCmd = program.command("cache").description("Manage model cache");
    cacheCmd
        .command("clear")
        .description("Clear model cache")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.clearCache()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    cacheCmd
        .command("info")
        .description("Show cache information")
        .action(function () { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.cacheInfo()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Authentication management commands
    var authCmd = program
        .command("auth")
        .description("Manage authentication credentials");
    authCmd
        .command("check")
        .description("Check authentication status for all providers")
        .option("--provider <name>", "Check specific provider only (synthetic, minimax)")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.checkAuth(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    authCmd
        .command("test <provider>")
        .description("Test authentication for a specific provider")
        .action(function (provider) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.testAuth(provider)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    authCmd
        .command("reset <provider>")
        .description("Reset authentication credentials for a specific provider")
        .action(function (provider) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.resetAuth(provider)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    authCmd
        .command("refresh [provider]")
        .description("Refresh authentication for all providers or specific provider")
        .action(function (provider) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.refreshAuth(provider)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    authCmd
        .command("status")
        .description("Show detailed authentication status")
        .option("--format <format>", "Output format (table, json)", "table")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.authStatus(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Stats command - Token usage tracking
    program
        .command("stats")
        .description("Show token usage statistics")
        .option("--reset", "Reset token usage statistics")
        .option("--format <format>", "Output format (table, json)", "table")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.showStats(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // System prompt management command
    var syspromptCmd = program
        .command("sysprompt")
        .description("Manage custom system prompts for Claude Code");
    syspromptCmd
        .option("--global", "Edit global system prompt (~/.config/mclaude/sysprompt.md)")
        .option("--show", "Display current active system prompt (with variables resolved)")
        .option("--clear", "Remove system prompt (revert to Claude default)")
        .option("--raw", "Show raw system prompt without resolving variables")
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = new app_1.SyntheticClaudeApp();
                    return [4 /*yield*/, app.manageSysprompt(options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Help commands are handled in the main action
    // This prevents double registration and cleaner handling
    return program;
}
