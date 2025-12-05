import { AxiosInstance, AxiosResponse } from "axios";
import { ApiModelsResponse } from "../models/types";
export interface ApiClientOptions {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
}
export declare class ApiClient {
    private axios;
    private defaultHeaders;
    constructor(options?: ApiClientOptions);
    private setupInterceptors;
    setApiKey(apiKey: string): void;
    setBaseURL(baseURL: string): void;
    get<T = unknown>(url: string, config?: unknown): Promise<AxiosResponse<T>>;
    post<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<AxiosResponse<T>>;
    put<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<AxiosResponse<T>>;
    delete<T = unknown>(url: string, config?: unknown): Promise<AxiosResponse<T>>;
    fetchModels(apiKey: string, modelsUrl: string): Promise<ApiModelsResponse>;
    private handleError;
    getAxiosInstance(): AxiosInstance;
}
//# sourceMappingURL=client.d.ts.map