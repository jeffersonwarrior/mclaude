import { ConfigCliManager } from "./config-cli-manager";
import { ConfigManager } from "../../config";
import { UserInterface } from "../../ui";

describe("ConfigCliManager", () => {
  let configCliManager: ConfigCliManager;
  let mockConfigManager: jest.Mocked<ConfigManager>;
  let mockUI: jest.Mocked<UserInterface>;

  beforeEach(() => {
    mockConfigManager = {
      config: {
        defaultProvider: "auto",
        selectedModel: "claude-3-5-sonnet",
        selectedThinkingModel: "claude-3-opus",
        cacheDurationHours: 24,
        providers: {
          synthetic: {
            enabled: true,
            baseUrl: "synth-url",
            groupId: "",
            anthropicBaseUrl: "synth-url/anthropic",
            modelsApiUrl: "synth-url/openai/v1/models",
            memoryCompact: false,
            parallelToolCalls: true,
            streaming: true,
            defaultModel: "",
          },
          minimax: {
            enabled: false,
            apiKey: "",
            baseUrl: "mini-url",
            groupId: "",
            anthropicBaseUrl: "mini-url/anthropic",
            modelsApiUrl: "mini-url/v1/models",
            memoryCompact: false,
            parallelToolCalls: true,
            streaming: true,
            defaultModel: "",
          },
        },
        firstRunCompleted: true,
      },
      resetConfig: jest.fn(),
      setSavedModel: jest.fn(),
      setSavedThinkingModel: jest.fn(),
      setCacheDuration: jest.fn(),
      setDefaultProvider: jest.fn(),
      getModelCombinations: jest.fn().mockReturnValue([]),
      saveModelCombination: jest.fn(),
      deleteModelCombination: jest.fn(),
      resetTokenUsage: jest.fn(),
      setProviderConfig: jest.fn(),
    } as any;

    mockUI = {
      info: jest.fn(),
      coloredSuccess: jest.fn(),
      error: jest.fn(),
      table: jest.fn(),
      confirm: jest.fn(),
      coloredInfo: jest.fn(),
      success: jest.fn(), // Added mock for success
    } as any;

    configCliManager = new ConfigCliManager(mockConfigManager, mockUI);
  });

  describe("showConfig", () => {
    it("should display the current configuration", async () => {
      await configCliManager.showConfig();

      expect(mockUI.info).toHaveBeenCalledWith("Current Configuration:");
      expect(mockUI.info).toHaveBeenCalledWith("========================");
      expect(mockUI.table).toHaveBeenCalledWith(
        expect.objectContaining({
          "Default Provider": "auto",
          "Selected Model": "claude-3-5-sonnet",
          "Selected Thinking Model": "claude-3-opus",
          "Cache Duration (hours)": "24",
          "Synthetic Enabled": "Yes",
          "Minimax Enabled": "No",
          "Synthetic Base URL": "synth-url",
          "Minimax Base URL": "mini-url",
          "Minimax Group ID": "None",
          "First Run Completed": "Yes",
        }),
      );
      expect(mockUI.info).toHaveBeenCalledWith(
        expect.stringContaining("Configuration is project-local"),
      );
    });
  });

  describe("setConfig", () => {
    it("should set a selectedModel", async () => {
      await configCliManager.setConfig("selectedModel", "new-model");
      expect(mockConfigManager.setSavedModel).toHaveBeenCalledWith("new-model");
      expect(mockUI.success).toHaveBeenCalledWith(
        "✓ Set selectedModel = new-model",
      );
    });

    it("should set a selectedThinkingModel", async () => {
      await configCliManager.setConfig(
        "selectedThinkingModel",
        "new-thinking-model",
      );
      expect(mockConfigManager.setSavedThinkingModel).toHaveBeenCalledWith(
        "new-thinking-model",
      );
      expect(mockUI.success).toHaveBeenCalledWith(
        "✓ Set selectedThinkingModel = new-thinking-model",
      );
    });

    it("should set cacheDurationHours", async () => {
      await configCliManager.setConfig("cacheDurationHours", "48");
      expect(mockConfigManager.setCacheDuration).toHaveBeenCalledWith(48);
      expect(mockUI.success).toHaveBeenCalledWith(
        "✓ Set cacheDurationHours = 48",
      );
    });

    it("should set defaultProvider", async () => {
      await configCliManager.setConfig("defaultProvider", "minimax");
      expect(mockConfigManager.setDefaultProvider).toHaveBeenCalledWith(
        "minimax",
      );
      expect(mockUI.success).toHaveBeenCalledWith(
        "✓ Set defaultProvider = minimax",
      );
    });

    it("should show error for invalid defaultProvider", async () => {
      await configCliManager.setConfig("defaultProvider", "invalid");
      expect(mockUI.error).toHaveBeenCalledWith(
        "Invalid provider. Use: synthetic, minimax, or auto",
      );
    });

    it("should show error for unimplemented keys", async () => {
      await configCliManager.setConfig("unimplementedKey", "value");
      expect(mockUI.error).toHaveBeenCalledWith(
        "Invalid config key: unimplementedKey",
      );
    });

    it("should show error for invalid keys", async () => {
      await configCliManager.setConfig("invalid.key", "value");
      expect(mockUI.error).toHaveBeenCalledWith(
        "Invalid config key: invalid.key",
      );
    });

    it("should set a provider config setting", async () => {
      await configCliManager.setConfig("synthetic.apiKey", "new-key");
      expect(mockConfigManager.setProviderConfig).toHaveBeenCalledWith(
        "synthetic",
        "apiKey",
        "new-key",
      );
      expect(mockUI.success).toHaveBeenCalledWith(
        "✓ Set synthetic.apiKey = new-key",
      );
    });
  });

  describe("resetConfig", () => {
    it("should reset local configuration if confirmed", async () => {
      mockUI.confirm.mockResolvedValue(true);

      await configCliManager.resetConfig({ scope: "local" });

      expect(mockUI.confirm).toHaveBeenCalledWith(
        expect.stringContaining("reset local configuration"),
        false,
      );
      expect(mockConfigManager.resetConfig).toHaveBeenCalled();
      expect(mockUI.coloredSuccess).toHaveBeenCalledWith(
        "✓ Local configuration reset to defaults",
      );
    });

    it("should cancel local reset if not confirmed", async () => {
      mockUI.confirm.mockResolvedValue(false);

      await configCliManager.resetConfig({ scope: "local" });

      expect(mockUI.info).toHaveBeenCalledWith(
        "Local configuration reset cancelled",
      );
      expect(mockConfigManager.resetConfig).not.toHaveBeenCalled();
    });

    it("should show error for invalid scope", async () => {
      await configCliManager.resetConfig({ scope: "invalid" });

      expect(mockUI.error).toHaveBeenCalledWith(
        "Invalid scope: invalid. Use 'local' or 'global'.",
      );
    });

    it("should advise manual reset for global scope", async () => {
      mockUI.confirm.mockResolvedValue(true);

      await configCliManager.resetConfig({ scope: "global" });

      expect(mockUI.error).toHaveBeenCalledWith(
        expect.stringContaining(
          "Global configuration reset is not yet fully implemented",
        ),
      );
    });
  });

  describe("showConfigContext", () => {
    it("should display information about local and global configs", async () => {
      await configCliManager.showConfigContext();

      expect(mockUI.info).toHaveBeenCalledWith("Configuration Context:");
      expect(mockUI.info).toHaveBeenCalledWith("========================");
      expect(mockUI.coloredInfo).toHaveBeenCalledWith(
        expect.stringContaining("Active config depends"),
      );
      expect(mockUI.info).toHaveBeenCalledWith(
        expect.stringContaining("Local config location"),
      );
      expect(mockUI.info).toHaveBeenCalledWith(
        expect.stringContaining("Global config location"),
      );
    });
  });
});
