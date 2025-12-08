import { ConfigManager } from "../../config";
import { UserInterface } from "../../ui";
import { RouterManager } from "../../router/manager";
import { SystemManager } from "./system-manager";

describe("SystemManager", () => {
  let mockConfigManager: jest.Mocked<ConfigManager>;
  let mockUI: jest.Mocked<UserInterface>;
  let mockRouterManager: jest.Mocked<RouterManager>;
  let systemManager: SystemManager;

  beforeEach(() => {
    mockConfigManager = {
      loadConfig: jest.fn().mockResolvedValue({}),
      config: { configVersion: 2, providers: {}, defaultProvider: "" } as any,
      needsUpdateCheck: jest.fn().mockReturnValue(false),
      hasApiKey: jest.fn().mockReturnValue(true),
    } as any;

    mockUI = {
      info: jest.fn(),
      error: jest.fn(),
      coloredSuccess: jest.fn(),
      coloredInfo: jest.fn(),
      coloredWarning: jest.fn(),
      showStatus: jest.fn(),
    } as any;

    mockRouterManager = {
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      status: jest.fn().mockResolvedValue({ running: false, port: 9313 }),
      updateModels: jest.fn().mockResolvedValue(undefined),
    } as any;

    systemManager = new SystemManager(mockConfigManager, mockUI, mockRouterManager);
  });

  describe("performSilentUpdate", () => {
    it("should perform silent update without errors", async () => {
      // Act & Assert - should not throw
      await expect(systemManager.performSilentUpdate()).resolves.not.toThrow();
    });
  });

  describe("checkSystemHealth", () => {
    it("should check system health", async () => {
      // Act & Assert - should not throw
      await expect(systemManager.doctor()).resolves.not.toThrow();
    });
  });
});
