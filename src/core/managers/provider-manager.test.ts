import { ProviderManager } from "./provider-manager";
import { ConfigManager } from "../../config";
import { UserInterface } from "../../ui";
import { SyntheticProviderConfig, MinimaxProviderConfig, Provider } from "../../config/types";

describe("ProviderManager", () => {
  let providerManager: ProviderManager;
  let mockConfigManager: jest.Mocked<ConfigManager>;
  let mockUI: jest.Mocked<UserInterface>;
  let mockRouterManager: jest.Mocked<any>;
  let mockModelManager: jest.Mocked<any>;

  beforeEach(() => {
    mockConfigManager = {
      config: {
        synthetic: {
          baseUrl: "https://api.syntheticai.com",
          apiKey: "test-key",
        },
        minimax: {
          apiKey: "test-key",
          baseUrl: "https://api.minimax.chat",
        },
        cacheDurationHours: 24,
      },
      getProviderConfig: jest.fn((provider: string) => {
        if (provider === "synthetic") {
          return {
            enabled: true,
            apiKey: "some-api-key-for-synthetic-1234",
            baseUrl: "https://test.com",
            timeout: 10000,
            anthropicBaseUrl: "url",
            modelsApiUrl: "url",
            responseFormat: "text",
            streaming: true,
            parallelToolCalls: true,
            defaultModel: "model",
            memoryCompact: false
          };
        }
        if (provider === "minimax") {
          return {
            enabled: false,
            apiKey: "some-api-key-for-minimax-5678",
            groupId: "some-group-id",
            baseUrl: "https://test.com",
            timeout: 10000,
            anthropicBaseUrl: "url",
            modelsApiUrl: "url",
            responseFormat: "text",
            streaming: true,
            parallelToolCalls: true,
            defaultModel: "model",
            memoryCompact: false
          };
        }
        return null;
      }),
      updateProviderConfig: jest.fn(),
      hasValidCredentials: jest.fn().mockReturnValue(true),
      hasSyntheticApiKey: jest.fn().mockReturnValue(true),
      hasMinimaxApiKey: jest.fn().mockReturnValue(true),
      setDefaultProvider: jest.fn(),
      setProviderEnabled: jest.fn().mockResolvedValue(true),
      isProviderEnabled: jest.fn().mockReturnValue(true),
      getDefaultProvider: jest.fn().mockReturnValue("synthetic"),
      getAtomicProviderState: jest.fn().mockReturnValue({
        synthetic: { enabled: true, hasApiKey: true, available: true },
        minimax: { enabled: false, hasApiKey: false, available: false }
      }),
      getMinimaxApiKey: jest.fn(),
      setConfig: jest.fn(),
    } as any;

    mockUI = {
      info: jest.fn(),
      warning: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      coloredSuccess: jest.fn(),
      table: jest.fn(),
      confirm: jest.fn(),
      showStatus: jest.fn(),
    } as any;

    mockRouterManager = {
      initializeRouter: jest.fn().mockResolvedValue({ running: true, url: "http://localhost:9313", uptime: 100, routes: 2 }),
    } as any;

    mockModelManager = {
      getModelsByProvider: jest.fn().mockResolvedValue([]),
      fetchModels: jest.fn().mockResolvedValue([]),
      getModelById: jest.fn().mockResolvedValue(null),
    };

    providerManager = new ProviderManager(
      mockConfigManager,
      mockUI,
      mockRouterManager,
      mockModelManager,
    );
  });

  describe("listProviders", () => {
    it("should list all providers and their status", async () => {
      mockConfigManager.isProviderEnabled.mockImplementation((provider: string) => {
        if (provider === "synthetic") return true;
        if (provider === "minimax") return false;
        return true; // auto
      });
      mockConfigManager.hasSyntheticApiKey = jest.fn().mockReturnValue(true);
      mockConfigManager.hasMinimaxApiKey = jest.fn().mockReturnValue(false);
      mockConfigManager.getProviderConfig.mockReturnValue(null);
      mockConfigManager.getDefaultProvider.mockReturnValue("synthetic");

      await providerManager.listProviders();

      expect(mockUI.info).toHaveBeenCalledWith("Available Providers:");
      expect(mockUI.info).toHaveBeenCalledWith("====================");
      expect(mockUI.info).toHaveBeenCalledWith("synthetic   ✓ Enabled    API: ✓");
      expect(mockUI.info).toHaveBeenCalledWith("minimax     ✗ Disabled   API: ✗");
      expect(mockUI.info).toHaveBeenCalledWith("auto        ✓ Enabled    API: ✓");
      expect(mockUI.info).toHaveBeenCalledWith("\nDefault Provider: synthetic");
    });

    it("should show base URL and group ID if available", async () => {
      mockConfigManager.isProviderEnabled.mockReturnValue(true);
      mockConfigManager.hasSyntheticApiKey = jest.fn().mockReturnValue(true);
      mockConfigManager.hasMinimaxApiKey = jest.fn().mockReturnValue(true);
      mockConfigManager.getProviderConfig.mockImplementation((provider: string) => {
        if (provider === "synthetic") return {
          enabled: true, apiKey: "key", baseUrl: "https://synth.ai", anthropicBaseUrl: "url", modelsApiUrl: "url", defaultModel: "model", parallelToolCalls: true, streaming: true, memoryCompact: false, responseFormat: "text"
        };
        if (provider === "minimax") return {
          enabled: false, groupId: "12345", apiKey: "key", baseUrl: "https://minimax.ai", anthropicBaseUrl: "url", modelsApiUrl: "url", defaultModel: "model", parallelToolCalls: true, streaming: true, memoryCompact: false, responseFormat: "text"
        };
        return {
          enabled: false, apiKey: "", baseUrl: "", anthropicBaseUrl: "", modelsApiUrl: "", defaultModel: "", parallelToolCalls: false, streaming: false, memoryCompact: false, responseFormat: "text"
        };
      });
      mockConfigManager.getDefaultProvider.mockReturnValue("synthetic");

      await providerManager.listProviders();

      expect(mockUI.info).toHaveBeenCalledWith("  Base URL: https://synth.ai");
      expect(mockUI.info).toHaveBeenCalledWith("  Group ID: 12345");
    });
  });

  describe("enableProvider", () => {
    it("should enable a provider successfully", async () => {
      mockConfigManager.setProviderEnabled.mockResolvedValue(true);
      mockConfigManager.hasSyntheticApiKey.mockReturnValue(true);

      await providerManager.enableProvider("synthetic");

      expect(mockConfigManager.setProviderEnabled).toHaveBeenCalledWith("synthetic", true);
      expect(mockUI.success).toHaveBeenCalledWith('Provider "synthetic" has been enabled');
    });

    it("should warn if API key is not configured for synthetic", async () => {
      mockConfigManager.setProviderEnabled.mockResolvedValue(true);
      mockConfigManager.hasSyntheticApiKey.mockReturnValue(false);

      await providerManager.enableProvider("synthetic");

      expect(mockUI.warning).toHaveBeenCalledWith('Note: "synthetic" provider is enabled but no API key is configured');
      expect(mockUI.info).toHaveBeenCalledWith('Set API key with: mclaude config set synthetic.apiKey <your-key>');
    });

    it("should warn if API key is not configured for minimax", async () => {
      mockConfigManager.setProviderEnabled.mockResolvedValue(true);
      mockConfigManager.hasSyntheticApiKey = jest.fn().mockReturnValue(true); // synthetic has key
      mockConfigManager.hasMinimaxApiKey.mockReturnValueOnce(false);

      await providerManager.enableProvider("minimax");

      expect(mockUI.warning).toHaveBeenCalledWith('Note: "minimax" provider is enabled but no API key is configured');
      expect(mockUI.info).toHaveBeenCalledWith('Set API key with: mclaude config set minimax.apiKey <your-key>');
    });

    it("should display an error for invalid provider", async () => {
      await providerManager.enableProvider("invalid-provider");

      expect(mockUI.error).toHaveBeenCalledWith("Invalid provider: invalid-provider. Valid providers: synthetic, minimax, auto");
      expect(mockConfigManager.setProviderEnabled).not.toHaveBeenCalled();
    });

    it("should display an error if enabling fails", async () => {
      mockConfigManager.setProviderEnabled.mockResolvedValue(false);

      await providerManager.enableProvider("synthetic");

      expect(mockUI.error).toHaveBeenCalledWith('Failed to enable provider "synthetic"');
    });
  });

  describe("disableProvider", () => {
    it("should disable a provider successfully", async () => {
      mockConfigManager.setProviderEnabled.mockResolvedValue(true);

      await providerManager.disableProvider("minimax");

      expect(mockConfigManager.setProviderEnabled).toHaveBeenCalledWith("minimax", false);
      expect(mockUI.success).toHaveBeenCalledWith('Provider "minimax" has been disabled');
    });

    it("should display an error for invalid provider", async () => {
      await providerManager.disableProvider("invalid-provider");

      expect(mockUI.error).toHaveBeenCalledWith("Invalid provider: invalid-provider. Valid providers: synthetic, minimax, auto");
      expect(mockConfigManager.setProviderEnabled).not.toHaveBeenCalled();
    });

    it("should display an error if disabling fails", async () => {
      mockConfigManager.setProviderEnabled.mockResolvedValue(false);

      await providerManager.disableProvider("synthetic");

      expect(mockUI.error).toHaveBeenCalledWith('Failed to disable provider "synthetic"');
    });
  });

  describe("setDefaultProvider", () => {
    it("should set the default provider successfully", async () => {
      mockConfigManager.setDefaultProvider.mockResolvedValue(true);

      await providerManager.setDefaultProvider("minimax");

      expect(mockConfigManager.setDefaultProvider).toHaveBeenCalledWith("minimax");
      expect(mockUI.success).toHaveBeenCalledWith('Default provider set to "minimax"');
    });

    it("should display an error for invalid provider", async () => {
      await providerManager.setDefaultProvider("invalid-provider");

      expect(mockUI.error).toHaveBeenCalledWith("Invalid provider: invalid-provider. Valid providers: synthetic, minimax, auto");
      expect(mockConfigManager.setDefaultProvider).not.toHaveBeenCalled();
    });

    it("should display an error if setting default provider fails", async () => {
      mockConfigManager.setDefaultProvider.mockResolvedValue(false);

      await providerManager.setDefaultProvider("synthetic");

      expect(mockUI.error).toHaveBeenCalledWith('Failed to set default provider "synthetic"');
    });
  });

  describe("providerStatus", () => {
    it("should show status for all providers if no specific provider is given", async () => {
      mockConfigManager.isProviderEnabled.mockImplementation((p) => p === "synthetic");
      mockConfigManager.hasSyntheticApiKey = jest.fn().mockReturnValue(true);
      mockConfigManager.hasMinimaxApiKey = jest.fn().mockReturnValue(false);
      mockConfigManager.getProviderConfig.mockImplementation((p: string) => (p === "synthetic" ? {
        enabled: true, apiKey: "key", baseUrl: "url", anthropicBaseUrl: "url", modelsApiUrl: "url",
        responseFormat: "text", timeout: 300000, streaming: true, parallelToolCalls: true, defaultModel: "model", memoryCompact: false
      } as SyntheticProviderConfig : null));
      mockConfigManager.getDefaultProvider.mockReturnValue("synthetic");
      // Mock getModelsByProvider from mockModelManager
      mockModelManager.getModelsByProvider.mockImplementation(async (provider: Provider) => {
        if (provider === "synthetic") return [{ id: "model1" }];
        return [];
      });

      await providerManager.providerStatus({});

      expect(mockUI.info).toHaveBeenCalledWith("Provider Status:");
      expect(mockUI.info).toHaveBeenCalledWith("================");
      expect(mockUI.info).toHaveBeenCalledWith("\nSYNTHETIC:");
      expect(mockUI.info).toHaveBeenCalledWith("Enabled: Yes");
      expect(mockUI.info).toHaveBeenCalledWith("Has API Key: Yes");
      expect(mockUI.info).toHaveBeenCalledWith("Base URL: url");
      expect(mockUI.info).toHaveBeenCalledWith("Available Models: 1");
      expect(mockUI.info).toHaveBeenCalledWith("\nMINIMAX:");
      expect(mockUI.info).toHaveBeenCalledWith("Enabled: No");
      expect(mockUI.info).toHaveBeenCalledWith("Has API Key: No");
      expect(mockUI.info).toHaveBeenCalledWith("Available Models: 0");
      expect(mockUI.info).toHaveBeenCalledWith("\nAUTO:");
      expect(mockUI.info).toHaveBeenCalledWith("Enabled: Yes");
      expect(mockUI.info).toHaveBeenCalledWith("Has API Key: Yes");
      expect(mockUI.info).toHaveBeenCalledWith("Available Models: 0");
      expect(mockUI.info).toHaveBeenCalledWith("\nDefault Provider: synthetic");
    });

    it("should show status for a specific provider", async () => {
      mockConfigManager.isProviderEnabled.mockReturnValue(true);
      mockConfigManager.hasSyntheticApiKey.mockReturnValue(true);
      mockConfigManager.getProviderConfig.mockReturnValue({
        enabled: true,
        apiKey: "mock-api-key",
        baseUrl: "https://mock.com",
        anthropicBaseUrl: "https://mock.com",
        modelsApiUrl: "https://mock.com",
        defaultModel: "mock-model",
        parallelToolCalls: true,
        streaming: true,
        memoryCompact: false,
        responseFormat: "text",
        timeout: 5000,
      });
      mockModelManager.getModelsByProvider.mockResolvedValueOnce([{ id: "model1" }]);

      await providerManager.providerStatus({ provider: "synthetic" });

      expect(mockUI.info).toHaveBeenCalledWith("\nSYNTHETIC:");
      expect(mockUI.info).toHaveBeenCalledWith("Enabled: Yes");
      expect(mockUI.info).toHaveBeenCalledWith("Has API Key: Yes");
      expect(mockUI.info).toHaveBeenCalledWith("Timeout: 5000ms");
      expect(mockUI.info).toHaveBeenCalledWith("Available Models: 1");
      expect(mockUI.info).not.toHaveBeenCalledWith("\nDefault Provider: synthetic");
    });

    it("should display an error for an invalid provider", async () => {
      await providerManager.providerStatus({ provider: "invalid-provider" });

      expect(mockUI.error).toHaveBeenCalledWith("Invalid provider: invalid-provider. Valid providers: synthetic, minimax, auto");
    });

    it("should handle errors when fetching models for status", async () => {
      mockConfigManager.isProviderEnabled.mockReturnValue(true);
      mockConfigManager.hasSyntheticApiKey.mockReturnValue(true);
      mockModelManager.getModelsByProvider.mockRejectedValueOnce(new Error("Network error"));

      await providerManager.providerStatus({ provider: "synthetic" });

      expect(mockUI.info).toHaveBeenCalledWith("Available Models: Could not fetch (Network error)");
    });
  });

  describe("testProvider", () => {
    it("should test a provider successfully with models found", async () => {
      mockConfigManager.isProviderEnabled.mockReturnValue(true);
      mockConfigManager.hasSyntheticApiKey.mockReturnValue(true);
      mockModelManager.getModelsByProvider.mockResolvedValueOnce(["model1", "model2"]);

      await providerManager.testProvider("synthetic");

      expect(mockUI.info).toHaveBeenCalledWith("Testing provider: synthetic");
      expect(mockUI.success).toHaveBeenCalledWith("✓ Connected successfully");
      expect(mockUI.info).toHaveBeenCalledWith("Found 2 models");
      expect(mockUI.success).toHaveBeenCalledWith('Provider "synthetic" is fully functional');
    });

    it("should test 'auto' provider successfully", async () => {
      mockConfigManager.isProviderEnabled.mockImplementation((p) => p === "synthetic" || p === "minimax" || p === "auto");
      mockConfigManager.hasSyntheticApiKey = jest.fn().mockReturnValue(true);
      mockConfigManager.hasMinimaxApiKey = jest.fn().mockReturnValue(true);
      mockModelManager.getModelsByProvider.mockResolvedValueOnce(["synthetic-model1"]);
      mockModelManager.getModelsByProvider.mockResolvedValueOnce(["minimax-model1"]);

      await providerManager.testProvider("auto");

      expect(mockUI.info).toHaveBeenCalledWith("Testing provider: auto");
      expect(mockUI.info).toHaveBeenCalledWith("Testing synthetic endpoint...");
      expect(mockUI.success).toHaveBeenCalledWith("✓ Synthetic: 1 models");
      expect(mockUI.info).toHaveBeenCalledWith("Testing minimax endpoint...");
      expect(mockUI.success).toHaveBeenCalledWith("✓ Minimax: 1 models");
      expect(mockUI.success).toHaveBeenCalledWith('Provider "auto" is fully functional');
    });

    it("should warn if provider is disabled", async () => {
      mockConfigManager.isProviderEnabled.mockReturnValue(false);

      await providerManager.testProvider("synthetic");

      expect(mockUI.warning).toHaveBeenCalledWith('Provider "synthetic" is disabled');
      expect(mockUI.info).toHaveBeenCalledWith('Enable with: mclaude providers enable synthetic');
    });

    it("should error if no API key is configured", async () => {
      mockConfigManager.isProviderEnabled.mockReturnValue(true);
      mockConfigManager.hasSyntheticApiKey.mockReturnValue(false);
      mockConfigManager.hasMinimaxApiKey.mockReturnValue(false);

      await providerManager.testProvider("synthetic");

      expect(mockUI.error).toHaveBeenCalledWith('No API key configured for provider "synthetic"');
    });

    it("should warn if no models are available from provider", async () => {
      mockConfigManager.isProviderEnabled.mockReturnValue(true);
      mockConfigManager.hasSyntheticApiKey.mockReturnValue(true);
      mockModelManager.getModelsByProvider.mockResolvedValueOnce([]);

      await providerManager.testProvider("synthetic");

      expect(mockUI.warning).toHaveBeenCalledWith('Provider "synthetic" connected but no models available');
    });

    it("should error if connection fails", async () => {
      mockConfigManager.isProviderEnabled.mockReturnValue(true);
      mockConfigManager.hasSyntheticApiKey.mockReturnValue(true);
      mockModelManager.getModelsByProvider.mockRejectedValueOnce(new Error("Network issue"));

      await providerManager.testProvider("synthetic");

      expect(mockUI.error).toHaveBeenCalledWith('✗ Failed to connect to provider "synthetic"');
      expect(mockUI.error).toHaveBeenCalledWith("Error: Network issue");
    });

    it("should display error for invalid provider", async () => {
      await providerManager.testProvider("invalid-provider");

      expect(mockUI.error).toHaveBeenCalledWith("Invalid provider: invalid-provider. Valid providers: synthetic, minimax, auto");
    });
  });

  describe("listProviderConfigs", () => {
    it("should list all provider configurations", async () => {
      mockConfigManager.getProviderConfig.mockImplementation((provider) => {
        if (provider === "synthetic") return {
          enabled: true, apiKey: "key", baseUrl: "url", anthropicBaseUrl: "url", modelsApiUrl: "url",
          responseFormat: "text", timeout: 300000, streaming: true, parallelToolCalls: true, defaultModel: "model", memoryCompact: false
        } as SyntheticProviderConfig;
        if (provider === "minimax") return {
          enabled: false, groupId: "group", apiKey: "key", baseUrl: "url", anthropicBaseUrl: "url", modelsApiUrl: "url",
          responseFormat: "text", timeout: 300000, streaming: true, parallelToolCalls: true, defaultModel: "model", memoryCompact: false
        } as MinimaxProviderConfig;
        return null;
      });

      await providerManager.listProviderConfigs();

      expect(mockUI.info).toHaveBeenCalledWith("Provider Configurations:");
      expect(mockUI.info).toHaveBeenCalledWith("=========================");
      expect(mockUI.info).toHaveBeenCalledWith("\nsynthetic:");
      expect(mockUI.info).toHaveBeenCalledWith("  Enabled: true");
      expect(mockUI.info).toHaveBeenCalledWith("  API Key:  configured");
      expect(mockUI.info).toHaveBeenCalledWith("  Base URL: url");
      expect(mockUI.info).toHaveBeenCalledWith("\nminimax:");
      expect(mockUI.info).toHaveBeenCalledWith("  Enabled: false");
      expect(mockUI.info).toHaveBeenCalledWith("  API Key:  configured"); // It checks if config.apiKey exists, not if hasMinimaxApiKey is true here
      expect(mockUI.info).toHaveBeenCalledWith("  Group ID: group");
      expect(mockUI.info).toHaveBeenCalledWith("\nauto:");
      expect(mockUI.info).toHaveBeenCalledWith("  No configuration");
    });
  });

  describe("getProviderConfigInfo", () => {
    it("should get configuration info for a specific provider", async () => {
      mockConfigManager.getProviderConfig.mockReturnValue({
        enabled: true,
        apiKey: "some-api-key-1234",
        baseUrl: "https://test.com",
        timeout: 10000,
        anthropicBaseUrl: "https://test.com/anthropic",
        modelsApiUrl: "https://test.com/models",
        defaultModel: "default-mock-model",
        parallelToolCalls: true,
        streaming: true,
        memoryCompact: false,
        responseFormat: "json",
      } as SyntheticProviderConfig);

      await providerManager.getProviderConfigInfo("synthetic");

      expect(mockUI.info).toHaveBeenCalledWith("Configuration for synthetic:");
      expect(mockUI.info).toHaveBeenCalledWith("Enabled: true");
      expect(mockUI.info).toHaveBeenCalledWith("API Key:  configured");
      expect(mockUI.info).toHaveBeenCalledWith("API Key (preview): some-api...1234");
      expect(mockUI.info).toHaveBeenCalledWith("Base URL: https://test.com");
      expect(mockUI.info).toHaveBeenCalledWith("Timeout: 10000ms");
    });

    it("should display 'No configuration found' if config is null", async () => {
      mockConfigManager.getProviderConfig.mockReturnValue(null);

      await providerManager.getProviderConfigInfo("minimax");

      expect(mockUI.info).toHaveBeenCalledWith("Configuration for minimax:");
      expect(mockUI.info).toHaveBeenCalledWith("No configuration found");
    });
  });

  describe("setProviderConfig", () => {
    it("should set provider-specific API key for synthetic", async () => {
      await providerManager.setProviderConfig("synthetic", "apiKey", "new-synthetic-key");
      expect(mockConfigManager.setConfig).toHaveBeenCalledWith("synthetic.apiKey", "new-synthetic-key");
    });

    it("should set provider-specific base URL for synthetic", async () => {
      await providerManager.setProviderConfig("synthetic", "baseUrl", "https://new-synth.com");
      expect(mockConfigManager.setConfig).toHaveBeenCalledWith("synthetic.baseUrl", "https://new-synth.com");
    });

    it("should set provider-specific API key for minimax", async () => {
      await providerManager.setProviderConfig("minimax", "apiKey", "new-minimax-key");
      expect(mockConfigManager.setConfig).toHaveBeenCalledWith("minimax.apiKey", "new-minimax-key");
    });

    it("should set provider-specific group ID for minimax", async () => {
      await providerManager.setProviderConfig("minimax", "groupId", "new-group-id");
      expect(mockConfigManager.setConfig).toHaveBeenCalledWith("minimax.groupId", "new-group-id");
    });

    it("should handle generic keys for non-synthetic/minimax providers", async () => {
      await providerManager.setProviderConfig("auto", "someKey", "someValue");
      expect(mockConfigManager.setConfig).toHaveBeenCalledWith("someKey", "someValue");
    });

    it("should display an error for an invalid provider", async () => {
      await providerManager.setProviderConfig("invalid-provider", "key", "value");
      expect(mockUI.error).toHaveBeenCalledWith("Invalid provider: invalid-provider. Valid providers: synthetic, minimax, auto");
      expect(mockConfigManager.setConfig).not.toHaveBeenCalled();
    });
  });
});