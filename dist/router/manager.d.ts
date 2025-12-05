import { ConfigManager } from "../config";
import { ProxyStartOptions, ProxyStatus } from "./types";
export declare class RouterManager {
    private proxy;
    private configManager;
    constructor(configManager: ConfigManager);
    /**
     * Initialize and start the router if enabled
     */
    initializeRouter(options?: ProxyStartOptions): Promise<ProxyStatus>;
    /**
     * Stop the router
     */
    stopRouter(): Promise<void>;
    /**
     * Get router status
     */
    getRouterStatus(): ProxyStatus | null;
    /**
     * Check if router is running
     */
    isRouterRunning(): boolean;
    /**
     * Get proxy URL
     */
    getProxyUrl(): string | null;
    /**
     * Cleanup on process exit
     */
    cleanup(): Promise<void>;
}
export declare function getRouterManager(configManager?: ConfigManager): RouterManager;
export declare function resetRouterManager(): void;
//# sourceMappingURL=manager.d.ts.map