import { ConfigManager } from "../../config";
import { UserInterface } from "../../ui";
import { ApiClient } from "../../api/client";
import { MiniMaxClient } from "../../api/minimax-client";
import { AuthManagerInterface } from "./auth-manager.interface";
import { 
  sanitizeApiError,
  getAuthErrorMessage
} from "../../utils/error-sanitizer";

export class AuthManager implements AuthManagerInterface {
  private syntheticClient: ApiClient;
  private minimaxClient: MiniMaxClient;

  constructor(
    private configManager: ConfigManager,
    private ui: UserInterface,
  ) {
    this.syntheticClient = new ApiClient({
      baseURL: this.configManager.config.providers.synthetic.baseUrl,
    });
    this.minimaxClient = new MiniMaxClient({
      baseURL: this.configManager.config.providers.minimax.baseUrl,
    });
  }

  async validateProviderCredentials(): Promise<{
    synthetic: boolean;
    minimax: boolean;
  }> {
    const syntheticValid = this.configManager.hasSyntheticApiKey();
    const minimaxValid = this.configManager.hasMinimaxApiKey();

    return { synthetic: syntheticValid, minimax: minimaxValid };
  }

  async checkAuth(options?: { provider?: string }): Promise<void> {
    this.ui.info("Authentication Status Check");
    this.ui.info("=========================");

    const providerState = this.configManager.getAtomicProviderState();
    const providers = options?.provider
      ? [options.provider.toLowerCase()]
      : ["synthetic", "minimax"];

    for (const provider of providers) {
      const state = providerState[provider as keyof typeof providerState];
      if (!state) {
        this.ui.showStatus("warning", `${provider}: Unknown provider`);
        continue;
      }

      const status = state.available ? "success" : "error";
      const message = `${provider.charAt(0).toUpperCase() + provider.slice(1)}: ${
        state.available ? "Available" : "Not available"
      }`;

      this.ui.showStatus(status, message);

      if (!state.available) {
        const issues = [];
        if (!state.enabled && !state.hasApiKey) {
          issues.push("Provider disabled and no API key");
        } else if (!state.enabled) {
          issues.push("Provider disabled");
        } else if (!state.hasApiKey) {
          issues.push("No API key configured");
        }

        if (issues.length > 0) {
          this.ui.info(`  Issues: ${issues.join(", ")}`);
        }
      }
    }

    const availableCount = providers.filter((p) => {
      const state = providerState[p as keyof typeof providerState];
      return state?.available;
    }).length;

    if (availableCount === 0) {
      this.ui.error("No providers are properly authenticated.");
      this.ui.info("Run 'mclaude setup' to configure authentication.");
    } else {
      this.ui.coloredSuccess(
        `${availableCount}/${providers.length} providers are available`,
      );
    }
  }

  async testAuth(provider: string): Promise<{ valid: boolean; error?: string }> {
    if (!["synthetic", "minimax"].includes(provider)) {
      return { valid: false, error: `Invalid provider: ${provider}. Valid providers: synthetic, minimax` };
    }

    try {
      const result = await this.testProviderAuth(provider);
      return result; // result will be { valid: boolean; error?: string }
    } catch (error: any) {
      return { valid: false, error: this.formatAuthenticationError(provider, error) };
    }
  }

  async resetAuth(provider: string): Promise<void> {
    const providerLower = provider.toLowerCase();
    if (!["synthetic", "minimax"].includes(providerLower)) {
      this.ui.error(
        `Unknown provider: ${provider}. Valid providers: synthetic, minimax`,
      );
      return;
    }

    const confirmReset = await this.ui.confirm(
      `Are you sure you want to reset authentication credentials for ${provider}? This will remove the API key and disable the provider.`,
      false,
    );

    if (!confirmReset) {
      this.ui.info("Operation cancelled");
      return;
    }

    try {
      await this.configManager.updateProviderConfig(providerLower as any, {
        apiKey: "",
        enabled: false,
      });

      this.ui.coloredSuccess(`✓ Reset ${provider} authentication credentials`);
      this.ui.info(`Run 'mclaude setup' to reconfigure ${provider} provider`);
    } catch (error) {
      this.ui.error(
        `Failed to reset ${provider} credentials: ${sanitizeApiError(error)}`,
      );
    }
  }

