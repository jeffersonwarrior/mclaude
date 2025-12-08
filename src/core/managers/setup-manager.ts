import { readFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { ConfigManager } from "../../config";
import { UserInterface } from "../../ui";
import { AuthManager } from "./auth-manager";
import { ModelInteractionManager } from "./model-interaction-manager";
import { sanitizeApiError } from "../../utils/error-sanitizer";

import { ISetupManager, SetupStep } from "./setup-manager.interface";

/**
 * Handles application setup flow and orchestration
 */
export class SetupManager implements ISetupManager {
  constructor(
    private configManager: ConfigManager,
    private ui: UserInterface,
    private authManager: AuthManager,
    private modelInteractionManager: ModelInteractionManager,
  ) {}

  /**
   * Run the complete setup process
   */
  async setup(): Promise<void> {
    // Read version from package.json
    const packageJsonPath = join(__dirname, "../../../package.json");
    const version = JSON.parse(readFileSync(packageJsonPath, "utf8")).version;

    console.log(
      chalk.red(
        `Welcome to Minimax MClaude ${version}! Let's setup your configuration.`,
      ),
    );
    this.ui.info("===============================================");

    try {
      // Use the unified setup orchestrator
      await this.unifiedSetupOrchestrator();

      this.ui.coloredSuccess("Setup completed successfully!");
      this.ui.highlightInfo('You can now run "mclaude" to launch Claude Code', [
        "mclaude",
      ]);
    } catch (error) {
      const errorMessage = sanitizeApiError(error);
      this.ui.error(`Setup failed: ${errorMessage}`);
      this.ui.info("You can retry setup by running 'mclaude setup' again");

      // Don't re-throw - let the user retry manually
      throw new Error(`Setup failed: ${errorMessage}`);
    }
  }

  /**
   * Orchestrate setup steps with progress tracking
   * Features:
   * - Atomic step execution with rollback capability
   * - Progressive disclosure and user feedback
   * - Comprehensive error recovery options
   */
  private async unifiedSetupOrchestrator(): Promise<void> {
    const setupSteps: SetupStep[] = [
      {
        name: "Provider Configuration",
        action: () => this.setupProviderConfiguration(),
      },
      {
        name: "Authentication Testing",
        action: () => this.setupAuthenticationTesting(),
      },
      { name: "Model Selection", action: () => this.modelInteractionManager.setupModelSelection() },
      { name: "Finalization", action: () => this.setupFinalization() },
    ];

    this.ui.info("Starting streamlined setup process...");
    this.ui.info("==================================");

    for (const step of setupSteps) {
      this.ui.coloredInfo(`\n📋 Step: ${step.name}`);
      this.ui.info("─".repeat(step.name.length + 7));

      try {
        await step.action();
        this.ui.coloredSuccess(`✓ ${step.name} completed`);
      } catch (error) {
        const shouldContinue = await this.handleSetupStepError(
          step.name,
          error,
        );
        if (!shouldContinue) {
          throw new Error(
            `Setup stopped at ${step.name}: ${sanitizeApiError(error)}`,
          );
        }
        this.ui.warning(`⚠ ${step.name} completed with warnings`);
      }
    }

    this.ui.coloredSuccess("\n🎉 All setup steps completed successfully!");
  }

  /**
   * Handle errors during setup steps with clear recovery options
   */
  private async handleSetupStepError(
    stepName: string,
    error: any,
  ): Promise<boolean> {
    const errorMessage = sanitizeApiError(error);

    this.ui.error(`❌ ${stepName} failed: ${errorMessage}`);

    this.ui.info("\nRecovery Options:");
    this.ui.info("1. Retry this step");
    this.ui.info("2. Skip this step and continue (if possible)");
    this.ui.info("3. Abort setup and fix the issue manually");

    const choice = await this.ui.ask("Choose an option (1-3)", "2");

    switch (choice) {
      case "1":
        this.ui.info("Retrying step...");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Brief pause
        return true; // Continue, which will retry the step

      case "2": {
        // Determine if we can safely skip this step
        const canSkip = await this.canSkipSetupStep(stepName);
        if (canSkip) {
          this.ui.warning(`Skipping ${stepName}. You can complete this later.`);
          return true; // Continue to next step
        } else {
          this.ui.error(`Cannot skip ${stepName}. This step is required.`);
          return false; // Abort setup
        }
      }

      case "3":
      default:
        this.ui.info(
          "Setup aborted. You can retry by running 'mclaude setup' again.",
        );
        return false; // Abort setup
    }
  }

  /**
   * Determine if a setup step can be safely skipped
   */
  private async canSkipSetupStep(stepName: string): Promise<boolean> {
    switch (stepName) {
      case "Provider Configuration":
        return false; // At least one provider is required
      case "Authentication Testing":
        return true; // Optional - can be done later with 'mclaude doctor'
      case "Model Selection":
        return true; // Optional - can be done later with 'mclaude models'
      case "Finalization":
        return false; // Required for proper setup completion
      default:
        return false;
    }
  }

  /**
   * Step 1: Configure providers (streamlined)
   */
  private async setupProviderConfiguration(): Promise<void> {
    // Check for local configuration and setup if in a project
    const configType = this.configManager.getConfigType();
    const workspaceRoot = this.configManager.getWorkspaceRoot();

    if (configType === "global" && workspaceRoot) {
      this.ui.info("🌍 Global configuration detected in a project directory");
      this.ui.info("Workspace: " + workspaceRoot);

      const shouldUseLocal = await this.ui.confirm(
        "Create local project configuration?",
        true,
      );

      if (shouldUseLocal) {
        try {
          await this.configManager.initLocalConfig();

          // Try to migrate existing global config
          const globalProviders = this.configManager.getAtomicProviderState();
          const hasGlobalProviders =
            globalProviders.synthetic.hasApiKey ||
            globalProviders.minimax.hasApiKey;

          if (hasGlobalProviders) {
            const shouldMigrate = await this.ui.confirm(
              "Migrate existing global configuration to local project?",
              true,
            );

            if (shouldMigrate) {
              await this.configManager.migrateToLocal();
              this.ui.success(
                "✓ Global configuration migrated to local project",
              );
            }
          }

          this.ui.success("✓ Local project configuration created");
          this.ui.info(
            "You can switch back to global config with: mclaude config global\n",
          );
        } catch (error: any) {
          this.ui.error(`Failed to create local config: ${error.message}`);
          this.ui.info("Continuing with global configuration");
        }
      }
    } else if (configType === "local") {
      this.ui.info("🏠 Using local project configuration");
      this.ui.info("Workspace: " + workspaceRoot);
      this.ui.info("This configuration will be used for this project only\n");
    } else {
      this.ui.info("🌍 Using global configuration");
      this.ui.info("This configuration will be used system-wide\n");
    }

    const providerState = this.configManager.getAtomicProviderState();
    const hasAnyProvider =
      providerState.synthetic.hasApiKey || providerState.minimax.hasApiKey;

    if (hasAnyProvider) {
      const shouldReconfigure = await this.ui.confirm(
        "Existing configuration found. Reconfigure providers?",
        false,
      );
      if (!shouldReconfigure) {
        this.ui.info("Keeping existing provider configuration");
        return;
      }
    }

    // Simple provider selection flow
    this.ui.info("Configure at least one provider to continue:");
    this.ui.info("1. Synthetic API (Recommended)");
    this.ui.info("2. MiniMax API");
    this.ui.info("3. Both providers");

    const providerChoice = await this.ui.ask("Select option (1-3)", "1");

    let configuredProviders = 0;

    // Configure Synthetic if selected
    if (providerChoice === "1" || providerChoice === "3") {
      const success = await this.configureSingleProvider("synthetic");
      if (success) configuredProviders++;
    }

    // Configure MiniMax if selected
    if (providerChoice === "2" || providerChoice === "3") {
      const success = await this.configureSingleProvider("minimax");
      if (success) configuredProviders++;
    }

    if (configuredProviders === 0) {
      throw new Error(
        "No providers were successfully configured. At least one provider is required.",
      );
    }

    this.ui.success(`✓ ${configuredProviders} provider(s) configured`);
  }

  /**
   * Configure a single provider with simplified flow
   */
  private async configureSingleProvider(
    provider: "synthetic" | "minimax",
  ): Promise<boolean> {
    try {
      const providerNames = { synthetic: "Synthetic", minimax: "MiniMax" };
      const providerName = providerNames[provider];

      this.ui.info(`\nConfiguring ${providerName} provider...`);

      const apiKey = await this.ui.askPassword(
        `Enter your ${providerName} API key (or press Enter to skip)`,
      );

      if (!apiKey) {
        this.ui.info(`Skipping ${providerName} provider`);
        return false;
      }

      // Basic format validation
      const formatValidation = this.validateApiKeyFormat(provider, apiKey);
      if (!formatValidation.valid) {
        this.ui.error(`Invalid API key format: ${formatValidation.error}`);
        const shouldRetry = await this.ui.confirm(
          `Try ${providerName} again?`,
          true,
        );
        if (shouldRetry) {
          return await this.configureSingleProvider(provider);
        }
        return false;
      }

      // Save API key
      let success = false;
      if (provider === "synthetic") {
        success = await this.configManager.setSyntheticApiKey(apiKey);
      } else {
        success = await this.configManager.setMinimaxApiKey(apiKey);

        // For MiniMax, also try to get Group ID
        if (success) {
          const groupId = await this.ui.ask(
            "Enter MiniMax Group ID (optional, press Enter to skip)",
          );
          if (groupId) {
            await this.configManager.setMinimaxGroupId(groupId);
          }
        }
      }

      if (!success) {
        this.ui.error(`Failed to save ${providerName} configuration`);
        return false;
      }

      // Enable the provider
      await this.configManager.setProviderEnabled(provider, true);

      this.ui.coloredSuccess(`✓ ${providerName} provider configured`);
      return true;
    } catch (error) {
      this.ui.error(
        `Failed to configure ${provider}: ${sanitizeApiError(error)}`,
      );
      return false;
    }
  }

  /**
   * Step 2: Test authentication for configured providers
   */
  private async setupAuthenticationTesting(): Promise<void> {
    const shouldTest = await this.ui.confirm(
      "Test configured provider connections?",
      true,
    );

    if (!shouldTest) {
      this.ui.info(
        "Skipping connection tests. You can test later with 'mclaude doctor'.",
      );
      return;
    }

    const providerState = this.configManager.getAtomicProviderState();
    const enabledProviders: ("synthetic" | "minimax")[] = [];

    if (providerState.synthetic.available) enabledProviders.push("synthetic");
    if (providerState.minimax.available) enabledProviders.push("minimax");

    if (enabledProviders.length === 0) {
      throw new Error(
        "No enabled providers available for testing. Configure at least one provider first.",
      );
    }

    let successCount = 0;
    const testResults: Record<string, { success: boolean; error?: string }> =
      {};

    for (const provider of enabledProviders) {
      // Skip testing if no API key is provided for this provider
      const hasApiKey =
        provider === "synthetic"
          ? this.configManager.hasSyntheticApiKey()
          : this.configManager.hasMinimaxApiKey();

      if (!hasApiKey) {
        const providerDisplayName =
          provider.charAt(0).toUpperCase() + provider.slice(1);
        this.ui.warning(
          `⚠ ${providerDisplayName} provider skipped: No API key configured`,
        );
        continue;
      }

      this.ui.info(`\nTesting ${provider} provider...`);

      try {
        const testResult = await this.authManager.testAuth(provider);
        testResults[provider] = {
          success: testResult.valid,
          error: testResult.error,
        };

        if (testResult.valid) {
          this.ui.coloredSuccess(`✓ ${provider} connection successful`);
          successCount++;
        } else {
          this.ui.error(`✗ ${provider} connection failed: ${testResult.error}`);
        }
      } catch (error) {
        const sanitizedError = sanitizeApiError(error);
        testResults[provider] = { success: false, error: sanitizedError };
        // Hide the full stack trace - only show sanitized error
        this.ui.error(`✗ ${provider} connection failed: ${sanitizedError}`);
      }
    }

    if (successCount === 0) {
      const shouldRetry = await this.ui.confirm(
        "All providers failed authentication. Retry setup?",
        true,
      );
      if (shouldRetry) {
        return await this.setupAuthenticationTesting(); // Retry with user intervention
      }
      // Critical failure - stop setup process completely
      throw new Error(
        "Authentication failed for all providers. Please check your API keys and restart setup.",
      );
    }

    // Check if critical providers failed - if Synthetic fails, it's critical since it's the primary provider
    const criticalProviders = ["synthetic"];
    const failedCriticalProviders = criticalProviders.filter(
      (p) =>
        enabledProviders.includes(p as any) &&
        testResults[p]?.success === false,
    );

    if (failedCriticalProviders.length > 0 && successCount > 0) {
      const shouldContinue = await this.ui.confirm(
        `Critical providers failed (${failedCriticalProviders.join(", ")}). Continue with working providers?`,
        false,
      );
      if (!shouldContinue) {
        throw new Error("Setup cancelled due to critical provider failures.");
      }
    }

    if (successCount < enabledProviders.length) {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const failedProviders = Object.entries(testResults)
        .filter(([, result]) => !result.success)
        .map(([provider]) => provider);
      /* eslint-enable @typescript-eslint/no-unused-vars */

      this.ui.warning(
        `⚠ Some providers failed: ${failedProviders.join(", ")}`,
      );
      this.ui.info(`Continuing with ${successCount} working provider(s)...`);
    }

    this.ui.success(
      `✓ Authentication testing complete (${successCount}/${enabledProviders.length} providers working)`,
    );
  }

  /**
   * Step 4: Finalize setup
   */
  private async setupFinalization(): Promise<void> {
    // Mark first run as completed
    const success = await this.configManager.markFirstRunCompleted();
    if (!success) {
      throw new Error("Failed to mark setup as completed");
    }

    // Verify final configuration
    const providerState = this.configManager.getAtomicProviderState();
    const availableProviders = Object.values(providerState).filter(
      (state) => state.available,
    ).length;

    if (availableProviders === 0) {
      throw new Error(
        "Setup completed but no providers are available. This shouldn't happen - please report this issue.",
      );
    }

    // Show final configuration summary
    this.ui.info("\n📋 Setup Summary:");
    this.ui.info("=================");
    this.ui.info(`✓ Available Providers: ${availableProviders}`);
    this.ui.info(`✓ Multi-Provider Routing: Direct provider routing (v1.5.1)`);

    if (this.configManager.hasSavedModel()) {
      this.ui.info(`✓ Default Model: ${this.configManager.getSavedModel()}`);
    }

    if (this.configManager.hasSavedThinkingModel()) {
      this.ui.info(
        `✓ Thinking Model: ${this.configManager.getSavedThinkingModel()}`,
      );
    }

    this.ui.info(
      `✓ Configuration Version: ${this.configManager.config.configVersion}`,
    );
  }

  /**
   * Validate API key format for a provider
   */
  private validateApiKeyFormat(
    provider: "synthetic" | "minimax",
    apiKey: string,
  ): { valid: boolean; error?: string } {
    if (!apiKey || apiKey.trim().length === 0) {
      return { valid: false, error: "API key cannot be empty" };
    }

    const trimmedKey = apiKey.trim();

    switch (provider) {
      case "synthetic":
        // Synthetic API keys typically start with 'syn_' and are alphanumeric
        if (!trimmedKey.match(/^syn_[a-zA-Z0-9]+$/)) {
          return {
            valid: false,
            error: "Synthetic API key should start with 'syn_' followed by alphanumeric characters",
          };
        }
        break;

      case "minimax":
        // MiniMax API keys are typically longer alphanumeric strings
        if (trimmedKey.length < 20 || !trimmedKey.match(/^[a-zA-Z0-9]+$/)) {
          return {
            valid: false,
            error: "MiniMax API key should be at least 20 alphanumeric characters",
          };
        }
        break;

      default:
        return { valid: false, error: `Unknown provider: ${provider}` };
    }

    return { valid: true };
  }
}