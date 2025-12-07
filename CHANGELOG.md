# Changelog

All notable changes to mclaude will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.2] - 2025-12-07

### Fixed
- ✅ **ESLint Errors**: Resolved all unused variable errors in CI/CD pipeline
  - Fixed 'options' parameter in initializeRouter()
  - Fixed 'provider' variable in providerStatus()
  - Fixed '_shouldRefresh' variables in listModels() and searchModels()
- ✅ **TypeScript Compilation**: Fixed provider type inference errors
  - Added explicit type assertion for filtered providers array
  - Ensured provider type matches getProviderConfig signature
- ✅ **CodeQL Configuration**: Resolved advanced setup conflicts
  - Fixed build-mode compatibility for JavaScript/TypeScript
  - Disabled default queries to prevent configuration conflicts
- ✅ **Test Suite Architecture**: Comprehensive modularization
  - Split launcher.test.ts into 2 focused modules
  - Split config.test.ts into 7 focused modules  
  - Split cli.test.ts into 4 focused modules
  - Created helper utilities for environment isolation
  - All 91 tests passing with improved maintainability

### Changed
- 🧹 **GitHub Actions**: Cleaned up workflow runs and fixed CI stability
- 📊 **Code Quality**: 0 ESLint errors, 71 acceptable warnings maintained
- 🏗️ **Infrastructure**: Robust modular test architecture for future development

## [1.7.0] - 2025-12-06

### Added
- 🚀 **New Architecture**: Custom TensorZero-like proxy (self-contained Python HTTP server)
- 🌐 **Dynamic Model Loading**: Real-time model fetching from provider APIs
- 🔍 **Fuzzy Model Matching**: Auto-prefix mapping (e.g., "hf:model" → "synthetic:hf:model")
- 📦 **Anthropic API Compatibility**: Full `/v1/messages?beta=true` endpoint support
- ⚙️ **Zero External Dependencies**: No pip/Docker requirements for proxy

### Changed  
- 🔀 **Migration**: Complete refactor from LiteLLM to custom proxy architecture
- 🧹 **Dependency Cleanup**: Removed all LiteLLM Python dependencies and scripts
- 🔄 **Async Propagation**: Fixed launcher/router initialization and health checks
- 📖 **Documentation**: Updated README to reflect new architecture and capabilities

### Technical
- 🏗️ **Built-in Proxy**: Embedded Python HTTP server (port 9313) with OpenAI/Anthropic compatibility
- 🎯 **Smart Routing**: Fuzzy matching + prefix mapping with provider fallbacks
- 🧪 **Test Suite**: Fixed Jest mocks and improved test stability (122+ tests passing)
- 🔇 **Clean Logs**: Removed debug output; silent stdio for Python subprocess

### Architecture
```
Claude Code → Custom TensorZero-like Proxy (localhost:9313) → Providers (MiniMax/Synthetic)
```

### Migration Notes
- ✅ Fully backward compatible - all existing CLI commands work unchanged
- ✅ Model selection now supports unprefixed inputs with automatic prefix detection
- ✅ Zero external dependencies - completely self-contained installation

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
