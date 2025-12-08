# MClaude CLI Commands Reference

## Overview

MClaude (v1.8.6) is a CLI tool for interactive model selection with Claude Code, supporting Synthetic AI and MiniMax models through a TensorZero proxy.

## Main Options

| Option | Description |
|--------|-------------|
| `-m, --model <model>` | Use specific model (skip interactive selection) |
| `-t, --thinking-model <model>` | Set thinking model for Claude thinking mode |
| `-v, --verbose` | Enable verbose logging output |
| `-q, --quiet` | Suppress non-error output |
| `--temperature <value>` | Sampling temperature (0.0-2.0) |
| `--top-p <value>` | Top-p sampling parameter (0.0-1.0) |
| `--preset <preset>` | Temperature preset: creative, precise, balanced |
| `--context-size <size>` | Context window size (up to 1M for MiniMax M2) |
| `--tool-choice <mode>` | Tool choice mode: auto, none, required |
| `--no-stream` | Disable streaming responses |
| `--memory <mode>` | Memory mode: compact |
| `--json-mode` | Enable JSON structured output mode |

## Core Commands

### Model Management Commands

#### `mclaude models [options]`
**Description**: Interactive model selection and launch Claude Code  
**Options**:
- `-v, --verbose`: Enable verbose output

**Usage**: Select models interactively and launch Claude Code directly

#### `mclaude --model <model>`
**Description**: Direct model launch bypassing interactive selection  
**Examples**:
```bash
mclaude --model synthetic:deepseek-ai/DeepSeek-V3.2
mclaude --model minimax:MiniMax-M2 --dangerously-skip-permissions
mclaude --model synthetic:meta-llama/Llama-3.2-3B-Instruct --thinking-model minimax:MiniMax-M2
```

#### `mclaude thinking-model [options]`  
**Description**: Interactive thinking model selection and save to config

### Provider Management Commands

#### `mclaude providers [command]`
**Main command**: Manage AI providers and their configurations

##### `mclaude providers list`
**Description**: List all providers with their current status (enabled/disabled)

##### `mclaude providers enable <provider>`
**Description**: Enable a specific provider
**Arguments**: `provider` - Provider name (synthetic, minimax)

##### `mclaude providers disable <provider>`  
**Description**: Disable a specific provider
**Arguments**: `provider` - Provider name (synthetic, minimax)

##### `mclaude providers status [options]`
**Description**: Show detailed provider information
**Options**:
- `-v, --verbose`: Include detailed model listings

##### `mclaude providers test <provider>`
**Description**: Test connectivity to a specific provider API
**Arguments**: `provider` - Provider name to test

### Model Discovery Commands

#### `mclaude models [options]`
**Description**: List available models from enabled providers  
**Options**:
- `-p, --provider <provider>`: Filter by provider
- `-s, --search <term>`: Search models by name
- `-d, --details`: Show detailed model information

#### `mclaude search [options] <query>`
**Description**: Search models by name or provider  
**Arguments**: `query` - Search term  
**Options**:
- `-p, --provider <provider>`: Filter by provider
- `-s, --sort <field>`: Sort by field (name, size)

### Authentication & Configuration Commands

#### `mclaude auth [command]`
**Main command**: Manage authentication credentials

##### `mclaude auth show <provider>`
**Description**: Show current authentication for provider  
**Arguments**: `provider` - Provider name

##### `mclaude auth set <provider>`
**Description**: Set/update authentication for provider  
**Arguments**: `provider` - Provider name

##### `mclaude auth test <provider>`
**Description**: Test authentication credentials  
**Arguments**: `provider` - Provider name

#### `mclaude config [command]`
**Main command**: Manage configuration settings

##### `mclaude config show`
**Description**: Display current configuration

##### `mclaude config set <key> <value>`
**Description**: Set configuration value

##### `mclaude config reset`
**Description**: Reset configuration to defaults

#### `mclaude combination [command]`
**Main command**: Manage model combinations

##### `mclaude combination save <name>`
**Description**: Save current model selection as named combination

##### `mclaude combination load <name>`
**Description**: Load saved model combination

