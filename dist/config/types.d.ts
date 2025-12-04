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
export declare const MinimaxProviderConfig: z.ZodObject<{
    apiKey: z.ZodDefault<z.ZodString>;
    groupId: z.ZodOptional<z.ZodString>;
    baseUrl: z.ZodDefault<z.ZodString>;
    anthropicBaseUrl: z.ZodDefault<z.ZodString>;
    modelsApiUrl: z.ZodDefault<z.ZodString>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    defaultModel: z.ZodDefault<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    apiKey: string;
    baseUrl: string;
    anthropicBaseUrl: string;
    modelsApiUrl: string;
    enabled: boolean;
    defaultModel: string;
    timeout?: number | undefined;
    groupId?: string | undefined;
}, {
    apiKey?: string | undefined;
    baseUrl?: string | undefined;
    anthropicBaseUrl?: string | undefined;
    modelsApiUrl?: string | undefined;
    enabled?: boolean | undefined;
    timeout?: number | undefined;
    groupId?: string | undefined;
    defaultModel?: string | undefined;
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
        }, "strip", z.ZodTypeAny, {
            apiKey: string;
            baseUrl: string;
            anthropicBaseUrl: string;
            modelsApiUrl: string;
            enabled: boolean;
            defaultModel: string;
            timeout?: number | undefined;
            groupId?: string | undefined;
        }, {
            apiKey?: string | undefined;
            baseUrl?: string | undefined;
            anthropicBaseUrl?: string | undefined;
            modelsApiUrl?: string | undefined;
            enabled?: boolean | undefined;
            timeout?: number | undefined;
            groupId?: string | undefined;
            defaultModel?: string | undefined;
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
            timeout?: number | undefined;
            groupId?: string | undefined;
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
        } | undefined;
    }>>;
    defaultProvider: z.ZodDefault<z.ZodEnum<["synthetic", "minimax", "auto"]>>;
    cacheDurationHours: z.ZodDefault<z.ZodNumber>;
    selectedModel: z.ZodDefault<z.ZodString>;
    selectedThinkingModel: z.ZodDefault<z.ZodString>;
    firstRunCompleted: z.ZodDefault<z.ZodBoolean>;
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
            timeout?: number | undefined;
            groupId?: string | undefined;
        };
    };
    defaultProvider: "synthetic" | "minimax" | "auto";
    cacheDurationHours: number;
    selectedModel: string;
    selectedThinkingModel: string;
    firstRunCompleted: boolean;
    envOverrides: {
        synthetic?: {
            apiKey?: string | undefined;
        } | undefined;
        minimax?: {
            apiKey?: string | undefined;
        } | undefined;
    };
    configVersion: number;
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
        } | undefined;
    } | undefined;
    defaultProvider?: "synthetic" | "minimax" | "auto" | undefined;
    cacheDurationHours?: number | undefined;
    selectedModel?: string | undefined;
    selectedThinkingModel?: string | undefined;
    firstRunCompleted?: boolean | undefined;
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
}>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
export type Provider = ProviderType;
export type SyntheticProviderConfig = z.infer<typeof SyntheticProviderConfig>;
export type MinimaxProviderConfig = z.infer<typeof MinimaxProviderConfig>;
export type LegacyAppConfig = z.infer<typeof LegacyAppConfigSchema>;
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