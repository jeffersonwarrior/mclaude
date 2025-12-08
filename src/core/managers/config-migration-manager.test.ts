import { ConfigMigrationManager } from "./config-migration-manager";
import { MigrationOptions } from "./config-migration-manager.interface";
import { ConfigManager } from "../../config";
import { UserInterface } from "../../ui";
import { AppConfig } from "../../config/types";

jest.mock("../../config");
jest.mock("../../ui");

describe("ConfigMigrationManager", () => {
  let configManager: any;
  let ui: jest.Mocked<UserInterface>;
  let migrationManager: ConfigMigrationManager;

  beforeEach(() => {
    jest.clearAllMocks();
    
    configManager = {
      getConfigType: jest.fn(),
      migrateToLocal: jest.fn(),
      initLocalConfig: jest.fn(),
      getWorkspaceRoot: jest.fn(),
      getAtomicProviderState: jest.fn(),
      config: {} as AppConfig,
      saveConfig: jest.fn(),
    };

    // Make config property fully configurable for tests
    Object.defineProperty(configManager, 'config', {
      value: {} as AppConfig,
      writable: true,
      enumerable: true,
      configurable: true,
    });

    ui = {
      coloredWarning: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
      confirm: jest.fn(),
      warning: jest.fn(),
    } as any;

    migrationManager = new ConfigMigrationManager(configManager, ui);
  });

  describe("migrateConfig", () => {
    it("should migrate global config to local when no local config exists", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("global");
      configManager.migrateToLocal.mockResolvedValue();

      // Act
      await migrationManager.migrateConfig({});

      // Assert
      expect(configManager.migrateToLocal).toHaveBeenCalledTimes(1);
      expect(ui.success).toHaveBeenCalledWith("✓ Configuration migrated to local project");
      expect(ui.info).toHaveBeenCalledWith(`Local config: ${process.cwd()}/.mclaude/config.json`);
      expect(ui.info).toHaveBeenCalledWith("Global config preserved for other projects");
    });

    it("should warn when local config already exists and no force flag", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("local");

      // Act
      await migrationManager.migrateConfig({});

      // Assert
      expect(configManager.migrateToLocal).not.toHaveBeenCalled();
      expect(ui.coloredWarning).toHaveBeenCalledWith("Local project configuration already exists");
      expect(ui.info).toHaveBeenCalledWith("Use --force to overwrite and migrate again");
    });

    it("should migrate when local config exists but force flag is set", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("local");
      configManager.migrateToLocal.mockResolvedValue();
      const options: MigrationOptions = { force: true };

      // Act
      await migrationManager.migrateConfig(options);

      // Assert
      expect(configManager.migrateToLocal).toHaveBeenCalledTimes(1);
      expect(ui.success).toHaveBeenCalledWith("✓ Configuration migrated to local project");
    });

    it("should handle migration errors gracefully", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("global");
      configManager.migrateToLocal.mockRejectedValue(new Error("Migration failed"));

      // Act
      await migrationManager.migrateConfig({});

      // Assert
      expect(ui.error).toHaveBeenCalledWith("Failed to migrate configuration: Migration failed");
      expect(ui.success).not.toHaveBeenCalled();
    });
  });

  describe("promptForMigrationOnLocalInit", () => {
    beforeEach(() => {
      // Set up config property for each test
      Object.defineProperty(configManager, 'config', {
        value: { configVersion: 2 } as AppConfig,
        writable: true,
        enumerable: true,
      });
    });

    it("should not prompt when no global providers have API keys", async () => {
      // Arrange
      configManager.getAtomicProviderState.mockReturnValue({
        synthetic: { hasApiKey: false, enabled: false, available: false },
        minimax: { hasApiKey: false, enabled: false, available: false },
      });

      // Act
      const result = await migrationManager.promptForMigrationOnLocalInit();

      // Assert
      expect(result).toBe(false);
      expect(ui.confirm).not.toHaveBeenCalled();
      expect(configManager.migrateToLocal).not.toHaveBeenCalled();
    });

    it("should prompt and migrate when user agrees", async () => {
      // Arrange
      configManager.getAtomicProviderState.mockReturnValue({
        synthetic: { hasApiKey: true, enabled: true, available: true },
        minimax: { hasApiKey: false, enabled: false, available: false },
      });
      ui.confirm.mockResolvedValue(true);
      configManager.migrateToLocal.mockResolvedValue();

      // Act
      const result = await migrationManager.promptForMigrationOnLocalInit();

      // Assert
      expect(result).toBe(true);
      expect(ui.confirm).toHaveBeenCalledWith(
        "Migrate existing global configuration to local project?",
        true,
      );
      expect(configManager.migrateToLocal).toHaveBeenCalledTimes(1);
      expect(ui.success).toHaveBeenCalledWith(
        "✓ Global configuration migrated to local project",
      );
    });

    it("should prompt but not migrate when user declines", async () => {
      // Arrange
      configManager.getAtomicProviderState.mockReturnValue({
        synthetic: { hasApiKey: false, enabled: false, available: false },
        minimax: { hasApiKey: true, enabled: true, available: true },
      });
      ui.confirm.mockResolvedValue(false);

      // Act
      const result = await migrationManager.promptForMigrationOnLocalInit();

      // Assert
      expect(result).toBe(false);
      expect(configManager.migrateToLocal).not.toHaveBeenCalled();
      expect(ui.success).not.toHaveBeenCalled();
    });

    it("should handle prompt migration errors gracefully", async () => {
      // Arrange
      configManager.getAtomicProviderState.mockReturnValue({
        synthetic: { hasApiKey: true, enabled: true, available: true },
        minimax: { hasApiKey: false, enabled: false, available: false },
      });
      ui.confirm.mockResolvedValue(true);
      configManager.migrateToLocal.mockRejectedValue(new Error("Prompt migration failed"));

      // Act
      const result = await migrationManager.promptForMigrationOnLocalInit();

      // Assert
      expect(result).toBe(false);
      expect(ui.error).toHaveBeenCalledWith("Migration failed: Prompt migration failed");
      expect(ui.success).not.toHaveBeenCalled();
    });
  });

  describe("needsLegacyMigration", () => {
    it("should return true for config without version", () => {
      // Arrange & Act
      const result = migrationManager.needsLegacyMigration({});

      // Assert
      expect(result).toBe(true);
    });

    it("should return true for config with version < 2", () => {
      // Arrange & Act
      const result = migrationManager.needsLegacyMigration({ configVersion: 1 });

      // Assert
      expect(result).toBe(true);
    });

    it("should return false for config with version >= 2", () => {
      // Arrange & Act
      const result = migrationManager.needsLegacyMigration({ configVersion: 2 });

      // Assert
      expect(result).toBe(false);
    });

    it("should return false for config with version > 2", () => {
      // Arrange & Act
      const result = migrationManager.needsLegacyMigration({ configVersion: 3 });

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("migrateRecommendedModelsToSelected", () => {
    beforeEach(() => {
      configManager.saveConfig = jest.fn().mockResolvedValue(undefined);
    });

    it("should migrate recommended models to selected when conditions are met", async () => {
      // Arrange
      const config: AppConfig = {
        recommendedModels: {
          default: { primary: "synthetic:deepseek-v3", backup: "minimax:m2" },
          thinking: { primary: "synthetic:thinking", backup: "minimax:thinking" },
          smallFast: { primary: "synthetic:fast", backup: "minimax:fast" },
          subagent: { primary: "synthetic:sub", backup: "minimax:sub" },
        },
        selectedModel: "",
        selectedThinkingModel: "",
        firstRunCompleted: true,
        configVersion: 2,
        providers: { 
          synthetic: { 
            apiKey: "test-key",
            baseUrl: "https://api.synthetic.new",
            anthropicBaseUrl: "https://api.synthetic.new/anthropic",
            modelsApiUrl: "https://api.synthetic.new/openai/v1/models",
            enabled: true 
          }, 
          minimax: {
            apiKey: "test-key",
            baseUrl: "https://api.minimax.chat",
            anthropicBaseUrl: "https://api.minimax.chat/v1/anthropic",
            modelsApiUrl: "https://api.minimax.chat/v1/models",
            defaultModel: "model1",
            parallelToolCalls: true,
            streaming: true,
            memoryCompact: false,
            enabled: true
          }
        },
        defaultProvider: "synthetic",
        cacheDurationHours: 24,
        envOverrides: {},
        tokenUsage: { totalInputTokens: 0, totalOutputTokens: 0, sessionTokens: 0, history: [] },
        responseCache: { enabled: false, ttlMinutes: 60, maxEntries: 100 },
        tensorzero: { enabled: false, port: 9313, host: "0.0.0.0", timeout: 300000 },
        liteLLM: { enabled: false, port: 9313, host: "127.0.0.1", timeout: 300000 },
      };

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      // Act
      await migrationManager.migrateRecommendedModelsToSelected(config);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith("Migrating recommended models to selected model fields...");
      expect(config.selectedModel).toBe("synthetic:deepseek-v3");
      expect(config.selectedThinkingModel).toBe("synthetic:thinking");
      expect(configManager.saveConfig).toHaveBeenCalledWith(config);
      
      consoleLogSpy.mockRestore();
    });

    it("should not migrate when no recommended models exist", async () => {
      // Arrange - create config WITHOUT recommendedModels property
      const config: any = {
        selectedModel: "",
        selectedThinkingModel: "",
        firstRunCompleted: true,
        configVersion: 2,
        providers: { 
          synthetic: { 
            apiKey: "test-key",
            baseUrl: "https://api.synthetic.new",
            anthropicBaseUrl: "https://api.synthetic.new/anthropic",
            modelsApiUrl: "https://api.synthetic.new/openai/v1/models",
            enabled: true 
          }, 
          minimax: {
            apiKey: "test-key",
            baseUrl: "https://api.minimax.chat",
            anthropicBaseUrl: "https://api.minimax.chat/v1/anthropic",
            modelsApiUrl: "https://api.minimax.chat/v1/models",
            defaultModel: "model1",
            parallelToolCalls: true,
            streaming: true,
            memoryCompact: false,
            enabled: true
          }
        },
        defaultProvider: "synthetic",
        cacheDurationHours: 24,
        envOverrides: {},
        tokenUsage: { totalInputTokens: 0, totalOutputTokens: 0, sessionTokens: 0, history: [] },
        responseCache: { enabled: false, ttlMinutes: 60, maxEntries: 100 },
        tensorzero: { enabled: false, port: 9313, host: "0.0.0.0", timeout: 300000 },
        liteLLM: { enabled: false, port: 9313, host: "127.0.0.1", timeout: 300000 }
      };

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      // Act
      await migrationManager.migrateRecommendedModelsToSelected(config);

      // Assert
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(configManager.saveConfig).not.toHaveBeenCalled();
      
      consoleLogSpy.mockRestore();
    });

    it("should not migrate when selected model already exists", async () => {
      // Arrange
      const config: AppConfig = {
        recommendedModels: {
          default: { primary: "synthetic:deepseek-v3", backup: "minimax:m2" },
          thinking: { primary: "synthetic:thinking", backup: "minimax:thinking" },
          smallFast: { primary: "synthetic:fast", backup: "minimax:fast" },
          subagent: { primary: "synthetic:sub", backup: "minimax:sub" },
        },
        selectedModel: "existing:model",
        selectedThinkingModel: "",
        firstRunCompleted: true,
        configVersion: 2,
        providers: { 
          synthetic: { 
            apiKey: "test-key",
            baseUrl: "https://api.synthetic.new",
            anthropicBaseUrl: "https://api.synthetic.new/anthropic",
            modelsApiUrl: "https://api.synthetic.new/openai/v1/models",
            enabled: true 
          }, 
          minimax: {
            apiKey: "test-key",
            baseUrl: "https://api.minimax.chat",
            anthropicBaseUrl: "https://api.minimax.chat/v1/anthropic",
            modelsApiUrl: "https://api.minimax.chat/v1/models",
            defaultModel: "model1",
            parallelToolCalls: true,
            streaming: true,
            memoryCompact: false,
            enabled: true
          }
        },
        defaultProvider: "synthetic",
        cacheDurationHours: 24,
        envOverrides: {},
        tokenUsage: { totalInputTokens: 0, totalOutputTokens: 0, sessionTokens: 0, history: [] },
        responseCache: { enabled: false, ttlMinutes: 60, maxEntries: 100 },
        tensorzero: { enabled: false, port: 9313, host: "0.0.0.0", timeout: 300000 },
        liteLLM: { enabled: false, port: 9313, host: "127.0.0.1", timeout: 300000 },
      };

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      // Act
      await migrationManager.migrateRecommendedModelsToSelected(config);

      // Assert
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(configManager.saveConfig).not.toHaveBeenCalled();
      
      consoleLogSpy.mockRestore();
    });

    it("should not migrate when first run is not completed", async () => {
      // Arrange
      const config: AppConfig = {
        recommendedModels: {
          default: { primary: "synthetic:deepseek-v3", backup: "minimax:m2" },
          smallFast: { primary: "", backup: "" },
          thinking: { primary: "", backup: "" },
          subagent: { primary: "", backup: "" },
        },
        selectedModel: "",
        selectedThinkingModel: "",
        firstRunCompleted: false,
        configVersion: 2,
        providers: { 
          synthetic: { 
            apiKey: "test-key",
            baseUrl: "https://api.synthetic.new",
            anthropicBaseUrl: "https://api.synthetic.new/anthropic",
            modelsApiUrl: "https://api.synthetic.new/openai/v1/models",
            enabled: true 
          }, 
          minimax: {
            apiKey: "test-key",
            baseUrl: "https://api.minimax.chat",
            anthropicBaseUrl: "https://api.minimax.chat/v1/anthropic",
            modelsApiUrl: "https://api.minimax.chat/v1/models",
            defaultModel: "model1",
            parallelToolCalls: true,
            streaming: true,
            memoryCompact: false,
            enabled: true
          }
        },
        defaultProvider: "synthetic",
        cacheDurationHours: 24,
        envOverrides: {},
        tokenUsage: { totalInputTokens: 0, totalOutputTokens: 0, sessionTokens: 0, history: [] },
        responseCache: { enabled: false, ttlMinutes: 60, maxEntries: 100 },
        tensorzero: { enabled: false, port: 9313, host: "0.0.0.0", timeout: 300000 },
        liteLLM: { enabled: false, port: 9313, host: "127.0.0.1", timeout: 300000 },
      };

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      // Act
      await migrationManager.migrateRecommendedModelsToSelected(config);

      // Assert
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(configManager.saveConfig).not.toHaveBeenCalled();
      
      consoleLogSpy.mockRestore();
    });
  });

  describe("getMigrationStatus", () => {
    it("should return correct status for legacy config", () => {
      // Arrange
      configManager.config = { firstRunCompleted: false } as AppConfig;

      // Act
      const status = migrationManager.getMigrationStatus();

      // Assert
      expect(status).toEqual({
        configVersion: 1,
        supportsMultiProvider: false,
        needsSelectedModelMigration: false,
        isLegacyFormat: true,
      });
    });

    it("should return correct status for modern config", () => {
      // Arrange
      configManager.config = {
        configVersion: 2,
        recommendedModels: {
          default: { primary: "model1", backup: "model2" },
          thinking: { primary: "model3", backup: "model4" },
          smallFast: { primary: "model5", backup: "model6" },
          subagent: { primary: "model7", backup: "model8" },
        },
        selectedModel: "",
        selectedThinkingModel: "",
        firstRunCompleted: true,
      } as AppConfig;

      // Act
      const status = migrationManager.getMigrationStatus();

      // Assert
      expect(status).toEqual({
        configVersion: 2,
        supportsMultiProvider: true,
        needsSelectedModelMigration: true,
        isLegacyFormat: false,
      });
    });

    it("should return correct status for future version", () => {
      // Arrange
      configManager.config = { configVersion: 3 } as AppConfig;

      // Act
      const status = migrationManager.getMigrationStatus();

      // Assert
      expect(status).toEqual({
        configVersion: 3,
        supportsMultiProvider: true,
        needsSelectedModelMigration: false,
        isLegacyFormat: false,
      });
    });
  });

  describe("showMigrationStatus", () => {
    it("should display migration status correctly", async () => {
      // Arrange
      configManager.config = {
        configVersion: 2,
        recommendedModels: {
          default: { primary: "model1", backup: "model2" },
          thinking: { primary: "model3", backup: "model4" },
          smallFast: { primary: "model5", backup: "model6" },
          subagent: { primary: "model7", backup: "model8" },
        },
        selectedModel: "",
        selectedThinkingModel: "",
        firstRunCompleted: true,
      } as AppConfig;

      // Act
      await migrationManager.showMigrationStatus();

      // Assert
      expect(ui.info).toHaveBeenCalledWith("Migration Status:");
      expect(ui.info).toHaveBeenCalledWith("================");
      expect(ui.info).toHaveBeenCalledWith("Config Version: 2");
      expect(ui.info).toHaveBeenCalledWith("Multi-Provider Support: Yes");
      expect(ui.info).toHaveBeenCalledWith("Legacy Format: No");
      expect(ui.coloredWarning).toHaveBeenCalledWith("⚠ Recommended models migration available");
      expect(ui.info).toHaveBeenCalledWith("Run configuration update to migrate model selections");
    });

    it("should not show warning when no migration needed", async () => {
      // Arrange
      configManager.config = {
        configVersion: 2,
        selectedModel: "existing:model",
        firstRunCompleted: true,
      } as AppConfig;

      // Act
      await migrationManager.showMigrationStatus();

      // Assert
      expect(ui.info).toHaveBeenCalledWith("Config Version: 2");
      expect(ui.info).toHaveBeenCalledWith("Multi-Provider Support: Yes");
      expect(ui.info).toHaveBeenCalledWith("Legacy Format: No");
      expect(ui.coloredWarning).not.toHaveBeenCalled();
    });
  });

  describe("initLocalConfig", () => {
    beforeEach(() => {
      Object.defineProperty(configManager, 'config', {
        value: { configVersion: 2 } as AppConfig,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    });

    it("should initialize local config successfully", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("global");
      configManager.initLocalConfig.mockResolvedValue();

      // Act
      await migrationManager.initLocalConfig();

      // Assert
      expect(configManager.initLocalConfig).toHaveBeenCalled();
      expect(ui.success).toHaveBeenCalledWith("✓ Local project configuration initialized");
      expect(ui.info).toHaveBeenCalledWith(`Config directory: ${process.cwd()}/.mclaude/`);
      expect(ui.info).toHaveBeenCalledWith("Configuration: .mclaude/config.json");
      expect(ui.info).toHaveBeenCalledWith("Local secrets: .mclaude/.env.local (git-ignored)");
    });

    it("should warn when local config already exists and not forced", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("local");
      configManager.getWorkspaceRoot.mockReturnValue("/test/workspace");

      // Act
      await migrationManager.initLocalConfig({ force: false });

      // Assert
      expect(configManager.initLocalConfig).not.toHaveBeenCalled();
      expect(ui.warning).toHaveBeenCalledWith(
        "Local project configuration already exists at: /test/workspace"
      );
      expect(ui.info).toHaveBeenCalledWith("Use --force to overwrite");
    });

    it("should overwrite when forced", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("local");
      configManager.initLocalConfig.mockResolvedValue();

      // Act
      await migrationManager.initLocalConfig({ force: true });

      // Assert
      expect(configManager.initLocalConfig).toHaveBeenCalled();
      expect(ui.success).toHaveBeenCalledWith("✓ Local project configuration initialized");
    });

    it("should handle initialization errors", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("global");
      configManager.initLocalConfig.mockRejectedValue(new Error("Permission denied"));

      // Act
      await migrationManager.initLocalConfig();

      // Assert
      expect(ui.error).toHaveBeenCalledWith(
        "Failed to initialize local configuration: Permission denied"
      );
    });
  });

  describe("switchToLocalConfig", () => {
    beforeEach(() => {
      Object.defineProperty(configManager, 'config', {
        value: { configVersion: 2 } as AppConfig,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    });

    it("should show already using local config message", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("local");
      configManager.getWorkspaceRoot.mockReturnValue("/test/workspace");

      // Act
      await migrationManager.switchToLocalConfig();

      // Assert
      expect(ui.info).toHaveBeenCalledWith("Already using local project configuration");
      expect(ui.info).toHaveBeenCalledWith("Workspace: /test/workspace");
    });

    it("should warn when no local config found", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("global");
      configManager.getWorkspaceRoot.mockReturnValue(null);

      // Act
      await migrationManager.switchToLocalConfig();

      // Assert
      expect(ui.warning).toHaveBeenCalledWith("No local project configuration found");
      expect(ui.info).toHaveBeenCalledWith("Run 'mclaude config init' to create one");
    });

    it("should switch to local config successfully", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("global");
      configManager.getWorkspaceRoot.mockReturnValue("/test/workspace");

      // Act
      await migrationManager.switchToLocalConfig();

      // Assert
      expect(ui.success).toHaveBeenCalledWith("Switched to local project configuration");
      expect(ui.info).toHaveBeenCalledWith("Workspace: /test/workspace");
    });
  });

  describe("switchToGlobalConfig", () => {
    let originalConfigManager: any;

    beforeEach(() => {
      Object.defineProperty(configManager, 'config', {
        value: { configVersion: 2 } as AppConfig,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      originalConfigManager = ConfigManager;
    });

    afterEach(() => {
      // Restore original ConfigManager if mocked
      try {
        ConfigManager.prototype.constructor = originalConfigManager;
      } catch (e) {
        // Ignore restoration errors
      }
    });

    it("should show already using global config message", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("global");

      // Act
      await migrationManager.switchToGlobalConfig();

      // Assert
      expect(ui.info).toHaveBeenCalledWith("Already using global configuration");
    });

    it("should switch to global config successfully", async () => {
      // Arrange
      configManager.getConfigType.mockReturnValue("local");
      
      // Mock the saveGlobalConfig method
      jest.spyOn(ConfigManager.prototype, 'saveGlobalConfig').mockResolvedValue(true);

      // Act
      await migrationManager.switchToGlobalConfig();

      // Assert
      expect(ui.success).toHaveBeenCalledWith("Switched to global configuration");
    });
  });
});