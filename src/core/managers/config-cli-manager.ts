import { ConfigManager } from "../../config";
import { UserInterface } from "../../ui";
import { ConfigCliManagerInterface } from "./config-cli-manager.interface";

export class ConfigCliManager implements ConfigCliManagerInterface {
  constructor(
    private configManager: ConfigManager,
    private ui: UserInterface,
  ) {}

  async showConfig(): Promise<void> {
    this.ui.info("Current Configuration:");
    this.ui.info("========================");

    const config = this.configManager.config;

    const configDisplay = {
      "Default Provider": config.defaultProvider,
      "Selected Model": config.selectedModel || "None",
      "Selected Thinking Model": config.selectedThinkingModel || "None",
      "Cache Duration (hours)": config.cacheDurationHours.toString(),
      "Synthetic Enabled": config.providers.synthetic.enabled ? "Yes" : "No",
      "Minimax Enabled": config.providers.minimax.enabled ? "Yes" : "No",
      "Synthetic Base URL": config.providers.synthetic.baseUrl || "Default",
      "Minimax Base URL": config.providers.minimax.baseUrl || "Default",
      "Minimax Group ID": config.providers.minimax.groupId || "None",
      "First Run Completed": config.firstRunCompleted ? "Yes" : "No",
    };

    this.ui.table(configDisplay);

    this.ui.info(
      "\nConfiguration is project-local (./.mclaude/config.json) or global (~/.config/mclaude/config.json).\n",
    );
    this.ui.info("Global config directory: ~/.config/mclaude");
  }

  async setConfig(key: string, value: string): Promise<void> {
    const validKeys = [
      'apiKey', 'baseUrl', 'modelsApiUrl', 'cacheDurationHours',
      'selectedModel', 'selectedThinkingModel', 'defaultProvider',
      'synthetic.apiKey', 'synthetic.baseUrl', 'minimax.apiKey', 'minimax.groupId'
    ];

    if (!validKeys.includes(key)) {
      this.ui.error(`Invalid config key: ${key}`);
      this.ui.info(`Valid keys: ${validKeys.join(', ')}`);
      return;
    }

    // Handle nested keys
    if (key.startsWith('synthetic.') || key.startsWith('minimax.')) {
      const [provider, setting] = key.split('.');
      await this.configManager.setProviderConfig(provider as "synthetic" | "minimax", setting || '', value);
      this.ui.success(`✓ Set ${key} = ${value}`);
      return;
    }

    // Handle flat keys using type-safe methods
    switch (key) {
      case 'cacheDurationHours':
        await this.configManager.setCacheDuration(parseInt(value));
        break;
      case 'selectedModel':
        await this.configManager.setSavedModel(value);
        break;
      case 'selectedThinkingModel':
        await this.configManager.setSavedThinkingModel(value);
        break;
      case 'defaultProvider':
        if (!['synthetic', 'minimax', 'auto'].includes(value)) {
          this.ui.error('Invalid provider. Use: synthetic, minimax, or auto');
          return;
        }
        await this.configManager.setDefaultProvider(value as any);
        break;
      default:
        this.ui.error(`Config key '${key}' is not yet implemented`);
        return;
    }

    this.ui.success(`✓ Set ${key} = ${value}`);
  }

  async resetConfig(options?: { scope?: string }): Promise<void> {
    const scope = options?.scope || "local";

    if (scope === "local") {
      const confirmed = await this.ui.confirm(
        "Are you sure you want to reset local configuration to defaults?",
        false,
      );
      if (!confirmed) {
        this.ui.info("Local configuration reset cancelled");
        return;
      }

      await this.configManager.resetConfig();
      this.ui.coloredSuccess("✓ Local configuration reset to defaults");
    } else if (scope === "global") {
      const confirmed = await this.ui.confirm(
        "Are you sure you want to reset global configuration to defaults?",
        false,
      );
      if (!confirmed) {
        this.ui.info("Global configuration reset cancelled");
        return;
      }

      this.ui.error("Global configuration reset is not yet fully implemented. For now, delete ~/.config/mclaude/config.json manually.");
    } else {
      this.ui.error(`Invalid scope: ${scope}. Use 'local' or 'global'.`);
    }
  }

  async showConfigContext(): Promise<void> {
    this.ui.info("Configuration Context:");
    this.ui.info("========================");

    this.ui.coloredInfo("ℹ Active config depends on your current directory and if there's a .mclaude folder.");
    this.ui.info(
      "Local config location: ./.mclaude/config.json (within your project directory)",
    );
    this.ui.info(
      "Global config location: ~/.config/mclaude/config.json (user's home directory)",
    );
  }

  async listCombinations(): Promise<void> {
    const combinations = this.configManager.getModelCombinations();
    if (combinations.length === 0) {
      this.ui.info("No saved model combinations found.");
      return;
    }

    this.ui.info("Saved Model Combinations:");
    this.ui.info("==========================");
    
    combinations.forEach(combination => {
      this.ui.info(`📦 ${combination.name}:`);
      this.ui.info(`   Model: ${combination.model}`);
      if (combination.thinkingModel) {
        this.ui.info(`   Thinking Model: ${combination.thinkingModel}`);
      }
      this.ui.info("");
    });
  }

