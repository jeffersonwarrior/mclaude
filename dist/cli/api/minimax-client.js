"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniMaxClient = void 0;
var axios_1 = require("axios");
var types_1 = require("../models/types");
var MiniMaxClient = /** @class */ (function () {
    function MiniMaxClient(options) {
        if (options === void 0) { options = {}; }
        this.defaultHeaders = __assign({ "Content-Type": "application/json", "User-Agent": "mclaude/1.2.1" }, options.headers);
        this.axios = axios_1.default.create({
            baseURL: options.baseURL || "https://api.minimax.io/anthropic",
            timeout: options.timeout || 30000,
            headers: this.defaultHeaders,
        });
        this.setupInterceptors();
    }
    MiniMaxClient.prototype.setupInterceptors = function () {
        // Request interceptor
        this.axios.interceptors.request.use(function (config) {
            return config;
        }, function (error) {
            console.error("MiniMax API Request Error:", error);
            return Promise.reject(error);
        });
        // Response interceptor
        this.axios.interceptors.response.use(function (response) {
            return response;
        }, function (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.response) {
                    console.error("MiniMax API Error Response: ".concat(error.response.status, " ").concat(error.response.statusText));
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
    };
    MiniMaxClient.prototype.setApiKey = function (apiKey) {
        this.axios.defaults.headers.common["Authorization"] = "Bearer ".concat(apiKey);
    };
    MiniMaxClient.prototype.setGroupId = function (groupId) {
        this.axios.defaults.headers.common["X-GroupId"] = groupId;
    };
    MiniMaxClient.prototype.setBaseURL = function (baseURL) {
        this.axios.defaults.baseURL = baseURL;
    };
    MiniMaxClient.prototype.get = function (url, config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.axios.get(url, config)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        throw this.handleError(error_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MiniMaxClient.prototype.post = function (url, data, config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.axios.post(url, data, config)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        throw this.handleError(error_2);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MiniMaxClient.prototype.put = function (url, data, config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.axios.put(url, data, config)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        throw this.handleError(error_3);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MiniMaxClient.prototype.delete = function (url, config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.axios.delete(url, config)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        throw this.handleError(error_4);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MiniMaxClient.prototype.fetchModels = function (apiKey, modelsUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setApiKey(apiKey);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.get(modelsUrl)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, this.transformResponse(response.data)];
                    case 3:
                        error_5 = _a.sent();
                        if (error_5 instanceof types_1.ApiError) {
                            throw error_5;
                        }
                        throw new types_1.ApiError("Failed to fetch MiniMax models: ".concat(error_5.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MiniMaxClient.prototype.checkQuota = function (apiKey) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setApiKey(apiKey);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.get("/v1/quota")];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_6 = _a.sent();
                        // MiniMax quota endpoint might not exist or might be different
                        // Return default values for now
                        console.warn("MiniMax quota check failed, assuming unlimited:", error_6);
                        return [2 /*return*/, { remaining: -1, total: -1 }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MiniMaxClient.prototype.transformResponse = function (data) {
        // MiniMax might have different response format
        // Transform to standard format if needed
        if (data.data && Array.isArray(data.data)) {
            return data;
        }
        // If MiniMax returns models directly, wrap in standard format
        if (Array.isArray(data)) {
            return {
                data: data.map(function (model) { return (__assign(__assign({}, model), { provider: "minimax" })); }),
                object: "list",
            };
        }
        // If it's already the right format, just ensure provider is set
        if (data.data) {
            return __assign(__assign({}, data), { data: data.data.map(function (model) { return (__assign(__assign({}, model), { provider: "minimax" })); }) });
        }
        // Fallback - return empty list
        return {
            data: [],
            object: "list",
        };
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MiniMaxClient.prototype.handleError = function (error) {
        if (axios_1.default.isAxiosError(error)) {
            if (error.response) {
                var status_1 = error.response.status;
                var data = error.response.data;
                var message = (data === null || data === void 0 ? void 0 : data.message) || (data === null || data === void 0 ? void 0 : data.error) || error.response.statusText;
                // MiniMax specific error handling
                if (status_1 === 401) {
                    return new types_1.ApiError("MiniMax authentication failed: Invalid API key or token expired", status_1, data);
                }
                else if (status_1 === 403) {
                    return new types_1.ApiError("MiniMax access forbidden: Insufficient permissions or quota exceeded", status_1, data);
                }
                else if (status_1 === 429) {
                    return new types_1.ApiError("MiniMax rate limit exceeded: Too many requests, please try again later", status_1, data);
                }
                return new types_1.ApiError("MiniMax API error ".concat(status_1, ": ").concat(message), status_1, data);
            }
            else if (error.request) {
                return new types_1.ApiError("MiniMax network error: No response received from API");
            }
            else {
                return new types_1.ApiError("MiniMax request error: ".concat(error.message));
            }
        }
        return new types_1.ApiError("MiniMax unknown error: ".concat(error.message));
    };
    MiniMaxClient.prototype.getAxiosInstance = function () {
        return this.axios;
    };
    /**
     * Retry logic for failed requests with exponential backoff
     */
    MiniMaxClient.prototype.fetchModelsWithRetry = function (apiKey_1, modelsUrl_1) {
        return __awaiter(this, arguments, void 0, function (apiKey, modelsUrl, maxRetries, retryDelay) {
            var lastError, _loop_1, this_1, attempt, state_1;
            if (maxRetries === void 0) { maxRetries = 3; }
            if (retryDelay === void 0) { retryDelay = 1000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lastError = new Error("Unknown error");
                        _loop_1 = function (attempt) {
                            var _b, error_7, apiError, delay_1;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 2, , 4]);
                                        _b = {};
                                        return [4 /*yield*/, this_1.fetchModels(apiKey, modelsUrl)];
                                    case 1: return [2 /*return*/, (_b.value = _c.sent(), _b)];
                                    case 2:
                                        error_7 = _c.sent();
                                        lastError = error_7;
                                        apiError = error_7;
                                        // Don't retry on authentication errors
                                        if (apiError.status === 401 || apiError.status === 403) {
                                            throw apiError;
                                        }
                                        // Don't retry on the last attempt
                                        if (attempt === maxRetries) {
                                            return [2 /*return*/, "break"];
                                        }
                                        delay_1 = retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                                        console.warn("MiniMax API request failed (attempt ".concat(attempt, "/").concat(maxRetries, "), retrying..."));
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })];
                                    case 3:
                                        _c.sent();
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 1;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= maxRetries)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        if (state_1 === "break")
                            return [3 /*break*/, 4];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: throw lastError;
                }
            });
        });
    };
    return MiniMaxClient;
}());
exports.MiniMaxClient = MiniMaxClient;
