import { ConfigManager } from "../../config";
import { UserInterface } from "../../ui";
import { RouterManager } from "../../router/manager";
import { ProviderManagerInterface } from "./provider-manager.interface";
import { ModelManager } from "../../models/manager";
import { sanitizeApiError } from "../../utils/error-sanitizer";

export class ProviderManager implements ProviderManagerInterface {
  constructor(
    private configManager: ConfigManager,
    private ui: UserInterface,
    private routerManager: RouterManager,
    private modelManager: ModelManager,
  ) {}

  async listProviders(): Promise<void> {
    this.ui.info("Available Providers:");
    this.ui.info("====================");

    const providers = ["synthetic", "minimax", "auto"] as const;

    for (const provider of providers) {
      const enabled = this.configManager.isProviderEnabled(provider);
      const hasApiKey =
        provider === "synthetic"
          ? this.configManager.hasSyntheticApiKey()
          : provider === "minimax"
            ? this.configManager.hasMinimaxApiKey()
            : true; // auto always has access if other providers are configured

      const config = this.configManager.getProviderConfig(provider);
      const status = enabled ? "✓ Enabled" : "✗ Disabled";
      const apiStatus = hasApiKey ? "✓" : "✗";

      this.ui.info(
        `${provider.padEnd(11)} ${status.padEnd(12)} API: ${apiStatus}`,
      );

      if (config) {
        if ("baseUrl" in config && config.baseUrl) {
          this.ui.info(`  Base URL: ${config.baseUrl}`);
        }
        if ("groupId" in config && config.groupId) {
          this.ui.info(`  Group ID: ${config.groupId}`);
        }
      }
    }

    const defaultProvider = this.configManager.getDefaultProvider();
    this.ui.info(`\nDefault Provider: ${defaultProvider}`);
  }

  async enableProvider(provider: string): Promise<void> {
    if (!["synthetic", "minimax", "auto"].includes(provider)) {
      this.ui.error(
        `Invalid provider: ${provider}. Valid providers: synthetic, minimax, auto`,
      );
      return;
    }

    const success = await this.configManager.setProviderEnabled(
      provider as "synthetic" | "minimax" | "auto",
      true,
    );
    if (success) {
      this.ui.success(`Provider "${provider}" has been enabled`);

      // Check if provider has API key
      if (
        provider === "synthetic" &&
        !this.configManager.hasSyntheticApiKey()
      ) {
        this.ui.warning(
          `Note: "synthetic" provider is enabled but no API key is configured`,
        );
        this.ui.info(
          `Set API key with: mclaude config set synthetic.apiKey <your-key>`,
        );
      } else if (
        provider === "minimax" &&
        !this.configManager.hasMinimaxApiKey()
      ) {
        this.ui.warning(
          `Note: "minimax" provider is enabled but no API key is configured`,
        );
        this.ui.info(
          `Set API key with: mclaude config set minimax.apiKey <your-key>`,
        );
      }
    } else {
      this.ui.error(`Failed to enable provider "${provider}"`);
    }
  }

  async disableProvider(provider: string): Promise<void> {
    if (!["synthetic", "minimax", "auto"].includes(provider)) {
      this.ui.error(
        `Invalid provider: ${provider}. Valid providers: synthetic, minimax, auto`,
      );
      return;
    }

    const success = await this.configManager.setProviderEnabled(
      provider as "synthetic" | "minimax" | "auto",
      false,
    );
    if (success) {
      this.ui.success(`Provider "${provider}" has been disabled`);
    } else {
      this.ui.error(`Failed to disable provider "${provider}"`);
    }
  }

  async setDefaultProvider(provider: string): Promise<void> {
    if (!["synthetic", "minimax", "auto"].includes(provider)) {
      this.ui.error(
        `Invalid provider: ${provider}. Valid providers: synthetic, minimax, auto`,
      );
      return;
    }

    const success = await this.configManager.setDefaultProvider(
      provider as "synthetic" | "minimax" | "auto",
    );
    if (success) {
      this.ui.success(`Default provider set to "${provider}"`);
    } else {
      this.ui.error(`Failed to set default provider "${provider}"`);
    }
  }

