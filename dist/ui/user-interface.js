"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInterface = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ink_1 = require("ink");
const chalk_1 = __importDefault(require("chalk"));
const RobustModelSelector_1 = require("./components/RobustModelSelector");
const StatusMessage_1 = require("./components/StatusMessage");
const ProviderStatus_1 = require("./components/ProviderStatus");
const config_1 = require("../config");
class UserInterface {
    verbose;
    quiet;
    configManager;
    constructor(options = {}, configManager) {
        this.verbose = options.verbose || false;
        this.quiet = options.quiet || false;
        this.configManager = configManager || new config_1.ConfigManager();
    }
    // Simple console output methods
    info(message, ...args) {
        if (!this.quiet) {
            console.log(`ℹ ${message}`, ...args);
        }
    }
    success(message, ...args) {
        if (!this.quiet) {
            console.log(`✓ ${message}`, ...args);
        }
    }
    // Colored success message for important notifications
    coloredSuccess(message, ...args) {
        if (!this.quiet) {
            console.log(chalk_1.default.green(`✓ ${message}`), ...args);
        }
    }
    // Colored info message for important notifications
    coloredInfo(message, ...args) {
        if (!this.quiet) {
            console.log(chalk_1.default.blue(`ℹ ${message}`), ...args);
        }
    }
    // MiniMax branded message for setup
    minimaxWelcome(message, ...args) {
        if (!this.quiet) {
            console.log(chalk_1.default.red(`ℹ ${message}`), ...args);
        }
    }
    // Highlighted message with colored elements within
    highlightInfo(message, highlights = []) {
        if (!this.quiet) {
            let output = chalk_1.default.blue('ℹ ');
            let processedMessage = message;
            // Color each highlighted occurrence
            highlights.forEach(highlight => {
                const regex = new RegExp(`(${highlight})`, 'g');
                processedMessage = processedMessage.replace(regex, chalk_1.default.cyan('$1'));
            });
            output += processedMessage;
            console.log(output);
        }
    }
    warning(message, ...args) {
        if (!this.quiet) {
            console.warn(`⚠ ${message}`, ...args);
        }
    }
    error(message, ...args) {
        console.error(`✗ ${message}`, ...args);
    }
    debug(message, ...args) {
        if (this.verbose) {
            console.debug(`🐛 ${message}`, ...args);
        }
    }
    // Show a simple list of models (legacy method with provider support)
    showModelList(models, selectedIndex) {
        if (models.length === 0) {
            this.info('No models available');
            return;
        }
        console.log('\nAvailable Models:');
        console.log('================');
        models.forEach((model, index) => {
            const marker = selectedIndex === index ? '➤' : ' ';
            const providerColor = model.getProvider() === 'synthetic' ? chalk_1.default.cyan :
                model.getProvider() === 'minimax' ? chalk_1.default.red :
                    model.getProvider() === 'auto' ? chalk_1.default.green : chalk_1.default.white;
            console.log(`${marker} ${index + 1}. ${chalk_1.default.bold(model.getDisplayName())}`);
            console.log(`    ${model.getProviderTag()}`);
            if (model.owned_by) {
                console.log(`    Owner: ${model.owned_by}`);
            }
            if (model.context_length) {
                console.log(`    Context: ${Math.round(model.context_length / 1024)}K tokens`);
            }
            if (model.id.toLowerCase().includes('thinking')) {
                console.log(`    Type: ${chalk_1.default.magenta('🤔 Thinking')}`);
            }
            if (model.isClaudeCompatible()) {
                console.log(`    Compatible: ${chalk_1.default.green('✓ Claude')}`);
            }
            console.log('');
        });
    }
    // Interactive model selection using Ink (single model - for backward compatibility)
    async selectModel(models) {
        if (models.length === 0) {
            this.error('No models available for selection');
            return null;
        }
        return new Promise(resolve => {
            const { waitUntilExit } = (0, ink_1.render)((0, jsx_runtime_1.jsx)(RobustModelSelector_1.RobustModelSelector, { models: models, onSelect: (regularModel, thinkingModel) => {
                    const selected = regularModel || thinkingModel;
                    if (selected) {
                        this.success(`Selected model: ${selected.getDisplayName()}`);
                        resolve(selected);
                    }
                    else {
                        this.info('No model selected');
                        resolve(null);
                    }
                }, onCancel: () => {
                    this.info('Model selection cancelled');
                    resolve(null);
                } }));
            waitUntilExit().catch(() => {
                resolve(null);
            });
        });
    }
    // Interactive dual model selection using Ink
    async selectDualModels(models, authenticationError) {
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
            const { waitUntilExit } = (0, ink_1.render)((0, jsx_runtime_1.jsx)(RobustModelSelector_1.RobustModelSelector, { models: models, authenticationError: authenticationError, providerStatus: providerStatusWithTimestamp, onSelect: (regularModel, thinkingModel) => {
                    if (regularModel || thinkingModel) {
                        if (regularModel)
                            this.success(`Regular model: ${regularModel.getDisplayName()}`);
                        if (thinkingModel)
                            this.success(`Thinking model: ${thinkingModel.getDisplayName()}`);
                    }
                    else {
                        this.info('No models selected');
                    }
                    resolve({ regular: regularModel, thinking: thinkingModel });
                }, onCancel: () => {
                    this.info('Model selection cancelled');
                    resolve({ regular: null, thinking: null });
                } }));
            waitUntilExit().catch(() => {
                resolve({ regular: null, thinking: null });
            });
        });
    }
    // Show progress (simple console version)
    showProgress(current, total, label) {
        if (this.quiet)
            return;
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
    async askQuestion(question, defaultValue) {
        return new Promise(resolve => {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
            rl.question(prompt, (answer) => {
                rl.close();
                resolve(answer || defaultValue || '');
            });
        });
    }
    // Ask for password input (masked with asterisks)
    async askPassword(question) {
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
            const onData = (key) => {
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
    async ask(question, defaultValue) {
        return this.askQuestion(question, defaultValue);
    }
    // Confirm action
    async confirm(message, defaultValue = false) {
        const answer = await this.askQuestion(message, defaultValue ? 'y' : 'n');
        return answer.toLowerCase().startsWith('y');
    }
    // Show status message using Ink component
    showStatus(type, message) {
        const { waitUntilExit } = (0, ink_1.render)((0, jsx_runtime_1.jsx)(StatusMessage_1.StatusMessage, { type: type, message: message }));
        waitUntilExit();
    }
    // Show provider status
    showProviderStatus(providers, details = false, compact = false) {
        if (this.quiet)
            return;
        const { waitUntilExit } = (0, ink_1.render)((0, jsx_runtime_1.jsx)(ProviderStatus_1.ProviderStatusIndicator, { providers: providers, showDetails: details, compact: compact }));
        waitUntilExit();
    }
    // Show provider summary
    showProviderSummary(providers) {
        if (this.quiet || providers.length === 0)
            return;
        const summary = (0, ProviderStatus_1.getProviderSummary)(providers);
        this.coloredInfo(`Provider Status: ${summary}`);
    }
    // Show provider-specific error
    showProviderError(provider, error) {
        const providerColors = {
            synthetic: chalk_1.default.cyan,
            minimax: chalk_1.default.red,
            auto: chalk_1.default.green,
        };
        const color = providerColors[provider] || chalk_1.default.white;
        if (this.quiet) {
            console.error(`${color(`${provider}:`)} ${error}`);
        }
        else {
            console.error(`${color('✗')} ${color(provider)} Error: ${error}`);
        }
    }
    // Show model selection with provider information
    showModelSelectionWithProviders(models, selectedIndex) {
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
        }, {});
        Object.entries(modelsByProvider).forEach(([provider, providerModels]) => {
            const providerColor = provider === 'synthetic' ? chalk_1.default.cyan :
                provider === 'minimax' ? chalk_1.default.red :
                    provider === 'auto' ? chalk_1.default.green : chalk_1.default.white;
            console.log(`\n${providerColor.bold(provider)} (${providerModels.length} models):`);
            console.log('─'.repeat(provider.length + 12));
            providerModels.forEach((model, index) => {
                const globalIndex = models.indexOf(model);
                const isSelected = globalIndex === selectedIndex;
                const marker = isSelected ? '➤' : ' ';
                console.log(`${marker} ${globalIndex + 1}. ${chalk_1.default.bold(model.getDisplayName())}`);
                console.log(`    ${model.getProviderTag()}`);
                if (model.context_length) {
                    console.log(`    Context: ${Math.round(model.context_length / 1024)}K tokens`);
                }
                if (model.id.toLowerCase().includes('thinking')) {
                    console.log(`    Type: ${chalk_1.default.magenta('🤔 Thinking')}`);
                }
                if (model.isClaudeCompatible()) {
                    console.log(`    Compatible: ${chalk_1.default.green('✓ Claude')}`);
                }
                console.log('');
            });
        });
    }
    // Clear terminal
    clear() {
        console.clear();
    }
    // Provider-specific API key prompt
    async promptForProviderApiKey(provider) {
        const providerNames = {
            synthetic: 'Synthetic',
            minimax: 'MiniMax'
        };
        const providerColors = {
            synthetic: chalk_1.default.cyan,
            minimax: chalk_1.default.red
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
    showProviderApiKeySuccess(provider) {
        const providerNames = {
            synthetic: 'Synthetic',
            minimax: 'MiniMax'
        };
        const providerColors = {
            synthetic: chalk_1.default.cyan,
            minimax: chalk_1.default.red
        };
        const color = providerColors[provider];
        const name = providerNames[provider];
        this.coloredSuccess(`${name} API key saved successfully`);
    }
    // Provider-specific error message
    showProviderApiKeyError(provider, error) {
        const providerNames = {
            synthetic: 'Synthetic',
            minimax: 'MiniMax'
        };
        const providerColors = {
            synthetic: chalk_1.default.cyan,
            minimax: chalk_1.default.red
        };
        const color = providerColors[provider];
        const name = providerNames[provider];
        this.error(`${name} API key error: ${error}`);
    }
    // Setup-specific UI methods for streamlined flow
    showSetupStep(stepNumber, totalSteps, stepName) {
        const progress = `[${stepNumber}/${totalSteps}]`;
        console.log(chalk_1.default.blue(`\n${progress} 📋 Step: ${stepName}`));
        console.log(chalk_1.default.gray("─".repeat(stepName.length + 10)));
    }
    showSetupStepResult(stepName, success, message) {
        if (success) {
            console.log(chalk_1.default.green(`✓ ${stepName} completed${message ? `: ${message}` : ''}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠ ${stepName} completed with warnings${message ? `: ${message}` : ''}`));
        }
    }
    showSetupProgress(current, total, stepName) {
        const percentage = Math.round((current / total) * 100);
        const barLength = 15;
        const filledLength = Math.round((percentage / 100) * barLength);
        const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        console.log(chalk_1.default.cyan(`\n${stepName}: [${bar}] ${percentage}%`));
    }
    showSetupSummary(summary) {
        console.log(chalk_1.default.blue('\n📋 Setup Summary:'));
        console.log(chalk_1.default.gray('================='));
        console.log(`✓ Available Providers: ${summary.providersWorking}/${summary.providersConfigured}`);
        if (summary.defaultModel) {
            console.log(`✓ Default Model: ${summary.defaultModel}`);
        }
        if (summary.thinkingModel) {
            console.log(`✓ Thinking Model: ${summary.thinkingModel}`);
        }
        console.log(`✓ Configuration ready to use`);
    }
    showStepError(stepName, error) {
        console.log(chalk_1.default.red(`❌ ${stepName} failed: ${error}`));
    }
    showRecoveryOptions() {
        console.log('\nRecovery Options:');
        console.log(chalk_1.default.cyan('1. Retry this step'));
        console.log(chalk_1.default.cyan('2. Skip this step and continue (if possible)'));
        console.log(chalk_1.default.cyan('3. Abort setup and fix the issue manually'));
    }
    showProviderChoice() {
        console.log('\nConfigure at least one provider to continue:');
        console.log(chalk_1.default.cyan('1. Synthetic API (Recommended)'));
        console.log(chalk_1.default.red('2. MiniMax API'));
        console.log(chalk_1.default.yellow('3. Both providers'));
    }
    showProviderConfigured(provider) {
        const providerColors = {
            synthetic: chalk_1.default.cyan,
            minimax: chalk_1.default.red
        };
        const color = providerColors[provider];
        console.log(color(`✓ ${provider.charAt(0).toUpperCase() + provider.slice(1)} provider configured`));
    }
    showConnectionTestResult(provider, success, error) {
        if (success) {
            console.log(chalk_1.default.green(`✓ ${provider} connection successful`));
        }
        else {
            console.log(chalk_1.default.red(`✗ ${provider} connection failed${error ? `: ${error}` : ''}`));
        }
    }
}
exports.UserInterface = UserInterface;
//# sourceMappingURL=user-interface.js.map