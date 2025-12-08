import { z } from "zod";

// Provider enumeration
export const ProviderEnum = z.enum(["synthetic", "minimax", "auto"]);
export type ProviderType = z.infer<typeof ProviderEnum>;

// Provider-specific configurations
export const SyntheticProviderConfig = z.object({
  apiKey: z.string().default("test-secure-key").describe("Synthetic API key"),
  baseUrl: z
    .string()
    .default("https://api.synthetic.new")
    .describe("Synthetic API base URL"),
  anthropicBaseUrl: z
    .string()
    .default("https://api.synthetic.new/anthropic")
    .describe("Anthropic-compatible API endpoint"),
  modelsApiUrl: z
    .string()
    .default("https://api.synthetic.new/openai/v1/models")
    .describe("OpenAI-compatible models endpoint"),
  enabled: z
    .boolean()
    .default(false)
    .describe("Whether synthetic provider is enabled"),
  timeout: z.number().optional().describe("Request timeout in milliseconds"),
});

// Tool choice enum for MiniMax and other providers
export const ToolChoiceEnum = z.enum(["auto", "none", "required"]);
export type ToolChoiceType = z.infer<typeof ToolChoiceEnum>;

// Preset enum for temperature/sampling presets
export const PresetEnum = z.enum(["creative", "precise", "balanced"]);
export type PresetType = z.infer<typeof PresetEnum>;

// Response format enum for structured output
export const ResponseFormatEnum = z.enum(["text", "json_object"]);
export type ResponseFormatType = z.infer<typeof ResponseFormatEnum>;

export const MinimaxProviderConfig = z.object({
  apiKey: z.string().default("").describe("MiniMax API key"),
  groupId: z.string().optional().describe("MiniMax Group ID"),
  baseUrl: z
    .string()
    .default("https://api.minimax.io")
    .describe("MiniMax API base URL"),
  anthropicBaseUrl: z
    .string()
    .default("https://api.minimax.io/anthropic")
    .describe("MiniMax Anthropic-compatible API endpoint"),
  modelsApiUrl: z
    .string()
    .default("https://api.minimax.io/v1/models")
    .describe("MiniMax OpenAI-compatible models endpoint"),
  enabled: z
    .boolean()
    .default(true)
    .describe("Whether minimax provider is enabled"),
  defaultModel: z
    .string()
    .default("MiniMax-M2")
    .describe("Default MiniMax model"),
  timeout: z.number().optional().describe("Request timeout in milliseconds"),
  // MiniMax M2 specific options
  temperature: z
    .number()
    .min(0)
    .max(2)
    .optional()
    .describe("Sampling temperature (0.0-2.0)"),
  topP: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Top-p sampling parameter (0.0-1.0)"),
  topK: z.number().min(1).optional().describe("Top-k sampling parameter"),
  contextSize: z
    .number()
    .min(1)
    .max(1000000)
    .optional()
    .describe("Context window size (up to 1M for MiniMax M2)"),
  toolChoice: ToolChoiceEnum.optional().describe(
    "Tool choice mode: auto, none, or required",
  ),
  parallelToolCalls: z
    .boolean()
    .default(true)
    .describe("Enable parallel tool execution"),
  responseFormat: ResponseFormatEnum.optional().describe(
    "Response format: text or json_object for structured output",
  ),
  streaming: z.boolean().default(true).describe("Enable streaming responses"),
  memoryCompact: z
    .boolean()
    .default(false)
    .describe("Enable memory compaction for long conversations"),
});

// Legacy configuration schema for backward compatibility
export const LegacyAppConfigSchema = z.object({
  apiKey: z.string().default("").describe("Synthetic API key (legacy)"),
  baseUrl: z
    .string()
    .default("https://api.synthetic.new")
    .describe("Synthetic API base URL (legacy)"),
  anthropicBaseUrl: z
    .string()
    .default("https://api.synthetic.new/anthropic")
    .describe("Anthropic-compatible API endpoint (legacy)"),
  modelsApiUrl: z
    .string()
    .default("https://api.synthetic.new/openai/v1/models")
    .describe("OpenAI-compatible models endpoint (legacy)"),
});

