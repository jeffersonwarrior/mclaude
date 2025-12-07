import { ConfigManager } from "../config";
import { ProxyStatus } from "./types";
export declare class RouterManager {
    private proxy;
    private configManager;
    constructor(configManager: ConfigManager);
    /**
     * Initialize and start the router if enabled
     */
    initializeRouter(): Promise<ProxyStatus>;
    /**
     * Stop the router
     */
    stopRouter(): Promise<void>;
    /**
     * Get router status
     */
    getRouterStatus(): Promise<ProxyStatus | null>;
    /**
     * Check if router is running
     */
    isRouterRunning(): Promise<boolean>;
    /**
     * Get proxy URL
     */
    getProxyUrl(): Promise<string | null>;
    /**
     * Cleanup on process exit
     */
    cleanup(): Promise<void>;
}
export declare function getRouterManager(configManager?: ConfigManager): RouterManager;
export declare function resetRouterManager(): void;
//# sourceMappingURL=manager.d.ts.map