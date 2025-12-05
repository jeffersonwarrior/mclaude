import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { join } from "path";
import { ConfigManager } from "../config";
import { LiteLLMConfig, ProxyStartOptions, ProxyStatus } from "./types";

export class LiteLLMProxy {
  private process: ChildProcessWithoutNullStreams | null = null;
  private config: LiteLLMConfig;
  private startTime: number | null = null;
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.config = this.loadConfig();
  }

  private loadConfig(): LiteLLMConfig {
    return {
      port: parseInt(process.env.LITELLM_PORT || "9313", 10),
      host: process.env.LITELLM_HOST || "127.0.0.1",
      timeout: parseInt(process.env.LITELLM_TIMEOUT || "300000", 10),
      enabled: process.env.LITELLM_ENABLED === "true",
      modelRoutes: [
        {
          pattern: "minimax:*",
          provider: "minimax",
          priority: 1,
        },
        {
          pattern: "synthetic:*",
          provider: "synthetic",
          priority: 2,
        },
      ],
    };
  }

  /**
   * Start the LiteLLM proxy server
   */
  async start(options: ProxyStartOptions = {}): Promise<ProxyStatus> {
    if (!this.config.enabled && !options.enabled) {
      return {
        running: false,
        url: "",
        uptime: 0,
        routes: 0,
      };
    }

    // Ensure LiteLLM is installed
    await this.ensureLiteLLMInstalled();

    if (this.process) {
      return {
        running: true,
        url: `http://${this.config.host}:${this.config.port}`,
        uptime: Date.now() - (this.startTime || Date.now()),
        routes: this.config.modelRoutes.length,
      };
    }

    const port = options.port || this.config.port;
    const host = options.host || this.config.host;
    const timeout = options.timeout || this.config.timeout;

    const configData = this.buildLiteLLMConfig();

    // Write config to temp file
    const os = require("os");
    const fs = require("fs");
    const configPath = join(os.tmpdir(), `litellm-config-${Date.now()}.yaml`);
    fs.writeFileSync(configPath, configData);

    try {
      // Start litellm proxy with the config file
      this.process = spawn("npx", ["litellm", "--config", configPath], {
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      }) as unknown as ChildProcessWithoutNullStreams;

      this.startTime = Date.now();

      this.process.stdout.on("data", (data: Buffer) => {
        console.log(`[LiteLLM] ${data.toString().trim()}`);
      });

      this.process.stderr.on("data", (data: Buffer) => {
        console.error(`[LiteLLM Error] ${data.toString().trim()}`);
      });

      this.process.on("exit", (code) => {
        console.log(`[LiteLLM] Process exited with code ${code}`);
        this.cleanup();
      });

      // Wait for server to be ready
      await this.waitForServer(host, port, timeout);

      // Clean up temp config file
      fs.unlinkSync(configPath);

      return {
        running: true,
        url: `http://${host}:${port}`,
        uptime: Date.now() - this.startTime,
        routes: this.config.modelRoutes.length,
      };
    } catch (error) {
      console.error("Failed to start LiteLLM proxy:", error);
      this.cleanup();
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
      throw error;
    }
  }

  /**
   * Stop the LiteLLM proxy server
   */
  async stop(): Promise<void> {
    this.cleanup();
  }

  /**
   * Get the proxy status
   */
  getStatus(): ProxyStatus {
    return {
      running: this.process !== null,
      url: this.process
        ? `http://${this.config.host}:${this.config.port}`
        : "",
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      routes: this.config.modelRoutes.length,
    };
  }

  /**
   * Check if proxy is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Ensure LiteLLM Python package is installed
   */
  private async ensureLiteLLMInstalled(): Promise<void> {
    try {
      const { execSync } = require("child_process");
      execSync("python3 -m litellm --version", { stdio: "ignore" });
      console.log("[LiteLLM] Python package verified");
    } catch (error) {
      console.log("[LiteLLM] Installing Python package...");
      try {
        const { execSync } = require("child_process");
        execSync("python3 -m pip install litellm --quiet --break-system-packages", {
          stdio: "inherit",
        });
        console.log("[LiteLLM] ✅ Python package installed");
      } catch (installError) {
        throw new Error(
          "LiteLLM Python package not found. Install with: pip install litellm",
        );
      }
    }
  }

  /**
   * Build LiteLLM configuration YAML
   */
  private buildLiteLLMConfig(): string {
    const modelConfigs = this.config.modelRoutes.map((route) => {
      let apiKey = "";
      let apiBase = "";

      if (route.provider === "minimax") {
        const minimaxConfig = this.configManager.getProviderConfig("minimax");
        try {
          apiKey = this.configManager.getEffectiveApiKey("minimax") || "";
          apiBase = minimaxConfig?.anthropicBaseUrl || "https://api.minimax.io/anthropic";
        } catch (error) {
          console.warn(`Failed to get MiniMax config: ${error}`);
        }
      } else {
        const syntheticConfig = this.configManager.getProviderConfig("synthetic");
        try {
          apiKey = this.configManager.getEffectiveApiKey("synthetic") || "";
          apiBase = syntheticConfig?.anthropicBaseUrl || "https://api.synthetic.new/anthropic";
        } catch (error) {
          console.warn(`Failed to get Synthetic config: ${error}`);
        }
      }

      return `  - model_name: "${route.pattern}"
    litellm_params:
      model: "openai/${route.provider}"
      api_base: "${apiBase}"
      api_key: "${apiKey}"`;
    });

    return `model_list:
${modelConfigs.join("\n")}

general_settings:
  master_key: "sk-litellm"
  database_url: "sqlite:///litellm.db"
`;
  }

  /**
   * Wait for server to be ready
   */
  private async waitForServer(
    host: string,
    port: number,
    timeoutMs: number,
  ): Promise<void> {
    const startTime = Date.now();
    const http = require("http");

    while (Date.now() - startTime < timeoutMs) {
      try {
        await new Promise<void>((resolve) => {
          const req = http.get(`http://${host}:${port}/health`, () => {
            resolve();
          });
          req.on("error", () => {
            // Ignore connection errors
          });
          req.setTimeout(1000);
        });
        console.log(`[LiteLLM] Proxy server is ready at http://${host}:${port}`);
        return;
      } catch (error) {
        // Server not ready yet, wait and retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error(`LiteLLM proxy server failed to start within ${timeoutMs}ms`);
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.startTime = null;
    }
  }
}
