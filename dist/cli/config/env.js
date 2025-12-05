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
exports.envManager = exports.EnvironmentManager = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var os_1 = require("os");
var EnvironmentManager = /** @class */ (function () {
    function EnvironmentManager() {
        this.envVars = {};
        this.loadEnvironmentVariables();
    }
    EnvironmentManager.getInstance = function () {
        if (!this.instance) {
            this.instance = new EnvironmentManager();
        }
        return this.instance;
    };
    EnvironmentManager.prototype.loadEnvFile = function () {
        try {
            // Try to load .env from project root first
            var projectEnvPath = (0, path_1.join)(process.cwd(), ".env");
            var homeEnvPath = (0, path_1.join)((0, os_1.homedir)(), ".mclaude", ".env");
            var envPath = null;
            // Check for .env in current directory
            try {
                var envContent = (0, fs_1.readFileSync)(projectEnvPath, "utf-8");
                // Only consider the file if it has content (not empty or just whitespace)
                if (envContent.trim().length > 0) {
                    envPath = projectEnvPath;
                }
            }
            catch (_a) {
                // Check for .env in home directory
                try {
                    var envContent = (0, fs_1.readFileSync)(homeEnvPath, "utf-8");
                    // Only consider the file if it has content (not empty or just whitespace)
                    if (envContent.trim().length > 0) {
                        envPath = homeEnvPath;
                    }
                }
                catch (_b) {
                    // No .env file found, use process.env only
                    return;
                }
            }
            if (envPath) {
                var envContent = (0, fs_1.readFileSync)(envPath, "utf-8");
                this.parseEnvContent(envContent);
            }
        }
        catch (error) {
            console.warn("Failed to load .env file:", error);
        }
    };
    EnvironmentManager.prototype.parseEnvContent = function (content) {
        var lines = content.split("\n");
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var trimmedLine = line.trim();
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith("#")) {
                continue;
            }
            // Parse key=value pairs
            var match = trimmedLine.match(/^([^=]+)=(.*)$/);
            if (match) {
                var key = match[1], value = match[2];
                if (!key || value === undefined) {
                    continue;
                }
                // Remove quotes if present
                var cleanValue = value.replace(/^["']|["']$/g, "");
                // Only store variables we're interested in
                if (key in this.envVars || [
                    "SYNTHETIC_API_KEY",
                    "MINIMAX_API_KEY",
                    "SYNTHETIC_BASE_URL",
                    "MINIMAX_API_URL",
                    "MINIMAX_ANTHROPIC_URL",
                    "MINIMAX_OPENAI_URL",
                    "MINIMAX_MODEL",
                    "API_TIMEOUT_MS"
                ].includes(key)) {
                    this.envVars[key] = cleanValue;
                    process.env[key] = cleanValue; // Also set in process.env
                }
            }
        }
    };
    EnvironmentManager.prototype.loadEnvironmentVariables = function () {
        // Initialize with current process.env
        this.envVars = {
            SYNTHETIC_API_KEY: process.env.SYNTHETIC_API_KEY,
            MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,
            SYNTHETIC_BASE_URL: process.env.SYNTHETIC_BASE_URL,
            MINIMAX_API_URL: process.env.MINIMAX_API_URL,
            MINIMAX_ANTHROPIC_URL: process.env.MINIMAX_ANTHROPIC_URL,
            MINIMAX_OPENAI_URL: process.env.MINIMAX_OPENAI_URL,
            MINIMAX_MODEL: process.env.MINIMAX_MODEL,
            API_TIMEOUT_MS: process.env.API_TIMEOUT_MS,
        };
        // Load from .env file synchronously to ensure variables are available immediately
        this.loadEnvFile();
    };
    EnvironmentManager.prototype.getEnvironmentVariables = function () {
        return __assign({}, this.envVars);
    };
    // Synchronous version for immediate needs
    EnvironmentManager.prototype.getEnvironmentVariable = function (key) {
        return this.envVars[key];
    };
    EnvironmentManager.prototype.getApiKey = function (provider) {
        switch (provider) {
            case "synthetic":
                return (this.envVars.SYNTHETIC_API_KEY || process.env.SYNTHETIC_API_KEY || "");
            case "minimax":
                return (this.envVars.MINIMAX_API_KEY || process.env.MINIMAX_API_KEY || "");
            default:
                return "";
        }
    };
    // eslint-disable-next-line no-fallthrough
    EnvironmentManager.prototype.getApiUrl = function (provider, type) {
        switch (provider) {
            case "synthetic":
                switch (type) {
                    case "anthropic":
                        return (this.envVars.SYNTHETIC_BASE_URL ||
                            process.env.SYNTHETIC_BASE_URL ||
                            "https://api.synthetic.new/anthropic");
                    case "openai":
                        return (this.envVars.SYNTHETIC_BASE_URL ||
                            process.env.SYNTHETIC_BASE_URL ||
                            "https://api.synthetic.new/openai/v1/models");
                    case "base":
                        return (this.envVars.SYNTHETIC_BASE_URL ||
                            process.env.SYNTHETIC_BASE_URL ||
                            "https://api.synthetic.new");
                    default:
                        return "";
                }
            case "minimax":
                switch (type) {
                    case "anthropic":
                        return (this.envVars.MINIMAX_ANTHROPIC_URL ||
                            process.env.MINIMAX_ANTHROPIC_URL ||
                            "https://api.minimax.io/anthropic");
                    case "openai":
                        return (this.envVars.MINIMAX_OPENAI_URL ||
                            process.env.MINIMAX_OPENAI_URL ||
                            "https://api.minimax.io/v1");
                    case "base":
                        return (this.envVars.MINIMAX_API_URL ||
                            process.env.MINIMAX_API_URL ||
                            "https://api.minimax.io");
                    default:
                        return "";
                }
            default:
                return "";
        }
    };
    EnvironmentManager.prototype.getDefaultModel = function (provider) {
        switch (provider) {
            case "synthetic":
                return ""; // Synthetic doesn't have a default model in config
            case "minimax":
                return (this.envVars.MINIMAX_MODEL ||
                    process.env.MINIMAX_MODEL ||
                    "MiniMax-M2");
            default:
                return "";
        }
    };
    EnvironmentManager.prototype.getApiTimeout = function () {
        var timeout = this.envVars.API_TIMEOUT_MS || process.env.API_TIMEOUT_MS;
        return timeout ? parseInt(timeout, 10) : 3000000; // Default 30 minutes for MiniMax
    };
    EnvironmentManager.prototype.validateEnvironmentVariables = function () {
        var errors = [];
        var envVars = this.getEnvironmentVariables();
        // Validate API keys if present
        if (envVars.SYNTHETIC_API_KEY &&
            !this.isValidApiKey(envVars.SYNTHETIC_API_KEY)) {
            errors.push("Synthetic API key format appears invalid");
        }
        if (envVars.MINIMAX_API_KEY &&
            !this.isValidApiKey(envVars.MINIMAX_API_KEY)) {
            errors.push("MiniMax API key format appears invalid");
        }
        // Validate URLs if present
        var urlFields = [
            "SYNTHETIC_BASE_URL",
            "MINIMAX_API_URL",
            "MINIMAX_ANTHROPIC_URL",
            "MINIMAX_OPENAI_URL",
        ];
        for (var _i = 0, urlFields_1 = urlFields; _i < urlFields_1.length; _i++) {
            var field = urlFields_1[_i];
            var url = envVars[field];
            if (url && !this.isValidUrl(url)) {
                errors.push("".concat(field, " appears to be an invalid URL: ").concat(url));
            }
        }
        // Validate timeout
        if (envVars.API_TIMEOUT_MS && isNaN(parseInt(envVars.API_TIMEOUT_MS, 10))) {
            errors.push("API_TIMEOUT_MS must be a valid number in milliseconds");
        }
        return { valid: errors.length === 0, errors: errors };
    };
    EnvironmentManager.prototype.isValidApiKey = function (apiKey) {
        // Basic validation - non-empty string with reasonable length
        return typeof apiKey === "string" && apiKey.length > 10;
    };
    EnvironmentManager.prototype.isValidUrl = function (url) {
        try {
            new URL(url);
            return true;
        }
        catch (_a) {
            return false;
        }
    };
    // Reload environment variables
    EnvironmentManager.prototype.reload = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.envVars = {};
                this.loadEnvironmentVariables();
                return [2 /*return*/];
            });
        });
    };
    // Synchronous reload for immediate needs (testing)
    EnvironmentManager.prototype.syncReload = function () {
        this.envVars = {};
        this.loadEnvironmentVariables();
    };
    // Reset the singleton instance (for testing)
    EnvironmentManager.resetInstance = function () {
        EnvironmentManager.instance = undefined;
    };
    return EnvironmentManager;
}());
exports.EnvironmentManager = EnvironmentManager;
// Export singleton instance
exports.envManager = EnvironmentManager.getInstance();
