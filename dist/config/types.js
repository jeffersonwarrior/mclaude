"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSaveError = exports.ConfigLoadError = exports.ConfigValidationError = exports.AppConfigSchema = exports.LegacyAppConfigSchema = exports.MinimaxProviderConfig = exports.SyntheticProviderConfig = exports.ProviderEnum = void 0;
const zod_1 = require("zod");
// Provider enumeration
exports.ProviderEnum = zod_1.z.enum(["synthetic", "minimax", "auto"]);
// Provider-specific configurations
exports.SyntheticProviderConfig = zod_1.z.object({
    apiKey: zod_1.z.string().default("").describe("Synthetic API key"),
    baseUrl: zod_1.z
        .string()
        .default("https://api.synthetic.new")
        .describe("Synthetic API base URL"),
    anthropicBaseUrl: zod_1.z
        .string()
        .default("https://api.synthetic.new/anthropic")
        .describe("Anthropic-compatible API endpoint"),
    modelsApiUrl: zod_1.z
        .string()
        .default("https://api.synthetic.new/openai/v1/models")
        .describe("OpenAI-compatible models endpoint"),
    enabled: zod_1.z
        .boolean()
        .default(true)
        .describe("Whether synthetic provider is enabled"),
    timeout: zod_1.z.number().optional().describe("Request timeout in milliseconds"),
});
exports.MinimaxProviderConfig = zod_1.z.object({
    apiKey: zod_1.z.string().default("").describe("MiniMax API key"),
    groupId: zod_1.z.string().optional().describe("MiniMax Group ID"),
    baseUrl: zod_1.z
        .string()
        .default("https://api.minimax.io")
        .describe("MiniMax API base URL"),
    anthropicBaseUrl: zod_1.z
        .string()
        .default("https://api.minimax.io/anthropic")
        .describe("MiniMax Anthropic-compatible API endpoint"),
    modelsApiUrl: zod_1.z
        .string()
        .default("https://api.minimax.io/v1/models")
        .describe("MiniMax OpenAI-compatible models endpoint"),
    enabled: zod_1.z
        .boolean()
        .default(true)
        .describe("Whether minimax provider is enabled"),
    defaultModel: zod_1.z
        .string()
        .default("MiniMax-M2")
        .describe("Default MiniMax model"),
    timeout: zod_1.z.number().optional().describe("Request timeout in milliseconds"),
});
// Legacy configuration schema for backward compatibility
exports.LegacyAppConfigSchema = zod_1.z.object({
    apiKey: zod_1.z.string().default("").describe("Synthetic API key (legacy)"),
    baseUrl: zod_1.z
        .string()
        .default("https://api.synthetic.new")
        .describe("Synthetic API base URL (legacy)"),
    anthropicBaseUrl: zod_1.z
        .string()
        .default("https://api.synthetic.new/anthropic")
        .describe("Anthropic-compatible API endpoint (legacy)"),
    modelsApiUrl: zod_1.z
        .string()
        .default("https://api.synthetic.new/openai/v1/models")
        .describe("OpenAI-compatible models endpoint (legacy)"),
});
// New multi-provider configuration schema
exports.AppConfigSchema = zod_1.z.object({
    providers: zod_1.z
        .object({
        synthetic: exports.SyntheticProviderConfig.default({}),
        minimax: exports.MinimaxProviderConfig.default({}),
    })
        .default({})
        .describe("Provider-specific configurations"),
    defaultProvider: exports.ProviderEnum.default("auto").describe("Default provider to use"),
    cacheDurationHours: zod_1.z
        .number()
        .int()
        .min(1)
        .max(168)
        .default(24)
        .describe("Model cache duration in hours"),
    selectedModel: zod_1.z.string().default("").describe("Last selected model"),
    selectedThinkingModel: zod_1.z
        .string()
        .default("")
        .describe("Last selected thinking model"),
    firstRunCompleted: zod_1.z
        .boolean()
        .default(false)
        .describe("Whether first-time setup has been completed"),
    // Environment variable overrides
    envOverrides: zod_1.z
        .object({
        synthetic: zod_1.z
            .object({
            apiKey: zod_1.z
                .string()
                .optional()
                .describe("Override synthetic API key from environment"),
        })
            .optional(),
        minimax: zod_1.z
            .object({
            apiKey: zod_1.z
                .string()
                .optional()
                .describe("Override minimax API key from environment"),
        })
            .optional(),
    })
        .default({})
        .describe("Environment variable overrides"),
    // Model combinations (up to 10 saved combinations)
    combination1: zod_1.z
        .object({
        name: zod_1.z.string().optional().describe("Combination name"),
        regularModel: zod_1.z.string().optional().describe("Regular model ID"),
        thinkingModel: zod_1.z.string().optional().describe("Thinking model ID"),
        regularProvider: zod_1.z.string().optional().describe("Regular model provider"),
        thinkingProvider: zod_1.z.string().optional().describe("Thinking model provider"),
        createdAt: zod_1.z.string().optional().describe("Creation timestamp"),
    })
        .optional(),
    combination2: zod_1.z
        .object({
        name: zod_1.z.string().optional().describe("Combination name"),
        regularModel: zod_1.z.string().optional().describe("Regular model ID"),
        thinkingModel: zod_1.z.string().optional().describe("Thinking model ID"),
        regularProvider: zod_1.z.string().optional().describe("Regular model provider"),
        thinkingProvider: zod_1.z.string().optional().describe("Thinking model provider"),
        createdAt: zod_1.z.string().optional().describe("Creation timestamp"),
    })
        .optional(),
    combination3: zod_1.z
        .object({
        name: zod_1.z.string().optional().describe("Combination name"),
        regularModel: zod_1.z.string().optional().describe("Regular model ID"),
        thinkingModel: zod_1.z.string().optional().describe("Thinking model ID"),
        regularProvider: zod_1.z.string().optional().describe("Regular model provider"),
        thinkingProvider: zod_1.z.string().optional().describe("Thinking model provider"),
        createdAt: zod_1.z.string().optional().describe("Creation timestamp"),
    })
        .optional(),
    combination4: zod_1.z
        .object({
        name: zod_1.z.string().optional().describe("Combination name"),
        regularModel: zod_1.z.string().optional().describe("Regular model ID"),
        thinkingModel: zod_1.z.string().optional().describe("Thinking model ID"),
        regularProvider: zod_1.z.string().optional().describe("Regular model provider"),
        thinkingProvider: zod_1.z.string().optional().describe("Thinking model provider"),
        createdAt: zod_1.z.string().optional().describe("Creation timestamp"),
    })
        .optional(),
    combination5: zod_1.z
        .object({
        name: zod_1.z.string().optional().describe("Combination name"),
        regularModel: zod_1.z.string().optional().describe("Regular model ID"),
        thinkingModel: zod_1.z.string().optional().describe("Thinking model ID"),
        regularProvider: zod_1.z.string().optional().describe("Regular model provider"),
        thinkingProvider: zod_1.z.string().optional().describe("Thinking model provider"),
        createdAt: zod_1.z.string().optional().describe("Creation timestamp"),
    })
        .optional(),
    combination6: zod_1.z
        .object({
        name: zod_1.z.string().optional().describe("Combination name"),
        regularModel: zod_1.z.string().optional().describe("Regular model ID"),
        thinkingModel: zod_1.z.string().optional().describe("Thinking model ID"),
        regularProvider: zod_1.z.string().optional().describe("Regular model provider"),
        thinkingProvider: zod_1.z.string().optional().describe("Thinking model provider"),
        createdAt: zod_1.z.string().optional().describe("Creation timestamp"),
    })
        .optional(),
    combination7: zod_1.z
        .object({
        name: zod_1.z.string().optional().describe("Combination name"),
        regularModel: zod_1.z.string().optional().describe("Regular model ID"),
        thinkingModel: zod_1.z.string().optional().describe("Thinking model ID"),
        regularProvider: zod_1.z.string().optional().describe("Regular model provider"),
        thinkingProvider: zod_1.z.string().optional().describe("Thinking model provider"),
        createdAt: zod_1.z.string().optional().describe("Creation timestamp"),
    })
        .optional(),
    combination8: zod_1.z
        .object({
        name: zod_1.z.string().optional().describe("Combination name"),
        regularModel: zod_1.z.string().optional().describe("Regular model ID"),
        thinkingModel: zod_1.z.string().optional().describe("Thinking model ID"),
        regularProvider: zod_1.z.string().optional().describe("Regular model provider"),
        thinkingProvider: zod_1.z.string().optional().describe("Thinking model provider"),
        createdAt: zod_1.z.string().optional().describe("Creation timestamp"),
    })
        .optional(),
    combination9: zod_1.z
        .object({
        name: zod_1.z.string().optional().describe("Combination name"),
        regularModel: zod_1.z.string().optional().describe("Regular model ID"),
        thinkingModel: zod_1.z.string().optional().describe("Thinking model ID"),
        regularProvider: zod_1.z.string().optional().describe("Regular model provider"),
        thinkingProvider: zod_1.z.string().optional().describe("Thinking model provider"),
        createdAt: zod_1.z.string().optional().describe("Creation timestamp"),
    })
        .optional(),
    combination10: zod_1.z
        .object({
        name: zod_1.z.string().optional().describe("Combination name"),
        regularModel: zod_1.z.string().optional().describe("Regular model ID"),
        thinkingModel: zod_1.z.string().optional().describe("Thinking model ID"),
        regularProvider: zod_1.z.string().optional().describe("Regular model provider"),
        thinkingProvider: zod_1.z.string().optional().describe("Thinking model provider"),
        createdAt: zod_1.z.string().optional().describe("Creation timestamp"),
    })
        .optional(),
    configVersion: zod_1.z.number().default(2).describe("Configuration schema version"),
});
class ConfigValidationError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = "ConfigValidationError";
    }
}
exports.ConfigValidationError = ConfigValidationError;
class ConfigLoadError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = "ConfigLoadError";
    }
}
exports.ConfigLoadError = ConfigLoadError;
class ConfigSaveError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = "ConfigSaveError";
    }
}
exports.ConfigSaveError = ConfigSaveError;
//# sourceMappingURL=types.js.map