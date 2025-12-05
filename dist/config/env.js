"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envManager = exports.EnvironmentManager = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
class EnvironmentManager {
    static instance;
    envVars = {};
    constructor() {
        this.loadEnvironmentVariables();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new EnvironmentManager();
        }
        return this.instance;
    }
    loadEnvFile() {
        try {
            // Try to load .env from project root first
            const projectEnvPath = (0, path_1.join)(process.cwd(), ".env");
            const homeEnvPath = (0, path_1.join)((0, os_1.homedir)(), ".mclaude", ".env");
            let envPath = null;
            // Check for .env in current directory
            try {
                const envContent = (0, fs_1.readFileSync)(projectEnvPath, "utf-8");
                // Only consider the file if it has content (not empty or just whitespace)
                if (envContent.trim().length > 0) {
                    envPath = projectEnvPath;
                }
            }
            catch {
                // Check for .env in home directory
                try {
                    const envContent = (0, fs_1.readFileSync)(homeEnvPath, "utf-8");
                    // Only consider the file if it has content (not empty or just whitespace)
                    if (envContent.trim().length > 0) {
                        envPath = homeEnvPath;
                    }
                }
                catch {
                    // No .env file found, use process.env only
                    return;
                }
            }
            if (envPath) {
                const envContent = (0, fs_1.readFileSync)(envPath, "utf-8");
                this.parseEnvContent(envContent);
            }
        }
        catch (error) {
            console.warn("Failed to load .env file:", error);
        }
    }
    parseEnvContent(content) {
        const lines = content.split("\n");
        for (const line of lines) {
            const trimmedLine = line.trim();
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith("#")) {
                continue;
            }
            // Parse key=value pairs
            const match = trimmedLine.match(/^([^=]+)=(.*)$/);
            if (match) {
                const [, key, value] = match;
                if (!key || value === undefined) {
                    continue;
                }
                // Remove quotes if present
                const cleanValue = value.replace(/^["']|["']$/g, "");
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
    }
    loadEnvironmentVariables() {
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
    }
    getEnvironmentVariables() {
        return { ...this.envVars };
    }
    // Synchronous version for immediate needs
    getEnvironmentVariable(key) {
        return this.envVars[key];
    }
    getApiKey(provider) {
        switch (provider) {
            case "synthetic":
                return (this.envVars.SYNTHETIC_API_KEY || process.env.SYNTHETIC_API_KEY || "");
            case "minimax":
                return (this.envVars.MINIMAX_API_KEY || process.env.MINIMAX_API_KEY || "");
            default:
                return "";
        }
    }
    // eslint-disable-next-line no-fallthrough
    getApiUrl(provider, type) {
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
    }
    getDefaultModel(provider) {
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
    }
    getApiTimeout() {
        const timeout = this.envVars.API_TIMEOUT_MS || process.env.API_TIMEOUT_MS;
        return timeout ? parseInt(timeout, 10) : 3000000; // Default 30 minutes for MiniMax
    }
    validateEnvironmentVariables() {
        const errors = [];
        const envVars = this.getEnvironmentVariables();
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
        const urlFields = [
            "SYNTHETIC_BASE_URL",
            "MINIMAX_API_URL",
            "MINIMAX_ANTHROPIC_URL",
            "MINIMAX_OPENAI_URL",
        ];
        for (const field of urlFields) {
            const url = envVars[field];
            if (url && !this.isValidUrl(url)) {
                errors.push(`${field} appears to be an invalid URL: ${url}`);
            }
        }
        // Validate timeout
        if (envVars.API_TIMEOUT_MS && isNaN(parseInt(envVars.API_TIMEOUT_MS, 10))) {
            errors.push("API_TIMEOUT_MS must be a valid number in milliseconds");
        }
        return { valid: errors.length === 0, errors };
    }
    isValidApiKey(apiKey) {
        // Basic validation - non-empty string with reasonable length
        return typeof apiKey === "string" && apiKey.length > 10;
    }
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    // Reload environment variables
    async reload() {
        this.envVars = {};
        this.loadEnvironmentVariables();
    }
    // Synchronous reload for immediate needs (testing)
    syncReload() {
        this.envVars = {};
        this.loadEnvironmentVariables();
    }
    // Reset the singleton instance (for testing)
    static resetInstance() {
        EnvironmentManager.instance = undefined;
    }
}
exports.EnvironmentManager = EnvironmentManager;
// Export singleton instance
exports.envManager = EnvironmentManager.getInstance();
//# sourceMappingURL=env.js.map