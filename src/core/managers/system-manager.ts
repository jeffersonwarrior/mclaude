import { ConfigManager } from "../../config";
import { UserInterface } from "../../ui";
import { RouterManager } from "../../router/manager";
import { Logger, setupLogging } from "../../utils/logger";
import { ClaudeLauncher } from "../../launcher";
import { ModelManager } from "../../models";
import { AppOptions } from "../app";
import { SystemManagerInterface } from "./system-manager.interface";
import { sanitizeApiError } from "../../utils/error-sanitizer";
import { join } from "path";
import { homedir } from "os";

export class SystemManager implements SystemManagerInterface {
  private logger: Logger;
  private launcher: ClaudeLauncher;
  private modelManager: ModelManager | null = null; // Initialize lazily

  constructor(
    private configManager: ConfigManager,
    private ui: UserInterface,
    private routerManager: RouterManager,
  ) {
    this.logger = new Logger({ level: "info" }); // SystemManager needs its own logger instance
    this.launcher = new ClaudeLauncher(undefined, this.configManager); // Assuming ClaudeLauncher doesn't need ModelManager directly
  }

  private getModelManager(): ModelManager {
    if (!this.modelManager) {
      const config = this.configManager.config;
      const cacheFile = join(
        homedir(),
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

  async setupLogging(options: AppOptions): Promise<void> {
    setupLogging(options.verbose, options.quiet);
    // Removed verbose startup log
  }

  /**
   * v1.3.1: Silent update check on launch (Option C from spec)
   * Non-blocking, 3 second timeout, silent catch
   */
  async performSilentUpdate(): Promise<void> {
    // Check if we need an update (24h threshold)
    if (!this.configManager.needsUpdateCheck()) {
      return;
    }

    // v1.3.1: GitHub raw URL for model cards
    const CARDS_URL =
      "https://raw.githubusercontent.com/jeffersonwarrior/mclaude/main/model-cards.json";

    // Fire and forget - don't await
    this.configManager
      .fetchAndSaveModelCards(CARDS_URL, 3000)
      .then(async (success) => {
        if (success) {
          // Update timestamp on success
          await this.configManager.updateLastCheck();
        }
      })
      .catch(() => {
        // Silent fail - no output to user
      });

    // Also update the last check timestamp immediately to prevent multiple attempts
    this.configManager.updateLastCheck().catch(() => {
      // Silent fail
    });
  }

  async doctor(): Promise<void> {
    this.ui.info("System Health Check");
    this.ui.info("===================");

    // Check Claude Code installation
    const claudeInstalled = await this.launcher.checkClaudeInstallation();
    this.ui.showStatus(
      claudeInstalled ? "success" : "error",
      `Claude Code: ${claudeInstalled ? "Installed" : "Not found"}`,
    );

    if (claudeInstalled) {
      const version = await this.launcher.getClaudeVersion();
      if (version) {
        this.ui.info(`Claude Code version: ${version}`);
      }
    }

    // Check configuration
    this.ui.showStatus(
      this.configManager.hasApiKey() ? "success" : "error",
      "Configuration: API key " +
        (this.configManager.hasApiKey() ? "configured" : "missing"),
    );

    // Check API connection
    if (this.configManager.hasApiKey()) {
      try {
        const modelManager = this.getModelManager();
        const models = await modelManager.fetchModels();
        this.ui.showStatus(
          "success",
          `API connection: OK (${models.length} models)`,
        );
      } catch (error) {
        const errorMessage = sanitizeApiError(error);
        this.ui.showStatus("error", `API connection: Failed (${errorMessage})`);
      }
    }

    // Note: Manual updates via `npm update -g mclaude`
    this.ui.info("To check for updates, run: npm update -g mclaude");
  }

  async clearCache(): Promise<void> {
    const modelManager = this.getModelManager();
    const success = await modelManager.clearCache();

    if (success) {
      this.ui.success("Model cache cleared");
    } else {
      this.ui.error("Failed to clear cache");
    }
  }

  async cacheInfo(): Promise<void> {
    const modelManager = this.getModelManager();
    const cacheInfo = await modelManager.getCacheInfo();

    this.ui.info("Cache Information:");
    this.ui.info("==================");

    if (cacheInfo.exists) {
      this.ui.info(`Status: ${cacheInfo.isValid ? "Valid" : "Expired"}`);
      this.ui.info(`File: ${cacheInfo.filePath}`);
      this.ui.info(`Size: ${cacheInfo.sizeBytes} bytes`);
      this.ui.info(`Models: ${cacheInfo.modelCount}`);
      this.ui.info(`Modified: ${cacheInfo.modifiedTime}`);
    } else {
      this.ui.info("Status: No cache file");
    }
  }
}
