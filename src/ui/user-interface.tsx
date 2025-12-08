import { render } from 'ink';
import React from 'react';
import chalk from 'chalk';
import { ModelInfoImpl } from '../models';
import { ModelSelector } from './components/ModelSelector';
import { RobustModelSelector } from './components/RobustModelSelector';
import { StatusMessage } from './components/StatusMessage';
import { ProgressBar } from './components/ProgressBar';
import { ProviderStatusIndicator, type ProviderStatus, getProviderSummary } from './components/ProviderStatus';
import { ConfigManager } from '../config';

export interface UIOptions {
  verbose?: boolean;
  quiet?: boolean;
}

export class UserInterface {
  private verbose: boolean;
  private quiet: boolean;
  private configManager: ConfigManager;

  constructor(options: UIOptions = {}, configManager?: ConfigManager) {
    this.verbose = options.verbose || false;
    this.quiet = options.quiet || false;
    this.configManager = configManager || new ConfigManager();
  }

  // Simple console output methods
  info(message: string, ...args: any[]): void {
    if (!this.quiet) {
      console.log(`ℹ ${message}`, ...args);
    }
  }

  success(message: string, ...args: any[]): void {
    if (!this.quiet) {
      console.log(`✓ ${message}`, ...args);
    }
  }

  // Colored success message for important notifications
  coloredSuccess(message: string, ...args: any[]): void {
    if (!this.quiet) {
      console.log(chalk.green(`✓ ${message}`), ...args);
    }
  }

  // Colored info message for important notifications
  coloredInfo(message: string, ...args: any[]): void {
    if (!this.quiet) {
      console.log(chalk.blue(`ℹ ${message}`), ...args);
    }
  }

  // Colored warning message for important notifications
  coloredWarning(message: string, ...args: any[]): void {
    if (!this.quiet) {
      console.log(chalk.yellow(`⚠ ${message}`), ...args);
    }
  }

  // MiniMax branded message for setup
  minimaxWelcome(message: string, ...args: any[]): void {
    if (!this.quiet) {
      console.log(chalk.red(`ℹ ${message}`), ...args);
    }
  }

  // Highlighted message with colored elements within
  highlightInfo(message: string, highlights: string[] = []): void {
    if (!this.quiet) {
      let output = chalk.blue('ℹ ');
      let processedMessage = message;

      // Color each highlighted occurrence
      highlights.forEach(highlight => {
        const regex = new RegExp(`(${highlight})`, 'g');
        processedMessage = processedMessage.replace(regex, chalk.cyan('$1'));
      });

      output += processedMessage;
      console.log(output);
    }
  }

