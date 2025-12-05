"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDangerousFlags = normalizeDangerousFlags;
exports.createBanner = createBanner;
var fs_1 = require("fs");
var path_1 = require("path");
var config_1 = require("../config");
var chalk_1 = require("chalk");
function normalizeDangerousFlags(args) {
    var dangerousPatterns = [
        /^--dangerously-skip-permissions$/, // correct
        /^--dangerously-skip-permission$/, // missing s
        /^--dangerous-skip-permissions$/, // missing ly
        /^--dangerous-skip-permission$/, // missing ly + s
        /^--dangerously skip-permissions$/, // space instead of dash
        /^--dangerously_skip_permissions$/, // underscores
        /^--dangerous(ly)?$/, // shortened
        /^--skip-permissions$/, // incomplete
        /^--skip-permission$/, // incomplete + missing s
    ];
    var processedArgs = args.map(function (arg) {
        if (typeof arg === "string") {
            var lowerArg_1 = arg.toLowerCase().replace(/[_\s]+/g, "-");
            if (dangerousPatterns.some(function (pattern) { return pattern.test(lowerArg_1); })) {
                return "--dangerously-skip-permissions";
            }
        }
        return arg;
    });
    return processedArgs;
}
function createBanner(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (options === void 0) { options = {}; }
    // Read version from package.json
    var packageJsonPath = (0, path_1.join)(__dirname, "../../package.json");
    var version = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, "utf8")).version;
    // Get current config for models
    var configManager = new config_1.ConfigManager();
    var config = configManager.config;
    // Determine options
    var activeOptions = [];
    if (options.additionalArgs) {
        var normalizedArgs = normalizeDangerousFlags(options.additionalArgs);
        if (normalizedArgs.includes("--dangerously-skip-permissions")) {
            activeOptions.push("Dangerous");
        }
    }
    if (options.verbose) {
        activeOptions.push("Verbose");
    }
    // Check for system prompt
    var syspromptInfo = configManager.getActiveSyspromptPath();
    if (syspromptInfo.type) {
        activeOptions.push("sysprompt: ".concat(syspromptInfo.type));
    }
    var defaultModel = config.selectedModel ||
        ((_b = (_a = config.recommendedModels) === null || _a === void 0 ? void 0 : _a.default) === null || _b === void 0 ? void 0 : _b.primary) ||
        "None";
    var thinkingModel = config.selectedThinkingModel ||
        ((_d = (_c = config.recommendedModels) === null || _c === void 0 ? void 0 : _c.thinking) === null || _d === void 0 ? void 0 : _d.primary) ||
        "None";
    var subagentModel = ((_f = (_e = config.recommendedModels) === null || _e === void 0 ? void 0 : _e.subagent) === null || _f === void 0 ? void 0 : _f.primary) || "None";
    var fastModel = ((_h = (_g = config.recommendedModels) === null || _g === void 0 ? void 0 : _g.smallFast) === null || _h === void 0 ? void 0 : _h.primary) || "None";
    var optionsStr = activeOptions.length > 0 ? activeOptions.join(", ") : "None";
    // Use atomic provider state to ensure consistent network display
    var networkDisplay = configManager.getNetworkDisplay();
    return [
        chalk_1.default.cyan.bold("MClaude") + chalk_1.default.gray(" v".concat(version)),
        chalk_1.default.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
        "".concat(chalk_1.default.blue("Model:"), "     ").concat(chalk_1.default.cyan(defaultModel)),
        "".concat(chalk_1.default.magenta("Thinking:"), "  ").concat(chalk_1.default.magenta(thinkingModel)),
        "".concat(chalk_1.default.cyan("Subagent:"), "  ").concat(chalk_1.default.cyan(subagentModel)),
        "".concat(chalk_1.default.cyan("Fast:"), "      ").concat(chalk_1.default.cyan(fastModel)),
        "".concat(chalk_1.default.green("Network:"), "    ").concat(chalk_1.default.green(networkDisplay)),
        "".concat(chalk_1.default.yellow("Options:"), "    ").concat(chalk_1.default.yellow(optionsStr)),
        "",
    ].join("\n");
}