##### `mclaude combination delete <name>`
**Description**: Delete saved combination

##### `mclaude combination list`
**Description**: List saved combinations

### TensorZero Proxy Management Commands

#### `mclaude proxy [command]`
**Main command**: Manage the TensorZero proxy for model routing on port 9313

##### `mclaude proxy start [options]`
**Description**: Start the TensorZero proxy  
**Options**:
- `-v, --verbose`: Enable verbose output  
- `-p, --port <port>`: Specify port (default: 9313)  
**Features**: 
- Auto-detects if proxy already running
- Enables proxy in config automatically  
- Shows 26 available routes on startup

##### `mclaude proxy stop [options]`
**Description**: Stop the TensorZero proxy  
**Options**:
- `-v, --verbose`: Enable verbose output  
**Features**:
- Actually kills detached Python processes
- Shows warning when no proxy is running
 Proper cleanup of all proxy processes

##### `mclaude proxy restart [options]`
**Description**: Restart the TensorZero proxy  
**Options**:
- `-v, --verbose`: Enable verbose output
- `-p, --port <port>`: Specify port  
**Process**: Full stop → brief pause → start sequence

##### `mclaude proxy status`
**Description**: Check current proxy status  
**Output**:
- Running status ✓/✗
- URL ( typically http://127.0.0.1:9313 )
- Available routes count (usually 26)
- Uptime in seconds

### Utility Commands

#### `mclaude setup`
**Description**: Run initial interactive setup  
**Process**: Configure providers, test authentication, select default models

#### `mclaude doctor`
**Description**: Check system health and configuration  
**Checks**: 
- Proxy status
- Provider connectivity  
- Configuration validity
- Model availability

#### `mclaude dangerously [options]` (also `dangerous`, `dang`)
**Description**: Launch Claude Code with --dangerously-skip-permissions using saved models  
**Options**:
- `-v, --verbose`
- `-q, --quiet`  
- `-f, --force`: Force model selection even if saved models exist

#### `mclaude cache [command]`
**Main command**: Manage model response cache

##### `mclaude cache clear`
**Description**: Clear all cached model responses

##### `mclaude cache info`
**Description**: Show cache statistics and configuration

#### `mclaute stats [options]`
**Description**: Show token usage statistics  
**Options**:
- `-d, --detailed`: Show detailed usage history

#### `mclaude sysprompt [command]`
**Main command**: Manage custom system prompts for Claude Code

##### `mclaude sysprompt show`
**Description**: Show current system prompt configuration

##### `mclaude sysprompt set <prompt>`
**Description**: Set custom system prompt

##### `mclaude sysprompt reset`
**Description**: Reset to default system prompt

## Usage Examples

### Quick Start
```bash
# Setup and initial configuration
mclaude setup

# Interactive model selection
mclaude models

# Direct model launch
mclaude --model synthetic:deepseek-ai/DeepSeek-V3.2 --dangerously-skip-permissions
```

### Proxy Management
```bash
# Start proxy for model routing
mclaude proxy start --verbose

# Check proxy status
mclaude proxy status

# Stop proxy when done
mclaude proxy stop
```

### Provider Management
```bash
# Check provider status
mclaude providers status --verbose

# Test synthetic provider
mclaude providers test synthetic

# Enable/disable providers
mclaude providers enable minimax
mclaude providers disable synthetic
```

### Configuration
```bash
# Show current config
mclaude config show

# Save model combination
mclaude combination save my-favorite-setup

# Load saved combination
mclaude combination load my-favorite-setup
```

## Model Naming Patterns

### ✅ **Confirmed Working Models** (tested with TensorZero proxy v1.8.6)

#### **Synthetic API Models (hf: prefix)**
**Chat & General:**
- `hf:zai-org/GLM-4.6` ✅ GLM-4.6 conversation model
- `hf:deepseek-ai/DeepSeek-V3-0324` ✅ Latest DeepSeek V3  
- `hf:deepseek-ai/DeepSeek-R1-0528` ✅ Reasoning model
- `hf:deepseek-ai/DeepSeek-V3.1` ✅ DeepSeek V3 stable

**Large Models:**
- `hf:MiniMaxAI/MiniMax-M2` ✅ MiniMax M2 large model
- `hf:moonshotai/Kimi-K2-Thinking` ✅ Kimi K2 thinking variant
- `hf:meta-llama/Llama-3.3-70B-Instruct` ✅ Llama 3.3 instruction (70B)

**Specialized:**
- `hf:Qwen/Qwen3-VL-235B-A22B-Instruct` ✅ Vision-Language multimodal (235B)
- `hf:Qwen/Qwen3-Coder-480B-A35B-Instruct` ✅ Code generation (480B)
- `hf:meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8` ✅ Llama 4 Maverick

#### **MiniMax Models (direct provider)**
- `minimax:MiniMax-M2` ✅ Direct MiniMax API routing

#### **Alternative Synthetic Prefix**
- `synthetic:zai-org/GLM-4.6` ✅ Same as hf: but synthetic prefix
- `synthetic:deepseek-ai/DeepSeek-V3-0324` ✅ Alternative format

### ❌ **Known Non-Working Models** (API returns 404)
- `hf:meta-llama/Llama-3.1-405B-Instruct` - Deprecated/moved
- `hf:meta-llama/Llama-3.1-70B-Instruct` - Deprecated/moved  
- `hf:deepseek-ai/DeepSeek-R1` - Use DeepSeek-R1-0528 instead
- `hf:openai/gpt-oss-120b` - API formatting issues

### Model Usage Examples
```bash
# Working models
mclaude --model hf:zai-org/GLM-4.6
mclaude --model hf:deepseek-ai/DeepSeek-V3-0324 --thinking-model hf:deepseek-ai/DeepSeek-R1-0528
mclaude --model hf:Qwen/Qwen3-Coder-480B-A35B-Instruct

# For code generation
echo "Write a Python function" | mclaude --model hf:Qwen/Qwen3-Coder-480B-A35B-Instruct

# For reasoning tasks  
echo "Solve this step by step" | mclaude --model hf:deepseek-ai/DeepSeek-R1-0528

# For multimodal visions  
echo "Describe this image" | mclaude --model hf:Qwen/Qwen3-VL-235B-A22B-Instruct

# Check proxy status first
mclaude proxy status
```

### Model Selection Strategy
- **General Chat**: `hf:zai-org/GLM-4.6` (fast, reliable)
- **Reasoning**: `hf:deepseek-ai/DeepSeek-R1-0528`  
- **Large Context**: `hf:meta-llama/Llama-3.3-70B-Instruct`
- **Code Generation**: `hf:Qwen/Qwen3-Coder-480B-A35B-Instruct`
- **Multimodal**: `hf:Qwen/Qwen3-VL-235B-A22B-Instruct`

### Prefix Transformation
- `hf:model-name` (automatic) → Synthetic API routing ✅
- `synthetic:model-name` (direct) → Synthetic API routing ✅  
- `minimax:model-name` (direct) → MiniMax API routing ✅

**Note**: Use exact case as shown. Some models appear in API catalog but return 404 when used - provider catalog updates.

Full list: See `WORKING-MODELS.md` for comprehensive tested model guide.

## Notes

- **Proxy Architecture**: Only one proxy instance runs per system on port 9313
- **Model Routing**: Use `synthetic:` prefix for Synthetic models through proxy, not `hf:`
- **Permissions**: Use `--dangerously-skip-permissions` for automated Claude Code launch
- **Configuration**: Provider settings stored in `~/.config/mclaude/config.json`
- **First Run**: `mclaude setup` required for initial configuration

## Troubleshooting

**Proxy Issues**:
```bash
mclaude proxy status     # Check if proxy is running
mclaude doctor          # Run system health check
```

**Authentication Issues**:
```bash
mclaude auth test synthetic    # test connectivity
mclaude providers status       # view provider status
```

**Model Selection Issues**:
```bash
mclaude models --provider synthetic     # list available models
mclaude search "llama"                   # search for specific models
```

---

*MClaude v1.8.6 - Interactive model selection for Claude Code with Synthetic AI and MiniMax models*