  warning(message: string, ...args: any[]): void {
    if (!this.quiet) {
      console.warn(`⚠ ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    console.error(`✗ ${message}`, ...args);
  }

  async prompt(message: string): Promise<string> {
    return new Promise((resolve) => {
      process.stdout.write(chalk.yellow(`? ${message}: `));
      process.stdin.once("data", (data) => {
        resolve(data.toString().trim());
      });
    });
  }

  async confirm(message: string, defaultValue: boolean): Promise<boolean> {
    if (this.quiet) {
      return defaultValue;
    }
    const answer = await this.prompt(`${message} (y/n)`);
    return answer.toLowerCase() === "y";
  }

  debug(message: string, ...args: any[]): void {
    if (this.verbose) {
      console.debug(`🐛 ${message}`, ...args);
    }
  }

  // Show a simple list of models (legacy method with provider support)
  showModelList(models: ModelInfoImpl[], selectedIndex?: number): void {
    if (models.length === 0) {
      this.info('No models available');
      return;
    }

    console.log('\nAvailable Models:');
    console.log('================');

    models.forEach((model, index) => {
      const marker = selectedIndex === index ? '➤' : ' ';
      const providerColor = model.getProvider() === 'synthetic' ? chalk.cyan :
                           model.getProvider() === 'minimax' ? chalk.red :
                           model.getProvider() === 'auto' ? chalk.green : chalk.white;

      console.log(`${marker} ${index + 1}. ${chalk.bold(model.getDisplayName())}`);
      console.log(`    ${model.getProviderTag()}`);

      if (model.owned_by) {
        console.log(`    Owner: ${model.owned_by}`);
      }

      if (model.context_length) {
        console.log(`    Context: ${Math.round(model.context_length / 1024)}K tokens`);
      }

      if (model.id.toLowerCase().includes('thinking')) {
        console.log(`    Type: ${chalk.magenta('🤔 Thinking')}`);
      }

      if (model.isClaudeCompatible()) {
        console.log(`    Compatible: ${chalk.green('✓ Claude')}`);
      }

      console.log('');
    });
  }

  // Interactive model selection using Ink (single model - for backward compatibility)
  async selectModel(models: ModelInfoImpl[]): Promise<ModelInfoImpl | null> {
    if (models.length === 0) {
      this.error('No models available for selection');
      return null;
    }

    return new Promise(resolve => {
      const { waitUntilExit } = render(
        <RobustModelSelector
          models={models}
          onSelect={(regularModel, thinkingModel) => {
            const selected = regularModel || thinkingModel;
            if (selected) {
              this.success(`Selected model: ${selected.getDisplayName()}`);
              resolve(selected);
            } else {
              this.info('No model selected');
              resolve(null);
            }
          }}
          onCancel={() => {
            this.info('Model selection cancelled');
            resolve(null);
          }}
        />
      );

      waitUntilExit().catch(() => {
        resolve(null);
      });
    });
  }

  // Interactive dual model selection using Ink
  async selectDualModels(
    models: ModelInfoImpl[],
    authenticationError?: string | null,
    onSelectSubagent?: (model: ModelInfoImpl | null) => void,
    onSelectFast?: (model: ModelInfoImpl | null) => void
  ): Promise<{regular: ModelInfoImpl | null, thinking: ModelInfoImpl | null}> {
    if (models.length === 0 && !authenticationError) {
      this.error('No models available for selection');
      return { regular: null, thinking: null };
    }

    // Get provider status from config manager
    const providerStatus = this.configManager.getAtomicProviderState();

    // Create enhanced provider status with current timestamp
    const now = new Date();
    const providerStatusWithTimestamp = {
      synthetic: {
        available: providerStatus.synthetic.available,
        lastChecked: now
      },
      minimax: {
        available: providerStatus.minimax.available,
        lastChecked: now
      }
    };

    return new Promise(resolve => {
      const { waitUntilExit } = render(
        <RobustModelSelector
          models={models}
          authenticationError={authenticationError}
          providerStatus={providerStatusWithTimestamp}
          onSelectSubagent={onSelectSubagent}
          onSelectFast={onSelectFast}
          onSelect={(regularModel, thinkingModel) => {
            if (regularModel || thinkingModel) {
              if (regularModel) this.success(`Regular model: ${regularModel.getDisplayName()}`);
              if (thinkingModel) this.success(`Thinking model: ${thinkingModel.getDisplayName()}`);
            } else {
              this.info('No models selected');
            }
            resolve({ regular: regularModel, thinking: thinkingModel });
          }}
          onCancel={() => {
            this.info('Model selection cancelled');
            resolve({ regular: null, thinking: null });
          }}
        />
      );

      waitUntilExit().catch(() => {
        resolve({ regular: null, thinking: null });
      });
    });
  }

  // Show progress (simple console version)
  showProgress(current: number, total: number, label?: string): void {
    if (this.quiet) return;

    const percentage = Math.round((current / total) * 100);
    const barLength = 20;
    const filledLength = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

    const labelStr = label ? `${label} ` : '';
    process.stdout.write(`\r${labelStr}[${bar}] ${percentage}% (${current}/${total})`);

    if (current >= total) {
      console.log(''); // New line when complete
    }
  }

  // Ask for user input (simple)
  async askQuestion(question: string, defaultValue?: string): Promise<string> {
    return new Promise(resolve => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
      rl.question(prompt, (answer: string) => {
        rl.close();
        resolve(answer || defaultValue || '');
      });
    });
  }

  // Ask for password input (masked with asterisks)
  async askPassword(question: string): Promise<string> {
    return new Promise(resolve => {
      const readline = require('readline');

      // Store original settings
      const stdin = process.stdin;
      const stdout = process.stdout;
      const wasRaw = stdin.isRaw;

      let password = '';
      stdout.write(`${question}: `);

      // Enable raw mode to capture individual keystrokes
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      const onData = (key: string) => {
        switch (key) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl+D
            // Restore original stdin settings
            stdin.setRawMode(wasRaw);
            stdin.pause();
            stdin.removeListener('data', onData);
            stdout.write('\n');
            resolve(password);
            break;
          case '\u0003': // Ctrl+C
            // Restore original stdin settings
            stdin.setRawMode(wasRaw);
            stdin.pause();
            stdin.removeListener('data', onData);
            stdout.write('\n');
            resolve('');
            break;
          case '\u007F': // Backspace (DEL)
          case '\u0008': // Backspace (BS)
            if (password.length > 0) {
              password = password.slice(0, -1);
              stdout.write('\b \b');
            }
            break;
          default:
            // Handle multi-character input (like paste) and individual keypresses
            for (let i = 0; i < key.length; i++) {
              const char = key[i];
              // Only accept printable ASCII characters
              if (char && char >= ' ' && char <= '~') {
                password += char;
                stdout.write('*');
              }
            }
        }
      };

      stdin.on('data', onData);
    });
  }

  // Ask for input
  async ask(question: string, defaultValue?: string): Promise<string> {
    return this.askQuestion(question, defaultValue);
  }

  // Confirm action
  // Note: confirm method is defined above using prompt implementation

  // Display a table (for config output)
  table(data: Record<string, string>): void {
    if (this.quiet) return;

    const keys = Object.keys(data);
    if (keys.length === 0) {
      this.info("No configuration data to display.");
      return;
    }

    const maxKeyLength = Math.max(...keys.map(key => key.length));

    for (const key of keys) {
      const value = data[key];
      console.log(`${key.padEnd(maxKeyLength)} : ${value}`);
    }
  }

  // Show status message using Ink component
  showStatus(type: 'info' | 'success' | 'warning' | 'error', message: string): void {
    const { waitUntilExit } = render(<StatusMessage type={type} message={message} />);
    waitUntilExit();
  }

  // Show provider status
  showProviderStatus(providers: ProviderStatus[], details: boolean = false, compact: boolean = false): void {
    if (this.quiet) return;

    const { waitUntilExit } = render(
      <ProviderStatusIndicator providers={providers} showDetails={details} compact={compact} />
    );
    waitUntilExit();
  }

  // Show provider summary
  showProviderSummary(providers: ProviderStatus[]): void {
    if (this.quiet || providers.length === 0) return;

    const summary = getProviderSummary(providers);
    this.coloredInfo(`Provider Status: ${summary}`);
  }

  // Show provider-specific error
  showProviderError(provider: string, error: string): void {
    const providerColors = {
      synthetic: chalk.cyan,
      minimax: chalk.red,
      auto: chalk.green,
    };

    const color = providerColors[provider as keyof typeof providerColors] || chalk.white;

    if (this.quiet) {
      console.error(`${color(`${provider}:`)} ${error}`);
    } else {
      console.error(`${color('✗')} ${color(provider)} Error: ${error}`);
    }
  }

  // Show model selection with provider information
  showModelSelectionWithProviders(models: ModelInfoImpl[], selectedIndex?: number): void {
    if (models.length === 0) {
      this.info('No models available');
      return;
    }

    console.log('\nAvailable Models:');
    console.log('================');

    // Group models by provider
    const modelsByProvider = models.reduce((acc, model) => {
      const provider = model.getProvider();
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push(model);
      return acc;
    }, {} as Record<string, ModelInfoImpl[]>);

    Object.entries(modelsByProvider).forEach(([provider, providerModels]) => {
      const providerColor = provider === 'synthetic' ? chalk.cyan :
                           provider === 'minimax' ? chalk.red :
                           provider === 'auto' ? chalk.green : chalk.white;

      console.log(`\n${providerColor.bold(provider)} (${providerModels.length} models):`);
      console.log('─'.repeat(provider.length + 12));

      providerModels.forEach((model, index) => {
        const globalIndex = models.indexOf(model);
        const isSelected = globalIndex === selectedIndex;
        const marker = isSelected ? '➤' : ' ';

        console.log(`${marker} ${globalIndex + 1}. ${chalk.bold(model.getDisplayName())}`);
        console.log(`    ${model.getProviderTag()}`);

        if (model.context_length) {
          console.log(`    Context: ${Math.round(model.context_length / 1024)}K tokens`);
        }

        if (model.id.toLowerCase().includes('thinking')) {
          console.log(`    Type: ${chalk.magenta('🤔 Thinking')}`);
        }

        if (model.isClaudeCompatible()) {
          console.log(`    Compatible: ${chalk.green('✓ Claude')}`);
        }

        console.log('');
      });
    });
  }

  // Clear terminal
  clear(): void {
    console.clear();
  }

  // Provider-specific API key prompt
  async promptForProviderApiKey(provider: 'synthetic' | 'minimax'): Promise<string | null> {
    const providerNames = {
      synthetic: 'Synthetic',
      minimax: 'MiniMax'
    };

    const providerColors = {
      synthetic: chalk.cyan,
      minimax: chalk.red
    };

    const color = providerColors[provider];
    const name = providerNames[provider];

    this.error(`${color(name)} authentication failed. Please enter a new API key.`);

    const newApiKey = await this.askPassword(`Enter your new ${name} API key`);
    if (!newApiKey) {
      this.info(`No ${name} API key entered.`);
      return null;
    }

    return newApiKey;
  }

  // Provider-specific success message
  showProviderApiKeySuccess(provider: 'synthetic' | 'minimax'): void {
    const providerNames = {
      synthetic: 'Synthetic',
      minimax: 'MiniMax'
    };

    const providerColors = {
      synthetic: chalk.cyan,
      minimax: chalk.red
    };

    const color = providerColors[provider];
    const name = providerNames[provider];

    this.coloredSuccess(`${name} API key saved successfully`);
  }

  // Provider-specific error message
  showProviderApiKeyError(provider: 'synthetic' | 'minimax', error: string): void {
    const providerNames = {
      synthetic: 'Synthetic',
      minimax: 'MiniMax'
    };

    const providerColors = {
      synthetic: chalk.cyan,
      minimax: chalk.red
    };

    const color = providerColors[provider];
    const name = providerNames[provider];

    this.error(`${name} API key error: ${error}`);
  }

  // Setup-specific UI methods for streamlined flow

  showSetupStep(stepNumber: number, totalSteps: number, stepName: string): void {
    const progress = `[${stepNumber}/${totalSteps}]`;
    console.log(chalk.blue(`\n${progress} 📋 Step: ${stepName}`));
    console.log(chalk.gray("─".repeat(stepName.length + 10)));
  }

  showSetupStepResult(stepName: string, success: boolean, message?: string): void {
    if (success) {
      console.log(chalk.green(`✓ ${stepName} completed${message ? `: ${message}` : ''}`));
    } else {
      console.log(chalk.yellow(`⚠ ${stepName} completed with warnings${message ? `: ${message}` : ''}`));
    }
  }

  showSetupProgress(current: number, total: number, stepName: string): void {
    const percentage = Math.round((current / total) * 100);
    const barLength = 15;
    const filledLength = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

    console.log(chalk.cyan(`\n${stepName}: [${bar}] ${percentage}%`));
  }

  showSetupSummary(summary: {
    providersConfigured: number;
    providersWorking: number;
    defaultModel?: string;
    thinkingModel?: string;
  }): void {
    console.log(chalk.blue('\n📋 Setup Summary:'));
    console.log(chalk.gray('================='));
    console.log(`✓ Available Providers: ${summary.providersWorking}/${summary.providersConfigured}`);

    if (summary.defaultModel) {
      console.log(`✓ Default Model: ${summary.defaultModel}`);
    }

    if (summary.thinkingModel) {
      console.log(`✓ Thinking Model: ${summary.thinkingModel}`);
    }

    console.log(`✓ Configuration ready to use`);
  }

  showStepError(stepName: string, error: string): void {
    console.log(chalk.red(`❌ ${stepName} failed: ${error}`));
  }

  showRecoveryOptions(): void {
    console.log('\nRecovery Options:');
    console.log(chalk.cyan('1. Retry this step'));
    console.log(chalk.cyan('2. Skip this step and continue (if possible)'));
    console.log(chalk.cyan('3. Abort setup and fix the issue manually'));
  }

  showProviderChoice(): void {
    console.log('\nConfigure at least one provider to continue:');
    console.log(chalk.cyan('1. Synthetic API (Recommended)'));
    console.log(chalk.red('2. MiniMax API'));
    console.log(chalk.yellow('3. Both providers'));
  }

  showProviderConfigured(provider: 'synthetic' | 'minimax'): void {
    const providerColors = {
      synthetic: chalk.cyan,
      minimax: chalk.red
    };

    const color = providerColors[provider];
    console.log(color(`✓ ${provider.charAt(0).toUpperCase() + provider.slice(1)} provider configured`));
  }

  showConnectionTestResult(provider: string, success: boolean, error?: string): void {
    if (success) {
      console.log(chalk.green(`✓ ${provider} connection successful`));
    } else {
      console.log(chalk.red(`✗ ${provider} connection failed${error ? `: ${error}` : ''}`));
    }
  }
}
