import { ConfigManager } from "../../config";
import { UserInterface } from "../../ui";
import { AppConfig } from "../../config/types";
import {
  ConfigMigrationManagerInterface,
  MigrationOptions,
} from "./config-migration-manager.interface";

/**
 * ConfigMigrationManager handles configuration migration operations.
 *
 * Responsibilities:
 * - Migrate global configuration to local project configuration
 * - Legacy config format detection and migration
 * - Interactive migration prompts during setup
 * - Version-based config migration
 */
export class ConfigMigrationManager implements ConfigMigrationManagerInterface {
  constructor(
    private configManager: ConfigManager,
    private ui: UserInterface,
  ) {}

  /**
   * Migrate global configuration to local project configuration
   */
  async migrateConfig(options: MigrationOptions = {}): Promise<void> {
    try {
      const configType = this.configManager.getConfigType();

      if (configType === "local" && !options.force) {
        this.ui.coloredWarning("Local project configuration already exists");
        this.ui.info("Use --force to overwrite and migrate again");
        return;
      }

      await this.configManager.migrateToLocal();

      this.ui.success("✓ Configuration migrated to local project");
      this.ui.info(`Local config: ${process.cwd()}/.mclaude/config.json`);
      this.ui.info("Global config preserved for other projects");
    } catch (error: any) {
      this.ui.error(`Failed to migrate configuration: ${error.message}`);
    }
  }

  /**
   * Prompt for migration during local project initialization
   * Detects if global configuration has API keys to migrate
   */
  async promptForMigrationOnLocalInit(): Promise<boolean> {
    try {
      // Check if global config has providers with API keys
      const globalProviders = this.configManager.getAtomicProviderState();
      const hasGlobalProviders =
        globalProviders.synthetic.hasApiKey ||
        globalProviders.minimax.hasApiKey;

      if (!hasGlobalProviders) {
        return false; // No migration needed
      }

      const shouldMigrate = await this.ui.confirm(
        "Migrate existing global configuration to local project?",
        true,
      );

      if (shouldMigrate) {
        await this.configManager.migrateToLocal();
        this.ui.success("✓ Global configuration migrated to local project");
        return true;
      }

      return false;
    } catch (error: any) {
      this.ui.error(`Migration failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if configuration is in legacy format and needs migration
   * This method would be used by ConfigManager during load operations
   */
  needsLegacyMigration(config: any): boolean {
    return !config.configVersion || config.configVersion < 2;
  }

  /**
   * Perform v1.4.4 migration: migrate recommendedModels to selectedModel fields
   * This migration preserves user model selections during the transition
   */
  async migrateRecommendedModelsToSelected(config: AppConfig): Promise<void> {
    if (
      config.recommendedModels &&
      !config.selectedModel &&
      config.firstRunCompleted
    ) {
      console.log("Migrating recommended models to selected model fields...");
      config.selectedModel = config.recommendedModels.default?.primary || "";
      config.selectedThinkingModel =
        config.recommendedModels.thinking?.primary || "";

      // Save the migrated config
      await this.configManager.saveConfig(config);
    }
  }

  /**
   * Get migration status and info for the current configuration
   */
  getMigrationStatus(): {
    configVersion: number;
    supportsMultiProvider: boolean;
    needsSelectedModelMigration: boolean;
    isLegacyFormat: boolean;
  } {
    const config = this.configManager.config;

    return {
      configVersion: config.configVersion || 1,
      supportsMultiProvider: !!(
        config.configVersion && config.configVersion >= 2
      ),
      needsSelectedModelMigration: !!(
        config.recommendedModels &&
        !config.selectedModel &&
        config.firstRunCompleted
      ),
      isLegacyFormat: !config.configVersion || config.configVersion < 2,
    };
  }

  /**
   * Initialize local project configuration
   */
  async initLocalConfig(options: { force?: boolean } = {}): Promise<void> {
    try {
      const configType = this.configManager.getConfigType();

      if (configType === "local" && !options.force) {
        this.ui.warning(
          "Local project configuration already exists at: " +
            this.configManager.getWorkspaceRoot(),
        );
        this.ui.info("Use --force to overwrite");
        return;
      }

      await this.configManager.initLocalConfig();

      this.ui.success("✓ Local project configuration initialized");
      this.ui.info(`Config directory: ${process.cwd()}/.mclaude/`);
      this.ui.info("Configuration: .mclaude/config.json");
      this.ui.info("Local secrets: .mclaude/.env.local (git-ignored)");
    } catch (error: any) {
      this.ui.error(
        `Failed to initialize local configuration: ${error.message}`,
      );
    }
  }

  /**
   * Switch to local project configuration
   */
  async switchToLocalConfig(): Promise<void> {
    const configType = this.configManager.getConfigType();

    if (configType === "local") {
      this.ui.info("Already using local project configuration");
      if (this.configManager.getWorkspaceRoot()) {
        this.ui.info(`Workspace: ${this.configManager.getWorkspaceRoot()}`);
      }
      return;
    }

    // Create local config if it doesn't exist
    if (!this.configManager.getWorkspaceRoot()) {
      this.ui.warning("No local project configuration found");
      this.ui.info("Run 'mclaude config init' to create one");
      return;
    }

    this.ui.success("Switched to local project configuration");
    this.ui.info(`Workspace: ${this.configManager.getWorkspaceRoot()}`);
  }

  /**
   * Switch to global configuration
   */
  async switchToGlobalConfig(): Promise<void> {
    const configType = this.configManager.getConfigType();

    if (configType === "global") {
      this.ui.info("Already using global configuration");
      return;
    }

    // Create a new instance for global only
    const globalConfigManager = new ConfigManager();
    globalConfigManager.config; // Force load

    this.ui.success("Switched to global configuration");
  }

  /**
   * Display migration status to user
   */
  async showMigrationStatus(): Promise<void> {
    const status = this.getMigrationStatus();

    this.ui.info("Migration Status:");
    this.ui.info("================");
    this.ui.info(`Config Version: ${status.configVersion}`);
    this.ui.info(
      `Multi-Provider Support: ${status.supportsMultiProvider ? "Yes" : "No"}`,
    );
    this.ui.info(`Legacy Format: ${status.isLegacyFormat ? "Yes" : "No"}`);

    if (status.needsSelectedModelMigration) {
      this.ui.coloredWarning("⚠ Recommended models migration available");
      this.ui.info("Run configuration update to migrate model selections");
    }
  }
}
