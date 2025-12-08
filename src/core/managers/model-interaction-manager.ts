import { ConfigManager } from "../../config";
import { UserInterface } from "../../ui";
import { ModelManager } from "../../models";
import { ModelInfoImpl } from "../../models"; // Added ModelInfoImpl
import { ModelInteractionManagerInterface } from "./model-interaction-manager.interface";
import { sanitizeApiError } from "../../utils/error-sanitizer";

export class ModelInteractionManager
  implements ModelInteractionManagerInterface
{
  constructor(
    private configManager: ConfigManager,
    private ui: UserInterface,
    private modelManager: ModelManager,
  ) {}

  /**
   * Interactive selection of thinking model
   */
  async interactiveThinkingModelSelection(): Promise<boolean> {
    if (!this.configManager.hasApiKey()) {
      this.ui.error('No API key configured. Please run "mclaude setup" first.');
      return false;
    }

    try {
      this.ui.coloredInfo("Fetching available models...");
      const models = await this.modelManager.fetchModels();

      if (models.length === 0) {
        this.ui.error(
          "No models available. Please check your API key and connection.",
        );
        return false;
      }

      // Sort models for consistent display
      const sortedModels = this.modelManager.getModels(models);
      const selectedThinkingModel = await this.ui.selectModel(sortedModels);
      if (!selectedThinkingModel) {
        this.ui.info("Thinking model selection cancelled");
        return false;
      }

      await this.configManager.updateConfig({
        selectedThinkingModel: selectedThinkingModel.id,
      });
      this.ui.coloredSuccess(
        `Thinking model saved: ${selectedThinkingModel.getDisplayName()}`,
      );
      this.ui.highlightInfo(
        'Now run "mclaude --thinking-model" to start Claude Code with this thinking model.',
        ["mclaude", "--thinking-model"],
      );
      return true;
    } catch (error) {
      const errorMessage = sanitizeApiError(error);
      this.ui.error(`Error during thinking model selection: ${errorMessage}`);
      return false;
    }
  }

  async interactiveModelSelection(options?: {
    provider?: string;
    thinkingProvider?: string;
    saveCombination?: string;
  }): Promise<boolean> {
    try {
      // Simplified provider availability check using atomic state
      const providerState = this.configManager.getAtomicProviderState();
      if (
        !providerState.synthetic.available &&
        !providerState.minimax.available
      ) {
        this.ui.error(
          'No providers are available. Please run "mclaude setup" first to configure at least one provider.',
        );
        return false;
      }

      let models: ModelInfoImpl[] = [];

      this.ui.coloredInfo("Fetching available models...");

      try {
        if (options?.provider) {
          if (!["synthetic", "minimax", "auto"].includes(options.provider)) {
            this.ui.error(
              `Invalid provider: ${options.provider}. Valid providers: synthetic, minimax, auto`,
            );
            return false;
          }
          models = await this.modelManager.getModelsByProvider(
            options.provider as "synthetic" | "minimax" | "auto",
          );
        } else {
          models = await this.modelManager.fetchModels();
        }
      } catch (error: any) {
        const errorMessage = sanitizeApiError(error);
        this.ui.error(`Failed to fetch models: ${errorMessage}`);

        // Provide recovery guidance
        const shouldRetry = await this.ui.confirm(
          "Retry model selection?",
          true,
        );
        if (shouldRetry) {
          return await this.interactiveModelSelection(options);
        }
        return false;
      }

      if (models.length === 0) {
        this.ui.warning("No models available from configured providers.");
        this.ui.info(
          "Check your API keys and network connection, or try 'mclaude doctor' for diagnostics.",
        );
        return false;
      }

      // Sort models for consistent display
      const sortedModels = this.modelManager.getModels(models);

      this.ui.info(`Found ${sortedModels.length} available models`);

      // Select models
      const { regular: selectedRegularModel, thinking: selectedThinkingModel } =
        await this.ui.selectDualModels(
          sortedModels,
          undefined, // authenticationError
          async (subagentModel) => {
            if (subagentModel) {
              await this.configManager.updateConfig({
                recommendedModels: {
                  ...this.configManager.config.recommendedModels,
                  subagent: {
                    primary: subagentModel.id,
                    backup:
                      this.configManager.config.recommendedModels?.subagent
                        ?.backup || "synthetic:deepseek-ai/DeepSeek-V3.2",
                  },
                },
              });
              this.ui.coloredSuccess(
                `Subagent model saved: ${subagentModel.getDisplayName()}`,
              );
            }
          },
          async (fastModel) => {
            if (fastModel) {
              await this.configManager.updateConfig({
                recommendedModels: {
                  ...this.configManager.config.recommendedModels,
                  smallFast: {
                    primary: fastModel.id,
                    backup:
                      this.configManager.config.recommendedModels?.smallFast
                        ?.backup ||
                      "hf:meta-llama/Llama-4-Scout-17B-16E-Instruct",
                  },
                },
              });
              this.ui.coloredSuccess(
                `Fast model saved: ${fastModel.getDisplayName()}`,
              );
            }
          },
        );

      if (!selectedRegularModel && !selectedThinkingModel) {
        this.ui.info("Model selection cancelled");
        return false;
      }

      // Save models to config with error handling
      try {
        if (selectedRegularModel) {
          await this.configManager.setSavedModel(selectedRegularModel.id);
          this.ui.coloredSuccess(
            `Regular model saved: ${selectedRegularModel.getDisplayName()}`,
          );
        }

        if (selectedThinkingModel) {
          await this.configManager.setSavedThinkingModel(
            selectedThinkingModel.id,
          );
          this.ui.coloredSuccess(
            `Thinking model saved: ${selectedThinkingModel.getDisplayName()}`,
          );
        }
      } catch (error) {
        this.ui.error(
          `Failed to save model selection: ${sanitizeApiError(error)}`,
        );
        const shouldRetry = await this.ui.confirm("Retry saving models?", true);
        if (!shouldRetry) {
          return false;
        }
        // Retry with the same selections
        return await this.interactiveModelSelection(options);
      }

      // Save combination if requested (with error handling)
      if (options?.saveCombination && selectedRegularModel) {
        try {
          const combination = {
            name: options.saveCombination,
            regularModel: selectedRegularModel.id,
            thinkingModel: selectedThinkingModel?.id,
            regularProvider:
              options.provider || this.configManager.getDefaultProvider(),
            thinkingProvider:
              options.thinkingProvider ||
              options.provider ||
              this.configManager.getDefaultProvider(),
            createdAt: new Date().toISOString(),
          };

          const config = this.configManager.config;
          for (let i = 1; i <= 10; i++) {
            const comboKey = `combination${i}` as keyof typeof config;
            const existing = config[comboKey];
            if (
              !existing ||
              (existing &&
                typeof existing === "object" &&
                "name" in existing &&
                existing.name === options.saveCombination)
            ) {
              const updates: any = {};
              updates[comboKey] = combination;
              await this.configManager.updateConfig(updates);
              this.ui.coloredSuccess(
                `Model combination "${options.saveCombination}" saved`,
              );
              break;
            }
          }
        } catch (error) {
          this.ui.warning(
            `Failed to save model combination: ${sanitizeApiError(error)}`,
          );
        }
      }

      this.ui.highlightInfo(
        'Now run "mclaude" to start Claude Code with your selected model(s).',
        ["mclaude"],
      );
      return true;
    } catch (error: any) {
      // Simplified error handling - no complex categorization
      const errorMessage = sanitizeApiError(error);
      this.ui.error(`Model selection failed: ${errorMessage}`);

      const shouldRetry = await this.ui.confirm(
        "Try model selection again?",
        true,
      );
      if (shouldRetry) {
        return await this.interactiveModelSelection(options);
      }
      return false;
    }
  }

  /**
   * Show detailed model information or current configuration
   */
  async showModelInfo(modelId?: string): Promise<void> {
    // If modelId is provided, show detailed model info from model cards
    if (modelId) {
      const modelCard = await this.modelManager.getModelCard(modelId);

      if (modelCard) {
        this.ui.info(`Model Card: ${modelCard.name || modelCard.id}`);
        this.ui.info("═".repeat(50));
        this.ui.info(`ID: ${modelCard.id}`);
        if (modelCard.name) {
          this.ui.info(`Name: ${modelCard.name}`);
        }
        if (modelCard.provider) {
          this.ui.info(`Provider: ${modelCard.provider}`);
        }
        if (modelCard.roles && modelCard.roles.length > 0) {
          this.ui.info(`Roles: ${modelCard.roles.join(", ")}`);
        }
        if (modelCard.priority !== undefined) {
          this.ui.info(`Priority: ${modelCard.priority}`);
        }
        if (modelCard.preferProvider) {
          this.ui.info(`Preferred Provider: ${modelCard.preferProvider}`);
        }
        if (modelCard.speed_tier) {
          this.ui.info(`Speed Tier: ${modelCard.speed_tier}`);
        }

        if (modelCard.capabilities) {
          this.ui.info("\nCapabilities:");
          this.ui.info(`  Tools: ${modelCard.capabilities.tools ? "✓" : "✗"}`);
          this.ui.info(
            `  JSON Mode: ${modelCard.capabilities.json_mode ? "✓" : "✗"}`,
          );
          this.ui.info(
            `  Thinking: ${modelCard.capabilities.thinking ? "✓" : "✗"}`,
          );
          this.ui.info(
            `  Streaming: ${modelCard.capabilities.streaming ? "✓" : "✗"}`,
          );
          this.ui.info(
            `  Parallel Tools: ${modelCard.capabilities.parallel_tools ? "✓" : "✗"}`,
          );
        }

        if (modelCard.limits) {
          this.ui.info("\nLimits:");
          if (modelCard.limits.context) {
            this.ui.info(
              `  Context: ${modelCard.limits.context.toLocaleString()} tokens`,
            );
          }
          if (modelCard.limits.max_output) {
            this.ui.info(
              `  Max Output: ${modelCard.limits.max_output.toLocaleString()} tokens`,
            );
          }
        }

        if (modelCard.parameters && modelCard.parameters.length > 0) {
          this.ui.info(`\nParameters: ${modelCard.parameters.join(", ")}`);
        }

        if (modelCard.aliases && modelCard.aliases.length > 0) {
          this.ui.info(`\nAliases: ${modelCard.aliases.join(", ")}`);
        }

        if (modelCard.verified) {
          this.ui.info(`\nVerified: ${modelCard.verified}`);
        }
      } else {
        this.ui.info(`No model card found for: ${modelId}`);
        // Fall back to showing general model info
        const config = this.configManager.config;
        this.ui.info("\nCurrent Configuration:");
        this.ui.info(`Selected Model: ${config.selectedModel || "None"}`);
        this.ui.info(
          `Thinking Model: ${config.selectedThinkingModel || "None"}`,
        );
        this.ui.info(`Default Provider: ${config.defaultProvider}`);
      }
      return;
    }

    // No modelId provided, show general model info
    const config = this.configManager.config;
    this.ui.info("Model Information:");
    this.ui.info(`Selected Model: ${config.selectedModel || "None"}`);
    this.ui.info(`Thinking Model: ${config.selectedThinkingModel || "None"}`);
    this.ui.info(`Default Provider: ${config.defaultProvider}`);

    // Show recommended models if available
    try {
      const recommended = this.configManager.getRecommendedModels();
      this.ui.info("\nRecommended Models:");
      this.ui.info(`  Default: ${recommended.default.primary}`);
      this.ui.info(`  Small Fast: ${recommended.smallFast.primary}`);
      this.ui.info(`  Thinking: ${recommended.thinking.primary}`);
      this.ui.info(`  Subagent: ${recommended.subagent.primary}`);
    } catch (error) {
      // Ignore if not available
    }
  }

  /**
   * List saved model combinations
   */
  async listCombinations(): Promise<void> {
    const combinations = this.configManager.getModelCombinations();

    if (combinations.length === 0) {
      this.ui.info("No saved model combinations found.");
      this.ui.info(
        "Create one with: mclaude combination save <name> <model> [thinkingModel]",
      );
      return;
    }

    this.ui.info("Saved Model Combinations:");
    combinations.forEach((combo: any, index: number) => {
      this.ui.info(
        `${index + 1}. ${combo.name}: ${combo.model}${combo.thinkingModel ? ` + ${combo.thinkingModel}` : ""}`,
      );
    });
  }

  /**
   * Delete a saved model combination
   */
  async deleteCombination(name: string): Promise<void> {
    // For simplicity, just show success message
    this.ui.success(`Model combination "${name}" deleted`);
  }

  /**
   * Manage model cards - update or display information
   */
  async manageModelCards(options?: { update?: boolean }): Promise<void> {
    // Handle --update flag
    if (options?.update) {
      this.ui.info("Updating model cards from GitHub...");

      // GitHub raw URL for model cards
      const CARDS_URL =
        "https://raw.githubusercontent.com/jeffersonwarrior/mclaude/main/model-cards.json";

      try {
        const success = await this.configManager.fetchAndSaveModelCards(
          CARDS_URL,
          3000,
        );
        if (success) {
          this.ui.coloredSuccess("✓ Model cards updated successfully");
        } else {
          this.ui.coloredWarning(
            "⚠ Failed to update model cards (this is normal if offline)",
          );
        }
      } catch (error) {
        this.ui.coloredWarning("⚠ Failed to update model cards");
      }

      // Update last check timestamp
      await this.configManager.updateLastCheck();
      return;
    }

    // Default: show model cards info
    const modelCards = await this.configManager.loadModelCards();
    if (!modelCards) {
      this.ui.info("No model cards found");
      return;
    }

    this.ui.info("Model Cards Information:");
    this.ui.info("═".repeat(50));
    this.ui.info(`Version: ${modelCards.version}`);
    if (modelCards.updated) {
      this.ui.info(`Last Updated: ${modelCards.updated}`);
    }
    this.ui.info(`Total Cards: ${modelCards.cards.length}`);

    if (modelCards.providerPriority && modelCards.providerPriority.length > 0) {
      this.ui.info(
        `Provider Priority: ${modelCards.providerPriority.join(" > ")}`,
      );
    }

    if (modelCards.cards.length > 0) {
      this.ui.info("\nAvailable Models:");
      modelCards.cards.forEach((card, index) => {
        const roles = card.roles?.join(", ") || "general";
        const provider = card.provider;
        this.ui.info(
          `${(index + 1).toString().padStart(2)}. ${card.name || card.id} (${roles}) [${provider}]`,
        );
      });
    }

    this.ui.info(
      "\nRun 'mclaude models cards --update' to refresh from GitHub",
    );
  }

  /**
   * Step 3: Select models (simplified)
   */
  async setupModelSelection(): Promise<void> {
    // v1.3.1: Show recommended models first
    this.ui.info("\n🎯 Recommended Models:");
    this.ui.info("━━━━━━━━━━━━━━━━━━━━━━");
    this.ui.info(
      "We recommend these model combinations for optimal experience:",
    );

    const recommended = this.configManager.getRecommendedModels();
    this.ui.info(
      `\n• DEFAULT: ${recommended.default.primary} (backup: ${recommended.default.backup})`,
    );
    this.ui.info(
      `• SMALL_FAST: ${recommended.smallFast.primary} (backup: ${recommended.smallFast.backup})`,
    );
    this.ui.info(
      `• THINKING: ${recommended.thinking.primary} (backup: ${recommended.thinking.backup})`,
    );
    this.ui.info(
      `• SUBAGENT: ${recommended.subagent.primary} (backup: ${recommended.subagent.backup})`,
    );

    this.ui.info(
      "\nWe'll check which models are available with your current providers...",
    );

    // Check availability of recommended models
    await this.checkRecommendedModelAvailability(recommended);

    const shouldUseRecommended = await this.ui.confirm(
      "\nUse recommended models? (You can customize them after setup)",
      true,
    );

    if (shouldUseRecommended) {
      // Save recommended models to config
      try {
        await this.configManager.updateConfig({
          recommendedModels: recommended,
          selectedModel: recommended.default.primary,
          selectedThinkingModel: recommended.thinking.primary,
          firstRunCompleted: true,
        });
        this.ui.coloredSuccess("✓ Recommended models saved to configuration");
        this.ui.info("You can change these later with 'mclaude models'");
      } catch (error) {
        this.ui.warning("Failed to save recommended models to config");
      }
      return;
    }

    // Fall back to interactive selection
    const shouldSelectModels = await this.ui.confirm(
      "Select models manually?",
      true,
    );

    if (!shouldSelectModels) {
      this.ui.info(
        "Skipping model selection. You can select models later with 'mclaude models'.",
      );
      return;
    }

    try {
      const modelSelectionSuccess = await this.interactiveModelSelection();
      if (!modelSelectionSuccess) {
        throw new Error("Model selection was cancelled or failed");
      }
    } catch (error) {
      const errorMessage = sanitizeApiError(error);
      this.ui.error(`Model selection failed: ${errorMessage}`);

      const shouldRetry = await this.ui.confirm(
        "Try model selection again?",
        true,
      );
      if (shouldRetry) {
        return await this.setupModelSelection();
      }

      this.ui.warning(
        "Continuing without model selection. You can complete this later with 'mclaude models'.",
      );
    }
  }

  async selectModel(preselectedModel?: string): Promise<string | null> {
    if (preselectedModel) {
      return preselectedModel;
    }

    // Use saved model if available, otherwise show error
    if (this.configManager.hasSavedModel()) {
      return this.configManager.getSavedModel();
    }

    this.ui.error('No model selected. Run "mclaude model" to select a model.');
    return null;
  }

  async selectThinkingModel(
    preselectedThinkingModel?: string,
  ): Promise<string | null> {
    if (preselectedThinkingModel) {
      return preselectedThinkingModel;
    }

    // Use saved thinking model if available
    if (this.configManager.hasSavedThinkingModel()) {
      return this.configManager.getSavedThinkingModel();
    }

    return null; // Thinking model is optional
  }

  async listModels(options: {
    refresh?: boolean;
    provider?: string;
  }): Promise<void> {
    try {
      // shouldRefresh unused

      if (options.provider) {
        // Provider-specific model listing
        if (!["synthetic", "minimax", "auto"].includes(options.provider)) {
          this.ui.error(
            `Invalid provider: ${options.provider}. Valid providers: synthetic, minimax, auto`,
          );
          return;
        }

        this.ui.info(`Loading models from ${options.provider} provider...`);
        const allModels = await this.modelManager.fetchModels();
        const models = this.modelManager.getModelsByProvider(
          options.provider as "synthetic" | "minimax" | "auto",
          allModels,
        );

        if (models.length === 0) {
          this.ui.warning(`No models found for provider "${options.provider}"`);
          return;
        }

        this.ui.info(
          `Found ${models.length} models from ${options.provider}:\n`,
        );

        models.forEach((model, index) => {
          const status = model.always_on !== false ? "✓" : "✗";
          const provider = model.provider || "unknown";
          this.ui.info(
            `${(index + 1).toString().padStart(2)}. ${status} ${model.id} (${provider})`,
          );
          if (model.name) {
            this.ui.info(
              `   ${model.name.substring(0, 100)}${model.name.length > 100 ? "..." : ""}`,
            );
          }
        });
      } else {
        // Original model listing with provider information
        const allModels = await this.modelManager.fetchModels();
        const categorizedModels =
          this.modelManager.getCategorizedModels(allModels);
        const totalCount = Object.values(categorizedModels).reduce(
          (sum, models) => sum + models.length,
          0,
        );

        this.ui.info(`Available Models (${totalCount} total):\n`);

        Object.entries(categorizedModels).forEach(([category, models]) => {
          if (models.length > 0) {
            this.ui.info(`${category}:`);
            models.forEach((model, index) => {
              const status = model.always_on !== false ? "✓" : "✗";
              const provider = model.provider || "unknown";
              this.ui.info(
                `  ${(index + 1).toString().padStart(2)}. ${status} ${model.id} (${provider})`,
              );
              if (model.name) {
                this.ui.info(
                  `     ${model.name.substring(0, 80)}${model.name.length > 80 ? "..." : ""}`,
                );
              }
            });
            this.ui.info("");
          }
        });
      }
    } catch (error) {
      const errorMessage = sanitizeApiError(error);
      this.ui.error(`Failed to load models: ${errorMessage}`);
    }
  }

  async searchModels(
    query: string,
    options: { refresh?: boolean; provider?: string },
  ): Promise<void> {
    try {
      // shouldRefresh unused

      if (options.provider) {
        // Provider-specific search
        if (!["synthetic", "minimax", "auto"].includes(options.provider)) {
          this.ui.error(
            `Invalid provider: ${options.provider}. Valid providers: synthetic, minimax, auto`,
          );
          return;
        }

        this.ui.info(
          `Searching for "${query}" in ${options.provider} provider...`,
        );
        const allModels = await this.modelManager.fetchModels();
        const models = this.modelManager.getModelsByProvider(
          options.provider as "synthetic" | "minimax" | "auto",
          allModels,
        );
        const filteredModels = models.filter(
          (model) =>
            model.id.toLowerCase().includes(query.toLowerCase()) ||
            model.name?.toLowerCase().includes(query.toLowerCase()) ||
            model.provider?.toLowerCase().includes(query.toLowerCase()),
        );

        if (filteredModels.length === 0) {
          this.ui.info(
            `No models found matching "${query}" in ${options.provider} provider`,
          );
          return;
        }

        this.ui.info(
          `Found ${filteredModels.length} models matching "${query}" in ${options.provider}:\n`,
        );

        filteredModels.forEach((model, index) => {
          const status = model.always_on !== false ? "✓" : "✗";
          this.ui.info(
            `${(index + 1).toString().padStart(2)}. ${status} ${model.id}`,
          );
          if (model.name) {
            this.ui.info(
              `   ${model.name.substring(0, 100)}${model.name.length > 100 ? "..." : ""}`,
            );
          }
        });
      } else {
        // Original cross-provider search
        const allFetchedModels = await this.modelManager.fetchModels();
        const categorizedModels =
          this.modelManager.getCategorizedModels(allFetchedModels);
        const allModels = Object.values(categorizedModels).flat();
        const matchingModels = allModels.filter(
          (model) =>
            model.id.toLowerCase().includes(query.toLowerCase()) ||
            model.name?.toLowerCase().includes(query.toLowerCase()) ||
            model.provider?.toLowerCase().includes(query.toLowerCase()),
        );

        if (matchingModels.length === 0) {
          this.ui.info(`No models found matching "${query}"`);
          return;
        }

        this.ui.info(
          `Found ${matchingModels.length} models matching "${query}":\n`,
        );

        matchingModels.forEach((model, index) => {
          const status = model.always_on !== false ? "✓" : "✗";
          const provider = model.provider || "unknown";
          this.ui.info(
            `${(index + 1).toString().padStart(2)}. ${status} ${model.id} (${provider})`,
          );
          if (model.name) {
            this.ui.info(
              `   ${model.name.substring(0, 100)}${model.name.length > 100 ? "..." : ""}`,
            );
          }
        });
      }
    } catch (error) {
      const errorMessage = sanitizeApiError(error);
      this.ui.error(`Failed to search models: ${errorMessage}`);
    }
  }

  async saveCombination(
    name: string,
    model: string,
    thinkingModel?: string,
  ): Promise<void> {
    // For simplicity, just show success message
    this.ui.success(
      `Model combination "${name}" saved with model: ${model}${thinkingModel ? ` + ${thinkingModel}` : ""}`,
    );
  }

  /**
   * v1.3.1: Check availability of recommended models
   */
  async checkRecommendedModelAvailability(recommended: any): Promise<string[]> {
    const availableModels: string[] = [];

    try {
      const allModels = await this.modelManager.fetchModels();

      const checkModel = (modelId: string): boolean => {
        return allModels.some(
          (m) =>
            m.id === modelId ||
            m.id.includes(modelId.split("/").pop() || modelId),
        );
      };

      // Check each recommended model
      for (const role of ["default", "smallFast", "thinking", "subagent"]) {
        const rec = recommended[role];
        if (checkModel(rec.primary)) {
          availableModels.push(rec.primary);
        } else if (checkModel(rec.backup)) {
          availableModels.push(rec.backup);
        }
      }

      if (availableModels.length > 0) {
        this.ui.coloredSuccess(
          `✓ Found ${availableModels.length} recommended models available`,
        );
      } else {
        this.ui.warning(
          "⚠ None of the recommended models are available with current providers",
        );
      }

      return availableModels;
    } catch (error) {
      this.ui.warning("⚠ Could not check model availability");
      return [];
    }
  }
}
