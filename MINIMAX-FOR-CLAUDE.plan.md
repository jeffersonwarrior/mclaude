# MiniMax M2 for Claude Code Integration Plan

## Overview

This document proposes 4 comprehensive plans to integrate MiniMax M2 into mclaude for seamless Claude Code access, leveraging the existing mclaude architecture with the MiniMax API key already configured in `.env`.

## Current State Analysis

- **mclaude**: Mature TypeScript CLI tool with modular architecture
- **Configuration**: Zod-based config system at `~/.config/mclaude/config.json`
- **Model Management**: Multi-provider support ready (provider field exists)
- **Launcher**: Dynamic environment setup for Claude Code
- **API Key**: MiniMax JWT available in `.env` file
- **Documentation**: MiniMax API specs downloaded in `./.api/`

---

## Plan 1: Simple Provider Switch (Low Complexity)

### Description
Add MiniMax as an alternate provider to the existing Synthetic API, allowing users to switch between providers using configuration.

### Key Features
- **Provider Selection**: `mclaude provider set minimax`
- **Model Integration**: MiniMax-M2 appears in model selection interface
- **Environment Routing**: Automatic MiniMax API endpoint configuration
- **Backward Compatibility**: Existing Synthetic API functionality preserved

### Implementation Strategy

#### Configuration Schema Extensions
```typescript
// src/config/types.ts
export const AppConfigSchema = z.object({
  // Existing fields...
  provider: z.enum(['synthetic', 'minimax']).default('synthetic'),
  minimax: z.object({
    apiKey: z.string().optional(),
    baseUrl: z.string().default('https://api.minimax.io'),
    anthropicBaseUrl: z.string().default('https://api.minimax.io/anthropic'),
    modelsApiUrl: z.string().default('https://api.minimax.io/v1/models'),
  }).optional(),
});
```

#### CLI Commands
```bash
mclaude provider list          # Show available providers
mclaude provider set minimax    # Switch to MiniMax
mclaude provider set synthetic  # Switch back to Synthetic
mclaude config show             # Show current provider settings
```

#### Integration Points
- **ModelManager**: Add MiniMax API client alongside existing Synthetic client
- **ClaudeLauncher**: Provider-based environment variable routing
- **UI Components**: Add provider badges to model list

### Pros
- ✅ Minimal code changes
- ✅ Fast implementation (1-2 days)
- ✅ Preserves existing functionality
- ✅ Easy for users to understand

### Cons
- ❌ Limited to single provider at a time
- ❌ No hybrid model selection (cross-provider)
- ❌ Basic provider management

---

## Plan 2: Multi-Provider Hybrid System (Medium Complexity)

### Description
Enable simultaneous access to both Synthetic and MiniMax providers, allowing users to select models from either provider and create hybrid configurations.

### Key Features
- **Dual Provider Access**: Models from both providers available simultaneously
- **Hybrid Model Selection**: Choose regular model from one provider, thinking from another
- **Provider-Aware UI**: Clear provider identification in model selection
- **Advanced Configuration**: Per-model provider settings

### Implementation Strategy

#### Enhanced Configuration
```typescript
export const AppConfigSchema = z.object({
  // Existing fields...
  providers: z.object({
    synthetic: z.object({
      enabled: z.boolean().default(true),
      apiKey: z.string().optional(),
      baseUrl: z.string().default('https://api.synthetic.new'),
    }),
    minimax: z.object({
      enabled: z.boolean().default(false),
      apiKey: z.string().optional(),
      baseUrl: z.string().default('https://api.minimax.io'),
    }),
  }),
  defaultProvider: z.enum(['synthetic', 'minimax']).default('synthetic'),
});
```

#### Model Management Enhancement
```typescript
// src/models/manager.ts
class ModelManager {
  async fetchAllProviders(forceRefresh = false): Promise<ModelInfoImpl[]> {
    const allModels: ModelInfoImpl[] = [];

    if (this.config.providers.synthetic.enabled) {
      const syntheticModels = await this.fetchFromProvider('synthetic', forceRefresh);
      allModels.push(...syntheticModels);
    }

    if (this.config.providers.minimax.enabled) {
      const minimaxModels = await this.fetchFromProvider('minimax', forceRefresh);
      allModels.push(...minimaxModels);
    }

    return allModels;
  }
}
```

#### New CLI Commands
```bash
mclaude providers                         # Show all provider statuses
mclaude providers enable minimax          # Enable MiniMax provider
mclaude providers disable minimax         # Disable MiniMax provider
mclaude models --provider minimax         # Filter models by provider
mclaude model --provider minimax          # Select from specific provider
```

