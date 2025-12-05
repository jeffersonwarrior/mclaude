import { LiteLLMProxy } from "./litellm-proxy";
import { ConfigManager } from "../config";
import { ProxyStartOptions, ProxyStatus } from "./types";

export class RouterManager {
  private proxy: LiteLLMProxy | null = null;
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  /**
   * Initialize and start the router if enabled
   */
  async initializeRouter(options: ProxyStartOptions = {}): Promise<ProxyStatus> {
    const config = this.configManager.config;

    // Check if router is enabled in config
    if (!config.liteLLM?.enabled) {
      console.log("[Router] LiteLLM proxy disabled in config");
      return {
        running: false,
        url: "",
        uptime: 0,
        routes: 0,
      };
    }

    if (!this.proxy) {
      this.proxy = new LiteLLMProxy(this.configManager);
    }

    console.log("[Router] Starting LiteLLM proxy...");
    const status = await this.proxy.start({
      port: options.port || config.liteLLM.port || 8000,
      host: options.host || config.liteLLM.host || "127.0.0.1",
      timeout: options.timeout || config.liteLLM.timeout || 300000,
      enabled: true,
    });

    if (status.running) {
      console.log(`[Router] ✅ LiteLLM proxy running at ${status.url}`);
      console.log(`[Router] Routes configured: ${status.routes}`);
    }

    return status;
  }

  /**
   * Stop the router
   */
  async stopRouter(): Promise<void> {
    if (this.proxy) {
      console.log("[Router] Stopping LiteLLM proxy...");
      await this.proxy.stop();
      this.proxy = null;
      console.log("[Router] ✅ LiteLLM proxy stopped");
    }
  }

  /**
   * Get router status
   */
  getRouterStatus(): ProxyStatus | null {
    return this.proxy?.getStatus() || null;
  }

  /**
   * Check if router is running
   */
  isRouterRunning(): boolean {
    return !!(this.proxy?.isEnabled() && this.proxy.getStatus().running);
  }

  /**
   * Get proxy URL
   */
  getProxyUrl(): string | null {
    const status = this.getRouterStatus();
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
  if (!routerManagerInstance && configManager) {
    routerManagerInstance = new RouterManager(configManager);
  }
  return routerManagerInstance!;
}

export function resetRouterManager(): void {
  routerManagerInstance = null;
}