// New multi-provider configuration schema
export const AppConfigSchema = z.object({
  providers: z
    .object({
      synthetic: SyntheticProviderConfig.default({}),
      minimax: MinimaxProviderConfig.default({}),
    })
    .default({})
    .describe("Provider-specific configurations"),
  defaultProvider: ProviderEnum.default("auto").describe(
    "Default provider to use",
  ),
  cacheDurationHours: z
    .number()
    .int()
    .min(1)
    .max(168)
    .default(24)
    .describe("Model cache duration in hours"),
  selectedModel: z.string().default("").describe("Last selected model"),
  selectedThinkingModel: z
    .string()
    .default("")
    .describe("Last selected thinking model"),
  firstRunCompleted: z
    .boolean()
    .default(false)
    .describe("Whether first-time setup has been completed"),
  // Token usage tracking
  tokenUsage: z
    .object({
      totalInputTokens: z
        .number()
        .default(0)
        .describe("Total input tokens used"),
      totalOutputTokens: z
        .number()
        .default(0)
        .describe("Total output tokens used"),
      sessionTokens: z
        .number()
        .default(0)
        .describe("Tokens used in current session"),
      lastUpdated: z
        .string()
        .optional()
        .describe("Last usage update timestamp"),
      history: z
        .array(
          z.object({
            date: z.string().describe("Usage date"),
            inputTokens: z.number().describe("Input tokens for this period"),
            outputTokens: z.number().describe("Output tokens for this period"),
          }),
        )
        .default([])
        .describe("Historical token usage"),
    })
    .default({})
    .describe("Token usage tracking"),
  // Response caching configuration
  responseCache: z
    .object({
      enabled: z.boolean().default(false).describe("Enable response caching"),
      ttlMinutes: z
        .number()
        .min(1)
        .max(1440)
        .default(60)
        .describe("Cache TTL in minutes"),
      maxEntries: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .describe("Maximum cached entries"),
    })
    .default({})
    .describe("Response caching configuration"),
  // TensorZero proxy router configuration (v1.7)
  tensorzero: z
    .object({
      enabled: z
        .boolean()
        .default(false)
        .describe("Enable TensorZero proxy router for provider routing"),
      port: z
        .number()
        .int()
        .min(1024)
        .max(65535)
        .default(9313)
        .describe("Port for TensorZero proxy server"),
      host: z
        .string()
        .default("0.0.0.0")
        .describe("Host for TensorZero proxy server"),
      timeout: z
        .number()
        .int()
        .min(1000)
        .default(300000)
        .describe("Request timeout in milliseconds"),
    })
    .default({})
    .describe("TensorZero proxy router configuration"),
  // LiteLLM proxy router configuration (v1.6) - deprecated, migrate to tensorzero
  liteLLM: z
    .object({
      enabled: z
        .boolean()
        .default(false)
        .describe(
          "Enable LiteLLM proxy router for provider routing (deprecated, use tensorzero)",
        ),
      port: z
        .number()
        .int()
        .min(1024)
        .max(65535)
        .default(9313)
        .describe("Port for LiteLLM proxy server"),
      host: z
        .string()
        .default("0.0.0.0")
        .describe("Host for LiteLLM proxy server"),
      timeout: z
        .number()
        .int()
        .min(1000)
        .default(300000)
        .describe("Request timeout in milliseconds"),
    })
    .default({})
    .describe(
      "LiteLLM proxy router configuration (deprecated, use tensorzero)",
    ),
  // Environment variable overrides
  envOverrides: z
    .object({
      synthetic: z
        .object({
          apiKey: z
            .string()
            .optional()
            .describe("Override synthetic API key from environment"),
        })
        .optional(),
      minimax: z
        .object({
          apiKey: z
            .string()
            .optional()
            .describe("Override minimax API key from environment"),
        })
        .optional(),
    })
    .default({})
    .describe("Environment variable overrides"),
  // Model combinations (up to 10 saved combinations)
  combination1: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z
        .string()
        .optional()
        .describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination2: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z
        .string()
        .optional()
        .describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination3: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z
        .string()
        .optional()
        .describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination4: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z
        .string()
        .optional()
        .describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination5: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z
        .string()
        .optional()
        .describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination6: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z
        .string()
        .optional()
        .describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination7: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z
        .string()
        .optional()
        .describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination8: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z
        .string()
        .optional()
        .describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination9: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z
        .string()
        .optional()
        .describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination10: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z
        .string()
        .optional()
        .describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  configVersion: z.number().default(2).describe("Configuration schema version"),
  // v1.3.1: Recommended models and update checking
  recommendedModels: z
    .object({
      default: z
        .object({
          primary: z.string().default("synthetic:hf:deepseek-ai/DeepSeek-V3.2"),
          backup: z.string().default("synthetic:hf:MiniMaxAI/MiniMax-M2"),
        })
        .default({}),
      smallFast: z
        .object({
          primary: z
            .string()
            .default("synthetic:hf:meta-llama/Llama-4-Scout-17B-16E-Instruct"),
          backup: z
            .string()
            .default("synthetic:hf:meta-llama/Llama-3.1-8B-Instruct"),
        })
        .default({}),
      thinking: z
        .object({
          primary: z.string().default("minimax:MiniMax-M2"),
          backup: z.string().default("synthetic:hf:deepseek-ai/DeepSeek-R1"),
        })
        .default({}),
      subagent: z
        .object({
          primary: z.string().default("synthetic:hf:deepseek-ai/DeepSeek-V3.2"),
          backup: z
            .string()
            .default("synthetic:hf:meta-llama/Llama-3.3-70B-Instruct"),
        })
        .default({}),
    })
    .default({})
    .describe("Recommended model configurations for each role"),
  lastUpdateCheck: z
    .number()
    .optional()
    .describe("Timestamp of last update check"),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type Provider = ProviderType;
export type LegacyAppConfig = z.infer<typeof LegacyAppConfigSchema>;

// Provider config types - eslint-disable needed due to Zod schema + type alias naming
// eslint-disable-next-line no-unused-vars, no-redeclare
export type SyntheticProviderConfig = z.infer<typeof SyntheticProviderConfig>;
// eslint-disable-next-line no-unused-vars, no-redeclare
export type MinimaxProviderConfig = z.infer<typeof MinimaxProviderConfig>;

// ============================================
// Model Card System (v1.3.1)
// ============================================

export const ModelCardSchema = z.object({
  id: z.string().describe("Model ID"),
  name: z.string().optional().describe("Model display name"),
  aliases: z.array(z.string()).optional().describe("Alternative model IDs"),
  roles: z
    .array(z.string())
    .optional()
    .describe("Roles this model is recommended for"),
  priority: z
    .number()
    .default(1)
    .describe("Priority for this model (lower = higher priority)"),
  preferProvider: z
    .string()
    .optional()
    .describe("Preferred provider for this model"),
  capabilities: z
    .object({
      tools: z.boolean().default(true),
      json_mode: z.boolean().default(true),
      thinking: z.boolean().default(false),
      streaming: z.boolean().default(true),
      parallel_tools: z.boolean().default(true),
    })
    .default({})
    .describe("Model capabilities"),
  limits: z
    .object({
      context: z.number().optional().describe("Context window size"),
      max_output: z.number().optional().describe("Maximum output tokens"),
    })
    .default({})
    .describe("Model limits"),
  parameters: z.array(z.string()).optional().describe("Supported parameters"),
  speed_tier: z
    .enum(["fast", "medium", "slow"])
    .default("medium")
    .describe("Speed tier"),
  provider: z.string().describe("Provider name"),
  verified: z.string().optional().describe("Verification date"),
});

export type ModelCard = z.infer<typeof ModelCardSchema>;

export const ModelCardsSchema = z.object({
  version: z.string().default("1.0"),
  updated: z.string().optional(),
  providerPriority: z.array(z.string()).default(["minimax", "synthetic"]),
  cards: z.array(ModelCardSchema).default([]),
});

export type ModelCards = z.infer<typeof ModelCardsSchema>;

export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "ConfigValidationError";
  }
}

export class ConfigLoadError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "ConfigLoadError";
  }
}

export class ConfigSaveError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "ConfigSaveError";
  }
}
