export interface CCRStatus {
    running: boolean;
    port: number;
    pid?: number;
    url?: string;
}
export declare class CCRManager {
    private ccrProcess;
    private configGenerator;
    private readonly ccrPort;
    private readonly ccrHomeDir;
    private readonly ccrConfigPath;
    private lastConfigHash;
    constructor();
    /**
     * Get hash of current CCR config file
     */
    private getConfigHash;
    /**
     * Check if config has changed since last check
     */
    hasConfigChanged(): boolean;
    /**
     * Generate CCR configuration from mclaude config
     * Returns true if config was generated/changed
     * Throws error only on actual failure, returns false when config hasn't changed
     */
    generateConfig(): Promise<boolean>;
    /**
     * Start CCR process
     */
    start(): Promise<boolean>;
    /**
     * Stop CCR process
     */
    stop(): Promise<boolean>;
    /**
     * Restart CCR process
     */
    restart(): Promise<boolean>;
    /**
     * Get CCR status
     */
    getStatus(): Promise<CCRStatus>;
    /**
     * Check if CCR is ready to accept requests
     */
    isReady(): Promise<boolean>;
    /**
     * Wait for CCR to be ready
     */
    waitForReady(timeout?: number): Promise<boolean>;
    /**
     * Get CCR logs (if available)
     */
    getLogs(): Promise<string>;
    /**
     * Ensure CCR is running before launching Claude Code
     * Restarts if config has changed
     */
    ensureRunning(): Promise<boolean>;
    /**
     * Get the CCR base URL
     */
    getBaseUrl(): string;
    /**
     * Cleanup on process exit
     */
    cleanup(): void;
}
export declare const ccrManager: CCRManager;
//# sourceMappingURL=ccr-manager.d.ts.map