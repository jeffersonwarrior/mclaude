# LiteLLM Version Management

## Current Version
- **Locked Version**: `1.52.11` 
- **Reason**: This version is specifically configured for MClaude's multi-provider architecture
- **Status**: DO NOT UPGRADE

## Version Locking Mechanisms

### 1. Package.json Script
```json
"install-litellm": "python3 -m pip install 'litellm[proxy]==1.52.11' prisma --quiet --break-system-packages"
```

### 2. Automated Installation
- Postinstall script enforces exact version installation
- Manual installation command documented for fallback scenarios

### 3. SQLite Compatibility Fixes
The system includes automated fixes for SQLite compatibility that are specific to version `1.52.11`:
- Schema conversion from PostgreSQL to SQLite
- Cache cleanup to prevent version conflicts

## Architecture Dependencies

The current LiteLLM configuration depends on:
- **Multi-provider YAML configuration format**
- **Specific model mapping syntax** (`hf:` prefix handling)
- **SQLite database compatibility patches**
- **Anthropic-compatible endpoint routing**

## Upgrade Risks

⚠️ **DO NOT UPGRADE LITELLM** - Upgrading may break:
- Multi-provider routing configuration
- Model name mapping (hf: prefix support)
- SQLite database schema compatibility
- Silent operation mode

If an upgrade is absolutely necessary:
1. Test all provider routing functionality
2. Verify SQLite compatibility patches still work
3. Confirm silent operation remains functional
4. Update model mapping configurations as needed

## Version Verification

To verify the correct version is installed:
```bash
litellm --version
# Should show: 1.52.11
```

To check if wrong version is installed:
```bash
pip show litellm | grep Version
# Should show: 1.52.11
```

## Installation Commands

If manual installation is needed:
```bash
pip install 'litellm[proxy]==1.52.11' prisma --break-system-packages
```

Force reinstall to correct version:
```bash
pip uninstall litellm -y
pip install 'litellm[proxy]==1.52.11' prisma --break-system-packages
```