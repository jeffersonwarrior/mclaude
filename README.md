# MClaude 1.2.7

**MClaude makes Claude Code work with MiniMax and Synthetic AI models!** This modern TypeScript/Node.js CLI tool seamlessly bridges Claude Code with MiniMax and Synthetic model APIs, unlocking model choice while maintaining the familiar Claude Code experience.

## How It Works

MClaude automatically configures Claude Code's environment to connect with MiniMax and Synthetic APIs. When you select a model, MClaude sets up:

- `ANTHROPIC_BASE_URL` → MiniMax or Synthetic endpoints
- `ANTHROPIC_AUTH_TOKEN` → Proper API authentication
- `CLAUDE_CODE_SUBAGENT_MODEL` → Your chosen model

This gives you the full Claude Code experience with access to MiniMax and Synthetic AI models instead of Anthropic's native models.

## Features

- 🔗 **MiniMax & Synthetic Integration**: Seamlessly bridge Claude Code with alternative AI models
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

## Supported AI Providers

**MiniMax Models:**
- MiniMax-M2 and other MiniMax model variants
- Direct API integration with MiniMax platform
- Optimized for coding and reasoning tasks

**Synthetic Models:**
- 26+ OpenAI-compatible models via Synthetic API
- Claude-3.5 variants, GPT-4 alternatives, and more
- Full model diversity and capability spectrum

**More providers coming soon!**

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

**Current Version**: 1.4.4

### Recent Changes

- Fixed permissions handling with atomic writes and backup strategies
- Local-first config resolution (.mclaude/config.json before global)
- Improved error recovery for EACCES/EPERM errors

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: https://github.com/jeffersonwarrior/mclaude/issues
- **Documentation**: See `/codedocs` directory for detailed technical docs
- **CLI Help**: `mclaude --help` for comprehensive command reference

---

**MClaude** - Because Claude Code deserves more model choices.

*Unlock the full Claude Code experience with MiniMax and Synthetic AI models!* 🚀