"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ccrManager = exports.CCRManager = void 0;
const child_process_1 = require("child_process");
const os_1 = require("os");
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const axios_1 = __importDefault(require("axios"));
const ccr_config_1 = require("./ccr-config");
class CCRManager {
    ccrProcess = null;
    configGenerator;
    ccrPort = 3456;
    ccrHomeDir;
    ccrConfigPath;
    lastConfigHash = null;
    constructor() {
        this.ccrHomeDir = (0, path_1.join)((0, os_1.homedir)(), ".claude-code-router");
        this.ccrConfigPath = (0, path_1.join)(this.ccrHomeDir, "config.json");
        this.configGenerator = new ccr_config_1.CCRConfigGenerator();
    }
    /**
     * Get hash of current CCR config file
     */
    getConfigHash() {
        try {
            if (!(0, fs_1.existsSync)(this.ccrConfigPath)) {
                return null;
            }
            const content = (0, fs_1.readFileSync)(this.ccrConfigPath, "utf-8");
            return (0, crypto_1.createHash)("md5").update(content).digest("hex");
        }
        catch {
            return null;
        }
    }
    /**
     * Check if config has changed since last check
     */
    hasConfigChanged() {
        const currentHash = this.getConfigHash();
        if (this.lastConfigHash === null) {
            this.lastConfigHash = currentHash;
            return false;
        }
        const changed = currentHash !== this.lastConfigHash;
        this.lastConfigHash = currentHash;
        return changed;
    }
    /**
     * Generate CCR configuration from mclaude config
     * Returns true if config was generated/changed
     */
    async generateConfig() {
        try {
            const oldHash = this.getConfigHash();
            await this.configGenerator.generateConfig();
            const newHash = this.getConfigHash();
            this.lastConfigHash = newHash;
            return oldHash !== newHash;
        }
        catch (error) {
            console.error("Failed to generate CCR configuration:", error);
            return false;
        }
    }
    /**
     * Start CCR process
     */
    async start() {
        try {
            // First check if CCR is already running
            const status = await this.getStatus();
            if (status.running) {
                console.info("CCR is already running");
                return true;
            }
            // Generate config before starting
            const configGenerated = await this.generateConfig();
            if (!configGenerated) {
                throw new Error("Failed to generate CCR configuration");
            }
            console.info("Starting Claude Code Router...");
            // Start CCR process
            this.ccrProcess = (0, child_process_1.spawn)("npx", ["@musistudio/claude-code-router", "start"], {
                detached: true,
                stdio: "ignore",
                env: {
                    ...process.env,
                    CCR_HOME: this.ccrHomeDir,
                },
            });
            // Unref the process so it can run independently
            this.ccrProcess.unref();
            // Wait for CCR to be ready
            await this.waitForReady(30000); // 30 second timeout
            console.info("CCR started successfully");
            return true;
        }
        catch (error) {
            console.error("Failed to start CCR:", error);
            this.ccrProcess = null;
            return false;
        }
    }
    /**
     * Stop CCR process
     */
    async stop() {
        try {
            const status = await this.getStatus();
            if (!status.running) {
                console.info("CCR is not running");
                return true;
            }
            if (this.ccrProcess) {
                this.ccrProcess.kill();
                this.ccrProcess = null;
            }
            // Try to kill by PID if we have it
            if (status.pid) {
                try {
                    process.kill(status.pid);
                }
                catch (killError) {
                    // Process might already be dead
                }
            }
            console.info("CCR stopped");
            return true;
        }
        catch (error) {
            console.error("Failed to stop CCR:", error);
            return false;
        }
    }
    /**
     * Restart CCR process
     */
    async restart() {
        try {
            await this.stop();
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
            return await this.start();
        }
        catch (error) {
            console.error("Failed to restart CCR:", error);
            return false;
        }
    }
    /**
     * Get CCR status
     */
    async getStatus() {
        try {
            const url = `http://127.0.0.1:${this.ccrPort}/health`;
            await axios_1.default.get(url, { timeout: 1000 });
            return {
                running: true,
                port: this.ccrPort,
                pid: this.ccrProcess?.pid,
                url: `http://127.0.0.1:${this.ccrPort}`,
            };
        }
        catch (error) {
            return {
                running: false,
                port: this.ccrPort,
            };
        }
    }
    /**
     * Check if CCR is ready to accept requests
     */
    async isReady() {
        try {
            const status = await this.getStatus();
            return status.running;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Wait for CCR to be ready
     */
    async waitForReady(timeout = 30000) {
        const startTime = Date.now();
        const interval = 500; // Check every 500ms
        while (Date.now() - startTime < timeout) {
            try {
                const status = await this.getStatus();
                if (status.running) {
                    return true;
                }
            }
            catch (error) {
                // Still not ready
            }
            await new Promise((resolve) => setTimeout(resolve, interval));
        }
        throw new Error(`CCR did not become ready within ${timeout}ms`);
    }
    /**
     * Get CCR logs (if available)
     */
    async getLogs() {
        try {
            // CCR doesn't expose logs via HTTP by default
            // This is a placeholder for future implementation
            return "Logs not available via API";
        }
        catch (error) {
            return `Failed to get logs: ${error}`;
        }
    }
    /**
     * Ensure CCR is running before launching Claude Code
     * Restarts if config has changed
     */
    async ensureRunning() {
        try {
            // Generate config and check if it changed
            const configChanged = await this.generateConfig();
            const status = await this.getStatus();
            if (status.running && configChanged) {
                console.info("CCR config changed, restarting...");
                return await this.restart();
            }
            if (status.running) {
                return true;
            }
            console.info("CCR is not running, starting it...");
            return await this.start();
        }
        catch (error) {
            console.error("Failed to ensure CCR is running:", error);
            return false;
        }
    }
    /**
     * Get the CCR base URL
     */
    getBaseUrl() {
        return `http://127.0.0.1:${this.ccrPort}`;
    }
    /**
     * Cleanup on process exit
     */
    cleanup() {
        if (this.ccrProcess) {
            try {
                this.ccrProcess.kill();
            }
            catch (error) {
                // Ignore cleanup errors
            }
            this.ccrProcess = null;
        }
    }
}
exports.CCRManager = CCRManager;
// Export singleton instance
exports.ccrManager = new CCRManager();
// Handle process exit
process.on("exit", () => {
    exports.ccrManager.cleanup();
});
process.on("SIGINT", () => {
    exports.ccrManager.cleanup();
    process.exit();
});
process.on("SIGTERM", () => {
    exports.ccrManager.cleanup();
    process.exit();
});
//# sourceMappingURL=ccr-manager.js.map