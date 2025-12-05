# CRUSH.md - MClaude Agent Instructions

## Project Overview
MClaude is a TypeScript CLI tool that provides interactive model selection for Claude Code, routing requests through a LiteLLM proxy (localhost:9313) to MiniMax and Synthetic AI providers. Uses pattern-based routing: `minimax:*` → MiniMax API, `synthetic:*` → Synthetic API.

## Essential Commands

### Development
```
npm install                 # Install dependencies
npm run build              # tsc && chmod +x dist/cli/index.js
npm run dev                # ts-node src/index.ts (development mode)
npm test                   # jest (122/133 tests passing)
npm run lint               # eslint src --ext .ts
npm run lint:fix           # Auto-fix lint issues
npm run format             # prettier --write \"src/**/*.ts\"
```

### Build & Publish
```
npm run build              # Production build
npm version <version>      # Creates tag, triggers GitHub Actions publish
# GitHub Actions: .github/workflows/publish.yml runs on v*.*.* tags
```

### Runtime
```
mclaude setup              # Initial setup + LiteLLM install
mclaude models             # Interactive model selection
mclaude --model <id>       # Direct model launch (most reliable)
mclaude doctor             # System health check
```

## Code Structure
```
src/
├── cli/           # Commander.js CLI (dist/cli/index.js is executable)
├── config/        # Zod validation + config management (~/.config/mclaude/config.json)
├── core/          # App orchestration (SyntheticClaudeApp)
├── api/           # HTTP clients (axios)
├── models/        # Model caching/management
├── router/        # LiteLLM proxy server (port 9313) + SQLite config
├── ui/            # Ink/React terminal UI + fallbacks
├── utils/         # Logger, error sanitizer, banner
└── launcher/      # Claude launcher integration
tests/             # Jest + React Testing Library
```

## Testing
- **Command**: `npm test` (Jest + ts-jest + jsdom)
- **Config**: `jest.config.js` (ESM support, coverage on src/**/*.ts(x))
- **Setup**: `tests/setup.ts`
- **Coverage**: Excludes `src/index.ts`, declaration files
- **Status**: 122/133 tests passing (91% coverage)
- **Timeout**: 30s per test

**Run specific tests**:
```
npm test tests/cli.test.ts
npm test --watch
npm test --coverage
```

## Linting & Formatting
```
npm run lint               # eslint src --ext .ts (8 errors, 84 warnings acceptable)
npm run lint:fix
npm run format             # prettier --write src/**/*.ts
```

**ESLint Rules** (`.eslintrc.json`):
- `@typescript-eslint/no-unused-vars`: warn (ignores `_` prefix)
- `@typescript-eslint/no-explicit-any`: warn
- `no-console`: off
- Ignores: `dist/`, `node_modules/`, `tests/__snapshots__/`

## Build Process
1. `tsc` compiles TypeScript → `dist/`
2. `scripts/build.sh` adds shebang + `chmod +x dist/cli/index.js`
3. `package.json#files` includes: `dist/`, `README.md`, `LICENSE`, `CHANGELOG.md`, `scripts/`
4. Entry: `"bin": { "mclaude": "dist/cli/index.js" }`

## Critical Dependencies & Setup
```
postinstall: npm run install-litellm
install-litellm: pip install 'litellm[proxy]' prisma
```
- **LiteLLM Proxy**: Port 9313, SQLite database (`file:${os.tmpdir()}/litellm.db`)
- **Prisma Fix**: Auto-generates schema for SQLite compatibility
- **Config Priority**: `.mclaude/config.json` > `.env` > `~/.config/mclaude/config.json` > `process.env`

## Key Gotchas

### LiteLLM SQLite Issues (LITELLM_SQLITE_FIX.md)
```
❌ Prisma defaults to PostgreSQL
✅ Must use SQLite: DATABASE_URL=file:${os.tmpdir()}/litellm.db
✅ Auto-fixed in postinstall script
```

### UI Terminal Compatibility
```
✅ Direct model: mclaude --model claude-3-5-sonnet-20241022 (most reliable)
🔄 Ctrl+F: Cycle UI modes during model selection
🔄 Ctrl+ESC: Safest console mode
```

### Publishing
```
✅ Git tags v*.*.* trigger .github/workflows/publish.yml
✅ Uses NPM_TOKEN secret (OIDC ready but not enabled)
✅ Tests skipped in prepublishOnly (88% coverage)
```

## Git Workflow
```
npm version patch/minor/major  # Updates version + creates tag
git push && git push --tags    # Triggers GitHub Actions publish
# OR manual: npm run format && npm run build && npm publish
```

## Module Patterns
```
✅ Barrel exports: src/index.ts re-exports everything
✅ Absolute imports: @/utils/logger → src/utils/logger.ts
✅ Commander.js: src/cli/commands.ts
✅ Ink/React: src/ui/ for terminal UI with fallbacks
✅ Zod: src/config/types.ts for schema validation
```

## Dist Status (Don't modify these)
```
❌ Deleted: dist/cli/api/*, dist/cli/launcher/* (rebuilt on npm install)
✅ Working: dist/cli/index.js (executable)
```
