import { ConfigManager } from "../../config";
import { getRouterManager } from "../../router/manager";
import { ProxyStatus } from "../../router/types";
import chalk from "chalk";

// Simplified console-only UI for proxy commands
class ConsoleUI {
  info(message: string): void {
    console.log(`ℹ ${message}`);
  }

  success(message: string): void {
    console.log(`✓ ${message}`);
  }

  error(message: string): void {
    console.error(chalk.red(`❌ ${message}`));
  }

  showStatus(status: 'success' | 'error' | 'warning', message: string): void {
    switch (status) {
      case 'success':
        console.log(chalk.green(`✓ ${message}`));
        break;
      case 'error':
        console.error(chalk.red(`❌ ${message}`));
        break;
      case 'warning':
        console.log(chalk.yellow(`⚠ ${message}`));
        break;
    }
  }
}

export class ProxyCliManager {
  private configManager: ConfigManager;
  private ui: ConsoleUI;
  private routerManager: ReturnType<typeof getRouterManager>;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.ui = new ConsoleUI();
    this.routerManager = getRouterManager(configManager);
  }

  async startProxy(options: { verbose?: boolean; port?: number }): Promise<void> {
    try {
      const config = this.configManager.config;
      const port = options.port || config.tensorzero?.port || config.liteLLM?.port || 9313;
      
      // First check if a proxy is already running on the port
      const existingStatus = await this.checkProxyPort(port);
      if (existingStatus) {
        this.ui.showStatus("success", "TensorZero proxy is already running");
        this.ui.info(`URL: ${existingStatus.url}`);
        this.ui.info(`Routes: ${existingStatus.routes}`);
        this.ui.info(`Uptime: ${(existingStatus.uptime / 1000).toFixed(1)}s`);
        return;
      }
      
      if (options.verbose) {
        this.ui.info("Starting TensorZero proxy...");
      }

      // Enable proxy in config if it's disabled
      if (!this.configManager.config.tensorzero?.enabled) {
        await this.configManager.updateConfig({
          tensorzero: {
            ...this.configManager.config.tensorzero,
            enabled: true,
            ...(options.port && { port: options.port }),
          },
        });
      }

      // Initialize router (this should use the updated config)
      const status = await this.routerManager.initializeRouter();
      
      if (status.running) {
        this.ui.showStatus("success", "Proxy started successfully");
        this.ui.info(`URL: ${status.url}`);
        this.ui.info(`Routes: ${status.routes}`);
        this.ui.info(`Uptime: ${(status.uptime / 1000).toFixed(1)}s`);
        
        if (options.verbose) {
          this.ui.info("Proxy is ready to handle requests");
        }
      } else {
        this.ui.showStatus("error", "Failed to start proxy");
        this.ui.error("Check your API keys and network connection");
      }
    } catch (error) {
      this.ui.showStatus("error", `Failed to start proxy: ${error}`);
      this.ui.error("Check your configuration and try again");
    }
  }

  async stopProxy(options: { verbose?: boolean }): Promise<void> {
    try {
      const config = this.configManager.config;
      const port = config.tensorzero?.port || config.liteLLM?.port || 9313;
      
      // First check if there's actually a proxy running
      const currentStatus = await this.checkProxyPort(port);
      if (!currentStatus) {
        if (options.verbose) {
          this.ui.info("No TensorZero proxy is currently running");
        } else {
          this.ui.showStatus("warning", "No proxy was running to stop");
        }
        return;
      }
      
      if (options.verbose) {
        this.ui.info("Stopping TensorZero proxy...");
      }

      // Try stop via local router manager first (in case it's our own process)
      await this.routerManager.stopRouter();
      
      // Also check for and kill any python processes running on our port
      await this.killProcessByPort(port, options.verbose);
      
      this.ui.showStatus("success", "Proxy stopped successfully");
      
      if (options.verbose) {
        this.ui.info("All proxy processes terminated");
      }
    } catch (error) {
      this.ui.showStatus("error", `Failed to stop proxy: ${error}`);
    }
  }

  async restartProxy(options: { verbose?: boolean; port?: number }): Promise<void> {
    try {
      if (options.verbose) {
        this.ui.info("Restarting TensorZero proxy...");
      }

      await this.routerManager.stopRouter();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
      const status = await this.routerManager.initializeRouter();
      
      if (status.running) {
        this.ui.showStatus("success", "Proxy restarted successfully");
        this.ui.info(`URL: ${status.url}`);
        this.ui.info(`Routes: ${status.routes}`);
        
        if (options.verbose) {
          this.ui.info("Proxy is ready to handle requests");
        }
      } else {
        this.ui.showStatus("error", "Failed to restart proxy");
      }
    } catch (error) {
      this.ui.showStatus("error", `Failed to restart proxy: ${error}`);
    }
  }

  async getProxyStatus(): Promise<ProxyStatus | null> {
  // First, try the local manager instance
  let status = await this.routerManager.getRouterStatus();
  
  // If that doesn't work, check if there's actually a proxy running on the port
  if (!status) {
    try {
      const axios = require('axios');
      const config = this.configManager.config;
      const port = config.tensorzero?.port || config.liteLLM?.port || 9313;
      
      const response = await axios.get(`http://127.0.0.1:${port}/v1/models`, {
        timeout: 5000,
      });
      
      if (response.data && response.data.data) {
        status = {
          running: true,
          url: `http://127.0.0.1:${port}`,
          uptime: 0, // Unknown uptime
          routes: response.data.data.length || 0,
        };
      }
    } catch (error) {
      // Proxy is not running or unreachable
      // Don't log errors - this is expected for status checks
    }
  }
  
  return status;
}

  async checkProxyPort(port: number): Promise<ProxyStatus | null> {
    const axios = require('axios');
    
    try {
      const response = await axios.get(`http://127.0.0.1:${port}/v1/models`, {
        timeout: 5000,
      });
      
      if (response.data && response.data.data) {
        return {
          running: true,
          url: `http://127.0.0.1:${port}`,
          uptime: 0, // Unknown uptime for existing proxy
          routes: response.data.data.length || 0,
        };
      }
    } catch (error) {
      // Nothing running on this port
    }
    
    return null;
  }

  async killProcessByPort(port: number, verbose: boolean = false): Promise<void> {
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      // Use lsof to find processes listening on the port
      const lsof = spawn('lsof', ['-ti', `:${port}`]);
      let output = '';
      
      lsof.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      lsof.on('close', (code: number) => {
        if (code === 0 && output.trim()) {
          const pids = output.trim().split('\n');
          
          if (verbose) {
            this.ui.info(`Found ${pids.length} process(es) on port ${port}: ${pids.join(', ')}`);
          }
          
          // Kill each process found on the port
          const killPromises = pids.map(pid => {
            return new Promise<void>((killResolve) => {
              const kill = spawn('kill', ['-9', pid]);
              kill.on('close', () => killResolve());
            });
          });
          
          Promise.all(killPromises).then(() => {
            if (verbose) {
              this.ui.info(`Killed ${pids.length} process(es) on port ${port}`);
            }
            resolve();
          });
        } else {
          // No process found on port
          if (verbose) {
            this.ui.info(`No processes found on port ${port}`);
          }
          resolve();
        }
      });
      
      lsof.on('error', (error: Error) => {
        // lsof failed, try alternative approach
        if (verbose) {
          this.ui.info(`Could not check port ${port}: ${error.message}`);
        }
        resolve();
      });
    });
  }
}