export interface ConfigCliManagerInterface {
  showConfig(): Promise<void>;
  setConfig(key: string, value: string): Promise<void>;
  resetConfig(options?: { scope?: string }): Promise<void>;
  showConfigContext(): Promise<void>;
  listCombinations(): Promise<void>;
  saveCombination(name: string, model: string, thinkingModel?: string): Promise<void>;
  deleteCombination(name: string): Promise<void>;
  showStats(options?: { reset?: boolean; format?: string }): Promise<void>;
  manageSysprompt(options: { global?: boolean; show?: boolean; clear?: boolean; raw?: boolean }): Promise<void>;
}