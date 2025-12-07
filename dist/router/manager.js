"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterManager = void 0;
exports.getRouterManager = getRouterManager;
exports.resetRouterManager = resetRouterManager;
const tensorzero_proxy_1 = require("./tensorzero-proxy");
const config_1 = require("../config");
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
        // Check if router is enabled in config (support both liteLLM and tensorzero for migration)
        const proxyConfig = config.tensorzero || config.liteLLM;
        if (!proxyConfig?.enabled) {
            console.log("[Router] TensorZero proxy disabled in config");
            return {
                running: false,
                url: "",
                uptime: 0,
                routes: 0,
            };
        }
        if (!this.proxy) {
            this.proxy = new tensorzero_proxy_1.TensorZeroProxy(this.configManager);
        }
        console.log("[Router] Starting TensorZero proxy...");
        const status = await this.proxy.start();
        if (status.running) {
            console.log(`[Router] ✅ TensorZero proxy running at ${status.url}`);
            console.log(`[Router] Routes configured: ${status.routes}`);
        }
        return status;
    }
    /**
     * Stop the router
     */
    async stopRouter() {
        if (this.proxy) {
            console.log("[Router] Stopping TensorZero proxy...");
            await this.proxy.stop();
            this.proxy = null;
            console.log("[Router] ✅ TensorZero proxy stopped");
        }
    }
    /**
     * Get router status
     */
    async getRouterStatus() {
        return this.proxy ? await this.proxy.getStatus() : null;
    }
    /**
     * Check if router is running
     */
    async isRouterRunning() {
        const status = this.proxy ? await this.proxy.getStatus() : null;
        return !!status?.running;
    }
    /**
     * Get proxy URL
     */
    async getProxyUrl() {
        const status = await this.getRouterStatus();
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
    if (!routerManagerInstance) {
        routerManagerInstance = new RouterManager(configManager || new config_1.ConfigManager());
    }
    return routerManagerInstance;
}
function resetRouterManager() {
    routerManagerInstance = null;
}
//# sourceMappingURL=manager.js.map