# Changelog

All notable changes to mclaude will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.2] - 2025-12-05

### Fixed
- ✅ **CRITICAL**: Fixed LiteLLM proxy dependency installation
  - `backoff` module now properly installed via `litellm[proxy]`
  - Added `prisma` Python client for database support
- Updated npm postinstall script to install full proxy dependencies
- Updated shell installer scripts to include all required Python packages

### Technical
- Changed from: `pip install litellm`
- Changed to: `pip install 'litellm[proxy]' prisma`
- Ensures all LiteLLM proxy dependencies are installed automatically

## [1.6.1] - 2025-12-05

### Fixed
- ✅ **CRITICAL**: Fixed module resolution error - commands.js now properly compiled and included
- Fixed npm package installation errors on macOS
- Fixed TypeScript compilation issues preventing full build

### Technical
- Cleaned TypeScript build cache to ensure proper compilation
- All 82 files now properly included in npm package
- Verified `mclaude setup` command works after installation

## [1.6.0] - 2025-12-05

### Added
- ✨ **New Architecture**: LiteLLM proxy-based model routing (port 9313)
- 🔄 **Pattern-Based Routing**: minimax:* and synthetic:* model patterns
- 📦 **Automatic Installation**: LiteLLM Python package auto-installed via npm hooks
- 🏷️ **npm Package**: Published to npm registry
- 📊 **Badges**: Added npm version, downloads, and GitHub stars badges

### Changed
- 🔧 **Simplified Configuration**: Unified configuration management
- 📖 **Documentation**: Updated README with LiteLLM architecture details

### Technical
- 🛡️ **Graceful Fallback**: Direct provider connection if proxy fails
- 🧹 **Code Quality**: 91% reduction in lint errors (8 errors, 84 warnings)
- ✅ **Test Coverage**: 122/133 tests passing with improved stability
- 🚀 **Publishing**: Setup npm publishing with proper token management

### Architecture
```
Claude Code → LiteLLM Proxy (localhost:9313) → Providers
```

### Installation
```bash
npm install -g mclaude
```

### Legacy Versions

Pre-1.6.0 versions used direct provider connections without LiteLLM proxy.

---

**Note**: v1.6.1 fixes critical installation issues in v1.6.0. Always use the latest version.
