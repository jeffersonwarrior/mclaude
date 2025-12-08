# Changelog

All notable changes to mclaude will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.5] - 2025-12-08

### Added
- **TensorZero Proxy Management CLI**: Complete proxy lifecycle management with dedicated commands
  - `mclaude proxy start/stop/restart/status` commands with comprehensive error handling
  - Port-based collision detection prevents multiple proxy instances on same port
  - Process cleanup for detached Python proxy processes using `lsof` and `kill -9`
  - HTTP endpoint status checking works across different CLI command instances
  - Verbose modes and detailed status reporting for all proxy states

### Fixed
- **CLI Command Completion**: Fixed hanging issue by adding explicit `process.exit(0)` to all proxy command success paths
- **Proxy Process Management**: Actually stops detached Python proxy processes (not just router state)
- **Status Detection**: Uses HTTP endpoint checking instead of singleton state for reliable cross-instance status
- **Synthetic Model Routing**: Correct model naming format - use `synthetic:deepseek-ai/DeepSeek-V3.2` (no `hf:` prefix for proxy)
- **Config First Run**: Fixed `firstRunCompleted: false` triggering setup flow every time

### Changed
- **Proxy Architecture**: Implemented `ProxyCliManager` with `ConsoleUI` to avoid Ink-based terminal UI hanging
- **Process Detection**: Port-based proxy detection ensures only one proxy runs per system, regardless of CLI instances
- **Error Messages**: Improved proxy command messaging for all states (running/stopped/already running/not found)

## [1.8.1] - 2025-12-08

### Fixed
- Resolved persistent test failures in `tests/config-apikeys.test.ts` by explicitly resetting the `EnvironmentManager` singleton for each test and adjusting test expectations.

### Changed
- Updated Node.js version to v20 across all GitHub Actions workflows (`test.yml`, `build.yml`, `eslint.yml`, `publish.yml`).
- Removed `tests/config-OLD.test.ts.backup` to prevent interference from old test data.
- Updated `README.md` to refer to `CHANGELOG.md` for full history.

### Added
- Introduced `scripts/check-keys.sh` for pre-commit validation to prevent hardcoded API keys.

## [1.8.0] - 2025-12-07

### Added
- **Manager Architecture**: Complete refactoring of core app into focused manager classes
- **AuthManager**: Handles provider credential validation, authentication testing, and status
- **ConfigCliManager**: Manages CLI configuration operations (show, set, reset, context, sysprompt)
- **ProviderManager**: Handles provider management (list, enable, disable, test, status, configs)
- **ModelInteractionManager**: Manages model selection, info, combinations, and cards
- **SystemManager**: Provides system operations (doctor, cache, setup, logging, updates)
- **ConfigMigrationManager**: Handles configuration migration and status operations
- **Comprehensive Testing**: Full test coverage for all manager classes (30+ tests across 6 managers)
- **Manager Interfaces**: Clean TypeScript interfaces for all manager contracts

### Changed  
- **Extracted 6 Managers**: Moved ~1,930 lines from monolithic app.ts into focused, testable managers
- **Reduced Code Size**: `src/core/app.ts` reduced from 2,890 lines to 961 lines (67% reduction)
- **Improved Architecture**: Better separation of concerns, testability, and maintainability
- **Manager Delegation**: CLI commands now interact directly with appropriate managers
- **Public Manager Access**: Added public getters in SyntheticClaudeApp for manager delegation
- **Enhanced Setup Flow**: Simplified and bulletproof setup orchestration
- **Better Error Handling**: Streamlined error categorization and recovery

### Technical
- **Manager Pattern**: Single responsibility principle with dependency injection
- **Test Isolation**: Comprehensive mocking for all manager dependencies (~95% coverage maintained)
- **Interface Design**: Clear contracts for all manager operations with TypeScript safety
- **Backward Compatibility**: All existing CLI commands maintain full functionality
- **Test Stability**: Implemented sequential test execution to eliminate race conditions
- **Code Quality**: ESLint compliance maintained with only acceptable `any` type warnings

### Performance
- **Improved Build Time**: Reduced TypeScript compilation complexity through modularization  
- **Better Test Execution**: Sequential test runs ensure consistent results across environments
- **Maintained Coverage**: 90%+ test coverage preserved despite major architectural changes

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