### Pros
- ✅ Complete provider flexibility
- ✅ Hybrid model capabilities
- ✅ Extensible for future providers
- ✅ Rich user experience

### Cons
- ❌ Moderate implementation time (3-5 days)
- ❌ More complex configuration
- ❌ Potential provider conflicts to manage

---

## Plan 3: Advanced MiniMax Integration (High Complexity)

### Description
Deep MiniMax integration with specialized features beyond basic provider switching, including model-specific optimizations, quota management, and advanced Claude Code configurations.

### Key Features
- **MiniMax-Specific Optimizations**: Special handling for M2 model capabilities
- **Quota Management**: Track and manage MiniMax API usage
- **Advanced Claude Config**: Optimize Claude Code settings for MiniMax
- **Performance Monitoring**: Track MiniMax vs Synthetic performance
- **Feature Flags**: Enable MiniMax-specific features (tool use, thinking modes)

### Implementation Strategy

#### MiniMax-Specific Configuration
```typescript
export const AppConfigSchema = z.object({
  // Existing fields...
  minimax: z.object({
    apiKey: z.string().optional(),
    baseUrl: z.string().default('https://api.minimax.io'),
    modelsApiUrl: z.string().default('https://api.minimax.io/v1/models'),
    // MiniMax-specific settings
    quota: z.object({
      dailyLimit: z.number().optional(),
      currentUsage: z.number().default(0),
      resetDate: z.string().optional(),
    }).optional(),
    optimizations: z.object({
      toolUse: z.boolean().default(true),
      interleavedThinking: z.boolean().default(true),
      extendedTimeout: z.boolean().default(true),
    }).optional(),
    claudeSettings: z.object({
      customTemperature: z.number().optional(),
      customMaxTokens: z.number().optional(),
      specialHeaders: z.record(z.string()).optional(),
    }).optional(),
  }),
});
```

#### Specialized MiniMax Manager
```typescript
// src/models/minimax-manager.ts
export class MiniMaxManager {
  async fetchM2Models(): Promise<ModelInfoImpl[]> {
    // M2-specific model fetching with capabilities detection
  }

  async getQuotaInfo(): Promise<QuotaInfo> {
    // Check MiniMax API quota and usage
  }

  async optimizeForM2(launchOptions: LaunchOptions): Promise<LaunchOptions> {
    // Apply MiniMax-specific optimizations
  }
}
```

#### Advanced CLI Commands
```bash
mclaude minimax status                    # Show MiniMax quota and status
mclaude minimax quota                     # Check API usage
mclaude minimax optimize                  # Apply M2 optimizations
mclaude minimax capabilities              # Show M2-specific features
mclaude minimax configure                 # Advanced MiniMax settings
```

#### Claude Code Optimizations
```typescript
// src/launcher/claude-launcher.ts
private createMinimaxEnvironment(options: LaunchOptions): Record<string, string> {
  const env = this.createClaudeEnvironment(options);

  // MiniMax-specific optimizations
  env.ANTHROPIC_BASE_URL = this.config.minimax.anthropicBaseUrl;
  env.API_TIMEOUT_MS = '3000000'; // Extended timeout for M2
  env.ANTHROPIC_MODEL = 'MiniMax-M2';

  if (this.config.minimax.optimizations.toolUse) {
    env.ANTHROPIC_ENABLE_TOOL_USE = 'true';
  }

  if (this.config.minimax.optimizations.interleavedThinking) {
    env.ANTHROPIC_THINKING_MODE = 'interleaved';
  }

  return env;
}
```

### Pros
- ✅ Maximum MiniMax integration
- ✅ Performance optimizations
- ✅ Advanced user control
- ✅ Future-proof for MiniMax features

### Cons
- ❌ Complex implementation (1-2 weeks)
- ❌ Higher maintenance burden
- ❌ Potential MiniMax API dependency issues

---

## Plan 4: Complete Multi-Provider Ecosystem (Maximum Complexity)

### Description
Transform mclaude into a universal provider management platform with plugin architecture, supporting multiple AI providers including Synthetic, MiniMax, and future providers with standardized interfaces.

### Key Features
- **Plugin Architecture**: Dynamic provider loading and management
- **Universal Interface**: Standardized provider API interfaces
- **Provider Marketplace**: Easy addition of new providers
- **Advanced Analytics**: Cross-provider performance comparison
- **Workflow Automation**: Provider selection based on context/task type
- **Configuration Profiles**: Save and switch between provider setups