  async saveCombination(name: string, model: string, thinkingModel?: string): Promise<void> {
    if (!name || !model) {
      this.ui.error("Name and model are required");
      return;
    }

    await this.configManager.saveModelCombination(name, model, thinkingModel);
    this.ui.success(`✓ Saved combination '${name}'`);
  }

  async deleteCombination(name: string): Promise<void> {
    if (!name) {
      this.ui.error("Combination name is required");
      return;
    }

    const confirmed = await this.ui.confirm(
      `Delete model combination '${name}'?`,
      false
    );

    if (!confirmed) {
      this.ui.info("Combination deletion cancelled");
      return;
    }

    // Check if combination exists
    const combinations = this.configManager.getModelCombinations();
    const exists = combinations.some(c => c.name === name);
    
    if (!exists) {
      this.ui.error(`Model combination '${name}' not found`);
      return;
    }

    await this.configManager.deleteModelCombination(name);
    this.ui.success(`✓ Deleted combination '${name}'`);
  }

  async showStats(options?: { reset?: boolean; format?: string }): Promise<void> {
    const config = this.configManager.config;
    const usage = config.tokenUsage;

    if (options?.reset) {
      const confirmed = await this.ui.confirm(
        "Reset token usage statistics?",
        false
      );

      if (confirmed) {
        await this.configManager.resetTokenUsage();
        this.ui.success("✓ Token usage statistics reset");
        return;
      }
    }

    this.ui.info("Token Usage Statistics:");
    this.ui.info("=======================");
    
    const stats = {
      "Total Input Tokens": usage.totalInputTokens.toLocaleString(),
      "Total Output Tokens": usage.totalOutputTokens.toLocaleString(),
      "Session Tokens": usage.sessionTokens.toLocaleString(),
      "Last Updated": usage.lastUpdated || "Never"
    };

    if (options?.format === "json") {
      console.log(JSON.stringify(stats, null, 2));
    } else {
      this.ui.table(stats);
    }

    if (usage.history.length > 0) {
      this.ui.info("\nRecent History:");
      usage.history.slice(-5).forEach((h, index) => {
        this.ui.info(`${index + 1}. ${h.date}: ${h.inputTokens} input, ${h.outputTokens} output tokens`);
      });
    }
  }

  async manageSysprompt(options: { global?: boolean; show?: boolean; clear?: boolean; raw?: boolean }): Promise<void> {
    const { global, show, clear, raw } = options;
    const { configManager, ui } = this;

    const activePath = this.configManager.getActiveSyspromptPath();
    const isLocal = activePath.type === 'local' && !global;

    if (clear) {
      const confirmed = await ui.confirm(
        `Are you sure you want to clear the ${isLocal ? 'local' : 'global'} system prompt?`,
        false,
      );
      if (!confirmed) {
        ui.info("System prompt clear cancelled.");
        return;
      }
      await configManager.clearSysprompt(global);
      ui.success(`✓ ${isLocal ? 'Local' : 'Global'} system prompt cleared.`);
      return;
    }

    if (show || raw) {
      const { content, type, size } = await configManager.loadSysprompt(!raw);
      if (!content) {
        ui.info("No active system prompt found.");
        return;
      }
      ui.info(`
--- Active System Prompt (${type || 'default'}, ${(size / 1024).toFixed(1)}KB) ---`);
      ui.info(content);
      ui.info("---------------------------------------");
      const { valid, warning, message } = configManager.validateSyspromptSize(size);
      if (warning) {
        ui.warning(message);
      } else if (!valid) {
        ui.error(message);
      }
      return;
    }

    // Default action: edit
    const { content: currentContent } = await configManager.loadSysprompt(false); // Load raw content for editing
    const defaultContent = configManager.getDefaultSyspromptTemplate();
    
    // Use an external editor (placeholder for now, as direct editor invocation is not available in agent)
    // For now, we'll provide a prompt to the user to manually edit and paste back.
    ui.info(`
To edit the ${isLocal ? 'local' : 'global'} system prompt, please copy the content below, make your changes, and paste it back.
`);
    ui.info(`File location: ${isLocal ? 'Local (.mclaude/config.json)' : 'Global (~/.config/mclaude/config.json)'}`);
    ui.info("---------------------------------------");
    ui.info(currentContent || defaultContent);
    ui.info("---------------------------------------");
    ui.info("Paste your updated system prompt content here (press Ctrl+D when done, Ctrl+C to cancel):\n");

    let newContent = "";
    try {
      ui.info("Editing system prompt (enter new content, press Enter when done):");
      newContent = await ui.ask("Enter your system prompt", currentContent || defaultContent);
    } catch (e: any) {
      ui.info("System prompt edit cancelled.");
      return;
    }

    if (!newContent) {
      ui.info("No changes made to system prompt.");
      return;
    }

    const saved = await configManager.saveSysprompt(newContent, global);
    if (saved) {
      ui.success(`✓ ${isLocal ? 'Local' : 'Global'} system prompt updated.`);
    } else {
      ui.error("Failed to save system prompt.");
    }
  }
}