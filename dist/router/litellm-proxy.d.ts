import { ConfigManager } from "../config";
import { ProxyStartOptions, ProxyStatus } from "./types";
export declare class LiteLLMProxy {
    private process;
    private config;
    private startTime;
    private configManager;
    constructor(configManager: ConfigManager);
    private loadConfig;
    /**
     * Start the LiteLLM proxy server
     */
    start(options?: ProxyStartOptions): Promise<ProxyStatus>;
    /**
     * Stop the LiteLLM proxy server
     */
    stop(): Promise<void>;
    /**
     * Get the proxy status
     */
    getStatus(): ProxyStatus;
    /**
     * Check if proxy is enabled
     */
    isEnabled(): boolean;
    /**
     * Check if LiteLLM proxy is already running on the expected port
     */
    private checkIfProxyRunning;
    /**
     * Ensure LiteLLM Python package is installed
     */
    private ensureLiteLLMInstalled;
    /**
     * Wait for server to be ready
     */
    private waitForServer;
    /**
     * Cleanup resources
     */
    private cleanup;
}
//# sourceMappingURL=litellm-proxy.d.ts.map