"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiteLLMProxy = void 0;
const child_process_1 = require("child_process");
class LiteLLMProxy {
    process = null;
    config;
    startTime = null;
    configManager;
    constructor(configManager) {
        this.configManager = configManager;
        this.config = this.loadConfig();
    }
    loadConfig() {
        return {
            port: parseInt(process.env.LITELLM_PORT || "9313", 10),
            host: process.env.LITELLM_HOST || "0.0.0.0",
            timeout: parseInt(process.env.LITELLM_TIMEOUT || "300000", 10),
            enabled: process.env.LITELLM_ENABLED === "true",
            modelRoutes: [
                {
                    pattern: "minimax:*",
                    provider: "minimax",
                    priority: 1,
                },
                {
                    pattern: "synthetic:*",
                    provider: "synthetic",
                    priority: 2,
                },
            ],
        };
    }
    /**
     * Start the LiteLLM proxy server
     */
    async start(options = {}) {
        if (!this.config.enabled && !options.enabled) {
            return {
                running: false,
                url: "",
                uptime: 0,
                routes: 0,
            };
        }
        // First check if LiteLLM is already running on the expected port
        const isAlreadyRunning = await this.checkIfProxyRunning();
        if (isAlreadyRunning) {
            return {
                running: true,
                url: `http://127.0.0.1:${this.config.port}`,
                uptime: 0,
                routes: this.config.modelRoutes.length,
            };
        }
        // Only start if not already running
        if (this.process) {
            return {
                running: true,
                url: `http://127.0.0.1:${this.config.port}`,
                uptime: Date.now() - (this.startTime || Date.now()),
                routes: this.config.modelRoutes.length,
            };
        }
        // Silent startup - no console output unless there's an error
        await this.ensureLiteLLMInstalled();
        try {
            // Use working configuration approach
            const syntheticApiKey = this.configManager.getEffectiveApiKey("synthetic") || "";
            const syntheticBaseUrl = this.configManager.getProviderConfig("synthetic")?.anthropicBaseUrl || "https://api.synthetic.new/anthropic";
            const minimaxApiKey = this.configManager.getEffectiveApiKey("minimax") || "";
            const minimaxBaseUrl = this.configManager.getProviderConfig("minimax")?.anthropicBaseUrl || "https://api.minimax.io/anthropic";
            // Use file-based SQLite database for better PostgreSQL compatibility
            const tempDir = require('os').tmpdir();
            const dbPath = `${tempDir}/litellm-mclaude.db`;
            const env = {
                ...process.env,
                // Use file-based SQLite database instead of in-memory (fixes PostgreSQL compatibility issues)
                DATABASE_URL: `file:${dbPath}`,
                LITELLM_DATABASE_URL: `file:${dbPath}`,
                // Alternative: try with local file database
                // DATABASE_URL: `file:${require('os').tmpdir()}/litellm-memory.db`,
                // LITELLM_DATABASE_URL: `file:${require('os').tmpdir()}/litellm-memory.db`,
                // Set configuration for direct API calls
                ANTHROPIC_API_KEY: syntheticApiKey,
                ANTHROPIC_API_BASE: syntheticBaseUrl,
                // Master key must start with "sk-" for LiteLLM proxy validation
                LITELLM_MASTER_KEY: `sk-${syntheticApiKey}`,
            };
            // Use simple direct model configuration without database
            const args = [
                "--port", "9313",
                "--host", "0.0.0.0",
                "--model", "openai/hf:deepseek-ai/DeepSeek-V3.2",
                "--api_base", syntheticBaseUrl,
                "--api_key", syntheticApiKey,
                "--drop_params",
                "--no_database", // Skip database entirely
            ];
            // Always silent - capture stderr for error detection only
            this.process = (0, child_process_1.spawn)("litellm", args, {
                stdio: "pipe", // Capture all output
                detached: true,
                env,
            });
            // Show startup output for debugging
            this.process.stderr.on('data', (data) => {
                const output = data.toString().trim();
                console.error(`[LiteLLM STDERR]: ${output}`);
            });
            // Show startup output for debugging  
            this.process.stdout.on('data', (data) => {
                const output = data.toString().trim();
                console.log(`[LiteLLM STDOUT]: ${output}`);
            });
            this.process.unref(); // Run in background - don't block
            this.startTime = Date.now();
            // Silently wait for startup
            await this.waitForServer("127.0.0.1", 9313, this.config.timeout);
            // Additional delay to ensure LiteLLM auth system is fully initialized
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Silent completion - no success message
            return {
                running: true,
                url: `http://127.0.0.1:9313`,
                uptime: Date.now() - this.startTime,
                routes: this.config.modelRoutes.length,
            };
        }
        catch (error) {
            console.error("Failed to start LiteLLM proxy:", error);
            this.cleanup();
            throw error;
        }
    }
    /**
     * Stop the LiteLLM proxy server
     */
    async stop() {
        this.cleanup();
    }
    /**
     * Get the proxy status
     */
    getStatus() {
        return {
            running: this.process !== null,
            url: this.process
                ? `http://127.0.0.1:${this.config.port}`
                : "",
            uptime: this.startTime ? Date.now() - this.startTime : 0,
            routes: this.config.modelRoutes.length,
        };
    }
    /**
     * Check if proxy is enabled
     */
    isEnabled() {
        return this.config.enabled;
    }
    /**
     * Check if LiteLLM proxy is already running on the expected port
     */
    async checkIfProxyRunning() {
        try {
            const http = require("http");
            // Check if proxy is running using correct master key
            const syntheticApiKey = this.configManager.getEffectiveApiKey("synthetic") || "";
            await new Promise((resolve, reject) => {
                const options = {
                    host: "127.0.0.1",
                    port: this.config.port,
                    path: "/health",
                    headers: {
                        Authorization: `Bearer sk-${syntheticApiKey}`,
                    },
                    timeout: 2000,
                };
                const req = http.get(options, (res) => {
                    // If we get any response, the server is running
                    resolve();
                });
                req.on("error", () => {
                    reject(new Error("Proxy not running"));
                });
                req.on("timeout", () => {
                    req.destroy();
                    reject(new Error("Connection timeout"));
                });
            });
            return true;
        }
        catch (error) {
            // If we can't connect, proxy is not running
            return false;
        }
    }
    /**
     * Ensure LiteLLM Python package is installed
     */
    async ensureLiteLLMInstalled() {
        try {
            const { execSync } = require("child_process");
            execSync("litellm --version", { stdio: "ignore" });
            // Silent - no console output for successful verification
        }
        catch (error) {
            try {
                const { execSync } = require("child_process");
                execSync("pip install --upgrade litellm --quiet --break-system-packages", {
                    stdio: "inherit",
                });
                // Silent - no console output for successful installation
            }
            catch (installError) {
                throw new Error("LiteLLM Python package not found. Install with: pip install litellm");
            }
        }
    }
    /**
     * Wait for server to be ready
     */
    async waitForServer(host, port, timeoutMs) {
        const startTime = Date.now();
        const http = require("http");
        while (Date.now() - startTime < timeoutMs) {
            try {
                // Use same sk- prefixed key for health checks during startup
                const syntheticApiKey = this.configManager.getEffectiveApiKey("synthetic") || "";
                await new Promise((resolve, reject) => {
                    const options = {
                        host,
                        port,
                        path: "/health",
                        headers: {
                            Authorization: `Bearer sk-${syntheticApiKey}`,
                        },
                        timeout: 2000,
                    };
                    const req = http.get(options, (res) => {
                        if (res.statusCode === 200) {
                            resolve();
                        }
                        else {
                            // Health endpoint might not exist, try root instead
                            if (res.statusCode === 404) {
                                resolve(); // Server is up, just no health endpoint
                            }
                            else {
                                reject(new Error(`Health check failed with status: ${res.statusCode}`));
                            }
                        }
                    });
                    req.on("error", (err) => {
                        reject(err);
                    });
                    req.on("timeout", () => {
                        req.destroy();
                        reject(new Error("Request timed out"));
                    });
                });
                // Silent - no console output when server is ready
                return;
            }
            catch (error) {
                // Server not ready yet, wait and retry
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }
        throw new Error(`LiteLLM proxy server failed to start within ${timeoutMs}ms`);
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.process) {
            this.process.kill();
            this.process = null;
            this.startTime = null;
        }
        // Clean up database file to prevent accumulation
        try {
            const { unlinkSync } = require('fs');
            const dbPath = `${require('os').tmpdir()}/litellm-mclaude.db`;
            unlinkSync(dbPath);
        }
        catch {
            // Ignore cleanup errors (file might not exist)
        }
    }
}
exports.LiteLLMProxy = LiteLLMProxy;
//# sourceMappingURL=litellm-proxy.js.map