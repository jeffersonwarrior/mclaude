import { Command } from "commander";
import { SyntheticClaudeApp } from "../core/app";
import { ConfigManager } from "../config";
import { readFileSync } from "fs";
import { join } from "path";
import { normalizeDangerousFlags } from "../utils/banner";

export function createProgram(): Command {
  const program = new Command();

  // Read version from package.json
  const packageJsonPath = join(__dirname, "../../package.json");
  const packageVersion = JSON.parse(
    readFileSync(packageJsonPath, "utf8"),
  ).version;

  program
    .name("mclaude")
    .description(
      "Interactive model selection tool for Claude Code with Synthetic AI models\n\nAdditional Claude Code flags (e.g., --dangerously-skip-permissions) are passed through to Claude Code.",
    )
    .version(packageVersion);

  program
    .option("-m, --model <model>", "Use specific model (skip selection)")
    .option(
      "-t, --thinking-model <model>",
      "Use specific thinking model (for Claude thinking mode)",
    )
    .option("-v, --verbose", "Enable verbose logging")
    .option("-q, --quiet", "Suppress non-error output")
    .allowUnknownOption(true)
    .passThroughOptions(true);

  // Main command (launch Claude Code)
  program.action(async (options, command) => {
    // Get all raw args from process.argv and extract unknown options
    const rawArgs = process.argv.slice(2);
    const additionalArgs: string[] = [];
    const knownFlags = new Set([
      "--model",
      "--thinking-model",
      "--verbose",
      "--quiet",
      "--help",
      "--version",
      "-m",
      "-t",
      "-v",
      "-q",
      "-h",
      "-V",
    ]);

    // Check for invalid commands (non-flag arguments that aren't help)
    // We need to be careful not to treat option values as commands
    const validCommands = new Set(["help", "/help"]);
    const knownOptions = new Set(["--model", "--thinking-model", "--verbose", "--quiet", "--help", "--version", "-m", "-t", "-v", "-q", "-h", "-V"]);

    // Find arguments that could be commands (not option values)
    let potentialCommand: string | undefined;
    for (let i = 0; i < rawArgs.length; i++) {
      const arg = rawArgs[i];
      if (!arg) continue;

      // If it starts with -, it's an option, skip
      if (arg.startsWith("-")) {
        // If it's an option that takes a value, skip the next argument too
        const baseOption = arg.split("=")[0];
        if (baseOption && ["--model", "--thinking-model", "-m", "-t"].includes(baseOption) && !arg.includes("=")) {
          i++; // Skip the value
        }
        continue;
      }

      // This is a non-flag argument - check if it could be a command
      // Only consider it a command if it appears at the beginning or after options that have been fully processed
      potentialCommand = arg;
      break;
    }

    // Only process help/invalid commands if we found a potential command
    if (potentialCommand) {
      // Check if this is a help request
      if (validCommands.has(potentialCommand)) {
        program.help();
        return;
      }

      // Check if this looks like an invalid command (not a subcommand we know about)
      const isKnownSubcommand = ['model', 'thinking-model', 'providers', 'models', 'search', 'config', 'setup', 'doctor', 'dangerously', 'dangerous', 'danger', 'cache', 'combination', 'list', 'info', 'clear-cache', 'enable', 'disable', 'status', 'test', 'show', 'set', 'provider', 'init', 'local', 'global', 'migrate', 'whoami', 'reset', 'set-default-provider', 'save', 'delete'].includes(potentialCommand);
      if (!isKnownSubcommand) {
        console.error(`Unknown command: ${potentialCommand}`);
        console.log('\nShowing available commands:');
        program.help();
        return;
      }
    }

    for (let i = 0; i < rawArgs.length; i++) {
      const arg = rawArgs[i];
      if (arg && arg.startsWith("--")) {
        // Check if this is a known mclaude option
        const flagName = arg.split("=")[0]!; // Handle --flag=value format
        if (!knownFlags.has(flagName) && !knownFlags.has(arg)) {
          additionalArgs.push(arg);
          // If this is a flag that takes a value and it's not in --flag=value format, skip the next arg
          if (
            !arg.includes("=") &&
            i + 1 < rawArgs.length &&
            rawArgs[i + 1] &&
            !rawArgs[i + 1]!.startsWith("-")
          ) {
            additionalArgs.push(rawArgs[i + 1]!);
            i++; // Skip the next argument as it's a value
          }
        }
      }
    }


    const app = new SyntheticClaudeApp();
    // Normalize dangerous flags
    const normalizedArgs = normalizeDangerousFlags(additionalArgs);
    await app.run({ ...options, additionalArgs: normalizedArgs });
  });

  // Model selection command (launches after selection)
  program
    .command("model")
    .description("Interactive model selection and launch Claude Code")
    .option("-v, --verbose", "Enable verbose logging")
    .option("-q, --quiet", "Suppress non-error output")
    .option("--provider <name>", "Select from specific provider only (synthetic, minimax, auto)")
    .option("--thinking-provider <name>", "Use different provider for thinking model")
    .option("--save-combination <name>", "Save this provider combination for future use")
    .action(async (options) => {
      const app = new SyntheticClaudeApp();
      const success = await app.interactiveModelSelection(options);

      // After successful model selection, launch Claude Code
      if (success) {
        const config = app.getConfig();
        if (config.selectedModel || config.selectedThinkingModel) {
          await app.run({
            verbose: options.verbose,
            quiet: options.quiet,
            model: "", // Will use saved models from config
          });
        }
      }
    });

  // Thinking model selection command
  program
    .command("thinking-model")
    .description("Interactive thinking model selection and save to config")
    .option("-v, --verbose", "Enable verbose logging")
    .action(async (options) => {
      const app = new SyntheticClaudeApp();
      await app.interactiveThinkingModelSelection();
    });

  // Provider management commands
  const providersCmd = program
    .command("providers")
    .description("Manage AI providers");

  providersCmd
    .command("list")
    .description("List all providers with their status")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.listProviders();
    });

  providersCmd
    .command("enable <provider>")
    .description("Enable a specific provider")
    .action(async (provider) => {
      const app = new SyntheticClaudeApp();
      await app.enableProvider(provider);
    });

  providersCmd
    .command("disable <provider>")
    .description("Disable a specific provider")
    .action(async (provider) => {
      const app = new SyntheticClaudeApp();
      await app.disableProvider(provider);
    });

  providersCmd
    .command("status")
    .description("Show detailed provider information")
    .option("--provider <name>", "Show status for specific provider only")
    .action(async (options) => {
      const app = new SyntheticClaudeApp();
      await app.providerStatus(options);
    });

  providersCmd
    .command("test <provider>")
    .description("Test connectivity to a specific provider")
    .action(async (provider) => {
      const app = new SyntheticClaudeApp();
      await app.testProvider(provider);
    });

  // Models command group
  const modelsCmd = program.command("models").description("List available models");

  modelsCmd
    .command("list")
    .description("List available models")
    .option("--refresh", "Force refresh model cache")
    .option("--provider <name>", "Filter models by provider (synthetic, minimax, auto)")
    .action(async (options) => {
      const app = new SyntheticClaudeApp();
      await app.listModels(options);
    });

  modelsCmd
    .command("info")
    .description("Show model information")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.showModelInfo();
    });

  modelsCmd
    .command("clear-cache")
    .description("Clear model cache")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.clearCache();
    });

  modelsCmd
    .command("search <query>")
    .description("Search models by name or provider")
    .option("--provider <name>", "Filter search by provider")
    .action(async (query, options) => {
      const app = new SyntheticClaudeApp();
      await app.searchModels(query, options);
    });

  // Default models command (alias for list)
  modelsCmd
    .action(async (options, command) => {
      const app = new SyntheticClaudeApp();
      await app.listModels(options);
    });

  // Search models command (top-level for backward compatibility)
  program
    .command("search <query>")
    .description("Search models by name or provider")
    .option("--refresh", "Force refresh model cache")
    .option("--provider <name>", "Search within specific provider (synthetic, minimax, auto)")
    .action(async (query, options) => {
      const app = new SyntheticClaudeApp();
      await app.searchModels(query, options);
    });

  // Configuration commands
  const configCmd = program
    .command("config")
    .description("Manage configuration");

  configCmd
    .command("show")
    .description("Show current configuration")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.showConfig();
    });

  configCmd
    .command("set <key> <value>")
    .description(
      "Set configuration value (keys: apiKey, baseUrl, modelsApiUrl, cacheDurationHours, selectedModel, selectedThinkingModel, defaultProvider, synthetic.apiKey, synthetic.baseUrl, minimax.apiKey, minimax.groupId)",
    )
    .action(async (key, value) => {
      const app = new SyntheticClaudeApp();
      await app.setConfig(key, value);
    });

  // Provider-specific configuration subcommands
  const providerConfigCmd = configCmd
    .command("provider")
    .description("Manage provider-specific configuration");

  providerConfigCmd
    .command("list")
    .description("List all provider configurations")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.listProviderConfigs();
    });

  providerConfigCmd
    .command("get <provider>")
    .description("Get configuration for a specific provider")
    .action(async (provider) => {
      const app = new SyntheticClaudeApp();
      await app.getProviderConfigInfo(provider);
    });

  providerConfigCmd
    .command("set <provider> <key> <value>")
    .description("Set provider-specific configuration")
    .action(async (provider, key, value) => {
      const app = new SyntheticClaudeApp();
      await app.setProviderConfig(provider, key, value);
    });

  configCmd
    .command("init")
    .description("Initialize a local project configuration")
    .option("--force", "Overwrite existing local configuration")
    .action(async (options) => {
      const app = new SyntheticClaudeApp();
      await app.initLocalConfig(options);
    });

  configCmd
    .command("local")
    .description("Switch to local project configuration mode")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.switchToLocalConfig();
    });

  configCmd
    .command("global")
    .description("Switch to global configuration mode")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.switchToGlobalConfig();
    });

  configCmd
    .command("migrate")
    .description("Migrate global configuration to local project configuration")
    .option("--force", "Overwrite existing local configuration")
    .action(async (options) => {
      const app = new SyntheticClaudeApp();
      await app.migrateConfig(options);
    });

  configCmd
    .command("whoami")
    .description("Show current configuration context and workspace")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.showConfigContext();
    });

  configCmd
    .command("reset")
    .description("Reset configuration to defaults")
    .option("--scope <scope>", "Reset scope: 'local' or 'global' (falls back to current mode)")
    .action(async (options) => {
      const app = new SyntheticClaudeApp();
      await app.resetConfig(options);
    });

  configCmd
    .command("set-default-provider <provider>")
    .description("Set the default provider (synthetic, minimax, auto)")
    .action(async (provider) => {
      const app = new SyntheticClaudeApp();
      await app.setDefaultProvider(provider);
    });

  // Combination management commands
  const combinationCmd = program.command("combination").description("Manage model combinations");

  combinationCmd
    .command("list")
    .description("List saved model combinations")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.listCombinations();
    });

  combinationCmd
    .command("save <name> <model> [thinkingModel]")
    .description("Save a model combination")
    .action(async (name, model, thinkingModel) => {
      const app = new SyntheticClaudeApp();
      await app.saveCombination(name, model, thinkingModel);
    });

  combinationCmd
    .command("delete <name>")
    .description("Delete a saved model combination")
    .action(async (name) => {
      const app = new SyntheticClaudeApp();
      await app.deleteCombination(name);
    });

  // Default combination command (alias for list)
  combinationCmd
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.listCombinations();
    });

  // Setup command
  program
    .command("setup")
    .description("Run initial setup")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.setup();
    });

  // Doctor command - check system health
  program
    .command("doctor")
    .description("Check system health and configuration")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.doctor();
    });

  // Dangerous command - launch Claude Code with --dangerously-skip-permissions
  program
    .command("dangerously")
    .alias("dangerous")
    .alias("dang")
    .alias("danger")
    .description(
      "Launch with --dangerously-skip-permissions using last used provider(s)",
    )
    .option("-v, --verbose", "Enable verbose logging")
    .option("-q, --quiet", "Suppress non-error output")
    .option(
      "-f, --force",
      "Force model selection even if last used provider is available",
    )
    .action(async (options) => {
      const app = new SyntheticClaudeApp();
      const config = app.getConfig();

      // Check if we have saved models and user didn't force selection
      if (
        !options.force &&
        (config.selectedModel || config.selectedThinkingModel)
      ) {
        // Use existing saved models
        await app.run({
          verbose: options.verbose,
          quiet: options.quiet,
          model: "", // Will use saved models from config
          additionalArgs: ["--dangerously-skip-permissions"],
        });
      } else {
        // Need to select models first
        await app.interactiveModelSelection();

        // After successful model selection, launch Claude Code with --dangerously-skip-permissions
        const updatedConfig = app.getConfig();
        if (
          updatedConfig.selectedModel ||
          updatedConfig.selectedThinkingModel
        ) {
          await app.run({
            verbose: options.verbose,
            quiet: options.quiet,
            model: "", // Will use saved models from config
            additionalArgs: ["--dangerously-skip-permissions"],
          });
        }
      }
    });

  // Cache management
  const cacheCmd = program.command("cache").description("Manage model cache");

  cacheCmd
    .command("clear")
    .description("Clear model cache")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.clearCache();
    });

  cacheCmd
    .command("info")
    .description("Show cache information")
    .action(async () => {
      const app = new SyntheticClaudeApp();
      await app.cacheInfo();
    });

  // Authentication management commands
  const authCmd = program.command("auth").description("Manage authentication credentials");

  authCmd
    .command("check")
    .description("Check authentication status for all providers")
    .option("--provider <name>", "Check specific provider only (synthetic, minimax)")
    .action(async (options) => {
      const app = new SyntheticClaudeApp();
      await app.checkAuth(options);
    });

  authCmd
    .command("test <provider>")
    .description("Test authentication for a specific provider")
    .action(async (provider) => {
      const app = new SyntheticClaudeApp();
      await app.testAuth(provider);
    });

  authCmd
    .command("reset <provider>")
    .description("Reset authentication credentials for a specific provider")
    .action(async (provider) => {
      const app = new SyntheticClaudeApp();
      await app.resetAuth(provider);
    });

  authCmd
    .command("refresh [provider]")
    .description("Refresh authentication for all providers or specific provider")
    .action(async (provider) => {
      const app = new SyntheticClaudeApp();
      await app.refreshAuth(provider);
    });

  authCmd
    .command("status")
    .description("Show detailed authentication status")
    .option("--format <format>", "Output format (table, json)", "table")
    .action(async (options) => {
      const app = new SyntheticClaudeApp();
      await app.authStatus(options);
    });

  // Help commands are handled in the main action
  // This prevents double registration and cleaner handling

  return program;
}
