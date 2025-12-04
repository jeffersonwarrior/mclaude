import { spawn, ChildProcess } from "child_process";
import { AppConfig, ConfigManager, ProviderType } from "../config";
import { ModelInfoImpl } from "../models/info";

export interface LaunchOptions {
  model: string;
  claudePath?: string;
  additionalArgs?: string[];
  env?: Record<string, string>;
  thinkingModel?: string | null;
  provider?: ProviderType;
  modelInfo?: ModelInfoImpl;
  // MiniMax M2 enhancements (v1.3.0)
  temperature?: number;
  topP?: number;
  contextSize?: number;
  toolChoice?: string;
  stream?: boolean;
  memoryCompact?: boolean;
  jsonMode?: boolean;
  sysprompt?: string;
}

export interface LaunchResult {
  success: boolean;
  pid?: number;
  error?: string;
}

export class ClaudeLauncher {
  private claudePath: string;
  private configManager?: ConfigManager;

  constructor(claudePath?: string, configManager?: ConfigManager) {
    this.claudePath = claudePath || "claude";
    this.configManager = configManager;
  }

  async launchClaudeCode(options: LaunchOptions): Promise<LaunchResult> {
    try {
      // Validate environment setup before launch
      const validation = await this.validateEnvironment(options);
      if (!validation.valid) {
        console.error("Environment validation failed:");
        validation.errors.forEach((error) => console.error(`  - ${error}`));

        // Try fallback mechanism if available
        const primaryProvider = this.resolveProvider(options);
        const fallbackProvider = this.getFallbackProvider(primaryProvider);

        if (fallbackProvider) {
          console.info(`Attempting fallback to ${fallbackProvider} provider`);
          const fallbackOptions = { ...options, provider: fallbackProvider };
          const fallbackValidation =
            await this.validateEnvironment(fallbackOptions);

          if (fallbackValidation.valid) {
            return this.launchWithOptions(fallbackOptions);
          } else {
            console.error("Fallback provider validation also failed:");
            fallbackValidation.errors.forEach((error) =>
              console.error(`  - ${error}`),
            );
          }
        }

        return {
          success: false,
          error: `Environment validation failed: ${validation.errors.join(", ")}`,
        };
      }

      return this.launchWithOptions(options);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Error launching Claude Code: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Launch Claude Code with validated options
   */
  private async launchWithOptions(
    options: LaunchOptions,
  ): Promise<LaunchResult> {
    try {
      // Set up environment variables for Claude Code
      const env = {
        ...process.env,
        ...this.createClaudeEnvironment(options),
        ...options.env,
      };

      const provider = this.resolveProvider(options);
      console.info(
        `Launching Claude Code with ${provider} provider using model: ${options.model}`,
      );

      if (options.thinkingModel) {
        const thinkingProvider = this.resolveThinkingProvider(
          options.thinkingModel,
          provider,
        );
        if (thinkingProvider !== provider) {
          console.info(
            `Hybrid setup: Regular model from ${provider}, thinking model from ${thinkingProvider}`,
          );
        }
        console.info(`Thinking model: ${options.thinkingModel}`);
      }

      // Prepare command arguments
      const args = [...(options.additionalArgs || [])];

      // Add system prompt if provided (v1.3.0)
      if (options.sysprompt) {
        args.push("--append-system-prompt", options.sysprompt);
      }

      return new Promise((resolve) => {
        const child = spawn(this.claudePath, args, {
          stdio: "inherit",
          env,
          // Remove detached mode to maintain proper terminal interactivity
        });

        child.on("spawn", () => {
          resolve({
            success: true,
            pid: child.pid || undefined,
          });
        });

        child.on("error", (error) => {
          console.error(`Failed to launch Claude Code: ${error.message}`);
          resolve({
            success: false,
            error: error.message,
          });
        });

        // Don't unref the process - let it maintain control of the terminal
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Error launching Claude Code: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private createClaudeEnvironment(
    options: LaunchOptions,
  ): Record<string, string> {
    const env: Record<string, string> = {};

    // Determine the provider for the model
    const provider = this.resolveProvider(options);

    // Get provider-specific configuration
    const providerConfig = this.getProviderConfig(provider);

    if (!providerConfig) {
      throw new Error(`Provider configuration not found for: ${provider}`);
    }

    const model = options.model;

    // Set provider-specific Anthropic-compatible endpoint
    env.ANTHROPIC_BASE_URL = providerConfig.anthropicBaseUrl;

    // Set authentication based on provider
    env.ANTHROPIC_AUTH_TOKEN = this.getProviderApiKey(provider);

    // v1.3.1: Set all 4 model environment variables to the full model identifier
    // This ensures Claude Code uses the correct model for each role
    env.ANTHROPIC_DEFAULT_MODEL = model;
    env.ANTHROPIC_DEFAULT_SMALL_FAST_MODEL = model;
    env.ANTHROPIC_DEFAULT_THINKING_MODEL = options.thinkingModel || model;
    env.CLAUDE_CODE_SUBAGENT_MODEL = model;

    // Set thinking model if provided
    if (options.thinkingModel) {
      // Handle hybrid case where thinking model might be from different provider
      const thinkingProvider = this.resolveThinkingProvider(
        options.thinkingModel,
        provider,
      );
      const thinkingConfig = this.getProviderConfig(thinkingProvider);

      if (thinkingConfig && thinkingProvider !== provider) {
        // Hybrid scenario: different providers for regular and thinking models
        env.ANTHROPIC_THINKING_MODEL = options.thinkingModel;
        env.ANTHROPIC_THINKING_BASE_URL = thinkingConfig.anthropicBaseUrl;
        env.ANTHROPIC_THINKING_AUTH_TOKEN =
          this.getProviderApiKey(thinkingProvider);
      } else {
        // Same provider for both models
        env.ANTHROPIC_THINKING_MODEL = options.thinkingModel;
      }
    }

    // Provider-specific optimizations
    this.applyProviderOptimizations(env, provider, options);

    // Disable non-essential traffic
    env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = "1";

    return env;
  }

  /**
   * Resolve the provider for the given model/options
   */
  private resolveProvider(options: LaunchOptions): ProviderType {
    // If provider is explicitly specified, use it
    if (options.provider) {
      return options.provider;
    }

    // If modelInfo is available, get provider from there
    if (options.modelInfo) {
      return options.modelInfo.getProvider() as ProviderType;
    }

    // Try to infer provider from model ID
    if (options.model.includes(":")) {
      const modelProvider = options.model.split(":", 1)[0];
      if (modelProvider === "synthetic" || modelProvider === "minimax") {
        return modelProvider as ProviderType;
      }
    }

    // Fallback to synthetic (default provider)
    console.warn(
      `Could not determine provider for model ${options.model}, defaulting to synthetic`,
    );
    return "synthetic";
  }

  /**
   * Resolve provider for thinking model (might be different from main model)
   */
  private resolveThinkingProvider(
    thinkingModel: string,
    defaultProvider: ProviderType,
  ): ProviderType {
    // Try to infer provider from thinking model ID
    if (thinkingModel.includes(":")) {
      const thinkingProvider = thinkingModel.split(":", 1)[0];
      if (thinkingProvider === "synthetic" || thinkingProvider === "minimax") {
        return thinkingProvider as ProviderType;
      }
    }

    // If no specific provider info, use same as main model
    return defaultProvider;
  }

  /**
   * Get provider configuration
   */
  private getProviderConfig(provider: ProviderType) {
    if (!this.configManager) {
      // Fallback to default configurations if no config manager
      const defaultConfigs: Record<
        string,
        { anthropicBaseUrl: string; modelsApiUrl: string }
      > = {
        synthetic: {
          anthropicBaseUrl: "https://api.synthetic.new/anthropic",
          modelsApiUrl: "https://api.synthetic.new/openai/v1/models",
        },
        minimax: {
          anthropicBaseUrl: "https://api.minimax.io/anthropic",
          modelsApiUrl: "https://api.minimax.io/v1/models",
        },
      };

      if (provider === "auto") {
        // For 'auto' provider, fallback to synthetic
        return defaultConfigs.synthetic;
      }

      return defaultConfigs[provider];
    }

    if (provider === "auto") {
      // For 'auto' provider, get the first enabled provider's config
      const enabledProviders = ["synthetic", "minimax"].filter((p) =>
        this.configManager!.isProviderEnabled(p as ProviderType),
      );
      if (enabledProviders.length > 0) {
        return this.configManager.getProviderConfig(
          enabledProviders[0] as ProviderType,
        );
      }
      // Fallback to synthetic if no providers enabled
      return this.configManager.getProviderConfig("synthetic");
    }

    return this.configManager.getProviderConfig(provider);
  }

  /**
   * Get API key for provider
   */
  private getProviderApiKey(provider: ProviderType): string {
    if (!this.configManager) {
      throw new Error(
        `ConfigManager required to get API key for provider: ${provider}`,
      );
    }

    if (provider === "auto") {
      // For 'auto' provider, get the first available API key
      const enabledProviders = ["synthetic", "minimax"].filter((p) =>
        this.configManager!.isProviderEnabled(p as ProviderType),
      );

      for (const p of enabledProviders) {
        const apiKey = this.configManager.getEffectiveApiKey(p as ProviderType);
        if (apiKey) {
          return apiKey;
        }
      }

      // Fallback to synthetic if no API keys available
      return this.configManager.getEffectiveApiKey("synthetic");
    }

    return this.configManager.getEffectiveApiKey(provider);
  }

  /**
   * Apply provider-specific optimizations
   */
  private applyProviderOptimizations(
    env: Record<string, string>,
    provider: ProviderType,
    options: LaunchOptions,
  ): void {
    switch (provider) {
      case "minimax":
        // MiniMax-specific optimizations
        // Extended timeout for MiniMax M2
        if (
          options.model.includes("MiniMax-M2") ||
          options.model.includes("M2")
        ) {
          env.CLAUDE_CODE_REQUEST_TIMEOUT = "3000000"; // 50 minutes
        }
        // MiniMax may benefit from smaller batch sizes
        env.CLAUDE_CODE_BATCH_SIZE = "1";

        // MiniMax M2 enhancements (v1.3.0)
        // Get minimax config for default values
        const minimaxConfig = this.configManager?.getProviderConfig("minimax");

        // Temperature
        const temperature = options.temperature ?? (minimaxConfig as any)?.temperature;
        if (temperature !== undefined) {
          env.CLAUDE_CODE_TEMPERATURE = String(temperature);
        }

        // Top-P
        const topP = options.topP ?? (minimaxConfig as any)?.topP;
        if (topP !== undefined) {
          env.CLAUDE_CODE_TOP_P = String(topP);
        }

        // Context size (MiniMax M2 supports up to 1M tokens)
        const contextSize = options.contextSize ?? (minimaxConfig as any)?.contextSize;
        if (contextSize !== undefined) {
          env.CLAUDE_CODE_CONTEXT_SIZE = String(contextSize);
        }

        // Tool choice
        const toolChoice = options.toolChoice ?? (minimaxConfig as any)?.toolChoice;
        if (toolChoice !== undefined) {
          env.CLAUDE_CODE_TOOL_CHOICE = toolChoice;
        }

        // Parallel tool calls (default true for MiniMax M2)
        const parallelToolCalls = (minimaxConfig as any)?.parallelToolCalls ?? true;
        if (parallelToolCalls) {
          env.CLAUDE_CODE_PARALLEL_TOOL_CALLS = "1";
        }

        // Response format (JSON mode)
        const responseFormat = options.jsonMode ? "json_object" : (minimaxConfig as any)?.responseFormat;
        if (responseFormat === "json_object") {
          env.CLAUDE_CODE_RESPONSE_FORMAT = "json_object";
        }

        // Memory compact mode
        const memoryCompact = options.memoryCompact ?? (minimaxConfig as any)?.memoryCompact;
        if (memoryCompact) {
          env.CLAUDE_CODE_MEMORY_COMPACT = "1";
        }
        break;

      case "synthetic":
        // Synthetic-specific optimizations
        env.CLAUDE_CODE_REQUEST_TIMEOUT = "600000"; // 10 minutes default
        break;
    }

    // Common optimizations
    // Streaming (can be disabled with --no-stream)
    if (options.stream === false) {
      env.CLAUDE_CODE_ENABLE_STREAMING = "0";
    } else {
      env.CLAUDE_CODE_ENABLE_STREAMING = "1";
    }

    env.CLAUDE_CODE_ENABLE_THINKING = options.thinkingModel ? "1" : "0";
  }

  /**
   * Validate environment setup before launch
   */
  private async validateEnvironment(
    options: LaunchOptions,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const provider = this.resolveProvider(options);

      // Check if provider is enabled
      if (
        this.configManager &&
        !this.configManager.isProviderEnabled(provider)
      ) {
        errors.push(`Provider '${provider}' is not enabled`);
      }

      // Check if API key is available
      try {
        const apiKey = this.getProviderApiKey(provider);
        if (!apiKey) {
          errors.push(`No API key configured for provider '${provider}'`);
        }
      } catch (error) {
        errors.push(
          `Failed to get API key for provider '${provider}': ${error}`,
        );
      }

      // Validate thinking model setup if provided
      if (options.thinkingModel) {
        const thinkingProvider = this.resolveThinkingProvider(
          options.thinkingModel,
          provider,
        );
        if (
          this.configManager &&
          !this.configManager.isProviderEnabled(thinkingProvider)
        ) {
          errors.push(
            `Thinking model provider '${thinkingProvider}' is not enabled`,
          );
        }

        try {
          const thinkingApiKey = this.getProviderApiKey(thinkingProvider);
          if (!thinkingApiKey) {
            errors.push(
              `No API key configured for thinking model provider '${thinkingProvider}'`,
            );
          }
        } catch (error) {
          errors.push(
            `Failed to get API key for thinking model provider '${thinkingProvider}': ${error}`,
          );
        }
      }
    } catch (error) {
      errors.push(`Environment validation failed: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get fallback provider if primary provider fails
   */
  private getFallbackProvider(
    primaryProvider: ProviderType,
  ): ProviderType | null {
    if (!this.configManager) {
      return null;
    }

    // Simple fallback strategy: try synthetic first, then other enabled providers
    const fallbackOrder: ProviderType[] = ["synthetic", "minimax"];

    for (const provider of fallbackOrder) {
      if (
        provider !== primaryProvider &&
        this.configManager.isProviderEnabled(provider)
      ) {
        const apiKey = this.configManager.getEffectiveApiKey(provider);
        if (apiKey) {
          console.warn(`Falling back from ${primaryProvider} to ${provider}`);
          return provider;
        }
      }
    }

    return null;
  }

  async checkClaudeInstallation(): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn(this.claudePath, ["--version"], {
        stdio: "pipe",
      });

      child.on("spawn", () => {
        resolve(true);
      });

      child.on("error", () => {
        resolve(false);
      });

      // Force resolution after timeout
      setTimeout(() => resolve(false), 5000);
    });
  }

  async getClaudeVersion(): Promise<string | null> {
    return new Promise((resolve) => {
      const child = spawn(this.claudePath, ["--version"], {
        stdio: "pipe",
      });

      let output = "";

      child.stdout?.on("data", (data) => {
        output += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          resolve(null);
        }
      });

      child.on("error", () => {
        resolve(null);
      });

      // Force resolution after timeout
      setTimeout(() => resolve(null), 5000);
    });
  }

  setClaudePath(path: string): void {
    this.claudePath = path;
  }

  getClaudePath(): string {
    return this.claudePath;
  }
}
