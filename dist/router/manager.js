"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterManager = void 0;
exports.getRouterManager = getRouterManager;
exports.resetRouterManager = resetRouterManager;
const litellm_proxy_1 = require("./litellm-proxy");
class RouterManager {
    proxy = null;
    configManager;
    constructor(configManager) {
        this.configManager = configManager;
    }
    /**
     * Initialize and start the router if enabled
     */
    async initializeRouter(options = {}) {
        const config = this.configManager.config;
        // Check if router is enabled in config
        if (!config.liteLLM?.enabled) {
            console.log("[Router] LiteLLM proxy disabled in config");
            return {
                running: false,
                url: "",
                uptime: 0,
                routes: 0,
            };
        }
        if (!this.proxy) {
            this.proxy = new litellm_proxy_1.LiteLLMProxy(this.configManager);
        }
        console.log("[Router] Starting LiteLLM proxy...");
        const status = await this.proxy.start({
            port: options.port || config.liteLLM.port || 8000,
            host: options.host || config.liteLLM.host || "127.0.0.1",
            timeout: options.timeout || config.liteLLM.timeout || 300000,
            enabled: true,
        });
        if (status.running) {
            console.log(`[Router] ✅ LiteLLM proxy running at ${status.url}`);
            console.log(`[Router] Routes configured: ${status.routes}`);
        }
        return status;
    }
    /**
     * Stop the router
     */
    async stopRouter() {
        if (this.proxy) {
            console.log("[Router] Stopping LiteLLM proxy...");
            await this.proxy.stop();
            this.proxy = null;
            console.log("[Router] ✅ LiteLLM proxy stopped");
        }
    }
    /**
     * Get router status
     */
    getRouterStatus() {
        return this.proxy?.getStatus() || null;
    }
    /**
     * Check if router is running
     */
    isRouterRunning() {
        return !!(this.proxy?.isEnabled() && this.proxy.getStatus().running);
    }
    /**
     * Get proxy URL
     */
    getProxyUrl() {
        const status = this.getRouterStatus();
        return status?.running ? status.url : null;
    }
    /**
     * Cleanup on process exit
     */
    async cleanup() {
        await this.stopRouter();
    }
}
exports.RouterManager = RouterManager;
// Singleton instance
let routerManagerInstance = null;
function getRouterManager(configManager) {
    if (!routerManagerInstance && configManager) {
        routerManagerInstance = new RouterManager(configManager);
    }
    return routerManagerInstance;
}
function resetRouterManager() {
    routerManagerInstance = null;
}
//# sourceMappingURL=manager.js.map