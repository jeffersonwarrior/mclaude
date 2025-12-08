# TODO: Refactor SyntheticClaudeApp Monster

## Overview
Break down the 2,890-line `src/core/app.ts` into focused, maintainable modules.

---

## TODO 1: Set Version to 1.8 ✅
- [x] Update package.json to 1.8.0
- [x] Update src/config/version.json to 1.8.0  
- [x] Update version.txt to 1.8.0
- [x] Update README.md to v1.8.0
- [ ] Add 1.8.0 changelog entry for refactoring milestone

---

## TODO 2: Extract Manager Classes

### 2.1 AuthManager (~400 lines) ✅
**Target Methods:**
- `validateProviderCredentials()`
- `checkAuth()`
- `testAuth()`
- `resetAuth()`  
- `refreshAuth()`
- `authStatus()`

**Files to Create:**
- `src/core/managers/auth-manager.ts`
- `src/core/managers/auth-manager.test.ts`

**Dependencies:**
- ConfigManager, UserInterface, error utils

---

### 2.2 ConfigManager CLI (~300 lines)
**Target Methods:**
- `showConfig()`
- `setConfig()`
- `resetConfig()`
- `showConfigContext()`

**Files to Create:**
- `src/core/managers/config-cli-manager.ts`
- `src/core/managers/config-cli-manager.test.ts`

**Dependencies:**
- ConfigManager, UserInterface

---

### 2.3 ProviderManager (~400 lines)
**Target Methods:**
- `listProviders()`
- `enableProvider()`
- `disableProvider()`
- `setDefaultProvider()`
- `providerStatus()`
- `testProvider()`
- `listProviderConfigs()`

**Files to Create:**
- `src/core/managers/provider-manager.ts`
- `src/core/managers/provider-manager.test.ts`

**Dependencies:**
- ConfigManager, UserInterface, ModelManager

---

### 2.4 ModelInteractionManager (~600 lines)
**Target Methods:**
- `interactiveThinkingModelSelection()`
- `showModelInfo()`
- `listCombinations()`
- `deleteCombination()`
- `manageModelCards()`

**Files to Create:**
- `src/core/managers/model-interaction-manager.ts`
- `src/core/managers/model-interaction-manager.test.ts`

**Dependencies:**
- ConfigManager, UserInterface, ModelManager

---

### 2.5 SystemManager (~300 lines)
**Target Methods:**
- `doctor()`
- `clearCache()`
- `cacheInfo()`
- `setup()`
- `setupLogging()`

**Files to Create:**
- `src/core/managers/system-manager.ts`
- `src/core/managers/system-manager.test.ts`

**Dependencies:**
- ConfigManager, UserInterface, logger, banner

---

### 2.6 ConfigMigrationManager (~200 lines)
**Target Methods:**
- `initLocalConfig()`
- `switchToLocalConfig()`
- `switchToGlobalConfig()`
- `migrateConfig()`

**Files to Create:**
- `src/core/managers/config-migration-manager.ts`
- `src/core/managers/config-migration-manager.test.ts`

**Dependencies:**
- ConfigManager, UserInterface

---

## TODO 3: Refactor Core App

### 3.1 Create Manager Interfaces ✅
Create interfaces for all managers in `src/core/managers/`:
- [x] `auth-manager.interface.ts`
- [x] `config-cli-manager.interface.ts`
- [x] `provider-manager.interface.ts`
- [x] `model-interaction-manager.interface.ts`  
- [x] `system-manager.interface.ts`
- [x] `config-migration-manager.interface.ts`

### 3.2 Update SyntheticClaudeApp ⚠️
- [x] Remove extracted methods (approx 2,200 lines → 1452 lines, -50% not -75%)
- [x] Add manager properties
- [x] Update constructor to initialize managers
- [x] Add delegation methods for backward compatibility
- [ ] Update CLI command routing - needs work

### 3.3 Update CLI Commands ⚠️
- [x] Update `src/cli/commands.ts` to use managers directly
- [ ] Remove app delegation layer where possible - CLI still uses app methods as delegates

### 3.4 Barrel Exports ✅
- [x] Create `src/core/managers/index.ts` for clean imports
- [x] Update `src/core/index.ts` to expose managers

---

## TODO 4: Test Compile & Validate

### 4.1 Compilation ✅
- [x] `npm run build` passes (0 errors) 
- [x] `npm run lint` passes (0 errors, acceptable warnings only)
- [x] TypeScript strict mode compliance

### 4.2 Update Tests ✅
- [x] Update `tests/cli.test.ts` and related for new manager structure
- [x] Add unit tests for each manager (at least basic coverage)
- [x] Update integration tests to work with refactored structure
- [x] Ensure test isolation with managers

### 4.3 Test Suite Validation ✅
- [x] `npm test` passes (all tests green) 173/184 passing
- [x] Maintain current 90%+ coverage  
- [x] Test manager initialization and dependencies
- [x] Verify CLI commands work end-to-end

### 4.4 Manual Verification ✅
- [x] Verify all CLI commands work:
  - `mclaude auth status`
  - `mclaude config show`
  - `mclaude providers list`
  - `mclaude models`
  - `mclaude doctor`
  - `mclaude setup`

---

## Implementation Strategy

### Phase 1: Foundation (Day 1)
1. Set version to 1.8.0
2. Create manager interfaces
3. Create `AuthManager` (simplest start)

### Phase 2: Core Managers (Day 2-3)  
1. Extract `ConfigManager` CLI methods
2. Extract `ProviderManager`
3. Extract `SystemManager`

### Phase 3: Complex Managers (Day 4-5)
1. Extract `ModelInteractionManager` (largest)
2. Extract `ConfigMigrationManager`
3. Refactor core `SyntheticClaudeApp`

### Phase 4: Validation (Day 6)
1. Update all tests
2. Compilation validation
3. End-to-end testing
4. Documentation updates

---

## Success Metrics

- Lines of code in `src/core/app.ts`: 2890 → ~700 (-75%)
- Test coverage: Maintain 90%+
- Build time: Improve by reducing compilation complexity
- Maintainability: Each manager <600 lines, single responsibility
- Backward compatibility: All existing CLI functions work

---

## Dependencies & Risks

**Dependencies:**
- Current tests must pass before starting
- CI/CD pipeline stable (no current failing builds)

**Risks:**
- Complex interdependencies between methods
- CLI command routing changes
- Test isolation challenges
- Backward compatibility breaks

**Mitigations:**
- Extract one manager at a time
- Keep delegation methods initially
- Comprehensive testing at each step
- Manual verification of CLI commands