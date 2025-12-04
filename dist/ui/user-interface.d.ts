import { ModelInfoImpl } from '../models';
import { type ProviderStatus } from './components/ProviderStatus';
import { ConfigManager } from '../config';
export interface UIOptions {
    verbose?: boolean;
    quiet?: boolean;
}
export declare class UserInterface {
    private verbose;
    private quiet;
    private configManager;
    constructor(options?: UIOptions, configManager?: ConfigManager);
    info(message: string, ...args: any[]): void;
    success(message: string, ...args: any[]): void;
    coloredSuccess(message: string, ...args: any[]): void;
    coloredInfo(message: string, ...args: any[]): void;
    minimaxWelcome(message: string, ...args: any[]): void;
    highlightInfo(message: string, highlights?: string[]): void;
    warning(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    showModelList(models: ModelInfoImpl[], selectedIndex?: number): void;
    selectModel(models: ModelInfoImpl[]): Promise<ModelInfoImpl | null>;
    selectDualModels(models: ModelInfoImpl[], authenticationError?: string | null): Promise<{
        regular: ModelInfoImpl | null;
        thinking: ModelInfoImpl | null;
    }>;
    showProgress(current: number, total: number, label?: string): void;
    askQuestion(question: string, defaultValue?: string): Promise<string>;
    askPassword(question: string): Promise<string>;
    ask(question: string, defaultValue?: string): Promise<string>;
    confirm(message: string, defaultValue?: boolean): Promise<boolean>;
    showStatus(type: 'info' | 'success' | 'warning' | 'error', message: string): void;
    showProviderStatus(providers: ProviderStatus[], details?: boolean, compact?: boolean): void;
    showProviderSummary(providers: ProviderStatus[]): void;
    showProviderError(provider: string, error: string): void;
    showModelSelectionWithProviders(models: ModelInfoImpl[], selectedIndex?: number): void;
    clear(): void;
    promptForProviderApiKey(provider: 'synthetic' | 'minimax'): Promise<string | null>;
    showProviderApiKeySuccess(provider: 'synthetic' | 'minimax'): void;
    showProviderApiKeyError(provider: 'synthetic' | 'minimax', error: string): void;
    showSetupStep(stepNumber: number, totalSteps: number, stepName: string): void;
    showSetupStepResult(stepName: string, success: boolean, message?: string): void;
    showSetupProgress(current: number, total: number, stepName: string): void;
    showSetupSummary(summary: {
        providersConfigured: number;
        providersWorking: number;
        defaultModel?: string;
        thinkingModel?: string;
    }): void;
    showStepError(stepName: string, error: string): void;
    showRecoveryOptions(): void;
    showProviderChoice(): void;
    showProviderConfigured(provider: 'synthetic' | 'minimax'): void;
    showConnectionTestResult(provider: string, success: boolean, error?: string): void;
}
//# sourceMappingURL=user-interface.d.ts.map