  async providerStatus(_options: { provider?: string }): Promise<void> {
    const providers = _options.provider
      ? ([_options.provider].filter((p) =>
          ["synthetic", "minimax", "auto"].includes(p),
        ) as ("synthetic" | "minimax" | "auto")[])
      : (["synthetic", "minimax", "auto"] as const);

    if (_options.provider && providers.length === 0) {
      this.ui.error(
        `Invalid provider: ${_options.provider}. Valid providers: synthetic, minimax, auto`,
      );
      return;
    }

    this.ui.info("Provider Status:");
    this.ui.info("================");

    for (const provider of providers) {
      this.ui.info(`\n${provider.toUpperCase()}:`);
      this.ui.info("─".repeat(provider.length + 1));

      const enabled = this.configManager.isProviderEnabled(provider);
      const hasApiKey =
        provider === "synthetic"
          ? this.configManager.hasSyntheticApiKey()
          : provider === "minimax"
            ? this.configManager.hasMinimaxApiKey()
            : true;

      this.ui.info(`Enabled: ${enabled ? "Yes" : "No"}`);
      this.ui.info(`Has API Key: ${hasApiKey ? "Yes" : "No"}`);

      const config = this.configManager.getProviderConfig(provider);
      if (config) {
        if ("baseUrl" in config && config.baseUrl) {
          this.ui.info(`Base URL: ${config.baseUrl}`);
        }
        if ("groupId" in config && config.groupId) {
          this.ui.info(`Group ID: ${config.groupId}`);
        }
        if (config.timeout) {
          this.ui.info(`Timeout: ${config.timeout}ms`);
        }
      }

      // Try to get provider-specific model count
      try {
        const providerModels = await this.modelManager.getModelsByProvider(
          provider as "synthetic" | "minimax" | "auto",
        );
        this.ui.info(`Available Models: ${providerModels.length}`);
      } catch (error) {
        const errorMessage = sanitizeApiError(error);
        this.ui.info(`Available Models: Could not fetch (${errorMessage})`);
      }
    }

    if (!_options.provider) {
      const defaultProvider = this.configManager.getDefaultProvider();
      this.ui.info(`\nDefault Provider: ${defaultProvider}`);
    }
  }

  async testProvider(provider: string): Promise<void> {
    if (!["synthetic", "minimax", "auto"].includes(provider)) {
      this.ui.error(
        `Invalid provider: ${provider}. Valid providers: synthetic, minimax, auto`,
      );
      return;
    }

    this.ui.info(`Testing provider: ${provider}`);
    this.ui.info("=".repeat(20 + provider.length));

    // Check if provider is enabled
    const enabled = this.configManager.isProviderEnabled(provider as any);
    if (!enabled) {
      this.ui.warning(`Provider "${provider}" is disabled`);
      this.ui.info(`Enable with: mclaude providers enable ${provider}`);
      return;
    }

    // Check API key
    const hasApiKey =
      provider === "synthetic"
        ? this.configManager.hasSyntheticApiKey()
        : provider === "minimax"
          ? this.configManager.hasMinimaxApiKey()
          : true;

    if (!hasApiKey) {
      this.ui.error(`No API key configured for provider "${provider}"`);
      return;
    }

    // Test connectivity
    try {
      let modelCount = 0;

      if (provider === "auto") {
        // Test all enabled providers
        const syntheticEnabled =
          this.configManager.isProviderEnabled("synthetic");
        const minimaxEnabled = this.configManager.isProviderEnabled("minimax");

        if (syntheticEnabled) {
          this.ui.info("Testing synthetic endpoint...");
          const syntheticModels =
            await this.modelManager.getModelsByProvider("synthetic");
          modelCount += syntheticModels.length;
          this.ui.success(`✓ Synthetic: ${syntheticModels.length} models`);
        }

        if (minimaxEnabled) {
          this.ui.info("Testing minimax endpoint...");
          const minimaxModels =
            await this.modelManager.getModelsByProvider("minimax");
          modelCount += minimaxModels.length;
          this.ui.success(`✓ Minimax: ${minimaxModels.length} models`);
        }

        if (!syntheticEnabled && !minimaxEnabled) {
          this.ui.warning("Auto mode: No providers are enabled");
          return;
        }
      } else {
        // Test specific provider
        const models = await this.modelManager.getModelsByProvider(provider);
        modelCount = models.length;
        this.ui.success(`✓ Connected successfully`);
        this.ui.info(`Found ${modelCount} models`);
      }

      if (modelCount > 0) {
        this.ui.success(`Provider "${provider}" is fully functional`);
      } else {
        this.ui.warning(
          `Provider "${provider}" connected but no models available`,
        );
      }
    } catch (error) {
      const errorMessage = sanitizeApiError(error);
      this.ui.error(`✗ Failed to connect to provider "${provider}"`);
      this.ui.error(`Error: ${errorMessage}`);

      // Provide specific guidance
      if (provider === "synthetic") {
        this.ui.info(`Check your API key and network connection`);
        this.ui.info(
          `Test with: curl -H "Authorization: Bearer $SYNTHETIC_API_KEY" https://api.synthetic.new/openai/v1/models`,
        );
      } else if (provider === "minimax") {
        this.ui.info(`Check your API key, Group ID, and network connection`);
      }
    }
  }

