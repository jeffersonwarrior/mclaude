import { readFile, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export interface EnvironmentVariables {
  SYNTHETIC_API_KEY?: string;
  MINIMAX_API_KEY?: string;
  SYNTHETIC_BASE_URL?: string;
  MINIMAX_API_URL?: string;
  MINIMAX_ANTHROPIC_URL?: string;
  MINIMAX_OPENAI_URL?: string;
  MINIMAX_MODEL?: string;
  API_TIMEOUT_MS?: string;
}

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private envVars: EnvironmentVariables = {};

  private constructor() {
    this.loadEnvironmentVariables();
  }

  static getInstance(): EnvironmentManager {
    if (!this.instance) {
      this.instance = new EnvironmentManager();
    }
    return this.instance;
  }


  private loadEnvFile(): void {
    try {
      // Try to load .env from project root first
      const projectEnvPath = join(process.cwd(), ".env");
      const homeEnvPath = join(homedir(), ".mclaude", ".env");

      let envPath: string | null = null;

      // Check for .env in current directory
      try {
        const envContent = readFileSync(projectEnvPath, "utf-8");
        // Only consider the file if it has content (not empty or just whitespace)
        if (envContent.trim().length > 0) {
          envPath = projectEnvPath;
        }
      } catch {
        // Check for .env in home directory
        try {
          const envContent = readFileSync(homeEnvPath, "utf-8");
          // Only consider the file if it has content (not empty or just whitespace)
          if (envContent.trim().length > 0) {
            envPath = homeEnvPath;
          }
        } catch {
          // No .env file found, use process.env only
          return;
        }
      }

      if (envPath) {
        const envContent = readFileSync(envPath, "utf-8");
        this.parseEnvContent(envContent);
      }
    } catch (error) {
      console.warn("Failed to load .env file:", error);
    }
  }

  private parseEnvContent(content: string): void {
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      // Parse key=value pairs
      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;

        if (!key || value === undefined) {
          continue;
        }

        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, "");

        // Only store variables we're interested in
        if (key in this.envVars || [
          "SYNTHETIC_API_KEY",
          "MINIMAX_API_KEY",
          "SYNTHETIC_BASE_URL",
          "MINIMAX_API_URL",
          "MINIMAX_ANTHROPIC_URL",
          "MINIMAX_OPENAI_URL",
          "MINIMAX_MODEL",
          "API_TIMEOUT_MS"
        ].includes(key)) {
          (this.envVars as any)[key] = cleanValue;
          process.env[key] = cleanValue; // Also set in process.env
        }
      }
    }
  }

  private loadEnvironmentVariables(): void {
    // Initialize with current process.env
    this.envVars = {
      SYNTHETIC_API_KEY: process.env.SYNTHETIC_API_KEY,
      MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,
      SYNTHETIC_BASE_URL: process.env.SYNTHETIC_BASE_URL,
      MINIMAX_API_URL: process.env.MINIMAX_API_URL,
      MINIMAX_ANTHROPIC_URL: process.env.MINIMAX_ANTHROPIC_URL,
      MINIMAX_OPENAI_URL: process.env.MINIMAX_OPENAI_URL,
      MINIMAX_MODEL: process.env.MINIMAX_MODEL,
      API_TIMEOUT_MS: process.env.API_TIMEOUT_MS,
    };

    // Load from .env file synchronously to ensure variables are available immediately
    this.loadEnvFile();
  }

  getEnvironmentVariables(): EnvironmentVariables {
    return { ...this.envVars };
  }

  // Synchronous version for immediate needs
  getEnvironmentVariable(key: keyof EnvironmentVariables): string | undefined {
    return this.envVars[key];
  }

  getApiKey(provider: "synthetic" | "minimax"): string {
    switch (provider) {
      case "synthetic":
        return (
          this.envVars.SYNTHETIC_API_KEY || process.env.SYNTHETIC_API_KEY || ""
        );
      case "minimax":
        return (
          this.envVars.MINIMAX_API_KEY || process.env.MINIMAX_API_KEY || ""
        );
      default:
        return "";
    }
  }

  getApiUrl(
    provider: "synthetic" | "minimax",
    type: "anthropic" | "openai" | "base",
  ): string {
    switch (provider) {
      case "synthetic":
        switch (type) {
          case "anthropic":
            return (
              this.envVars.SYNTHETIC_BASE_URL ||
              process.env.SYNTHETIC_BASE_URL ||
              "https://api.synthetic.new/anthropic"
            );
          case "openai":
            return (
              this.envVars.SYNTHETIC_BASE_URL ||
              process.env.SYNTHETIC_BASE_URL ||
              "https://api.synthetic.new/openai/v1/models"
            );
          case "base":
            return (
              this.envVars.SYNTHETIC_BASE_URL ||
              process.env.SYNTHETIC_BASE_URL ||
              "https://api.synthetic.new"
            );
        }
      case "minimax":
        switch (type) {
          case "anthropic":
            return (
              this.envVars.MINIMAX_ANTHROPIC_URL ||
              process.env.MINIMAX_ANTHROPIC_URL ||
              "https://api.minimax.io/anthropic"
            );
          case "openai":
            return (
              this.envVars.MINIMAX_OPENAI_URL ||
              process.env.MINIMAX_OPENAI_URL ||
              "https://api.minimax.io/v1"
            );
          case "base":
            return (
              this.envVars.MINIMAX_API_URL ||
              process.env.MINIMAX_API_URL ||
              "https://api.minimax.io"
            );
        }
      default:
        return "";
    }
  }

  getDefaultModel(provider: "synthetic" | "minimax"): string {
    switch (provider) {
      case "synthetic":
        return ""; // Synthetic doesn't have a default model in config
      case "minimax":
        return (
          this.envVars.MINIMAX_MODEL ||
          process.env.MINIMAX_MODEL ||
          "MiniMax-M2"
        );
      default:
        return "";
    }
  }

  getApiTimeout(): number {
    const timeout = this.envVars.API_TIMEOUT_MS || process.env.API_TIMEOUT_MS;
    return timeout ? parseInt(timeout, 10) : 3000000; // Default 30 minutes for MiniMax
  }

  validateEnvironmentVariables(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const envVars = this.getEnvironmentVariables();

    // Validate API keys if present
    if (
      envVars.SYNTHETIC_API_KEY &&
      !this.isValidApiKey(envVars.SYNTHETIC_API_KEY)
    ) {
      errors.push("Synthetic API key format appears invalid");
    }

    if (
      envVars.MINIMAX_API_KEY &&
      !this.isValidApiKey(envVars.MINIMAX_API_KEY)
    ) {
      errors.push("MiniMax API key format appears invalid");
    }

    // Validate URLs if present
    const urlFields = [
      "SYNTHETIC_BASE_URL",
      "MINIMAX_API_URL",
      "MINIMAX_ANTHROPIC_URL",
      "MINIMAX_OPENAI_URL",
    ];

    for (const field of urlFields) {
      const url = envVars[field as keyof EnvironmentVariables];
      if (url && !this.isValidUrl(url)) {
        errors.push(`${field} appears to be an invalid URL: ${url}`);
      }
    }

    // Validate timeout
    if (envVars.API_TIMEOUT_MS && isNaN(parseInt(envVars.API_TIMEOUT_MS, 10))) {
      errors.push("API_TIMEOUT_MS must be a valid number in milliseconds");
    }

    return { valid: errors.length === 0, errors };
  }

  private isValidApiKey(apiKey: string): boolean {
    // Basic validation - non-empty string with reasonable length
    return typeof apiKey === "string" && apiKey.length > 10;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Reload environment variables
  async reload(): Promise<void> {
    this.envVars = {};
    this.loadEnvironmentVariables();
  }
}

// Export singleton instance
export const envManager = EnvironmentManager.getInstance();
