import { z } from "zod";

// Provider enumeration
export const ProviderEnum = z.enum(["synthetic", "minimax", "auto"]);
export type ProviderType = z.infer<typeof ProviderEnum>;

// Provider-specific configurations
export const SyntheticProviderConfig = z.object({
  apiKey: z.string().default("").describe("Synthetic API key"),
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
    .default(true)
    .describe("Whether synthetic provider is enabled"),
  timeout: z.number().optional().describe("Request timeout in milliseconds"),
});

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
      thinkingProvider: z.string().optional().describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination2: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z.string().optional().describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination3: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z.string().optional().describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination4: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z.string().optional().describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination5: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z.string().optional().describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination6: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z.string().optional().describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination7: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z.string().optional().describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination8: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z.string().optional().describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination9: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z.string().optional().describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  combination10: z
    .object({
      name: z.string().optional().describe("Combination name"),
      regularModel: z.string().optional().describe("Regular model ID"),
      thinkingModel: z.string().optional().describe("Thinking model ID"),
      regularProvider: z.string().optional().describe("Regular model provider"),
      thinkingProvider: z.string().optional().describe("Thinking model provider"),
      createdAt: z.string().optional().describe("Creation timestamp"),
    })
    .optional(),
  configVersion: z.number().default(2).describe("Configuration schema version"),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type Provider = ProviderType;
export type SyntheticProviderConfig = z.infer<typeof SyntheticProviderConfig>;
export type MinimaxProviderConfig = z.infer<typeof MinimaxProviderConfig>;
export type LegacyAppConfig = z.infer<typeof LegacyAppConfigSchema>;

export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public override cause?: unknown,
  ) {
    super(message);
    this.name = "ConfigValidationError";
  }
}

export class ConfigLoadError extends Error {
  constructor(
    message: string,
    public override cause?: unknown,
  ) {
    super(message);
    this.name = "ConfigLoadError";
  }
}

export class ConfigSaveError extends Error {
  constructor(
    message: string,
    public override cause?: unknown,
  ) {
    super(message);
    this.name = "ConfigSaveError";
  }
}
