## MClaude v1.8.1

### About
MClaude allows you to pick from any model within the setup for the 4 models that Claude uses. Currently supports Synthetic.New and MiniMax with more networks being added regularly.

### 🚀 Quick Start

```bash
npm install -g mclaude
mclaude setup
mclaude models  # Interactive model selection
```

### 🎯 Key Features

- **Zero Dependencies Proxy**: Self-contained HTTP server (port 9313), no Docker/pip needed
- **Smart Model Routing**: `minimax:*`, `synthetic:*`, auto-prefix fuzzy matching
- **Dynamic Model Discovery**: Real-time model lists from provider APIs
- **Full Anthropic API**: `/v1/messages?beta=true` endpoint compatibility
- **CLI-First**: `mclaude --model minimax:MiniMax-M2` launches instantly

### 📋 Commands

```bash
mclaude models                    # Interactive model picker
mclaude --model claude-3-sonnet   # Direct launch (auto-detects provider)
mclaude doctor                    # System health check
mclaude setup                     # Initial setup + proxy install
mclaude providers                 # Manage API keys
mclaude cache clear               # Clear model cache
```

### 🛠️ Architecture

```
Claude Code → Custom Proxy (localhost:9313) → MiniMax/Synthetic AI
```

### ⚙️ Configuration

```bash
~/.config/mclaude/config.json
# or .mclaude/config.json (project-local)
```

### 🔧 Development

```bash
npm install
npm run dev      # ts-node src/index.ts
npm test         # 133/133 tests
npm run build    # tsc + chmod +x
npm version patch # Triggers GitHub Actions publish
```

### 📦 Installation Methods

1. **npm (Recommended)**
   ```bash
   npm install -g mclaude
   ```

2. **npx**
   ```bash
   npx mclaude@latest setup
   ```

3. **Shell Script**
   ```bash
   curl -fsSL https://mclaude.sh | bash
   ```

### Previous Versions
See [CHANGELOG.md](CHANGELOG.md) for full history