import { join } from "path";
import { ConfigManager } from "../config";
import { ModelManager } from "../models";
import { UserInterface } from "../ui";
import { ClaudeLauncher, LaunchOptions } from "../launcher";
import { ModelInfoImpl } from "../models";

import { createBanner, normalizeDangerousFlags } from "../utils/banner";
import { AuthManager } from "./managers/auth-manager";
import { ConfigCliManager } from "./managers/config-cli-manager";
import { ConfigMigrationManager } from "./managers/config-migration-manager";
import { ProviderManager } from "./managers/provider-manager";
import { ModelInteractionManager } from "./managers/model-interaction-manager";
import { SetupManager } from "./managers/setup-manager";
import { SystemManager } from "./managers/system-manager";
import { RouterManager } from "../router/manager";

import { sanitizeApiError } from "../utils/error-sanitizer";

export interface AppOptions {
  verbose?: boolean;
  quiet?: boolean;
  additionalArgs?: string[];
  thinkingModel?: string;
  // MiniMax M2 enhancements (v1.3.0)
  temperature?: number;
  topP?: number;
  preset?: string;
  contextSize?: number;
  toolChoice?: string;
  stream?: boolean;
  memory?: string;
  jsonMode?: boolean;
}

export class SyntheticClaudeApp {
  private modelManager: ModelManager | null = null;
  private configManager: ConfigManager;
  private ui: UserInterface;
  private launcher: ClaudeLauncher;
  private routerManager: RouterManager;
  private authManager: AuthManager;
  private configCliManager: ConfigCliManager;
  private configMigrationManager: ConfigMigrationManager;
  private providerManager: ProviderManager;
  private modelInteractionManager: ModelInteractionManager;
  private setupManager: SetupManager;
  private systemManager: SystemManager;

  constructor() {
    this.configManager = new ConfigManager();
    const config = this.configManager.config;
    this.ui = new UserInterface(
      {
        verbose: this.configManager.hasSyntheticApiKey()
          ? config.cacheDurationHours > 0
          : false,
      },
      this.configManager,
    );
    this.launcher = new ClaudeLauncher(undefined, this.configManager);

    // Initialize core services
    this.routerManager = new RouterManager(this.configManager);

    // Instantiate managers
    this.authManager = new AuthManager(this.configManager, this.ui);
    this.configCliManager = new ConfigCliManager(this.configManager, this.ui);
    this.configMigrationManager = new ConfigMigrationManager(
      this.configManager,
      this.ui,
    );
    this.providerManager = new ProviderManager(
      this.configManager,
      this.ui,
      this.routerManager,
      this.getModelManager(),
    );
    this.modelInteractionManager = new ModelInteractionManager(
      this.configManager,
      this.ui,
      this.getModelManager(),
    );
    this.setupManager = new SetupManager(
      this.configManager,
      this.ui,
      this.authManager,
      this.modelInteractionManager,
    );
    this.systemManager = new SystemManager(
      this.configManager,
      this.ui,
      this.routerManager,
    );
  }

  async setupLogging(options: AppOptions): Promise<void> {
    await this.systemManager.setupLogging(options);
  }

  getConfig() {
    return this.configManager.config;
  }

  get managers() {
    return {
      configManager: this.configManager,
      ui: this.ui,
      authManager: this.authManager,
      configCliManager: this.configCliManager,
      configMigrationManager: this.configMigrationManager,
      providerManager: this.providerManager,
      modelInteractionManager: this.modelInteractionManager,
      setupManager: this.setupManager,
      systemManager: this.systemManager,
    };
  }

  private getModelManager(): ModelManager {
    if (!this.modelManager) {
      const config = this.configManager.config;
      const cacheFile = join(
        require("os").homedir(),
        ".config",
        "mclaude",
        "models_cache.json",
      );

      this.modelManager = new ModelManager({
        configManager: this.configManager,
        cacheFile,
        cacheDurationHours: config.cacheDurationHours,
      });
    }
    return this.modelManager;
  }

