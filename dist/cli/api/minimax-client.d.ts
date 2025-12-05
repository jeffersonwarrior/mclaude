import { AxiosInstance, AxiosResponse } from "axios";
import { ApiModelsResponse } from "../models/types";
export interface MiniMaxClientOptions {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
}
export declare class MiniMaxClient {
    private axios;
    private defaultHeaders;
    constructor(options?: MiniMaxClientOptions);
    private setupInterceptors;
    setApiKey(apiKey: string): void;
    setGroupId(groupId: string): void;
    setBaseURL(baseURL: string): void;
    get<T = unknown>(url: string, config?: unknown): Promise<AxiosResponse<T>>;
    post<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<AxiosResponse<T>>;
    put<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<AxiosResponse<T>>;
    delete<T = unknown>(url: string, config?: unknown): Promise<AxiosResponse<T>>;
    fetchModels(apiKey: string, modelsUrl: string): Promise<ApiModelsResponse>;
    checkQuota(apiKey: string): Promise<{
        remaining: number;
        total: number;
        resetTime?: number;
    }>;
    private transformResponse;
    private handleError;
    getAxiosInstance(): AxiosInstance;
    /**
     * Retry logic for failed requests with exponential backoff
     */
    fetchModelsWithRetry(apiKey: string, modelsUrl: string, maxRetries?: number, retryDelay?: number): Promise<ApiModelsResponse>;
}
