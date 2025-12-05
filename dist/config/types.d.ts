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
    apiKey: string;
    baseUrl: string;
    anthropicBaseUrl: string;
    modelsApiUrl: string;
    enabled: boolean;
    timeout?: number | undefined;
}, {
    apiKey?: string | undefined;
    baseUrl?: string | undefined;
    anthropicBaseUrl?: string | undefined;
    modelsApiUrl?: string | undefined;
    enabled?: boolean | undefined;
    timeout?: number | undefined;
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
    apiKey: string;
    baseUrl: string;
    anthropicBaseUrl: string;
    modelsApiUrl: string;
    enabled: boolean;
    defaultModel: string;
    parallelToolCalls: boolean;
    streaming: boolean;
    memoryCompact: boolean;
    timeout?: number | undefined;
    groupId?: string | undefined;
    temperature?: number | undefined;
    topP?: number | undefined;
    topK?: number | undefined;
    contextSize?: number | undefined;
    toolChoice?: "auto" | "none" | "required" | undefined;
    responseFormat?: "text" | "json_object" | undefined;
}, {
    apiKey?: string | undefined;
    baseUrl?: string | undefined;
    anthropicBaseUrl?: string | undefined;
    modelsApiUrl?: string | undefined;
    enabled?: boolean | undefined;
    timeout?: number | undefined;
    groupId?: string | undefined;
    defaultModel?: string | undefined;
    temperature?: number | undefined;
    topP?: number | undefined;
    topK?: number | undefined;
    contextSize?: number | undefined;
    toolChoice?: "auto" | "none" | "required" | undefined;
    parallelToolCalls?: boolean | undefined;
    responseFormat?: "text" | "json_object" | undefined;
    streaming?: boolean | undefined;
    memoryCompact?: boolean | undefined;
}>;
export declare const LegacyAppConfigSchema: z.ZodObject<{
    apiKey: z.ZodDefault<z.ZodString>;
    baseUrl: z.ZodDefault<z.ZodString>;
    anthropicBaseUrl: z.ZodDefault<z.ZodString>;
    modelsApiUrl: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    apiKey: string;
    baseUrl: string;
    anthropicBaseUrl: string;
    modelsApiUrl: string;
}, {
    apiKey?: string | undefined;
    baseUrl?: string | undefined;
    anthropicBaseUrl?: string | undefined;
    modelsApiUrl?: string | undefined;
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
            apiKey: string;
            baseUrl: string;
            anthropicBaseUrl: string;
            modelsApiUrl: string;
            enabled: boolean;
            timeout?: number | undefined;
        }, {
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            anthropicBaseUrl?: string | undefined;
            modelsApiUrl?: string | undefined;
            enabled?: boolean | undefined;
            timeout?: number | undefined;
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
            apiKey: string;
            baseUrl: string;
            anthropicBaseUrl: string;
            modelsApiUrl: string;
            enabled: boolean;
            defaultModel: string;
            parallelToolCalls: boolean;
            streaming: boolean;
            memoryCompact: boolean;
            timeout?: number | undefined;
            groupId?: string | undefined;
            temperature?: number | undefined;
            topP?: number | undefined;
            topK?: number | undefined;
            contextSize?: number | undefined;
            toolChoice?: "auto" | "none" | "required" | undefined;
            responseFormat?: "text" | "json_object" | undefined;
        }, {
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            anthropicBaseUrl?: string | undefined;
            modelsApiUrl?: string | undefined;
            enabled?: boolean | undefined;
            timeout?: number | undefined;
            groupId?: string | undefined;
            defaultModel?: string | undefined;
            temperature?: number | undefined;
            topP?: number | undefined;
            topK?: number | undefined;
            contextSize?: number | undefined;
            toolChoice?: "auto" | "none" | "required" | undefined;
            parallelToolCalls?: boolean | undefined;
            responseFormat?: "text" | "json_object" | undefined;
            streaming?: boolean | undefined;
            memoryCompact?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        synthetic: {
            apiKey: string;
            baseUrl: string;
            anthropicBaseUrl: string;
            modelsApiUrl: string;
            enabled: boolean;
            timeout?: number | undefined;
        };
        minimax: {
            apiKey: string;
            baseUrl: string;
            anthropicBaseUrl: string;
            modelsApiUrl: string;
            enabled: boolean;
            defaultModel: string;
            parallelToolCalls: boolean;
            streaming: boolean;
            memoryCompact: boolean;
            timeout?: number | undefined;
            groupId?: string | undefined;
            temperature?: number | undefined;
            topP?: number | undefined;
            topK?: number | undefined;
            contextSize?: number | undefined;
            toolChoice?: "auto" | "none" | "required" | undefined;
            responseFormat?: "text" | "json_object" | undefined;
        };
    }, {
        synthetic?: {
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            anthropicBaseUrl?: string | undefined;
            modelsApiUrl?: string | undefined;
            enabled?: boolean | undefined;
            timeout?: number | undefined;
        } | undefined;
        minimax?: {
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            anthropicBaseUrl?: string | undefined;
            modelsApiUrl?: string | undefined;
            enabled?: boolean | undefined;
            timeout?: number | undefined;
            groupId?: string | undefined;
            defaultModel?: string | undefined;
            temperature?: number | undefined;
            topP?: number | undefined;
            topK?: number | undefined;
            contextSize?: number | undefined;
            toolChoice?: "auto" | "none" | "required" | undefined;
            parallelToolCalls?: boolean | undefined;
            responseFormat?: "text" | "json_object" | undefined;
            streaming?: boolean | undefined;
            memoryCompact?: boolean | undefined;
        } | undefined;
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
            date: string;
            inputTokens: number;
            outputTokens: number;
        }, {
            date: string;
            inputTokens: number;
            outputTokens: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        totalInputTokens: number;
        totalOutputTokens: number;
        sessionTokens: number;
        history: {
            date: string;
            inputTokens: number;
            outputTokens: number;
        }[];
        lastUpdated?: string | undefined;
    }, {
        totalInputTokens?: number | undefined;
        totalOutputTokens?: number | undefined;
        sessionTokens?: number | undefined;
        lastUpdated?: string | undefined;
        history?: {
            date: string;
            inputTokens: number;
            outputTokens: number;
        }[] | undefined;
    }>>;
    responseCache: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        ttlMinutes: z.ZodDefault<z.ZodNumber>;
        maxEntries: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        ttlMinutes: number;
        maxEntries: number;
    }, {
        enabled?: boolean | undefined;
        ttlMinutes?: number | undefined;
        maxEntries?: number | undefined;
    }>>;
    liteLLM: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        port: z.ZodDefault<z.ZodNumber>;
        host: z.ZodDefault<z.ZodString>;
        timeout: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        timeout: number;
        port: number;
        host: string;
    }, {
        enabled?: boolean | undefined;
        timeout?: number | undefined;
        port?: number | undefined;
        host?: string | undefined;
    }>>;
    envOverrides: z.ZodDefault<z.ZodObject<{
        synthetic: z.ZodOptional<z.ZodObject<{
            apiKey: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            apiKey?: string | undefined;
        }, {
            apiKey?: string | undefined;
        }>>;
        minimax: z.ZodOptional<z.ZodObject<{
            apiKey: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            apiKey?: string | undefined;
        }, {
            apiKey?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        synthetic?: {
            apiKey?: string | undefined;
        } | undefined;
        minimax?: {
            apiKey?: string | undefined;
        } | undefined;
    }, {
        synthetic?: {
            apiKey?: string | undefined;
        } | undefined;
        minimax?: {
            apiKey?: string | undefined;
        } | undefined;
    }>>;
    combination1: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }>>;
    combination2: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }>>;
    combination3: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }>>;
    combination4: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }>>;
    combination5: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }>>;
    combination6: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }>>;
    combination7: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }>>;
    combination8: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }>>;
    combination9: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }>>;
    combination10: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        regularModel: z.ZodOptional<z.ZodString>;
        thinkingModel: z.ZodOptional<z.ZodString>;
        regularProvider: z.ZodOptional<z.ZodString>;
        thinkingProvider: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }, {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    }>>;
    configVersion: z.ZodDefault<z.ZodNumber>;
    recommendedModels: z.ZodDefault<z.ZodObject<{
        default: z.ZodDefault<z.ZodObject<{
            primary: z.ZodDefault<z.ZodString>;
            backup: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            primary: string;
            backup: string;
        }, {
            primary?: string | undefined;
            backup?: string | undefined;
        }>>;
        smallFast: z.ZodDefault<z.ZodObject<{
            primary: z.ZodDefault<z.ZodString>;
            backup: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            primary: string;
            backup: string;
        }, {
            primary?: string | undefined;
            backup?: string | undefined;
        }>>;
        thinking: z.ZodDefault<z.ZodObject<{
            primary: z.ZodDefault<z.ZodString>;
            backup: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            primary: string;
            backup: string;
        }, {
            primary?: string | undefined;
            backup?: string | undefined;
        }>>;
        subagent: z.ZodDefault<z.ZodObject<{
            primary: z.ZodDefault<z.ZodString>;
            backup: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            primary: string;
            backup: string;
        }, {
            primary?: string | undefined;
            backup?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        default: {
            primary: string;
            backup: string;
        };
        smallFast: {
            primary: string;
            backup: string;
        };
        thinking: {
            primary: string;
            backup: string;
        };
        subagent: {
            primary: string;
            backup: string;
        };
    }, {
        default?: {
            primary?: string | undefined;
            backup?: string | undefined;
        } | undefined;
        smallFast?: {
            primary?: string | undefined;
            backup?: string | undefined;
        } | undefined;
        thinking?: {
            primary?: string | undefined;
            backup?: string | undefined;
        } | undefined;
        subagent?: {
            primary?: string | undefined;
            backup?: string | undefined;
        } | undefined;
    }>>;
    lastUpdateCheck: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    providers: {
        synthetic: {
            apiKey: string;
            baseUrl: string;
            anthropicBaseUrl: string;
            modelsApiUrl: string;
            enabled: boolean;
            timeout?: number | undefined;
        };
        minimax: {
            apiKey: string;
            baseUrl: string;
            anthropicBaseUrl: string;
            modelsApiUrl: string;
            enabled: boolean;
            defaultModel: string;
            parallelToolCalls: boolean;
            streaming: boolean;
            memoryCompact: boolean;
            timeout?: number | undefined;
            groupId?: string | undefined;
            temperature?: number | undefined;
            topP?: number | undefined;
            topK?: number | undefined;
            contextSize?: number | undefined;
            toolChoice?: "auto" | "none" | "required" | undefined;
            responseFormat?: "text" | "json_object" | undefined;
        };
    };
    defaultProvider: "synthetic" | "minimax" | "auto";
    cacheDurationHours: number;
    selectedModel: string;
    selectedThinkingModel: string;
    firstRunCompleted: boolean;
    tokenUsage: {
        totalInputTokens: number;
        totalOutputTokens: number;
        sessionTokens: number;
        history: {
            date: string;
            inputTokens: number;
            outputTokens: number;
        }[];
        lastUpdated?: string | undefined;
    };
    responseCache: {
        enabled: boolean;
        ttlMinutes: number;
        maxEntries: number;
    };
    liteLLM: {
        enabled: boolean;
        timeout: number;
        port: number;
        host: string;
    };
    envOverrides: {
        synthetic?: {
            apiKey?: string | undefined;
        } | undefined;
        minimax?: {
            apiKey?: string | undefined;
        } | undefined;
    };
    configVersion: number;
    recommendedModels: {
        default: {
            primary: string;
            backup: string;
        };
        smallFast: {
            primary: string;
            backup: string;
        };
        thinking: {
            primary: string;
            backup: string;
        };
        subagent: {
            primary: string;
            backup: string;
        };
    };
    combination1?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination2?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination3?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination4?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination5?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination6?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination7?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination8?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination9?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination10?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    lastUpdateCheck?: number | undefined;
}, {
    providers?: {
        synthetic?: {
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            anthropicBaseUrl?: string | undefined;
            modelsApiUrl?: string | undefined;
            enabled?: boolean | undefined;
            timeout?: number | undefined;
        } | undefined;
        minimax?: {
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            anthropicBaseUrl?: string | undefined;
            modelsApiUrl?: string | undefined;
            enabled?: boolean | undefined;
            timeout?: number | undefined;
            groupId?: string | undefined;
            defaultModel?: string | undefined;
            temperature?: number | undefined;
            topP?: number | undefined;
            topK?: number | undefined;
            contextSize?: number | undefined;
            toolChoice?: "auto" | "none" | "required" | undefined;
            parallelToolCalls?: boolean | undefined;
            responseFormat?: "text" | "json_object" | undefined;
            streaming?: boolean | undefined;
            memoryCompact?: boolean | undefined;
        } | undefined;
    } | undefined;
    defaultProvider?: "synthetic" | "minimax" | "auto" | undefined;
    cacheDurationHours?: number | undefined;
    selectedModel?: string | undefined;
    selectedThinkingModel?: string | undefined;
    firstRunCompleted?: boolean | undefined;
    tokenUsage?: {
        totalInputTokens?: number | undefined;
        totalOutputTokens?: number | undefined;
        sessionTokens?: number | undefined;
        lastUpdated?: string | undefined;
        history?: {
            date: string;
            inputTokens: number;
            outputTokens: number;
        }[] | undefined;
    } | undefined;
    responseCache?: {
        enabled?: boolean | undefined;
        ttlMinutes?: number | undefined;
        maxEntries?: number | undefined;
    } | undefined;
    liteLLM?: {
        enabled?: boolean | undefined;
        timeout?: number | undefined;
        port?: number | undefined;
        host?: string | undefined;
    } | undefined;
    envOverrides?: {
        synthetic?: {
            apiKey?: string | undefined;
        } | undefined;
        minimax?: {
            apiKey?: string | undefined;
        } | undefined;
    } | undefined;
    combination1?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination2?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination3?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination4?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination5?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination6?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination7?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination8?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination9?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    combination10?: {
        name?: string | undefined;
        regularModel?: string | undefined;
        thinkingModel?: string | undefined;
        regularProvider?: string | undefined;
        thinkingProvider?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    configVersion?: number | undefined;
    recommendedModels?: {
        default?: {
            primary?: string | undefined;
            backup?: string | undefined;
        } | undefined;
        smallFast?: {
            primary?: string | undefined;
            backup?: string | undefined;
        } | undefined;
        thinking?: {
            primary?: string | undefined;
            backup?: string | undefined;
        } | undefined;
        subagent?: {
            primary?: string | undefined;
            backup?: string | undefined;
        } | undefined;
    } | undefined;
    lastUpdateCheck?: number | undefined;
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
        streaming: boolean;
        thinking: boolean;
        tools: boolean;
        json_mode: boolean;
        parallel_tools: boolean;
    }, {
        streaming?: boolean | undefined;
        thinking?: boolean | undefined;
        tools?: boolean | undefined;
        json_mode?: boolean | undefined;
        parallel_tools?: boolean | undefined;
    }>>;
    limits: z.ZodDefault<z.ZodObject<{
        context: z.ZodOptional<z.ZodNumber>;
        max_output: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        context?: number | undefined;
        max_output?: number | undefined;
    }, {
        context?: number | undefined;
        max_output?: number | undefined;
    }>>;
    parameters: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    speed_tier: z.ZodDefault<z.ZodEnum<["fast", "medium", "slow"]>>;
    provider: z.ZodString;
    verified: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    priority: number;
    capabilities: {
        streaming: boolean;
        thinking: boolean;
        tools: boolean;
        json_mode: boolean;
        parallel_tools: boolean;
    };
    limits: {
        context?: number | undefined;
        max_output?: number | undefined;
    };
    speed_tier: "fast" | "medium" | "slow";
    provider: string;
    name?: string | undefined;
    aliases?: string[] | undefined;
    roles?: string[] | undefined;
    preferProvider?: string | undefined;
    parameters?: string[] | undefined;
    verified?: string | undefined;
}, {
    id: string;
    provider: string;
    name?: string | undefined;
    aliases?: string[] | undefined;
    roles?: string[] | undefined;
    priority?: number | undefined;
    preferProvider?: string | undefined;
    capabilities?: {
        streaming?: boolean | undefined;
        thinking?: boolean | undefined;
        tools?: boolean | undefined;
        json_mode?: boolean | undefined;
        parallel_tools?: boolean | undefined;
    } | undefined;
    limits?: {
        context?: number | undefined;
        max_output?: number | undefined;
    } | undefined;
    parameters?: string[] | undefined;
    speed_tier?: "fast" | "medium" | "slow" | undefined;
    verified?: string | undefined;
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
            streaming: boolean;
            thinking: boolean;
            tools: boolean;
            json_mode: boolean;
            parallel_tools: boolean;
        }, {
            streaming?: boolean | undefined;
            thinking?: boolean | undefined;
            tools?: boolean | undefined;
            json_mode?: boolean | undefined;
            parallel_tools?: boolean | undefined;
        }>>;
        limits: z.ZodDefault<z.ZodObject<{
            context: z.ZodOptional<z.ZodNumber>;
            max_output: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            context?: number | undefined;
            max_output?: number | undefined;
        }, {
            context?: number | undefined;
            max_output?: number | undefined;
        }>>;
        parameters: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        speed_tier: z.ZodDefault<z.ZodEnum<["fast", "medium", "slow"]>>;
        provider: z.ZodString;
        verified: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        priority: number;
        capabilities: {
            streaming: boolean;
            thinking: boolean;
            tools: boolean;
            json_mode: boolean;
            parallel_tools: boolean;
        };
        limits: {
            context?: number | undefined;
            max_output?: number | undefined;
        };
        speed_tier: "fast" | "medium" | "slow";
        provider: string;
        name?: string | undefined;
        aliases?: string[] | undefined;
        roles?: string[] | undefined;
        preferProvider?: string | undefined;
        parameters?: string[] | undefined;
        verified?: string | undefined;
    }, {
        id: string;
        provider: string;
        name?: string | undefined;
        aliases?: string[] | undefined;
        roles?: string[] | undefined;
        priority?: number | undefined;
        preferProvider?: string | undefined;
        capabilities?: {
            streaming?: boolean | undefined;
            thinking?: boolean | undefined;
            tools?: boolean | undefined;
            json_mode?: boolean | undefined;
            parallel_tools?: boolean | undefined;
        } | undefined;
        limits?: {
            context?: number | undefined;
            max_output?: number | undefined;
        } | undefined;
        parameters?: string[] | undefined;
        speed_tier?: "fast" | "medium" | "slow" | undefined;
        verified?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    version: string;
    providerPriority: string[];
    cards: {
        id: string;
        priority: number;
        capabilities: {
            streaming: boolean;
            thinking: boolean;
            tools: boolean;
            json_mode: boolean;
            parallel_tools: boolean;
        };
        limits: {
            context?: number | undefined;
            max_output?: number | undefined;
        };
        speed_tier: "fast" | "medium" | "slow";
        provider: string;
        name?: string | undefined;
        aliases?: string[] | undefined;
        roles?: string[] | undefined;
        preferProvider?: string | undefined;
        parameters?: string[] | undefined;
        verified?: string | undefined;
    }[];
    updated?: string | undefined;
}, {
    version?: string | undefined;
    updated?: string | undefined;
    providerPriority?: string[] | undefined;
    cards?: {
        id: string;
        provider: string;
        name?: string | undefined;
        aliases?: string[] | undefined;
        roles?: string[] | undefined;
        priority?: number | undefined;
        preferProvider?: string | undefined;
        capabilities?: {
            streaming?: boolean | undefined;
            thinking?: boolean | undefined;
            tools?: boolean | undefined;
            json_mode?: boolean | undefined;
            parallel_tools?: boolean | undefined;
        } | undefined;
        limits?: {
            context?: number | undefined;
            max_output?: number | undefined;
        } | undefined;
        parameters?: string[] | undefined;
        speed_tier?: "fast" | "medium" | "slow" | undefined;
        verified?: string | undefined;
    }[] | undefined;
}>;
export type ModelCards = z.infer<typeof ModelCardsSchema>;
export declare class ConfigValidationError extends Error {
    cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
export declare class ConfigLoadError extends Error {
    cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
export declare class ConfigSaveError extends Error {
    cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
//# sourceMappingURL=types.d.ts.map