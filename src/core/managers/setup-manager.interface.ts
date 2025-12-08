/**
 * Error handling options for setup step failures
 */
export interface SetupStepErrorResult {
  shouldContinue: boolean;
  retryStep: boolean;
  skipStep: boolean;
}

/**
 * Setup step definition for orchestrator
 */
export interface SetupStep {
  name: string;
  action: () => Promise<void>;
  skipCondition?: () => Promise<boolean>;
  retryAction?: () => Promise<void>;
}

/**
 * Setup configuration options
 */
export interface SetupOptions {
  skipSteps?: string[];
  retryFailures?: boolean;
  nonInteractive?: boolean;
}

/**
 * Setup progress tracking
 */
export interface SetupProgress {
  completedSteps: string[];
  failedSteps: string[];
  skippedSteps: string[];
  currentStep: string | null;
}

/**
 * SetupManager interface for handling application setup flow
 */
export interface ISetupManager {
  /**
   * Run the complete setup process
   */
  setup(): Promise<void>;
}