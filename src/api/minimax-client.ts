import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ApiModelsResponse, ApiError } from "../models/types";

export interface MiniMaxClientOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class MiniMaxClient {
  private axios: AxiosInstance;
  private defaultHeaders: Record<string, string>;

  constructor(options: MiniMaxClientOptions = {}) {
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "User-Agent": "mclaude/1.2.1",
      ...options.headers,
    };

    this.axios = axios.create({
      baseURL: options.baseURL || "https://api.minimax.io/anthropic",
      timeout: options.timeout || 30000,
      headers: this.defaultHeaders,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axios.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        console.error("MiniMax API Request Error:", error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error(
              `MiniMax API Error Response: ${error.response.status} ${error.response.statusText}`,
            );
          } else if (error.request) {
            console.error("MiniMax API Network Error: No response received");
          } else {
            console.error("MiniMax API Request Setup Error:", error.message);
          }
        }
        return Promise.reject(error);
      },
    );
  }

  setApiKey(apiKey: string): void {
    this.axios.defaults.headers.common["Authorization"] = `Bearer ${apiKey}`;
  }

  setGroupId(groupId: string): void {
    this.axios.defaults.headers.common["X-GroupId"] = groupId;
  }

  setBaseURL(baseURL: string): void {
    this.axios.defaults.baseURL = baseURL;
  }

  async get<T = unknown>(url: string, config?: unknown): Promise<AxiosResponse<T>> {
    try {
      return await this.axios.get<T>(url, config as any);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: unknown,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axios.post<T>(url, data as any, config as any);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: unknown,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axios.put<T>(url, data as any, config as any);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T = unknown>(url: string, config?: unknown): Promise<AxiosResponse<T>> {
    try {
      return await this.axios.delete<T>(url, config as any);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async fetchModels(
    apiKey: string,
    modelsUrl: string,
  ): Promise<ApiModelsResponse> {
    this.setApiKey(apiKey);

    try {
      const response = await this.get<ApiModelsResponse>(modelsUrl);
      return this.transformResponse(response.data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Failed to fetch MiniMax models: ${(error as Error).message}`,
      );
    }
  }

  async checkQuota(apiKey: string): Promise<{
    remaining: number;
    total: number;
    resetTime?: number;
  }> {
    this.setApiKey(apiKey);

    try {
      const response = await this.get<{ remaining: number; total: number }>("/v1/quota");
      return response.data;
    } catch (error) {
      // MiniMax quota endpoint might not exist or might be different
      // Return default values for now
      console.warn("MiniMax quota check failed, assuming unlimited:", error);
      return { remaining: -1, total: -1 };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformResponse(data: any): ApiModelsResponse {
    // MiniMax might have different response format
    // Transform to standard format if needed
    if (data.data && Array.isArray(data.data)) {
      return data;
    }

    // If MiniMax returns models directly, wrap in standard format
    if (Array.isArray(data)) {
      return {
        data: data.map((model: any) => ({
          ...model,
          provider: "minimax",
        })),
        object: "list",
      };
    }

    // If it's already the right format, just ensure provider is set
    if (data.data) {
      return {
        ...data,
        data: data.data.map((model: any) => ({
          ...model,
          provider: "minimax",
        })),
      };
    }

    // Fallback - return empty list
    return {
      data: [],
      object: "list",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        const message =
          data?.message || data?.error || error.response.statusText;

        // MiniMax specific error handling
        if (status === 401) {
          return new ApiError(
            "MiniMax authentication failed: Invalid API key or token expired",
            status,
            data,
          );
        } else if (status === 403) {
          return new ApiError(
            "MiniMax access forbidden: Insufficient permissions or quota exceeded",
            status,
            data,
          );
        } else if (status === 429) {
          return new ApiError(
            "MiniMax rate limit exceeded: Too many requests, please try again later",
            status,
            data,
          );
        }

        return new ApiError(
          `MiniMax API error ${status}: ${message}`,
          status,
          data,
        );
      } else if (error.request) {
        return new ApiError(
          "MiniMax network error: No response received from API",
        );
      } else {
        return new ApiError(`MiniMax request error: ${error.message}`);
      }
    }

    return new ApiError(`MiniMax unknown error: ${(error as Error).message}`);
  }

  getAxiosInstance(): AxiosInstance {
    return this.axios;
  }

  /**
   * Retry logic for failed requests with exponential backoff
   */
  async fetchModelsWithRetry(
    apiKey: string,
    modelsUrl: string,
    maxRetries: number = 3,
    retryDelay: number = 1000,
  ): Promise<ApiModelsResponse> {
    let lastError: Error = new Error("Unknown error");

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.fetchModels(apiKey, modelsUrl);
      } catch (error) {
        lastError = error as Error;

        const apiError = error as ApiError;

        // Don't retry on authentication errors
        if (apiError.status === 401 || apiError.status === 403) {
          throw apiError;
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff with jitter
        const delay =
          retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.warn(
          `MiniMax API request failed (attempt ${attempt}/${maxRetries}), retrying...`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}
