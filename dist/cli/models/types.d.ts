import { z } from "zod";
export declare const ModelInfoSchema: z.ZodObject<{
    id: z.ZodString;
    object: z.ZodDefault<z.ZodString>;
    created: z.ZodOptional<z.ZodNumber>;
    owned_by: z.ZodOptional<z.ZodString>;
    provider: z.ZodOptional<z.ZodString>;
    always_on: z.ZodOptional<z.ZodBoolean>;
    hugging_face_id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    input_modalities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    output_modalities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    context_length: z.ZodOptional<z.ZodNumber>;
    max_output_length: z.ZodOptional<z.ZodNumber>;
    pricing: z.ZodOptional<z.ZodObject<{
        prompt: z.ZodOptional<z.ZodString>;
        completion: z.ZodOptional<z.ZodString>;
        image: z.ZodOptional<z.ZodString>;
        request: z.ZodOptional<z.ZodString>;
        input_cache_reads: z.ZodOptional<z.ZodString>;
        input_cache_writes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        prompt?: string;
        completion?: string;
        image?: string;
        request?: string;
        input_cache_reads?: string;
        input_cache_writes?: string;
    }, {
        prompt?: string;
        completion?: string;
        image?: string;
        request?: string;
        input_cache_reads?: string;
        input_cache_writes?: string;
    }>>;
    quantization: z.ZodOptional<z.ZodString>;
    supported_sampling_parameters: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    supported_features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    openrouter: z.ZodOptional<z.ZodObject<{
        slug: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        slug?: string;
    }, {
        slug?: string;
    }>>;
    datacenters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        country_code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        country_code?: string;
    }, {
        country_code?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    object?: string;
    name?: string;
    id?: string;
    provider?: string;
    created?: number;
    owned_by?: string;
    always_on?: boolean;
    hugging_face_id?: string;
    input_modalities?: string[];
    output_modalities?: string[];
    context_length?: number;
    max_output_length?: number;
    pricing?: {
        prompt?: string;
        completion?: string;
        image?: string;
        request?: string;
        input_cache_reads?: string;
        input_cache_writes?: string;
    };
    quantization?: string;
    supported_sampling_parameters?: string[];
    supported_features?: string[];
    openrouter?: {
        slug?: string;
    };
    datacenters?: {
        country_code?: string;
    }[];
}, {
    object?: string;
    name?: string;
    id?: string;
    provider?: string;
    created?: number;
    owned_by?: string;
    always_on?: boolean;
    hugging_face_id?: string;
    input_modalities?: string[];
    output_modalities?: string[];
    context_length?: number;
    max_output_length?: number;
    pricing?: {
        prompt?: string;
        completion?: string;
        image?: string;
        request?: string;
        input_cache_reads?: string;
        input_cache_writes?: string;
    };
    quantization?: string;
    supported_sampling_parameters?: string[];
    supported_features?: string[];
    openrouter?: {
        slug?: string;
    };
    datacenters?: {
        country_code?: string;
    }[];
}>;
export type ModelInfo = z.infer<typeof ModelInfoSchema>;
export interface CacheInfo {
    exists: boolean;
    filePath?: string;
    modifiedTime?: string;
    sizeBytes?: number;
    modelCount?: number;
    isValid?: boolean;
    error?: string;
}
export interface ApiModelsResponse {
    data: ModelInfo[];
    object?: string;
}
export declare class ModelValidationError extends Error {
    cause?: unknown;
    constructor(message: string, cause?: unknown);
}
export declare class ApiError extends Error {
    status?: number;
    response?: any;
    constructor(message: string, status?: number, response?: any);
}
