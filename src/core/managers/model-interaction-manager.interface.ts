export interface ModelInteractionManagerInterface {
  interactiveThinkingModelSelection(): Promise<boolean>;
  showModelInfo(modelId?: string): Promise<void>;
  listCombinations(): Promise<void>;
  deleteCombination(name: string): Promise<void>;
  manageModelCards(options?: { update?: boolean }): Promise<void>;
  selectModel(preselectedModel?: string): Promise<string | null>;
  selectThinkingModel(
    preselectedThinkingModel?: string,
  ): Promise<string | null>;
  interactiveModelSelection(options?: {
    provider?: string;
    thinkingProvider?: string;
    saveCombination?: string;
  }): Promise<boolean>;
  listModels(options: { refresh?: boolean; provider?: string }): Promise<void>;
  searchModels(
    query: string,
    options: { refresh?: boolean; provider?: string },
  ): Promise<void>;
  saveCombination(
    name: string,
    model: string,
    thinkingModel?: string,
  ): Promise<void>;
  checkRecommendedModelAvailability(recommended: any): Promise<string[]>;
  setupModelSelection(): Promise<void>;
}
