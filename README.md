# Mclaude

Interactive model selection tool for Claude Code with Synthetic AI models.

## Overview

mclaude is a modern TypeScript/Node.js application that provides a seamless interface for selecting and launching Claude Code with various AI models from the Synthetic API.

Mclaude is a fork of the original Synclaude project, maintaining all functionality while establishing a new project identity.

## Features

- **Modern TypeScript Stack**: Built with TypeScript, Node.js, and npm
- **Interactive Model Selection**: Rich terminal UI for browsing and selecting models
- **Smart Search**: Search models by name, provider, or capabilities
- **Per-Project Configuration**: Project-specific settings with global fallback
- **Persistent Configuration**: Save your preferred model choices
- **Multi-Provider Support**: Synthetic API and MiniMax API integration
- **Easy Installation**: One-line installer with npm support
- **System Health**: Built-in diagnostic tools
- **Well Tested**: Comprehensive Jest test suite
- **Beautiful UI**: Modern React-based terminal interface with Ink

## Quick Start

### Prerequisites

- Node.js 18+ and npm installed
- Synthetic API key (get one from [synthetic.new](https://synthetic.new))
- Claude Code installed (get from [claude.com/product/claude-code](https://claude.com/product/claude-code))

### Installation

#### Option 1: GitHub Release (Recommended)

**Linux/Windows:**
```bash
npm install -g https://github.com/jeffersonwarrior/mclaude/releases/download/v1.0.0/mclaude-1.0.0.tgz
```

**macOS (if permissions error):**
```bash
sudo npm install -g https://github.com/jeffersonwarrior/mclaude/releases/download/v1.0.0/mclaude-1.0.0.tgz
```

**Alternative for macOS (permanent fix):**
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
npm install -g https://github.com/jeffersonwarrior/mclaude/releases/download/v1.0.0/mclaude-1.0.0.tgz
```

#### Option 2: Download from GitHub Releases

1. Visit [GitHub Releases](https://github.com/jeffersonwarrior/mclaude/releases)
2. Download the latest `mclaude-X.Y.Z.tgz` file
3. Install with: `npm install -g mclaude-X.Y.Z.tgz`

#### Option 3: One-line Installer

```bash
curl -sSL https://raw.githubusercontent.com/jeffersonwarrior/mclaude/main/scripts/install.sh | bash
```

#### Option 4: macOS One-line Script

```bash
curl -sSL https://raw.githubusercontent.com/jeffersonwarrior/mclaude/main/scripts/install-macos.sh | bash
```

#### Option 5: Local Development Install

```bash
git clone https://github.com/jeffersonwarrior/mclaude.git
cd mclaude
npm install
npm run build
sudo npm link
```

**Important**:
- Direct git installation (`npm install -g https://github.com/.../mclaude.git`) is not supported due to npm's git installation limitations
- Use the specific release tarball: `https://github.com/jeffersonwarrior/mclaude/releases/download/v1.0.0/mclaude-1.0.0.tgz`
- Or visit [GitHub Releases](https://github.com/jeffersonwarrior/mclaude/releases) for the latest version

### Uninstallation

#### Option 1: One-line Uninstaller

```bash
curl -sSL https://raw.githubusercontent.com/jeffersonwarrior/mclaude/main/scripts/uninstall.sh | bash
```

#### Option 2: Manual Uninstall

```bash
# If installed globally via npm
npm uninstall -g mclaude

# If installed locally via npm link
npm unlink -g mclaude

# Remove configuration and cache
rm -rf ~/.config/mclaude
```

### Initial Setup

After installation, run the setup wizard:

```bash
mclaude setup
```

This will guide you through:
1. Configuring your Synthetic API key
2. Testing your connection
3. Selecting your first model

### Basic Usage

#### Launch Claude Code with Model Selection

```bash
# Interactive model selection
mclaude

# Use specific model
mclaude --model "openai:gpt-4"

# Or use saved model
mclaude model  # Select and save a model
mclaude         # Launch with saved model
```

#### Model Management

```bash
# List all available models
mclaude models

# Search for specific models
mclaude search "gpt"

# Force refresh model cache
mclaude models --refresh

# Interactive model selection
mclaude model
```

#### Configuration

MClaude supports both per-project and global configurations:

```bash
# Show current configuration context
mclaude config whoami

# Show configuration details
mclaude config show

# Set configuration values
mclaude config set apiKey "your-api-key"
mclaude config set cacheDurationHours 12

# Per-project configuration
mclaude config init              # Initialize local project config
mclaude config local             # Switch to local project mode
mclaude config global            # Switch to global mode
mclaude config migrate           # Migrate global to local project
mclaude config reset             # Reset current configuration
mclaude config reset --scope local    # Reset local config only
mclaude config reset --scope global   # Reset global config only
```

#### System Tools

```bash
# Check system health and configuration
mclaude doctor

# Clear model cache
mclaude cache clear

# Show cache information
mclaude cache info
```

## Advanced Usage

### Per-Project Configuration

MClaude supports project-specific configurations that override global settings. This enables teams to share default configurations while allowing individual developers to have local overrides.

#### Configuration Priority

Settings are loaded in the following priority order (highest to lowest):

1. **Local Project**: `.mclaude/config.json`
2. **Local Project**: `.env` (current directory)
3. **Global User**: `~/.config/mclaude/config.json`
4. **System Environment**: `process.env`

#### Project Directory Structure

```
my-project/
├── .mclaude/
│   ├── config.json         # Project-specific config (git-tracked)
│   ├── .env.local          # Local overrides (git-ignored)
│   └── .gitignore         # Generated git-ignore
├── .env                    # Project env vars (optional, git-ignored)
└── package.json
```

#### Example Local Configuration

`.mclaude/config.json`:
```json
{
  "providers": {
    "synthetic": {
      "enabled": true,
      "baseUrl": "https://api.synthetic.new"
    },
    "minimax": {
      "enabled": true,
      "defaultModel": "MiniMax-M2"
    }
  },
  "defaultProvider": "auto",
  "selectedModel": "synthetic:claude-3-sonnet",
  "selectedThinkingModel": "",
  "cacheDurationHours": 24,
  "configVersion": 2
}
```

`.mclaude/.env.local` (local overrides):
```env
# Local environment overrides (do not commit to git)
SYNTHETIC_API_KEY=your-secret-key-here
MINIMAX_API_KEY=your-minimax-key
MINIMAX_GROUP_ID=your-group-id
```

#### Local Configuration Commands

```bash
# Initialize a new project configuration
mclaude config init

# Check current configuration context
mclaude config whoami

# Switch between project and global configs
mclaude config local
mclaude config global

# Migrate global settings to project
mclaude config migrate
```

### Configuration Options

MClaude stores configuration hierarchically:

#### Global Configuration
- Location: `~/.config/mclaude/config.json`
- Used as fallback when no local config exists

#### Project Configuration
- Location: `.mclaude/config.json`
- Overrides global settings for current project
- Shared across team (can be committed to git)

#### Key Settings

- `providers.{synthetic|minimax}.enabled`: Enable/disable providers
- `providers.{synthetic|minimax}.apiKey`: API keys (use .env.local for secrets)
- `providers.{synthetic|minimax}.baseUrl`: Custom API endpoints
- `defaultProvider`: Default provider to use ("synthetic", "minimax", "auto")
- `selectedModel`: Last selected model
- `selectedThinkingModel`: Last selected thinking model
- `cacheDurationHours`: Model cache duration (1-168 hours)
- `configVersion`: Configuration schema version

### Updates

Mclaude follows standard npm package management conventions. Instead of built-in auto-updates, you manage updates manually:

```bash

# Update to latest version
npm update -g mclaude

# Check current version
mclaude --version
```

This approach provides:
- **Full control** over when updates happen
- **Standard npm workflow** that developers are familiar with
- **No update-related bugs or complexity**
- **Rollback capability** if needed (`npm install -g mclaude@specific-version`)

### Environment Variables

You can override configuration with environment variables:

```bash
export SYNTHETIC_API_KEY="your-api-key"
export SYNTHETIC_BASE_URL="https://api.synthetic.new"
export SYNTHETIC_CACHE_DURATION=24
```

### Development

#### Setup Development Environment

```bash
git clone https://github.com/jeffersonwarrior/mclaude.git
cd mclaude
npm install
```

#### Development Commands

```bash
# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Full development cycle
npm run lint && npm test && npm run build
```

#### Project Structure

```
mclaude/
├── src/
│   ├── cli/           # CLI commands and parsing (Commander.js)
│   ├── core/          # Application orchestration
│   ├── config/        # Configuration management (Zod)
│   ├── models/        # Data models and API interfaces
│   ├── ui/            # Terminal UI components (Ink)
│   ├── launcher/      # Claude Code launcher
│   ├── api/           # HTTP client (axios)
│   └── utils/         # Shared utilities
├── tests/             # Jest tests
├── scripts/           # Installation and utility scripts
└── dist/              # Built TypeScript output
```

## API Integration

### Synthetic API Endpoints

- **Models API**: `https://api.synthetic.new/openai/v1/models`
- **Anthropic API**: `https://api.synthetic.new/anthropic`

### Environment Variables for Claude Code

When launching Claude Code, Mclaude automatically sets:

- `ANTHROPIC_BASE_URL=https://api.synthetic.new/anthropic`
- `ANTHROPIC_AUTH_TOKEN={your_api_key}`
- `ANTHROPIC_DEFAULT_*_MODEL` variants
- `CLAUDE_CODE_SUBAGENT_MODEL={selected_model}`

## Troubleshooting

### Common Issues

#### Node.js Version Issues

```bash
# Check your Node.js version
node --version

# Upgrade to Node.js 18+ if needed
nvm install 18
nvm use 18
```

#### PATH Issues

If `synclaude` command is not found after installation:

```bash
# Check if local bin directory is in PATH
echo $PATH | grep -o "$HOME/.local/bin"

# Add to PATH (add to your .bashrc, .zshrc, etc.)
export PATH="$PATH:$HOME/.local/bin"
```

#### Permission Issues

```bash
# Fix npm global permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

#### API Connection Issues

```bash
# Test API connection
mclaude doctor

# Clear cache and retry
mclaude cache clear
mclaude models --refresh
```

### Get Help

```bash
# Show all commands
mclaude --help

# Get help for specific command
mclaude models --help
mclaude config --help

# Check system health
mclaude doctor
```


## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `npm test && npm run lint`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write tests for new functionality
- Update documentation for API changes
- Ensure compatibility with Node.js 18+

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/jeffersonwarrior/mclaude/issues)
- **Documentation**: [GitHub Wiki](https://github.com/jeffersonwarrior/mclaude/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/jeffersonwarrior/mclaude/discussions)
- **Synthetic API**: [https://dev.synthetic.new](https://dev.synthetic.new)