  async refreshAuth(provider?: string): Promise<void> {
    this.ui.info("🔄 Refreshing authentication...");
    
    const providers = provider
      ? [provider]
      : ["synthetic", "minimax"];

    let allValid = true;

    for (const p of providers) {
      this.ui.info(`\nTesting ${p}...`);
      const { valid, error } = await this.testProviderAuth(p);
      
      if (!valid) {
        allValid = false;
        this.ui.error(`❌ ${p}: Authentication failed${error ? `: ${error}` : ""}`);
      } else {
        this.ui.coloredSuccess(`✓ ${p}: Authentication successful`);
      }
    }

    if (!allValid) {
      this.ui.error("\n❌ Some providers failed authentication");
      process.exit(1);
    }
  }

  formatAuthenticationError(provider: string, error: any): string {
    return getAuthErrorMessage(error);
  }

  async authStatus(options?: { format?: string }): Promise<void> {
    this.ui.info("Authentication Status Details");
    this.ui.info("=============================");

    const providerState = this.configManager.getAtomicProviderState();
    const format = options?.format || "table";

    const statusData = {
      synthetic: {
        enabled: providerState.synthetic.enabled,
        hasApiKey: providerState.synthetic.hasApiKey,
        available: providerState.synthetic.available,
        apiKey: this.configManager.getSyntheticApiKey()
          ? "***configured***"
          : "none",
      },
      minimax: {
        enabled: providerState.minimax.enabled,
        hasApiKey: providerState.minimax.hasApiKey,
        available: providerState.minimax.available,
        apiKey: this.configManager.getMinimaxApiKey()
          ? "***configured***"
          : "none",
        groupId: this.configManager.getMinimaxGroupId() || "none",
      },
    };

    if (format === "json") {
      console.log(JSON.stringify(statusData, null, 2));
      return;
    }

    // Table format
    console.log("Provider   | Enabled | API Key | Available | Details");
    console.log("-----------|---------|---------|-----------|--------");

    Object.entries(statusData).forEach(([provider, data]) => {
      const enabled = data.enabled ? "✓" : "✗";
      const apiKey = data.apiKey !== "none" ? "✓" : "✗";
      const available = data.available ? "✓" : "✗";
      const details =
        "groupId" in data && data.groupId && data.groupId !== "none"
          ? `Group: ${data.groupId}`
          : "";

      console.log(
        `${provider.padEnd(10)} | ${enabled.padEnd(7)} | ${apiKey.padEnd(7)} | ${available.padEnd(9)} | ${details}`,
      );
    });

    const availableCount = Object.values(statusData).filter(
      (d) => d.available,
    ).length;
    const totalCount = Object.keys(statusData).length;

    console.log(
      `\nSummary: ${availableCount}/${totalCount} providers available`,
    );
  }

  private async testProviderAuth(
    provider: string,
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      if (provider === "synthetic") {
        if (!this.configManager.hasSyntheticApiKey()) {
          return { valid: false, error: "Synthetic API key not configured" };
        }
        const syntheticApiKey = this.configManager.getSyntheticApiKey();
        if (!syntheticApiKey) {
          return { valid: false, error: "Synthetic API key not found" };
        }
        this.syntheticClient.setApiKey(syntheticApiKey);
        await this.syntheticClient.fetchModels(
          syntheticApiKey,
          this.configManager.config.providers.synthetic.modelsApiUrl,
        );
        return { valid: true };
      } else if (provider === "minimax") {
        if (!this.configManager.hasMinimaxApiKey()) {
          return { valid: false, error: "MiniMax API key not configured" };
        }
        const minimaxApiKey = this.configManager.getMinimaxApiKey();
        const minimaxGroupId = this.configManager.getMinimaxGroupId();
        if (!minimaxApiKey) {
          return { valid: false, error: "MiniMax API key not found" };
        }
        if (minimaxGroupId) {
          this.minimaxClient.setGroupId(minimaxGroupId);
        }
        this.minimaxClient.setApiKey(minimaxApiKey);
        await this.minimaxClient.fetchModels(
          minimaxApiKey,
          this.configManager.config.providers.minimax.modelsApiUrl,
        );
        return { valid: true };
      }
      return { valid: false, error: `Unknown provider: ${provider}` };
    } catch (error: any) {
      return { valid: false, error: sanitizeApiError(error) };
    }
  }
}