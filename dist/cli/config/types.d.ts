import { z } from "zod";
export declare const ProviderEnum: z.ZodEnum<["synthetic", "minimax", "auto"]>;
export type ProviderType = z.infer<typeof ProviderEnum>;
export declare const SyntheticProviderConfig: z.ZodObject<{
    apiKey: z.ZodDefault<z.ZodString>;
    baseUrl: z.ZodDefault<z.ZodString>;
    anthropicBaseUrl: z.ZodDefault<z.ZodString>;
    modelsApiUrl: z.ZodDefault<z.ZodString>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    timeout: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    apiKey?: string;
    baseUrl?: string;
    anthropicBaseUrl?: string;
    modelsApiUrl?: string;
    enabled?: boolean;
    timeout?: number;
}, {
    apiKey?: string;
    baseUrl?: string;
    anthropicBaseUrl?: string;
    modelsApiUrl?: string;
    enabled?: boolean;
    timeout?: number;
}>;
export declare const ToolChoiceEnum: z.ZodEnum<["auto", "none", "required"]>;
export type ToolChoiceType = z.infer<typeof ToolChoiceEnum>;
export declare const PresetEnum: z.ZodEnum<["creative", "precise", "balanced"]>;
export type PresetType = z.infer<typeof PresetEnum>;
export declare const ResponseFormatEnum: z.ZodEnum<["text", "json_object"]>;
export type ResponseFormatType = z.infer<typeof ResponseFormatEnum>;
export declare const MinimaxProviderConfig: z.ZodObject<{
    apiKey: z.ZodDefault<z.ZodString>;
    groupId: z.ZodOptional<z.ZodString>;
    baseUrl: z.ZodDefault<z.ZodString>;
    anthropicBaseUrl: z.ZodDefault<z.ZodString>;
    modelsApiUrl: z.ZodDefault<z.ZodString>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    defaultModel: z.ZodDefault<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
    temperature: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    contextSize: z.ZodOptional<z.ZodNumber>;
    toolChoice: z.ZodOptional<z.ZodEnum<["auto", "none", "required"]>>;
    parallelToolCalls: z.ZodDefault<z.ZodBoolean>;
    responseFormat: z.ZodOptional<z.ZodEnum<["text", "json_object"]>>;
    streaming: z.ZodDefault<z.ZodBoolean>;
    memoryCompact: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    apiKey?: string;
    baseUrl?: string;
    anthropicBaseUrl?: string;
    modelsApiUrl?: string;
    enabled?: boolean;
    timeout?: number;
    groupId?: string;
    defaultModel?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    contextSize?: number;
    toolChoice?: "auto" | "none" | "required";
    parallelToolCalls?: boolean;
    responseFormat?: "text" | "json_object";
    streaming?: boolean;
    memoryCompact?: boolean;
}, {
    apiKey?: string;
    baseUrl?: string;
    anthropicBaseUrl?: string;
    modelsApiUrl?: string;
    enabled?: boolean;
    timeout?: number;
    groupId?: string;
    defaultModel?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    contextSize?: number;
    toolChoice?: "auto" | "none" | "required";
    parallelToolCalls?: boolean;
    responseFormat?: "text" | "json_object";
    streaming?: boolean;
    memoryCompact?: boolean;
}>;
export declare const LegacyAppConfigSchema: z.ZodObject<{
    apiKey: z.ZodDefault<z.ZodString>;
    baseUrl: z.ZodDefault<z.ZodString>;
    anthropicBaseUrl: z.ZodDefault<z.ZodString>;
    modelsApiUrl: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    apiKey?: string;
    baseUrl?: string;
    anthropicBaseUrl?: string;
    modelsApiUrl?: string;
}, {
    apiKey?: string;
    baseUrl?: string;
    anthropicBaseUrl?: string;
    modelsApiUrl?: string;
}>;
export declare const AppConfigSchema: z.ZodObject<{
    providers: z.ZodDefault<z.ZodObject<{
        synthetic: z.ZodDefault<z.ZodObject<{
            apiKey: z.ZodDefault<z.ZodString>;
            baseUrl: z.ZodDefault<z.ZodString>;
            anthropicBaseUrl: z.ZodDefault<z.ZodString>;
            modelsApiUrl: z.ZodDefault<z.ZodString>;
            enabled: z.ZodDefault<z.ZodBoolean>;
            timeout: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            apiKey?: string;
            baseUrl?: string;
            anthropicBaseUrl?: string;
            modelsApiUrl?: string;
            enabled?: boolean;
            timeout?: number;
        }, {
            apiKey?: string;
            baseUrl?: string;
            anthropicBaseUrl?: string;
            modelsApiUrl?: string;
            enabled?: boolean;
            timeout?: number;
        }>>;
        minimax: z.ZodDefault<z.ZodObject<{
            apiKey: z.ZodDefault<z.ZodString>;
            groupId: z.ZodOptional<z.ZodString>;
            baseUrl: z.ZodDefault<z.ZodString>;
            anthropicBaseUrl: z.ZodDefault<z.ZodString>;
            modelsApiUrl: z.ZodDefault<z.ZodString>;
            enabled: z.ZodDefault<z.ZodBoolean>;
            defaultModel: z.ZodDefault<z.ZodString>;
            timeout: z.ZodOptional<z.ZodNumber>;
            temperature: z.ZodOptional<z.ZodNumber>;
            topP: z.ZodOptional<z.ZodNumber>;
            topK: z.ZodOptional<z.ZodNumber>;
            contextSize: z.ZodOptional<z.ZodNumber>;
            toolChoice: z.ZodOptional<z.ZodEnum<["auto", "none", "required"]>>;
            parallelToolCalls: z.ZodDefault<z.ZodBoolean>;
            responseFormat: z.ZodOptional<z.ZodEnum<["text", "json_object"]>>;
            streaming: z.ZodDefault<z.ZodBoolean>;
            memoryCompact: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            apiKey?: string;
            baseUrl?: string;
            anthropicBaseUrl?: string;
            modelsApiUrl?: string;
            enabled?: boolean;
            timeout?: number;
            groupId?: string;
            defaultModel?: string;
            temperature?: number;
            topP?: number;
            topK?: number;
            contextSize?: number;
            toolChoice?: "auto" | "none" | "required";
            parallelToolCalls?: boolean;
            responseFormat?: "text" | "json_object";
            streaming?: boolean;
            memoryCompact?: boolean;
        }, {
            apiKey?: string;
            baseUrl?: string;
            anthropicBaseUrl?: string;
            modelsApiUrl?: string;
            enabled?: boolean;
            timeout?: number;
            groupId?: string;
            defaultModel?: string;
            temperature?: number;
            topP?: number;
            topK?: number;
            contextSize?: number;
            toolChoice?: "auto" | "none" | "required";
            parallelToolCalls?: boolean;
            responseFormat?: "text" | "json_object";
            streaming?: boolean;
            memoryCompact?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        synthetic?: {
            apiKey?: string;
            baseUrl?: string;
            anthropicBaseUrl?: string;
            modelsApiUrl?: string;
            enabled?: boolean;
            timeout?: number;
        };
        minimax?: {
            apiKey?: string;
            baseUrl?: string;
            anthropicBaseUrl?: string;
            modelsApiUrl?: string;
            enabled?: boolean;
            timeout?: number;
            groupId?: string;
            defaultModel?: string;
            temperature?: number;
            topP?: number;
            topK?: number;
            contextSize?: number;
            toolChoice?: "auto" | "none" | "required";
            parallelToolCalls?: boolean;
            responseFormat?: "text" | "json_object";
            streaming?: boolean;
            memoryCompact?: boolean;
        };
    }, {
        synthetic?: {
            apiKey?: string;
            baseUrl?: string;
            anthropicBaseUrl?: string;
            modelsApiUrl?: string;
            enabled?: boolean;
            timeout?: number;
        };
        minimax?: {
            apiKey?: string;
            baseUrl?: string;
            anthropicBaseUrl?: string;
            modelsApiUrl?: string;
            enabled?: boolean;
            timeout?: number;
            groupId?: string;
            defaultModel?: string;
            temperature?: number;
            topP?: number;
            topK?: number;
            contextSize?: number;
            toolChoice?: "auto" | "none" | "required";
            parallelToolCalls?: boolean;
            responseFormat?: "text" | "json_object";
            streaming?: boolean;
            memoryCompact?: boolean;
        };
    }>>;
    defaultProvider: z.ZodDefault<z.ZodEnum<["synthetic", "minimax", "auto"]>>;
    cacheDurationHours: z.ZodDefault<z.ZodNumber>;
    selectedModel: z.ZodDefault<z.ZodString>;
    selectedThinkingModel: z.ZodDefault<z.ZodString>;
    firstRunCompleted: z.ZodDefault<z.ZodBoolean>;
    tokenUsage: z.ZodDefault<z.ZodObject<{
        totalInputTokens: z.ZodDefault<z.ZodNumber>;
        totalOutputTokens: z.ZodDefault<z.ZodNumber>;
        sessionTokens: z.ZodDefault<z.ZodNumber>;
        lastUpdated: z.ZodOptional<z.ZodString>;
        history: z.ZodDefault<z.ZodArray<z.ZodObject<{
            date: z.ZodString;
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            date?: string;
            inputTokens?: number;
            outputTokens?: number;
        }, {
            date?: string;
            inputTokens?: number;
            outputTokens?: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        totalInputTokens?: number;
        totalOutputTokens?: number;
        sessionTokens?: number;
        lastUpdated?: string;
        history?: {
            date?: string;
            inputTokens?: number;
            outputTokens?: number;
        }[];
    }, {
        totalInputTokens?: number;
        totalOutputTokens?: number;
        sessionTokens?: number;
        lastUpdated?: string;
        history?: {
            date?: string;
            inputTokens?: number;
            outputTokens?: number;
        }[];
    }>>;
    responseCache: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        ttlMinutes: z.ZodDefault<z.ZodNumber>;
        maxEntries: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        ttlMinutes?: number;
        maxEntries?: number;
    }, {
        enabled?: boolean;
        ttlMinutes?: number;
        maxEntries?: number;
    }>>;
    liteLLM: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        port: z.ZodDefault<z.ZodNumber>;
        host: z.ZodDefault<z.ZodString>;
        timeout: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        timeout?: number;
        port?: number;
        host?: string;
    }, {
        enabled?: boolean;
        timeout?: number;
        port?: number;
        host?: string;
    }>>;
    envOverrides: z.ZodDefault<z.ZodObject<{
        synthetic: z.ZodOptional<z.ZodObject<{
            apiKey: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            apiKey?: string;
        }, {
            apiKey?: string;
        }>>;
        minimax: z.ZodOptional<z.ZodObject<{
            apiKey: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            apiKey?: string;
        }, {
            apiKey?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        synthetic?: {
            apiKey?: string;
        };
        minimax?: {
            apiKey?: string;
        };
    }, {
        synthetic?: {
            apiKey?: string;
        };
        minimax?: {
            apiKey?: string;
        };
    }>>;
    combination1: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }>>;
    combination2: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }>>;
    combination3: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }>>;
    combination4: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }>>;
    combination5: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }>>;
    combination6: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }>>;
    combination7: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }>>;
    combination8: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }>>;
    combination9: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }>>;
    combination10: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }, {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    }>>;
    configVersion: z.ZodDefault<z.ZodNumber>;
    recommendedModels: z.ZodDefault<z.ZodObject<{
        default: z.ZodDefault<z.ZodObject<{
            primary: z.ZodDefault<z.ZodString>;
            backup: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            primary?: string;
            backup?: string;
        }, {
            primary?: string;
            backup?: string;
        }>>;
        smallFast: z.ZodDefault<z.ZodObject<{
            primary: z.ZodDefault<z.ZodString>;
            backup: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            primary?: string;
            backup?: string;
        }, {
            primary?: string;
            backup?: string;
        }>>;
        thinking: z.ZodDefault<z.ZodObject<{
            primary: z.ZodDefault<z.ZodString>;
            backup: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            primary?: string;
            backup?: string;
        }, {
            primary?: string;
            backup?: string;
        }>>;
        subagent: z.ZodDefault<z.ZodObject<{
            primary: z.ZodDefault<z.ZodString>;
            backup: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            primary?: string;
            backup?: string;
        }, {
            primary?: string;
            backup?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        default?: {
            primary?: string;
            backup?: string;
        };
        smallFast?: {
            primary?: string;
            backup?: string;
        };
        thinking?: {
            primary?: string;
            backup?: string;
        };
        subagent?: {
            primary?: string;
            backup?: string;
        };
    }, {
        default?: {
            primary?: string;
            backup?: string;
        };
        smallFast?: {
            primary?: string;
            backup?: string;
        };
        thinking?: {
            primary?: string;
            backup?: string;
        };
        subagent?: {
            primary?: string;
            backup?: string;
        };
    }>>;
    lastUpdateCheck: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    providers?: {
        synthetic?: {
            apiKey?: string;
            baseUrl?: string;
            anthropicBaseUrl?: string;
            modelsApiUrl?: string;
            enabled?: boolean;
            timeout?: number;
        };
        minimax?: {
            apiKey?: string;
            baseUrl?: string;
            anthropicBaseUrl?: string;
            modelsApiUrl?: string;
            enabled?: boolean;
            timeout?: number;
            groupId?: string;
            defaultModel?: string;
            temperature?: number;
            topP?: number;
            topK?: number;
            contextSize?: number;
            toolChoice?: "auto" | "none" | "required";
            parallelToolCalls?: boolean;
            responseFormat?: "text" | "json_object";
            streaming?: boolean;
            memoryCompact?: boolean;
        };
    };
    defaultProvider?: "synthetic" | "minimax" | "auto";
    cacheDurationHours?: number;
    selectedModel?: string;
    selectedThinkingModel?: string;
    firstRunCompleted?: boolean;
    tokenUsage?: {
        totalInputTokens?: number;
        totalOutputTokens?: number;
        sessionTokens?: number;
        lastUpdated?: string;
        history?: {
            date?: string;
            inputTokens?: number;
            outputTokens?: number;
        }[];
    };
    responseCache?: {
        enabled?: boolean;
        ttlMinutes?: number;
        maxEntries?: number;
    };
    liteLLM?: {
        enabled?: boolean;
        timeout?: number;
        port?: number;
        host?: string;
    };
    envOverrides?: {
        synthetic?: {
            apiKey?: string;
        };
        minimax?: {
            apiKey?: string;
        };
    };
    combination1?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination2?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination3?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination4?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination5?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination6?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination7?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination8?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination9?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination10?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    configVersion?: number;
    recommendedModels?: {
        default?: {
            primary?: string;
            backup?: string;
        };
        smallFast?: {
            primary?: string;
            backup?: string;
        };
        thinking?: {
            primary?: string;
            backup?: string;
        };
        subagent?: {
            primary?: string;
            backup?: string;
        };
    };
    lastUpdateCheck?: number;
}, {
    providers?: {
        synthetic?: {
            apiKey?: string;
            baseUrl?: string;
            anthropicBaseUrl?: string;
            modelsApiUrl?: string;
            enabled?: boolean;
            timeout?: number;
        };
        minimax?: {
            apiKey?: string;
            baseUrl?: string;
            anthropicBaseUrl?: string;
            modelsApiUrl?: string;
            enabled?: boolean;
            timeout?: number;
            groupId?: string;
            defaultModel?: string;
            temperature?: number;
            topP?: number;
            topK?: number;
            contextSize?: number;
            toolChoice?: "auto" | "none" | "required";
            parallelToolCalls?: boolean;
            responseFormat?: "text" | "json_object";
            streaming?: boolean;
            memoryCompact?: boolean;
        };
    };
    defaultProvider?: "synthetic" | "minimax" | "auto";
    cacheDurationHours?: number;
    selectedModel?: string;
    selectedThinkingModel?: string;
    firstRunCompleted?: boolean;
    tokenUsage?: {
        totalInputTokens?: number;
        totalOutputTokens?: number;
        sessionTokens?: number;
        lastUpdated?: string;
        history?: {
            date?: string;
            inputTokens?: number;
            outputTokens?: number;
        }[];
    };
    responseCache?: {
        enabled?: boolean;
        ttlMinutes?: number;
        maxEntries?: number;
    };
    liteLLM?: {
        enabled?: boolean;
        timeout?: number;
        port?: number;
        host?: string;
    };
    envOverrides?: {
        synthetic?: {
            apiKey?: string;
        };
        minimax?: {
            apiKey?: string;
        };
    };
    combination1?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination2?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination3?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination4?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination5?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination6?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination7?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination8?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination9?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    combination10?: {
        name?: string;
        regularModel?: string;
        thinkingModel?: string;
        regularProvider?: string;
        thinkingProvider?: string;
        createdAt?: string;
    };
    configVersion?: number;
    recommendedModels?: {
        default?: {
            primary?: string;
            backup?: string;
        };
        smallFast?: {
            primary?: string;
            backup?: string;
        };
        thinking?: {
            primary?: string;
            backup?: string;
        };
        subagent?: {
            primary?: string;
            backup?: string;
        };
    };
    lastUpdateCheck?: number;
}>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
export type Provider = ProviderType;
export type LegacyAppConfig = z.infer<typeof LegacyAppConfigSchema>;
export type SyntheticProviderConfig = z.infer<typeof SyntheticProviderConfig>;
export type MinimaxProviderConfig = z.infer<typeof MinimaxProviderConfig>;
export declare const ModelCardSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    aliases: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    roles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    priority: z.ZodDefault<z.ZodNumber>;
    preferProvider: z.ZodOptional<z.ZodString>;
    capabilities: z.ZodDefault<z.ZodObject<{
        tools: z.ZodDefault<z.ZodBoolean>;
        json_mode: z.ZodDefault<z.ZodBoolean>;
        thinking: z.ZodDefault<z.ZodBoolean>;
        streaming: z.ZodDefault<z.ZodBoolean>;
        parallel_tools: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        streaming?: boolean;
        thinking?: boolean;
        tools?: boolean;
        json_mode?: boolean;
        parallel_tools?: boolean;
    }, {
        streaming?: boolean;
        thinking?: boolean;
        tools?: boolean;
        json_mode?: boolean;
        parallel_tools?: boolean;
    }>>;
    limits: z.ZodDefault<z.ZodObject<{
        context: z.ZodOptional<z.ZodNumber>;
        max_output: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        context?: number;
        max_output?: number;
    }, {
        context?: number;
        max_output?: number;
    }>>;
    parameters: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    speed_tier: z.ZodDefault<z.ZodEnum<["fast", "medium", "slow"]>>;
    provider: z.ZodString;
    verified: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    id?: string;
    aliases?: string[];
    roles?: string[];
    priority?: number;
    preferProvider?: string;
    capabilities?: {
        streaming?: boolean;
        thinking?: boolean;
        tools?: boolean;
        json_mode?: boolean;
        parallel_tools?: boolean;
    };
    limits?: {
        context?: number;
        max_output?: number;
    };
    parameters?: string[];
    speed_tier?: "fast" | "medium" | "slow";
    provider?: string;
    verified?: string;
}, {
    name?: string;
    id?: string;
    aliases?: string[];
    roles?: string[];
    priority?: number;
    preferProvider?: string;
    capabilities?: {
        streaming?: boolean;
        thinking?: boolean;
        tools?: boolean;
        json_mode?: boolean;
        parallel_tools?: boolean;
    };
    limits?: {
        context?: number;
        max_output?: number;
    };
    parameters?: string[];
    speed_tier?: "fast" | "medium" | "slow";
    provider?: string;
    verified?: string;
}>;
export type ModelCard = z.infer<typeof ModelCardSchema>;
export declare const ModelCardsSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    updated: z.ZodOptional<z.ZodString>;
    providerPriority: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    cards: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        aliases: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        roles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        priority: z.ZodDefault<z.ZodNumber>;
        preferProvider: z.ZodOptional<z.ZodString>;
        capabilities: z.ZodDefault<z.ZodObject<{
            tools: z.ZodDefault<z.ZodBoolean>;
            json_mode: z.ZodDefault<z.ZodBoolean>;
            thinking: z.ZodDefault<z.ZodBoolean>;
            streaming: z.ZodDefault<z.ZodBoolean>;
            parallel_tools: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            streaming?: boolean;
            thinking?: boolean;
            tools?: boolean;
            json_mode?: boolean;
            parallel_tools?: boolean;
        }, {
            streaming?: boolean;
            thinking?: boolean;
            tools?: boolean;
            json_mode?: boolean;
            parallel_tools?: boolean;
        }>>;
        limits: z.ZodDefault<z.ZodObject<{
            context: z.ZodOptional<z.ZodNumber>;
            max_output: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            context?: number;
            max_output?: number;
        }, {
            context?: number;
            max_output?: number;
        }>>;
        parameters: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        speed_tier: z.ZodDefault<z.ZodEnum<["fast", "medium", "slow"]>>;
        provider: z.ZodString;
        verified: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        id?: string;
        aliases?: string[];
        roles?: string[];
        priority?: number;
        preferProvider?: string;
        capabilities?: {
            streaming?: boolean;
            thinking?: boolean;
            tools?: boolean;
            json_mode?: boolean;
            parallel_tools?: boolean;
        };
        limits?: {
            context?: number;
            max_output?: number;
        };
        parameters?: string[];
        speed_tier?: "fast" | "medium" | "slow";
        provider?: string;
        verified?: string;
    }, {
        name?: string;
        id?: string;
        aliases?: string[];
        roles?: string[];
        priority?: number;
        preferProvider?: string;
        capabilities?: {
            streaming?: boolean;
            thinking?: boolean;
            tools?: boolean;
            json_mode?: boolean;
            parallel_tools?: boolean;
        };
        limits?: {
            context?: number;
            max_output?: number;
        };
        parameters?: string[];
        speed_tier?: "fast" | "medium" | "slow";
        provider?: string;
        verified?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    version?: string;
    updated?: string;
    providerPriority?: string[];
    cards?: {
        name?: string;
        id?: string;
        aliases?: string[];
        roles?: string[];
        priority?: number;
        preferProvider?: string;
        capabilities?: {
            streaming?: boolean;
            thinking?: boolean;
            tools?: boolean;
            json_mode?: boolean;
            parallel_tools?: boolean;
        };
        limits?: {
            context?: number;
            max_output?: number;
        };
        parameters?: string[];
        speed_tier?: "fast" | "medium" | "slow";
        provider?: string;
        verified?: string;
    }[];
}, {
    version?: string;
    updated?: string;
    providerPriority?: string[];
    cards?: {
        name?: string;
        id?: string;
        aliases?: string[];
        roles?: string[];
        priority?: number;
        preferProvider?: string;
        capabilities?: {
            streaming?: boolean;
            thinking?: boolean;
            tools?: boolean;
            json_mode?: boolean;
            parallel_tools?: boolean;
        };
        limits?: {
            context?: number;
            max_output?: number;
        };
        parameters?: string[];
        speed_tier?: "fast" | "medium" | "slow";
        provider?: string;
        verified?: string;
    }[];
}>;
export type ModelCards = z.infer<typeof ModelCardsSchema>;
export declare class ConfigValidationError extends Error {
    cause?: unknown;
    constructor(message: string, cause?: unknown);
}
export declare class ConfigLoadError extends Error {
    cause?: unknown;
    constructor(message: string, cause?: unknown);
}
export declare class ConfigSaveError extends Error {
    cause?: unknown;
    constructor(message: string, cause?: unknown);
}
