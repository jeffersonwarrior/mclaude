import { spawn, ChildProcess } from "child_process";
import { homedir } from "os";
import { join } from "path";
import axios from "axios";
import { CCRConfigGenerator } from "./ccr-config";

export interface CCRStatus {
  running: boolean;
  port: number;
  pid?: number;
  url?: string;
}

export class CCRManager {
  private ccrProcess: ChildProcess | null = null;
  private configGenerator: CCRConfigGenerator;
  private readonly ccrPort = 3456;
  private readonly ccrHomeDir: string;

  constructor() {
    this.ccrHomeDir = join(homedir(), ".claude-code-router");
    this.configGenerator = new CCRConfigGenerator();
  }

  /**
   * Generate CCR configuration from mclaude config
   */
  async generateConfig(): Promise<boolean> {
    try {
      await this.configGenerator.generateConfig();
      return true;
    } catch (error) {
      console.error("Failed to generate CCR configuration:", error);
      return false;
    }
  }

  /**
   * Start CCR process
   */
  async start(): Promise<boolean> {
    try {
      // First check if CCR is already running
      const status = await this.getStatus();
      if (status.running) {
        console.info("CCR is already running");
        return true;
      }

      // Generate config before starting
      const configGenerated = await this.generateConfig();
      if (!configGenerated) {
        throw new Error("Failed to generate CCR configuration");
      }

      console.info("Starting Claude Code Router...");

      // Start CCR process
      this.ccrProcess = spawn(
        "npx",
        ["@musistudio/claude-code-router", "start"],
        {
          detached: true,
          stdio: "ignore",
          env: {
            ...process.env,
            CCR_HOME: this.ccrHomeDir,
          },
        },
      );

      // Unref the process so it can run independently
      this.ccrProcess.unref();

      // Wait for CCR to be ready
      await this.waitForReady(30000); // 30 second timeout

      console.info("CCR started successfully");
      return true;
    } catch (error) {
      console.error("Failed to start CCR:", error);
      this.ccrProcess = null;
      return false;
    }
  }

  /**
   * Stop CCR process
   */
  async stop(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      if (!status.running) {
        console.info("CCR is not running");
        return true;
      }

      if (this.ccrProcess) {
        this.ccrProcess.kill();
        this.ccrProcess = null;
      }

      // Try to kill by PID if we have it
      if (status.pid) {
        try {
          process.kill(status.pid);
        } catch (killError) {
          // Process might already be dead
        }
      }

      console.info("CCR stopped");
      return true;
    } catch (error) {
      console.error("Failed to stop CCR:", error);
      return false;
    }
  }

  /**
   * Restart CCR process
   */
  async restart(): Promise<boolean> {
    try {
      await this.stop();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      return await this.start();
    } catch (error) {
      console.error("Failed to restart CCR:", error);
      return false;
    }
  }

  /**
   * Get CCR status
   */
  async getStatus(): Promise<CCRStatus> {
    try {
      const url = `http://127.0.0.1:${this.ccrPort}/health`;
      await axios.get(url, { timeout: 1000 });
      return {
        running: true,
        port: this.ccrPort,
        pid: this.ccrProcess?.pid,
        url: `http://127.0.0.1:${this.ccrPort}`,
      };
    } catch (error) {
      return {
        running: false,
        port: this.ccrPort,
      };
    }
  }

  /**
   * Check if CCR is ready to accept requests
   */
  async isReady(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      return status.running;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for CCR to be ready
   */
  async waitForReady(timeout: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    const interval = 500; // Check every 500ms

    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.getStatus();
        if (status.running) {
          return true;
        }
      } catch (error) {
        // Still not ready
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(`CCR did not become ready within ${timeout}ms`);
  }

  /**
   * Get CCR logs (if available)
   */
  async getLogs(): Promise<string> {
    try {
      // CCR doesn't expose logs via HTTP by default
      // This is a placeholder for future implementation
      return "Logs not available via API";
    } catch (error) {
      return `Failed to get logs: ${error}`;
    }
  }

  /**
   * Ensure CCR is running before launching Claude Code
   */
  async ensureRunning(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      if (status.running) {
        return true;
      }

      console.info("CCR is not running, starting it...");
      return await this.start();
    } catch (error) {
      console.error("Failed to ensure CCR is running:", error);
      return false;
    }
  }

  /**
   * Get the CCR base URL
   */
  getBaseUrl(): string {
    return `http://127.0.0.1:${this.ccrPort}`;
  }

  /**
   * Cleanup on process exit
   */
  cleanup(): void {
    if (this.ccrProcess) {
      try {
        this.ccrProcess.kill();
      } catch (error) {
        // Ignore cleanup errors
      }
      this.ccrProcess = null;
    }
  }
}

// Export singleton instance
export const ccrManager = new CCRManager();

// Handle process exit
process.on("exit", () => {
  ccrManager.cleanup();
});

process.on("SIGINT", () => {
  ccrManager.cleanup();
  process.exit();
});

process.on("SIGTERM", () => {
  ccrManager.cleanup();
  process.exit();
});
