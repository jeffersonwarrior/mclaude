export interface EnvironmentVariables {
    SYNTHETIC_API_KEY?: string;
    MINIMAX_API_KEY?: string;
    SYNTHETIC_BASE_URL?: string;
    MINIMAX_API_URL?: string;
    MINIMAX_ANTHROPIC_URL?: string;
    MINIMAX_OPENAI_URL?: string;
    MINIMAX_MODEL?: string;
    API_TIMEOUT_MS?: string;
}
export declare class EnvironmentManager {
    private static instance;
    private envVars;
    private constructor();
    static getInstance(): EnvironmentManager;
    private loadEnvFile;
    private parseEnvContent;
    private loadEnvironmentVariables;
    getEnvironmentVariables(): EnvironmentVariables;
    getEnvironmentVariable(key: keyof EnvironmentVariables): string | undefined;
    getApiKey(provider: "synthetic" | "minimax"): string;
    getApiUrl(provider: "synthetic" | "minimax", type: "anthropic" | "openai" | "base"): string;
    getDefaultModel(provider: "synthetic" | "minimax"): string;
    getApiTimeout(): number;
    validateEnvironmentVariables(): {
        valid: boolean;
        errors: string[];
    };
    private isValidApiKey;
    private isValidUrl;
    reload(): Promise<void>;
    syncReload(): void;
    static resetInstance(): void;
}
export declare const envManager: EnvironmentManager;