  async listProviderConfigs(): Promise<void> {
    this.ui.info("Provider Configurations:");
    this.ui.info("=========================");

    const providers = ["synthetic", "minimax", "auto"] as const;

    for (const provider of providers) {
      const config = this.configManager.getProviderConfig(provider);
      this.ui.info(`\n${provider}:`);
      this.ui.info("─".repeat(provider.length + 1));

      if (!config) {
        this.ui.info("  No configuration");
        continue;
      }

      this.ui.info(`  Enabled: ${config.enabled}`);

      if ("apiKey" in config) {
        const hasKey = !!config.apiKey;
        this.ui.info(
          `  API Key: ${hasKey ? " configured" : " not configured"}`,
        );
      }

      if ("baseUrl" in config && config.baseUrl) {
        this.ui.info(`  Base URL: ${config.baseUrl}`);
      }

      if ("groupId" in config && config.groupId) {
        this.ui.info(`  Group ID: ${config.groupId}`);
      }

      if (config.timeout) {
        this.ui.info(`  Timeout: ${config.timeout}ms`);
      }
    }
  }

  async getProviderConfigInfo(
    provider: "synthetic" | "minimax" | "auto",
  ): Promise<void> {
    const config = this.configManager.getProviderConfig(provider);
    this.ui.info(`Configuration for ${provider}:`);
    this.ui.info("=".repeat(20 + provider.length));

    if (!config) {
      this.ui.info("No configuration found");
      return;
    }

    this.ui.info(`Enabled: ${config.enabled}`);

    if ("apiKey" in config) {
      const hasKey = !!config.apiKey;
      this.ui.info(`API Key: ${hasKey ? " configured" : " not configured"}`);

      if (hasKey && typeof config.apiKey === "string") {
        this.ui.info(
          `API Key (preview): ${config.apiKey.substring(0, 8)}...${config.apiKey.substring(config.apiKey.length - 4)}`,
        );
      }
    }

    if ("baseUrl" in config && config.baseUrl) {
      this.ui.info(`Base URL: ${config.baseUrl}`);
    }

    if ("groupId" in config && config.groupId) {
      this.ui.info(`Group ID: ${config.groupId}`);
    }

    if ("timeout" in config && config.timeout) {
      this.ui.info(`Timeout: ${config.timeout}ms`);
    }
  }

  async setProviderConfig(
    provider: string,
    key: string,
    value: string,
  ): Promise<void> {
    if (!["synthetic", "minimax", "auto"].includes(provider)) {
      this.ui.error(
        `Invalid provider: ${provider}. Valid providers: synthetic, minimax, auto`,
      );
      return;
    }

    // Map to provider-specific keys
    let configKey: string;

    if (provider === "synthetic") {
      if (key === "apiKey") configKey = "synthetic.apiKey";
      else if (key === "baseUrl") configKey = "synthetic.baseUrl";
      else configKey = key;
    } else if (provider === "minimax") {
      if (key === "apiKey") configKey = "minimax.apiKey";
      else if (key === "groupId") configKey = "minimax.groupId";
      else configKey = key;
    } else {
      configKey = key;
    }

    await this.configManager.setConfig(configKey, value);
  }
}
