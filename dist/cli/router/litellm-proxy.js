"use strict";
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
exports.LiteLLMProxy = void 0;
var child_process_1 = require("child_process");
var path_1 = require("path");
var LiteLLMProxy = /** @class */ (function () {
    function LiteLLMProxy(configManager) {
        this.process = null;
        this.startTime = null;
        this.configManager = configManager;
        this.config = this.loadConfig();
    }
    LiteLLMProxy.prototype.loadConfig = function () {
        return {
            port: parseInt(process.env.LITELLM_PORT || "9313", 10),
            host: process.env.LITELLM_HOST || "127.0.0.1",
            timeout: parseInt(process.env.LITELLM_TIMEOUT || "300000", 10),
            enabled: process.env.LITELLM_ENABLED === "true",
            modelRoutes: [
                {
                    pattern: "minimax:*",
                    provider: "minimax",
                    priority: 1,
                },
                {
                    pattern: "synthetic:*",
                    provider: "synthetic",
                    priority: 2,
                },
            ],
        };
    };
    /**
     * Start the LiteLLM proxy server
     */
    LiteLLMProxy.prototype.start = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            var port, host, timeout, configData, os, fs, configPath, error_1;
            var _this = this;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.enabled && !options.enabled) {
                            return [2 /*return*/, {
                                    running: false,
                                    url: "",
                                    uptime: 0,
                                    routes: 0,
                                }];
                        }
                        // Ensure LiteLLM is installed
                        return [4 /*yield*/, this.ensureLiteLLMInstalled()];
                    case 1:
                        // Ensure LiteLLM is installed
                        _a.sent();
                        if (this.process) {
                            return [2 /*return*/, {
                                    running: true,
                                    url: "http://".concat(this.config.host, ":").concat(this.config.port),
                                    uptime: Date.now() - (this.startTime || Date.now()),
                                    routes: this.config.modelRoutes.length,
                                }];
                        }
                        port = options.port || this.config.port;
                        host = options.host || this.config.host;
                        timeout = options.timeout || this.config.timeout;
                        configData = this.buildLiteLLMConfig();
                        os = require("os");
                        fs = require("fs");
                        configPath = (0, path_1.join)(os.tmpdir(), "litellm-config-".concat(Date.now(), ".yaml"));
                        fs.writeFileSync(configPath, configData);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        // Start litellm proxy with the config file
                        this.process = (0, child_process_1.spawn)("npx", ["litellm", "--config", configPath], {
                            stdio: ["ignore", "pipe", "pipe"],
                            env: process.env,
                        });
                        this.startTime = Date.now();
                        this.process.stdout.on("data", function (data) {
                            console.log("[LiteLLM] ".concat(data.toString().trim()));
                        });
                        this.process.stderr.on("data", function (data) {
                            console.error("[LiteLLM Error] ".concat(data.toString().trim()));
                        });
                        this.process.on("exit", function (code) {
                            console.log("[LiteLLM] Process exited with code ".concat(code));
                            _this.cleanup();
                        });
                        // Wait for server to be ready
                        return [4 /*yield*/, this.waitForServer(host, port, timeout)];
                    case 3:
                        // Wait for server to be ready
                        _a.sent();
                        // Clean up temp config file
                        fs.unlinkSync(configPath);
                        return [2 /*return*/, {
                                running: true,
                                url: "http://".concat(host, ":").concat(port),
                                uptime: Date.now() - this.startTime,
                                routes: this.config.modelRoutes.length,
                            }];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Failed to start LiteLLM proxy:", error_1);
                        this.cleanup();
                        if (fs.existsSync(configPath)) {
                            fs.unlinkSync(configPath);
                        }
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop the LiteLLM proxy server
     */
    LiteLLMProxy.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.cleanup();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get the proxy status
     */
    LiteLLMProxy.prototype.getStatus = function () {
        return {
            running: this.process !== null,
            url: this.process
                ? "http://".concat(this.config.host, ":").concat(this.config.port)
                : "",
            uptime: this.startTime ? Date.now() - this.startTime : 0,
            routes: this.config.modelRoutes.length,
        };
    };
    /**
     * Check if proxy is enabled
     */
    LiteLLMProxy.prototype.isEnabled = function () {
        return this.config.enabled;
    };
    /**
     * Ensure LiteLLM Python package is installed
     */
    LiteLLMProxy.prototype.ensureLiteLLMInstalled = function () {
        return __awaiter(this, void 0, void 0, function () {
            var execSync, execSync;
            return __generator(this, function (_a) {
                try {
                    execSync = require("child_process").execSync;
                    execSync("python3 -m litellm --version", { stdio: "ignore" });
                    console.log("[LiteLLM] Python package verified");
                }
                catch (error) {
                    console.log("[LiteLLM] Installing Python package...");
                    try {
                        execSync = require("child_process").execSync;
                        execSync("python3 -m pip install litellm --quiet --break-system-packages", {
                            stdio: "inherit",
                        });
                        console.log("[LiteLLM] ✅ Python package installed");
                    }
                    catch (installError) {
                        throw new Error("LiteLLM Python package not found. Install with: pip install litellm");
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Build LiteLLM configuration YAML
     */
    LiteLLMProxy.prototype.buildLiteLLMConfig = function () {
        var _this = this;
        var modelConfigs = this.config.modelRoutes.map(function (route) {
            var apiKey = "";
            var apiBase = "";
            if (route.provider === "minimax") {
                var minimaxConfig = _this.configManager.getProviderConfig("minimax");
                try {
                    apiKey = _this.configManager.getEffectiveApiKey("minimax") || "";
                    apiBase = (minimaxConfig === null || minimaxConfig === void 0 ? void 0 : minimaxConfig.anthropicBaseUrl) || "https://api.minimax.io/anthropic";
                }
                catch (error) {
                    console.warn("Failed to get MiniMax config: ".concat(error));
                }
            }
            else {
                var syntheticConfig = _this.configManager.getProviderConfig("synthetic");
                try {
                    apiKey = _this.configManager.getEffectiveApiKey("synthetic") || "";
                    apiBase = (syntheticConfig === null || syntheticConfig === void 0 ? void 0 : syntheticConfig.anthropicBaseUrl) || "https://api.synthetic.new/anthropic";
                }
                catch (error) {
                    console.warn("Failed to get Synthetic config: ".concat(error));
                }
            }
            return "  - model_name: \"".concat(route.pattern, "\"\n    litellm_params:\n      model: \"openai/").concat(route.provider, "\"\n      api_base: \"").concat(apiBase, "\"\n      api_key: \"").concat(apiKey, "\"");
        });
        return "model_list:\n".concat(modelConfigs.join("\n"), "\n\ngeneral_settings:\n  master_key: \"sk-litellm\"\n  database_url: \"sqlite:///litellm.db\"\n");
    };
    /**
     * Wait for server to be ready
     */
    LiteLLMProxy.prototype.waitForServer = function (host, port, timeoutMs) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, http, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        http = require("http");
                        _a.label = 1;
                    case 1:
                        if (!(Date.now() - startTime < timeoutMs)) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var req = http.get("http://".concat(host, ":").concat(port, "/health"), function () {
                                    resolve();
                                });
                                req.on("error", function () {
                                    // Ignore connection errors
                                });
                                req.setTimeout(1000);
                            })];
                    case 3:
                        _a.sent();
                        console.log("[LiteLLM] Proxy server is ready at http://".concat(host, ":").concat(port));
                        return [2 /*return*/];
                    case 4:
                        error_2 = _a.sent();
                        // Server not ready yet, wait and retry
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 5:
                        // Server not ready yet, wait and retry
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 1];
                    case 7: throw new Error("LiteLLM proxy server failed to start within ".concat(timeoutMs, "ms"));
                }
            });
        });
    };
    /**
     * Cleanup resources
     */
    LiteLLMProxy.prototype.cleanup = function () {
        if (this.process) {
            this.process.kill();
            this.process = null;
            this.startTime = null;
        }
    };
    return LiteLLMProxy;
}());
exports.LiteLLMProxy = LiteLLMProxy;
