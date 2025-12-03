# Per-Project Configuration Examples

This document provides practical examples of using MClaude's per-project configuration system.

## Quick Examples

### 1. Initialize a Project Configuration

```bash
cd my-awesome-project/
mclaude config init
```

This creates:
```
my-awesome-project/
├── .mclaude/
│   ├── config.json      # Project settings (commit to git)
│   ├── .env.local       # Local secrets (don't commit)
│   └── .gitignore       # Protects .env.local
```

### 2. Team Configuration Sharing

Create a `.mclaude/config.json` with team defaults:

```json
{
  "providers": {
    "synthetic": {
      "enabled": true,
      "baseUrl": "https://api.synthetic.new"
    },
    "minimax": {
      "enabled": true,
      "defaultModel": "MiniMax-M2-124B"
    }
  },
  "defaultProvider": "synthetic",
  "selectedModel": "synthetic:claude-3-sonnet",
  "cacheDurationHours": 24,
  "configVersion": 2
}
```

### 3. Developer Local Overrides

In `.mclaude/.env.local` (git-ignored):

```env
# Your personal API keys (don't commit!)
SYNTHETIC_API_KEY=syn_xxx_your_personal_key
MINIMAX_API_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9_your_key
MINIMAX_GROUP_ID=your_group_id
```

### 4. Configuration Priority in Action

```bash
mclaude config whoami
# Output: Current mode: Local Project
#          Workspace root: /path/to/my-awesome-project
#          Config file: /path/to/my-awesome-project/.mclaude/config.json
```

## Real-World Workflows

### Workflow 1: New Project Setup

```bash
# 1. Clone the repository
git clone https://github.com/company/project.git
cd project

# 2. Team already has .mclaude/config.json
mclaude config whoami
# Output: Current mode: Local Project
#          Workspace root: /path/to/project

# 3. Add your personal API keys
cp .mclaude/.env.local.template .mclaude/.env.local
# Edit .mclaude/.env.local with your keys

# 4. Start using project configuration
mclaude model  # Uses project defaults + your keys
```

### Workflow 2: Migrating Existing Global Setup

```bash
# 1. Navigate to existing project
cd existing-project/

# 2. Check current context
mclaude config whoami
# Output: Current mode: Global User

# 3. Initialize project config with migration
mclaude config migrate

# 4. Review the new local config
cat .mclaude/config.json

# 5. Test it works
mclaude config whoami
# Output: Current mode: Local Project
```

### Workflow 3: Switching Between Modes

```bash
# Check current mode
mclaude config whoami

# Switch to global configuration temporarily
mclaude config global
mclaude config whoami

# Switch back to project configuration
mclaude config local
mclaude config whoami
```

### Workflow 4: Team Development Setup

**Maintainer (creates project config):**
```bash
cd company-project/
mclaude config init
# Edit .mclaude/config.json with team settings
git add .mclaude/config.json .mclaude/.gitignore
git commit -m "Add mclaude project configuration"
```

**Developer (joins project):**
```bash
git clone https://github.com/company/project.git
cd project/

mclaude config whoami
# Output: Current mode: Local Project

# Add personal keys
echo "SYNTHETIC_API_KEY=syn_your_key" > .mclaude/.env.local

# Start working
mclaude  # Uses project settings + personal API keys
```

## Configuration Hierarchy Examples

### Example 1: Project Overrides Global

**Global Config:**
```json
{
  "defaultProvider": "auto",
  "selectedModel": "synthetic:claude-3-haiku"
}
```

**Project Config:**
```json
{
  "defaultProvider": "synthetic",
  "selectedModel": "synthetic:claude-3-sonnet"
}
```

**Result:** Project config overrides global → `synthetic:claude-3-sonnet` with synthetic provider.

### Example 2: Environment Variable Override

**Environment:**
```bash
export SYNTHETIC_API_KEY="special-project-key"
```

**Project Config:**
```json
{
  "providers": {
    "synthetic": {
      "enabled": true
    }
  }
}
```

**Result:** Project uses `special-project-key` from environment.

## Advanced Scenarios

### Scenario 1: Project-Specific Models

Some projects use specialized models. Create project-specific config:

```json
{
  "selectedModel": "synthetic:gpt-4-code-analyzer",
  "selectedThinkingModel": "synthetic:claude-3-opus",
  "cacheDurationHours": 1  // Fresh models for code analysis
}
```

### Scenario 2: Development vs Production

Different configurations for different environments:

**Development Project (.mclaude/config.json):**
```json
{
  "defaultProvider": "auto",
  "providers": {
    "minimax": { "enabled": true }
  },
  "cacheDurationHours": 1
}
```

**Production Project (.mclaude/config.json):**
```json
{
  "defaultProvider": "synthetic",
  "providers": {
    "synthetic": { "enabled": true },
    "minimax": { "enabled": false }  // Production cost control
  },
  "cacheDurationHours": 48
}
```

### Scenario 3: Team Collaboration

Team shares provider settings but each member has personal API keys:

**Team Config (committed to git):**
```json
{
  "providers": {
    "synthetic": {
      "enabled": true,
      "baseUrl": "https://api.synthetic.new"
    }
  },
  "defaultProvider": "synthetic",
  "selectedModel": "synthetic:claude-3-sonnet"
}
```

**Individual .env.local (not committed):**
```env
SYNTHETIC_API_KEY=syn_personal_dev_key
```

## Troubleshooting

### Issue: "No local project configuration found"
```bash
# Fix: Initialize local config
mclaude config init

# Or check you're in the right directory
mclaude config whoami
```

### Issue: "Global configuration already exists"
```bash
# Fix: Force overwrite if needed
mclaude config init --force
```

### Issue: API keys not working in project
```bash
# Check which config is being used
mclaude config whoami

# Check environment variable loading
echo $SYNTHETIC_API_KEY

# Verify local file permissions
ls -la .mclaude/.env.local
```

### Issue: Want to completely reset project config
```bash
# Reset local project to defaults
mclaude config reset --scope local

# Or reset global
mclaude config reset --scope global
```

## Best Practices

1. **Commit project config to git** - `.mclaude/config.json` should be version controlled
2. **Never commit API keys** - Use `.mclaude/.env.local` for secrets
3. **Use sensible defaults** - Project config should work out-of-the-box
4. **Document project settings** - Add README section explaining project's mclaude setup
5. **Regular backups** - Global config still serves as backup/fallback
6. **Team consistency** - Keep project config minimal and focused on team needs
7. **Security** - Add `.mclaude/.env.local` to `.gitignore` (done automatically)

## Migration Guide

### From Global to Project:

```bash
# 1. Check current setup
mclaude config whoami

# 2. Navigate to project directory
cd my-project/

# 3. Migrate existing global config
mclaude config migrate

# 4. Verify migration worked
mclaude config whoami
cat .mclaude/config.json
```

### From Project to Project:

```bash
# 1. Copy existing config
cp old-project/.mclaude/config.json new-project/.mclaude/
cp old-project/.mclaude/.env.local.template new-project/.mclaude/

# 2. Set up new secrets
cp new-project/.mclaude/.env.local.template new-project/.mclaude/.env.local
# Edit with new keys if needed
```

This system provides the flexibility of per-project configurations while maintaining the simplicity of global fallbacks.