  async run(options: AppOptions & LaunchOptions): Promise<void> {
    // v1.3.1: Silent update check on launch (non-blocking)
    await this.systemManager.performSilentUpdate();

    // Normalize dangerous flags first
    if (options.additionalArgs) {
      options.additionalArgs = normalizeDangerousFlags(options.additionalArgs);
    }

    await this.setupLogging(options);

    // Display banner unless quiet mode
    if (!options.quiet) {
      console.log(createBanner(options));
    }

    // Note: Updates are now handled manually by users via `npm update -g mclaude`
    // This eliminates complex update checking and related bugs

    // Handle first-time setup
    if (this.configManager.isFirstRun()) {
      await this.setupManager.setup();
      return;
    }

    // Get model to use
    const model = await this.selectModel(options.model);
    if (!model) {
      this.ui.error("No model selected");
      return;
    }

    // Get thinking model to use (if specified)
    const thinkingModel = await this.selectThinkingModel(options.thinkingModel);

    // Apply temperature presets (v1.3.0)
    let temperature = options.temperature;
    if (options.preset) {
      switch (options.preset.toLowerCase()) {
        case "creative":
          temperature = 1.0;
          break;
        case "precise":
          temperature = 0.2;
          break;
        case "balanced":
          temperature = 0.7;
          break;
        default:
          this.ui.warning(
            `Unknown preset: ${options.preset}. Using default temperature.`,
          );
      }
    }

    // Load system prompt (v1.3.0)
    let sysprompt: string | undefined;
    const { content, size } = await this.configManager.loadSysprompt();
    if (content) {
      const validation = this.configManager.validateSyspromptSize(size);
      if (!validation.valid) {
        this.ui.error(validation.message);
        this.ui.info("Skipping system prompt. Run 'mclaude sysprompt' to fix.");
      } else {
        if (validation.warning) {
          this.ui.warning(validation.message);
        }
        sysprompt = content;
      }
    }

    // Launch Claude Code with enhanced options
    await this.launchClaudeCode(
      model,
      {
        ...options,
        temperature,
        topP: options.topP,
        contextSize: options.contextSize,
        toolChoice: options.toolChoice,
        stream: options.stream,
        memoryCompact: options.memory === "compact",
        jsonMode: options.jsonMode,
        sysprompt,
      },
      thinkingModel,
    );
    process.exit(0);
  }

  /**
   * Validate provider credentials - maintains compatibility while being simpler
   */
  async validateProviderCredentials(): Promise<{
    valid: boolean;
    authenticationError?: string | null;
    warnings?: string[];
  }> {
    const modelManager = this.getModelManager();
    const enabledProviders = modelManager.getEnabledProviders();
    const errors: string[] = [];

    // Test each provider individually to collect specific errors
    for (const provider of enabledProviders) {
      try {
        const result = await this.authManager.testAuth(provider);
        if (!result.valid) {
          errors.push(`${provider} authentication failed`);
        }
      } catch (error: any) {
        // Delegate error formatting to AuthManager
        errors.push(
          this.authManager.formatAuthenticationError(provider, error),
        );
      }
    }

    if (errors.length === enabledProviders.length && errors.length > 0) {
      // All providers failed
      return {
        valid: false,
        authenticationError: `All providers failed authentication. ${errors.join("; ")}`,
        warnings: [],
      };
    } else if (errors.length > 0) {
      // Some providers failed but at least one succeeded
      return {
        valid: true,
        authenticationError: null,
        warnings: errors,
      };
    } else {
      // All providers succeeded
      return { valid: true, warnings: [], authenticationError: null };
    }
  }

  /**
   * Helper to detect which provider caused an error
   */
  private detectProviderFromError(error: any): string | null {
    if (
      error.config?.baseURL?.includes("synthetic") ||
      error.message?.includes("synthetic")
    ) {
      return "synthetic";
    }
    if (
      error.config?.baseURL?.includes("minimax") ||
      error.message?.includes("minimax")
    ) {
      return "minimax";
    }
    return null;
  }

