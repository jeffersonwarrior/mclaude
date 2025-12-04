"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniMaxClient = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../models/types");
class MiniMaxClient {
    axios;
    defaultHeaders;
    constructor(options = {}) {
        this.defaultHeaders = {
            "Content-Type": "application/json",
            "User-Agent": "mclaude/1.2.1",
            ...options.headers,
        };
        this.axios = axios_1.default.create({
            baseURL: options.baseURL || "https://api.minimax.io/anthropic",
            timeout: options.timeout || 30000,
            headers: this.defaultHeaders,
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor
        this.axios.interceptors.request.use((config) => {
            return config;
        }, (error) => {
            console.error("MiniMax API Request Error:", error);
            return Promise.reject(error);
        });
        // Response interceptor
        this.axios.interceptors.response.use((response) => {
            return response;
        }, (error) => {
            if (axios_1.default.isAxiosError(error)) {
                if (error.response) {
                    console.error(`MiniMax API Error Response: ${error.response.status} ${error.response.statusText}`);
                }
                else if (error.request) {
                    console.error("MiniMax API Network Error: No response received");
                }
                else {
                    console.error("MiniMax API Request Setup Error:", error.message);
                }
            }
            return Promise.reject(error);
        });
    }
    setApiKey(apiKey) {
        this.axios.defaults.headers.common["Authorization"] = `Bearer ${apiKey}`;
    }
    setGroupId(groupId) {
        this.axios.defaults.headers.common["X-GroupId"] = groupId;
    }
    setBaseURL(baseURL) {
        this.axios.defaults.baseURL = baseURL;
    }
    async get(url, config) {
        try {
            return await this.axios.get(url, config);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async post(url, data, config) {
        try {
            return await this.axios.post(url, data, config);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async put(url, data, config) {
        try {
            return await this.axios.put(url, data, config);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async delete(url, config) {
        try {
            return await this.axios.delete(url, config);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async fetchModels(apiKey, modelsUrl) {
        this.setApiKey(apiKey);
        try {
            const response = await this.get(modelsUrl);
            return this.transformResponse(response.data);
        }
        catch (error) {
            if (error instanceof types_1.ApiError) {
                throw error;
            }
            throw new types_1.ApiError(`Failed to fetch MiniMax models: ${error.message}`);
        }
    }
    async checkQuota(apiKey) {
        this.setApiKey(apiKey);
        try {
            const response = await this.get("/v1/quota");
            return response.data;
        }
        catch (error) {
            // MiniMax quota endpoint might not exist or might be different
            // Return default values for now
            console.warn("MiniMax quota check failed, assuming unlimited:", error);
            return { remaining: -1, total: -1 };
        }
    }
    transformResponse(data) {
        // MiniMax might have different response format
        // Transform to standard format if needed
        if (data.data && Array.isArray(data.data)) {
            return data;
        }
        // If MiniMax returns models directly, wrap in standard format
        if (Array.isArray(data)) {
            return {
                data: data.map((model) => ({
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
                data: data.data.map((model) => ({
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
    handleError(error) {
        if (axios_1.default.isAxiosError(error)) {
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                const message = data?.message || data?.error || error.response.statusText;
                // MiniMax specific error handling
                if (status === 401) {
                    return new types_1.ApiError("MiniMax authentication failed: Invalid API key or token expired", status, data);
                }
                else if (status === 403) {
                    return new types_1.ApiError("MiniMax access forbidden: Insufficient permissions or quota exceeded", status, data);
                }
                else if (status === 429) {
                    return new types_1.ApiError("MiniMax rate limit exceeded: Too many requests, please try again later", status, data);
                }
                return new types_1.ApiError(`MiniMax API error ${status}: ${message}`, status, data);
            }
            else if (error.request) {
                return new types_1.ApiError("MiniMax network error: No response received from API");
            }
            else {
                return new types_1.ApiError(`MiniMax request error: ${error.message}`);
            }
        }
        return new types_1.ApiError(`MiniMax unknown error: ${error.message}`);
    }
    getAxiosInstance() {
        return this.axios;
    }
    /**
     * Retry logic for failed requests with exponential backoff
     */
    async fetchModelsWithRetry(apiKey, modelsUrl, maxRetries = 3, retryDelay = 1000) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.fetchModels(apiKey, modelsUrl);
            }
            catch (error) {
                lastError = error;
                const apiError = error;
                // Don't retry on authentication errors
                if (apiError.status === 401 || apiError.status === 403) {
                    throw apiError;
                }
                // Don't retry on the last attempt
                if (attempt === maxRetries) {
                    break;
                }
                // Exponential backoff with jitter
                const delay = retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                console.warn(`MiniMax API request failed (attempt ${attempt}/${maxRetries}), retrying...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
}
exports.MiniMaxClient = MiniMaxClient;
//# sourceMappingURL=minimax-client.js.map