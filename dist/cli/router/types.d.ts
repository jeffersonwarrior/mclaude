export interface LiteLLMConfig {
    port: number;
    host: string;
    timeout: number;
    modelRoutes: ModelRoute[];
    enabled: boolean;
}
export interface ModelRoute {
    pattern: string;
    provider: "minimax" | "synthetic";
    priority: number;
}
export interface RouterProvider {
    name: "minimax" | "synthetic";
    anthropicBaseUrl: string;
    apiKey: string;
}
export interface ProxyStartOptions {
    port?: number;
    host?: string;
    timeout?: number;
    enabled?: boolean;
}
export interface ProxyStatus {
    running: boolean;
    url: string;
    uptime: number;
    routes: number;
}