### Implementation Strategy

#### Plugin Architecture
```typescript
// src/providers/interface.ts
export interface AIProvider {
  name: string;
  version: string;
  models(): Promise<ModelInfoImpl[]>;
  validateApiKey(key: string): Promise<boolean>;
  createEnvironment(options: LaunchOptions): Record<string, string>;
  capabilities(): ProviderCapabilities;
}

// src/providers/minimax-provider.ts
export class MiniMaxProvider implements AIProvider {
  name = 'minimax';
  version = '1.0.0';

  async models(): Promise<ModelInfoImpl[]> {
    // MiniMax model implementation
  }

  createEnvironment(options: LaunchOptions): Record<string, string> {
    // MiniMax-specific environment setup
  }

  capabilities(): ProviderCapabilities {
    return {
      toolUse: true,
      interleavedThinking: true,
      maxTokens: 16384,
      supportedModels: ['MiniMax-M2'],
    };
  }
}
```

#### Provider Registry
```typescript
// src/providers/registry.ts
export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();

  register(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  list(): AIProvider[] {
    return Array.from(this.providers.values());
  }
}
```

#### Configuration Profiles
```typescript
export const AppConfigSchema = z.object({
  profiles: z.record(z.object({
    name: z.string(),
    providers: z.array(z.string()),
    defaultProvider: z.string(),
    settings: z.record(z.any()),
  })),
  activeProfile: z.string().default('default'),
});
```

#### Universal CLI Commands
```bash
mclaude provider list                    # List all available providers
mclaude provider install <name>         # Install new provider
mclaude provider remove <name>          # Remove provider
mclaude profile list                    # List configuration profiles
mclaude profile create <name>           # Create new profile
mclaude profile switch <name>           # Switch active profile
mclaude analytics compare               # Compare provider performance
```

### Pros
- ✅ Unlimited extensibility
- ✅ Future-proof architecture
- ✅ Community contribution ready
- ✅ Maximum user flexibility
- ✅ Commercial potential

### Cons
- ❌ Very complex implementation (2+ weeks)
- ❌ Significant architectural changes
- ❌ Potential plugin management overhead
- ❌ Higher learning curve for users

---

## Recommendation Matrix

| Plan | Complexity | Implementation Time | User Value | Future-Proof | Risk | Recommendation |
|------|------------|-------------------|------------|--------------|------|----------------|
| Plan 1 | Low | 1-2 days | Medium | Low | Low | **Quick Start** |
| Plan 2 | Medium | 3-5 days | High | Medium | Medium | **Recommended** |
| Plan 3 | High | 1-2 weeks | High | High | High | **Power Users** |
| Plan 4 | Maximum | 2+ weeks | Very High | Very High | Very High | **Long-term Vision** |

## Phased Implementation Roadmap

### Phase 1: Foundation (Plan 1)
- Implement basic provider switching
- Add MiniMax to configuration schema
- Create provider CLI commands
- Test MiniMax integration

### Phase 2: Enhancement (Plan 2)
- Upgrade to multi-provider support
- Add hybrid model selection
- Implement provider management UI
- Performance testing and optimization

### Phase 3: Advanced Features (Plan 3)
- Add MiniMax-specific optimizations
- Implement quota management
- Add performance monitoring
- Advanced Claude Code integration

### Phase 4: Ecosystem (Plan 4)
- Develop plugin architecture
- Create provider marketplace
- Add analytics and workflows
- Community features

## Next Steps

1. **Choose Implementation Plan** based on timeline and resources
2. **Start with Plan 1** for immediate MiniMax access
3. **Plan Phase 2** integration based on user feedback
4. **Consider Plans 3-4** for long-term roadmap

## Technical Considerations

- **API Key Security**: Leverage existing `.env` file with proper permissions
- **Error Handling**: Robust provider fallback mechanisms
- **Performance**: Efficient model caching across providers
- **Testing**: Comprehensive provider integration tests
- **Documentation**: Updated CLAUDE.md and user guides

## Dependencies and Risk Mitigation

- **MiniMax API Stability**: Monitor rate limits and uptime
- **JWT Token Management**: Secure token refresh mechanisms
- **Claude Code Compatibility**: Ensure environment variable alignment
- **User Experience**: Smooth provider transitions and clear feedback

Each plan provides increasing levels of sophistication while maintaining compatibility with the existing mclaude architecture and leveraging the MiniMax API key already available.