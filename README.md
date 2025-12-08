## MClaude v1.8.6

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

## CLI Commands

### Proxy Management
```bash
# Start the TensorZero proxy (auto-detects if already running)
mclaude proxy start --verbose

# Check proxy status (shows URL, available routes, uptime)
mclaude proxy status

# Stop the proxy (properly kills all Python processes)
mclaude proxy stop --verbose

# Restart the proxy (full stop/start cycle)
mclaude proxy restart
```

### Model Selection
```bash
# Interactive model selection
mclaude models

# Direct model launch
mclaude --model synthetic:deepseek-ai/DeepSeek-V3.2
mclaude --model minimax:MiniMax-M2 --dangerously-skip-permissions

# Quick test command
echo "Hello, Claude!" | mclaude --model synthetic:meta-llama/Llama-3.2-3B-Instruct
```

### Configuration & Management
```bash
# Initial setup
mclaude setup

# System health check
mclaude doctor

# Provider management
mclaude providers
mclaude auth show synthetic
```

## Proxy Management

The TensorZero proxy provides model routing on port 9313. **Only one proxy instance runs per system** - CLI commands automatically detect existing instances.

### Key Features:
- **Collision Detection**: Won't start duplicate proxies
- **Process Cleanup**: Actually kills detached Python processes  
- **Cross-Instance Status**: Status detection works between different CLI invocations
- **Auto-Configuration**: Enables `tensorzero.enabled: true` in config automatically
- **26 Available Models**: Synthetic and MiniMax models routed through `/v1/models`

#### Model Naming Patterns:
- ✅ `synthetic:deepseek-ai/DeepSeek-V3.2` 
- ✅ `synthetic:meta-llama/Llama-3.2-3B-Instruct`
- ✅ `minimax:MiniMax-M2`
- ❌ `hf:deepseek-ai/DeepSeek-V3.2` (proxies use `synthetic:` prefix)

### Previous Versions
See [CHANGELOG.md](CHANGELOG.md) for full history