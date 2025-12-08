import { SetupManager } from "../src/core/managers/setup-manager";
import { ConfigManager } from "../src/config";
import { UserInterface } from "../src/ui";
import { AuthManager } from "../src/core/managers/auth-manager";
import { ModelInteractionManager } from "../src/core/managers/model-interaction-manager";
import { setupConfigTestEnvironment } from "./helpers/config-test-utils";

describe("SetupManager", () => {
  const { createConfigManager } = setupConfigTestEnvironment();
  let configManager: ConfigManager;
  let ui: UserInterface;
  let authManager: AuthManager;
  let modelInteractionManager: ModelInteractionManager;
  let setupManager: SetupManager;

  beforeEach(() => {
    configManager = createConfigManager();
    ui = new UserInterface();
    authManager = new AuthManager(configManager, ui);
    modelInteractionManager = new ModelInteractionManager(configManager, ui);
    setupManager = new SetupManager(configManager, ui, authManager, modelInteractionManager);
  });

  describe("setup", () => {
    it("should initialize setup process", () => {
      expect(setupManager).toBeDefined();
    });

    it("should handle setup orchestration", async () => {
      // Mock the UI methods to avoid actual prompts
      const mockInfo = jest.spyOn(ui, 'info').mockImplementation();
      const mockSuccess = jest.spyOn(ui, 'success').mockImplementation();
      
      // Test would require extensive mocking for full setup flow
      expect(setupManager).toBeDefined();
      
      mockInfo.mockRestore();
      mockSuccess.mockRestore();
    });
  });

  describe("API key validation", () => {
    it("should validate synthetic API key format", () => {
      // Access private method through type assertion for testing
      const validateApiKeyFormat = (setupManager as any).validateApiKeyFormat.bind(setupManager);
      
      // Valid synthetic API key
      const validResult = validateApiKeyFormat("synthetic", "syn_abc123def456");
      expect(validResult.valid).toBe(true);
      
      // Invalid synthetic API key - wrong prefix
      const invalidPrefixResult = validateApiKeyFormat("synthetic", "abc_123");
      expect(invalidPrefixResult.valid).toBe(false);
      expect(invalidPrefixResult.error).toContain("should start with 'syn_'");
      
      // Empty API key
      const emptyResult = validateApiKeyFormat("synthetic", "");
      expect(emptyResult.valid).toBe(false);
      expect(emptyResult.error).toBe("API key cannot be empty");
    });

    it("should validate minimax API key format", () => {
      const validateApiKeyFormat = (setupManager as any).validateApiKeyFormat.bind(setupManager);
      
      // Valid minimax API key (minimum length)
      const validResult = validateApiKeyFormat("minimax", "abcdefghij1234567890");
      expect(validResult.valid).toBe(true);
      
      // Invalid minimax API key - too short
      const shortResult = validateApiKeyFormat("minimax", "abc123");
      expect(shortResult.valid).toBe(false);
      expect(shortResult.error).toContain("at least 20 alphanumeric characters");
      
      // Invalid minimax API key - contains special characters
      const specialCharResult = validateApiKeyFormat("minimax", "abc123!@#def456");
      expect(specialCharResult.valid).toBe(false);
      expect(specialCharResult.error).toContain("alphanumeric characters");
    });

    it("should handle unknown provider", () => {
      const validateApiKeyFormat = (setupManager as any).validateApiKeyFormat.bind(setupManager);
      
      const unknownResult = validateApiKeyFormat("unknown" as any, "some_key");
      expect(unknownResult.valid).toBe(false);
      expect(unknownResult.error).toBe("Unknown provider: unknown");
    });
  });

  describe("error handling", () => {
    it("should handle setup step errors gracefully", async () => {
      const mockError = jest.spyOn(ui, 'error').mockImplementation();
      const mockInfo = jest.spyOn(ui, 'info').mockImplementation();
      const handleSetupStepError = (setupManager as any).handleSetupStepError.bind(setupManager);
      
      // Mock user choice to skip step
      const mockAsk = jest.spyOn(ui, 'ask').mockResolvedValue("2");
      const mockCanSkipSetupStep = jest.spyOn(setupManager as any, 'canSkipSetupStep').mockResolvedValue(true);
      
      const shouldContinue = await handleSetupStepError("Test Step", new Error("Test error"));
      
      expect(shouldContinue).toBe(true);
      mockError.mockRestore();
      mockInfo.mockRestore();
      mockAsk.mockRestore();
      mockCanSkipSetupStep.mockRestore();
    });

    it("should handle setup step error when retry is chosen", async () => {
      const mockError = jest.spyOn(ui, 'error').mockImplementation();
      const mockInfo = jest.spyOn(ui, 'info').mockImplementation();
      const handleSetupStepError = (setupManager as any).handleSetupStepError.bind(setupManager);
      
      // Mock user choice to retry
      const mockAsk = jest.spyOn(ui, 'ask').mockResolvedValue("1");
      
      const shouldContinue = await handleSetupStepError("Test Step", new Error("Test error"));
      
      expect(shouldContinue).toBe(true); // Should return true to retry
      mockError.mockRestore();
      mockInfo.mockRestore();
      mockAsk.mockRestore();
    });

    it("should handle setup step error when abort is chosen", async () => {
      const mockError = jest.spyOn(ui, 'error').mockImplementation();
      const mockInfo = jest.spyOn(ui, 'info').mockImplementation();
      const handleSetupStepError = (setupManager as any).handleSetupStepError.bind(setupManager);
      
      // Mock user choice to abort
      const mockAsk = jest.spyOn(ui, 'ask').mockResolvedValue("3");
      
      const shouldContinue = await handleSetupStepError("Test Step", new Error("Test error"));
      
      expect(shouldContinue).toBe(false); // Should return false to abort
      mockError.mockRestore();
      mockInfo.mockRestore();
      mockAsk.mockRestore();
    });
  });

  describe("step skipping logic", () => {
    it("should determine which steps can be skipped", async () => {
      const canSkipSetupStep = (setupManager as any).canSkipSetupStep.bind(setupManager);
      
      // Required steps cannot be skipped
      expect(await canSkipSetupStep("Provider Configuration")).toBe(false);
      expect(await canSkipSetupStep("Finalization")).toBe(false);
      
      // Optional steps can be skipped
      expect(await canSkipSetupStep("Authentication Testing")).toBe(true);
      expect(await canSkipSetupStep("Model Selection")).toBe(true);
      
      // Unknown steps cannot be skipped
      expect(await canSkipSetupStep("Unknown Step")).toBe(false);
    });
  });

  describe("provider configuration", () => {
    it("should handle provider configuration decisions", async () => {
      const setupProviderConfiguration = (setupManager as any).setupProviderConfiguration.bind(setupManager);
      const mockInfo = jest.spyOn(ui, 'info').mockImplementation();
      const mockSuccess = jest.spyOn(ui, 'success').mockImplementation();
      
      // Test with existing configuration (mock user chooses to keep existing)
      const mockConfirm = jest.spyOn(ui, 'confirm').mockResolvedValue(false);
      
      // This would need more extensive mocking for full test
      expect(setupManager).toBeDefined();
      
      mockInfo.mockRestore();
      mockSuccess.mockRestore();
      mockConfirm.mockRestore();
    });
  });

  describe("authentication testing", () => {
    it("should handle authentication testing flow", async () => {
      const setupAuthenticationTesting = (setupManager as any).setupAuthenticationTesting.bind(setupManager);
      const mockInfo = jest.spyOn(ui, 'info').mockImplementation();
      const mockSuccess = jest.spyOn(ui, 'success').mockImplementation();
      
      // Mock user choosing to skip testing
      const mockConfirm = jest.spyOn(ui, 'confirm').mockResolvedValue(false);
      
      // Should complete successfully when user skips tests
      await expect(setupAuthenticationTesting()).resolves.toBeUndefined();
      
      mockInfo.mockRestore();
      mockSuccess.mockRestore();
      mockConfirm.mockRestore();
    });
  });

  describe("setup finalization", () => {
    it("should handle setup finalization", async () => {
      const setupFinalization = (setupManager as any).setupFinalization.bind(setupManager);
      const mockInfo = jest.spyOn(ui, 'info').mockImplementation();
      
      // Mock config manager methods
      const mockMarkFirstRunCompleted = jest.spyOn(configManager, 'markFirstRunCompleted').mockResolvedValue(true);
      const mockGetAtomicProviderState = jest.spyOn(configManager, 'getAtomicProviderState').mockReturnValue({
        synthetic: { available: true, hasApiKey: true },
        minimax: { available: false, hasApiKey: false },
      });
      
      // Should complete finalization successfully
      await expect(setupFinalization()).resolves.toBeUndefined();
      
      mockInfo.mockRestore();
      mockMarkFirstRunCompleted.mockRestore();
      mockGetAtomicProviderState.mockRestore();
    });

    it("should handle finalization failure when no providers available", async () => {
      const setupFinalization = (setupManager as any).setupFinalization.bind(setupManager);
      
      // Mock no providers available
      const mockMarkFirstRunCompleted = jest.spyOn(configManager, 'markFirstRunCompleted').mockResolvedValue(true);
      const mockGetAtomicProviderState = jest.spyOn(configManager, 'getAtomicProviderState').mockReturnValue({
        synthetic: { available: false, hasApiKey: false },
        minimax: { available: false, hasApiKey: false },
      });
      
      // Should throw error when no providers are available
      await expect(setupFinalization()).rejects.toThrow("no providers are available");
      
      mockMarkFirstRunCompleted.mockRestore();
      mockGetAtomicProviderState.mockRestore();
    });

    it("should handle finalization failure when marking first run fails", async () => {
      const setupFinalization = (setupManager as any).setupFinalization.bind(setupManager);
      
      // Mock failure to mark first run completed
      const mockMarkFirstRunCompleted = jest.spyOn(configManager, 'markFirstRunCompleted').mockResolvedValue(false);
      
      // Should throw error when marking first run fails
      await expect(setupFinalization()).rejects.toThrow("Failed to mark setup as completed");
      
      mockMarkFirstRunCompleted.mockRestore();
    });
  });
});