# MClaude 1.2.5

**Minimax MClaude** is a modern TypeScript/Node.js interactive CLI tool that integrates Synthetic AI models with Claude Code. It provides model selection, configuration management, and seamless launching of Claude Code with various language models through synthetic endpoints.

## Features

- 🤖 **Interactive Model Selection**: Robust multi-tier fallback system for reliable terminal compatibility
- 🔧 **Streamlined Setup**: Simple configuration process for providers and authentication
- 📦 **Multiple Installation Methods**: One-line installer, npm package, or local development
- 🎯 **Direct Model Launch**: Skip UI entirely with `--model` parameter
- 🔁 **Error Recovery**: Automatic fallback to simpler interfaces when terminal issues occur
- 🔍 **Model Management**: Search, categorize, and cache available models
- 🏥 **System Diagnostics**: Health checks and troubleshooting tools

## Quick Start

### Installation (One-line)

```bash
curl -sSL https://raw.githubusercontent.com/jeffersonwarrior/mclaude/main/scripts/install.sh | bash
```

### Manual Installation

```bash
npm install -g mclaude
```

### Initial Setup

```bash
mclaude setup
```

### Usage

```bash
# Interactive model selection
mclaude models

# Direct model launch (recommended for terminal compatibility)
mclaude --model claude-3-5-sonnet-20241022

# Search for specific models
mclaude search claude

# System health check
mclaude doctor
```

## Model Selection Options

MClaude provides multiple model selection interfaces for terminal compatibility:

1. **Minimal Arrow Selection** (default) - Simple arrow-key navigation
2. **Numbered List Selection** - Type numbers 1-9 for quick selection
3. **Console-Based Selection** - Direct console output (most reliable)

### Manual Controls

- `Ctrl+F` - Cycle through selection modes
- `Ctrl+ESC` - Switch to safest mode
- `q/ESC` - Exit selection

### Bypass UI Entirely

For maximum compatibility:

```bash
mclaude --model <model-id>
```

## Supported Providers

- **Synthetic** - OpenAI-compatible models
- **Minimax** - Minimax AI models
- More providers coming soon

## Configuration

Configuration is stored in `~/.config/mclaude/config.json`

### Environment Variables

```bash
SYNTHETIC_API_KEY=your_api_key
SYNTHETIC_BASE_URL=https://api.synthetic.new
```

## Development

### Local Development Setup

```bash
git clone https://github.com/jeffersonwarrior/mclaude.git
cd mclaude
npm install && npm run build && npm link
```

### Development Commands

```bash
npm run dev          # Development mode
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

## Architecture

MClaude uses a moduler TypeScript architecture:

- **CLI Layer** - Commander.js command interface
- **Application Layer** - Core orchestration logic
- **Configuration** - Zod-based validation and management
- **UI Components** - React/Ink terminal interfaces with fallbacks
- **Model Management** - Caching and categorization
- **API Client** - Integration with Synthetic endpoints

## Troubleshooting

### UI Rendering Issues

If you encounter "Text string must be rendered inside Text component" errors:

1. **Use Direct Model Selection**: `mclaude --model <model-id>`
2. **Try Minimal Mode**: Press `Ctrl+F` during model selection
3. **Terminal Compatibility**: `TERM=xterm-256color mclaude models`

### Common Issues

- **Authentication**: Run `mclaude setup` to verify provider connections
- **Model Cache**: Use `mclaude cache clean` for outdated model lists
- **System Health**: `mclaude doctor` for comprehensive diagnostics

## Version Information

**Current Version**: 1.2.5

### Recent Changes

- Implemented robust multi-tier fallback system
- Changed default to minimal arrow selection UI
- Enhanced terminal compatibility across xterm environments
- Improved error recovery and user guidance

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: https://github.com/jeffersonwarrior/mclaude/issues
- **Documentation**: See `/codedocs` directory for detailed technical docs
- **CLI Help**: `mclaude --help` for comprehensive command reference

---

**MClaude** - Making Claude Code accessible with Synthetic AI models.