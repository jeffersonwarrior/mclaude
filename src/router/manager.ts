import { TensorZeroProxy } from "./tensorzero-proxy";
import { ConfigManager } from "../config";
import { ProxyStatus } from "./types";

export class RouterManager {
  private proxy: TensorZeroProxy | null = null;
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  /**
   * Initialize and start the router if enabled
   */
  async initializeRouter(): Promise<ProxyStatus> {
    const config = this.configManager.config;

    // Check if router is enabled in config (support both liteLLM and tensorzero for migration)
    const proxyConfig = config.tensorzero || config.liteLLM;
    if (!proxyConfig?.enabled) {
      console.log("[Router] TensorZero proxy disabled in config");
      return {
        running: false,
        url: "",
        uptime: 0,
        routes: 0,
      };
    }

    if (!this.proxy) {
      this.proxy = new TensorZeroProxy(this.configManager);
    }

    console.log("[Router] Starting TensorZero proxy...");
    const status = await this.proxy.start();

    if (status.running) {
      console.log(`[Router] ✅ TensorZero proxy running at ${status.url}`);
      console.log(`[Router] Routes configured: ${status.routes}`);
    }

    return status;
  }

  /**
   * Stop the router
   */
  async stopRouter(): Promise<void> {
    if (this.proxy) {
      console.log("[Router] Stopping TensorZero proxy...");
      await this.proxy.stop();
      this.proxy = null;
      console.log("[Router] ✅ TensorZero proxy stopped");
    }
  }

  /**
   * Get router status
   */
  async getRouterStatus(): Promise<ProxyStatus | null> {
    return this.proxy ? await this.proxy.getStatus() : null;
  }

  /**
   * Check if router is running
   */
  async isRouterRunning(): Promise<boolean> {
    const status = this.proxy ? await this.proxy.getStatus() : null;
    return !!status?.running;
  }

  /**
   * Get proxy URL
   */
  async getProxyUrl(): Promise<string | null> {
    const status = await this.getRouterStatus();
    return status?.running ? status.url : null;
  }

  /**
   * Cleanup on process exit
   */
  async cleanup(): Promise<void> {
    await this.stopRouter();
  }
}

// Singleton instance
let routerManagerInstance: RouterManager | null = null;

export function getRouterManager(configManager?: ConfigManager): RouterManager {
  if (!routerManagerInstance) {
    routerManagerInstance = new RouterManager(configManager || new ConfigManager());
  }
  return routerManagerInstance;
}

export function resetRouterManager(): void {
  routerManagerInstance = null;
}