  /**
   * Simple error categorization for backward compatibility
   */
  categorizeError(error: any): string {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return "AUTHENTICATION";
    }
    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.code === "ETIMEDOUT"
    ) {
      return "NETWORK";
    }
    if (
      typeof error?.message === "string" &&
      error.message.includes("No providers are enabled")
    ) {
      return "PROVIDER_UNAVAILABLE";
    }
    if (
      typeof error?.message === "string" &&
      error.message.includes("UI error")
    ) {
      return "UI_ERROR";
    }
    return "UNKNOWN";
  }

  /**
   * Improved API key format validation
   */
  validateApiKeyFormat(
    provider: string,
    apiKey: string,
  ): { valid: boolean; error?: string } {
    if (!apiKey || apiKey.trim().length === 0) {
      return { valid: false, error: "API key cannot be empty" };
    }

    // Basic format validation
    switch (provider.toLowerCase()) {
      case "synthetic":
        if (apiKey.length < 10) {
          return {
            valid: false,
            error: "Synthetic API key appears to be too short",
          };
        }
        if (!apiKey.startsWith("syn_")) {
          return {
            valid: false,
            error: 'Synthetic API key should start with "syn_"',
          };
        }
        break;
      case "minimax":
        if (apiKey.length < 20) {
          return {
            valid: false,
            error: "MiniMax API key appears to be too short",
          };
        }
        break;
    }

    // Check for common placeholder values
    const placeholders = ["test", "example", "placeholder", "your-api-key"];
    if (
      placeholders.some((placeholder) =>
        apiKey.toLowerCase().includes(placeholder),
      )
    ) {
      return {
        valid: false,
        error: "Please enter a real API key, not a placeholder value",
      };
    }

    return { valid: true };
  }

  /**
   * Simplified error recovery: Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async interactiveThinkingModelSelection(): Promise<boolean> {
    return await this.modelInteractionManager.interactiveThinkingModelSelection();
  }

  // Old searchModels method is now replaced by enhanced version below

  /**
   * Unified Setup Orchestrator - Simplified, bulletproof setup flow
   *
   * This method orchestrates the entire setup process with:
   * - Single point of authentication testing
   * - Atomic state management to prevent race conditions
   * - Clear progressive disclosure and user feedback
   * - Graceful degradation when steps fail
   * - Comprehensive error recovery options
   */
  private async unifiedSetupOrchestrator(): Promise<void> {
    const setupSteps = [
      {
        name: "Provider Configuration",
        action: () => this.setupProviderConfiguration(),
      },
      {
        name: "Authentication Testing",
        action: () => this.setupAuthenticationTesting(),
      },
      {
        name: "Model Selection",
        action: () =>
          this.managers.modelInteractionManager.setupModelSelection(),
      },
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
   * Step 3: Select models (simplified)
   */

  private async checkRecommendedModelAvailability(
    recommended: any,
  ): Promise<string[]> {
    return await this.modelInteractionManager.checkRecommendedModelAvailability(
      recommended,
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

  // Note: setupSyntheticApiKey() and setupMinimaxApiKey() methods have been replaced
  // by the unified setup orchestrator. See configureSingleProvider() for the new implementation.

  private async selectModel(preselectedModel?: string): Promise<string | null> {
    return await this.modelInteractionManager.selectModel(preselectedModel);
  }

  private async selectThinkingModel(
    preselectedThinkingModel?: string,
  ): Promise<string | null> {
    return await this.modelInteractionManager.selectThinkingModel(
      preselectedThinkingModel,
    );
  }

  /**
   * Simplified connection testing - handled by the new setup orchestrator
   * This method is kept for backward compatibility but delegates to the new flow
   */
  private async testConnectionWithRecovery(): Promise<void> {
    // Use the new simplified authentication testing
    await this.setupAuthenticationTesting();
  }

  private async launchClaudeCode(
    model: string,
    options: LaunchOptions,
    thinkingModel?: string | null,
  ): Promise<void> {
    const launchInfo = thinkingModel
      ? `Launching with ${model} (thinking: ${thinkingModel}). Use "mclaude model" to change model.`
      : `Launching with ${model}. Use "mclaude model" to change model.`;

    this.ui.highlightInfo(launchInfo, [model, "mclaude model"]);

    // Try to get model info for better provider resolution
    let modelInfo: ModelInfoImpl | undefined;
    try {
      const modelManager = this.getModelManager();
      const modelResult = await modelManager.getModelById(model);
      if (modelResult) {
        modelInfo = modelResult;
      }
    } catch (error) {
      // Continue without model info if we can't fetch it
      console.warn(`Could not get model info for ${model}: ${error}`);
    }

    const result = await this.launcher.launchClaudeCode({
      model,
      thinkingModel,
      additionalArgs: options.additionalArgs,
      env: options.env, // Pass through any custom env variables
      modelInfo,
    });

    if (!result.success) {
      this.ui.error(`Failed to launch Claude Code: ${result.error}`);
    }
  }

  // Enhanced model methods

  // Local Configuration Management Methods

  // ============================================
  // Stats Command (v1.3.0)
  // ============================================

  // ============================================
  // System Prompt Management (v1.3.0)
  // ============================================

  // ============================================
  // Router Management (v1.4.4)
  // ============================================

  // ============================================
  // Model Card Management (v1.3.1)
  // ============================================
}
